import React    from 'react';
import loadable from '@loadable/component';

export default loadable(
    () => import(/* webpackChunkName: "Button" */'.'),
    {
        fallback: <div>Loading..</div>
    }
);