import { LOCATION_CHANGE }           from 'connected-react-router';
import { ofType, ActionsObservable } from 'redux-observable';
import { map, pluck }                from 'rxjs/operators';
import R                             from 'ramda';
import * as O                        from 'fp-ts/lib/Option';
import { pipe }                      from 'fp-ts/lib/pipeable';
import { flow }                      from 'fp-ts/lib/function';

import * as modals                   from '@app/modals';
import { EModals }                   from '@app/enums/modal';
import { callModalAction }           from '@core/actions/modal';
import { CallModal }                 from '@core/types/modal';
import { snakeToCamel }              from '@core/utils/string';
import { EStringFormatter }          from '@core/enums/string';
import { EmptyEpic }                 from '@core/types/empty';
import { emptyEpicAction }           from '@core/actions/emptyEpic';

type ReturnEpicType = CallModal | EmptyEpic;

const splitSearchString = (search: string): O.Option<string[]> => R.compose(
    O.some,
    R.split('&'),
    R.replace('?', '')
)(search);

const findActionPattern = (patterns: string[]): O.Option<string> => (
    O.fromNullable(patterns.find(pattern => ~pattern.indexOf('action')))
);

const splitActionQueryByID = R.split('=');

const filterModalsIDOption = ([ , id ]: string[]): O.Option<EModals> => {
    const modalIdOption = snakeToCamel(EStringFormatter.Upper, id as EModals);
    const modalIDs      = R.keys(modals);

    return R.includes(modalIdOption)(modalIDs)
        ? O.some(modalIdOption)
        : O.none;
};

const actionOrEMPTY = flow(
    O.fold<EModals, ReturnEpicType>(
        () => emptyEpicAction(),
        (v) => callModalAction(v)
    )
);

export const locationEpic = (action$: ActionsObservable<any>) => action$.pipe(
    ofType(LOCATION_CHANGE),
    pluck('payload', 'location', 'search'),
    map(search => pipe(
        splitSearchString(search),
        O.chain(findActionPattern),
        O.map(splitActionQueryByID),
        O.chain(filterModalsIDOption),
        actionOrEMPTY
    )),
);
