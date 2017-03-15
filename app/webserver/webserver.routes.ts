import {Routes, RouterModule} from '@angular/router';
import {WebServerComponent} from './webserver.component';

class WebServerRouter {

    private static _featureCache: Array<any>;
    static features: Array<string> = ["App-Pools", "WebSites", "WebApps", "Vdirs"];

    private static Route(name: string) {
        return {
            path: name.toLowerCase(),
            loadChildren: './app/webserver/' + name + '/' + name + '.module#' + name.replace("-", "") + 'Module'
        }
    }

    private static RouteFeatures(features: Array<string>, regularRoutes: Array<any>) {

        var routes = [];

        if (WebServerRouter._featureCache == null) {
            WebServerRouter._featureCache = [];
            for (var feature of features) {
                var o = WebServerRouter.Route(feature);
                routes.push(o);
                WebServerRouter._featureCache.push(o);
            }
        }
        else {
            for (var f of WebServerRouter._featureCache) {
                routes.push(f);
            }
        }

        for (var route of regularRoutes) {
            routes.push(route);
        }

        return routes;
    }

    public static getRoutes() {

        return WebServerRouter.RouteFeatures(
            WebServerRouter.features,
            [
                { path: '', component: WebServerComponent },
                { path: ':section', component: WebServerComponent }
            ]
        )
    }


}

// - Updated Export
export const Routing = RouterModule.forChild(WebServerRouter.getRoutes());