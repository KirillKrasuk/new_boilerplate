import { matchRoutes, RouteConfig } from 'react-router-config';

import { protectRedirect }          from '@app/routes/routes';
import routes                       from '@core/components/Router/routes';

export function getLocation(isLogged: boolean, url: string): string | void {
    const [ pathname ]   = url.split('?');
    const [ , appRoute ] = matchRoutes(routes as RouteConfig[], pathname);

    if (appRoute && appRoute.route) {
        const { route } = appRoute;

        if (!isLogged && route.protect) {
            return protectRedirect;
        }

        return url;
    }
}