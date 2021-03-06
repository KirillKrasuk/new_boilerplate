import { FC, useEffect } from 'react';
import { useDispatch }   from 'react-redux';
import R                 from 'ramda';

import { readyAction }   from '@core/store/actions/ready';
import { Props }         from './types';

const ReadyWrapper: FC<Props> = (props) => {
    const { children } = props;

    const dispatch = useDispatch();

    useEffect(() => {
        const ready: typeof readyAction = R.compose(dispatch, readyAction);

        ready();
    }, [ dispatch ]);

    return (
        <>{ children }</>
    );
};

export default ReadyWrapper;
