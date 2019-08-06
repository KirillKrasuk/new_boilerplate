// @flow
import React, { Component }          from 'react';

import type { iHTTP }                from 'core/interfaces/HTTP';
import { container }                 from 'core/services/inversify';
import { TYPES }                     from 'core/services/types';
import type { PropsType, StateType } from './types.js';

class ErrorBoundary extends Component<PropsType, StateType> {
    state = {
        hasError: false
    }

    componentDidCatch(err: Object) {
        const http: iHTTP = container.get(TYPES.HTTP);

        this.setState({ hasError: true });

        const stack = err.stack.split(/\n/);

        http.body = {
            stack,
        };

        http.fetch({
            method   : 'POST',
            path     : '/handle_error',
            requestTo: 'root'
        });
    }

    render() {
        if (this.state.hasError) {
            return <div>Oops, something goes wrong</div>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;