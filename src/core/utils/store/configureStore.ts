import {
    createStore, applyMiddleware, Reducer, Action, Middleware, Store
} from 'redux';
import { createEpicMiddleware, ofType, ActionsObservable } from 'redux-observable';
import { routerMiddleware }                                from 'connected-react-router';
import { composeWithDevTools }                             from 'redux-devtools-extension';
import { BehaviorSubject, Observable }                     from 'rxjs';
import { mergeMap, takeUntil }                             from 'rxjs/operators';
import { History }                                         from 'history';
import { compose, isEmpty }                                from 'ramda';

import { themeMiddleware }                                 from '@core/middlewares/theme';
import { localeMiddleware }                                from '@core/middlewares/locale';
import { locationMiddleware }                              from '@core/middlewares/location';
import rootEpic                                            from '@core/epics';
import createRootReducer                                   from '@core/reducers';
import { DEV }                                             from '@core/constants/environment';
import ssrReducers                                         from '@app/reducers/serverReducer';
import { extendStore }                                     from './extendStore';
import { shakeReducers }                                   from './shakeReducers';
import { ExtendedStore }                                   from './types';

type ConfiguredStore = { store: Store; history: History<any> };

export function configureStore(preloadedState: object = {}, history: History<any>): ConfiguredStore {
    const [ staticPreloadedState, asyncPreloadedState ] = shakeReducers(preloadedState);

    const env = process.env.NODE_ENV;

    const isClientSide = !isEmpty(preloadedState);

    const epicMiddleware            = createEpicMiddleware();
    const middlewares: Middleware[] = [
        locationMiddleware,
        themeMiddleware,
        localeMiddleware,
        routerMiddleware(history)
    ];

    if (isClientSide) {
        middlewares.push(epicMiddleware);
    }

    const composeEnhancers: Function =
        env === DEV
            ? composeWithDevTools
            : compose;

    // TODO: fix type
    const store: ExtendedStore = createStore(
        createRootReducer(history, {}, ssrReducers) as Reducer<any, any>,
        staticPreloadedState,
        composeEnhancers(applyMiddleware(...middlewares))
    );

    extendStore(store, history, asyncPreloadedState);

    if (isClientSide) {
        const epic$ = new BehaviorSubject(rootEpic);

        const hotReloadingEpic = (action$: ActionsObservable<Action<any>>, ...rest: any[]): Observable<any> => epic$.pipe(

            // @ts-ignore
            mergeMap(epic => epic(action$, ...rest).pipe(
                takeUntil(action$.pipe(
                    ofType('EPIC_END')
                ))
            ))
        );

        epicMiddleware.run(hotReloadingEpic);

        if ((module as any).hot) {
            (module as any).hot.accept('../../reducers', () => {
            // TODO: fix type
                store.replaceReducer(createRootReducer(history) as Reducer<any, any>);
            });

            (module as any).hot.accept('../../epics', () => {
                const nextRootEpic = require('../../epics').default;

                store.dispatch({ type: 'EPIC_END' });
                epic$.next(nextRootEpic);
            });
        }
    }


    return { store, history };
}
