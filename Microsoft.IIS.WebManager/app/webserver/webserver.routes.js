"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
var webserver_component_1 = require("./webserver.component");
var WebServerRouter = /** @class */ (function () {
    function WebServerRouter() {
    }
    WebServerRouter.Route = function (name) {
        return {
            path: name.toLowerCase(),
            loadChildren: './app/webserver/' + name + '/' + name + '.module#' + name.replace("-", "") + 'Module'
        };
    };
    WebServerRouter.RouteFeatures = function (features, regularRoutes) {
        var routes = [];
        if (WebServerRouter._featureCache == null) {
            WebServerRouter._featureCache = [];
            for (var _i = 0, features_1 = features; _i < features_1.length; _i++) {
                var feature = features_1[_i];
                var o = WebServerRouter.Route(feature);
                routes.push(o);
                WebServerRouter._featureCache.push(o);
            }
        }
        else {
            for (var _a = 0, _b = WebServerRouter._featureCache; _a < _b.length; _a++) {
                var f = _b[_a];
                routes.push(f);
            }
        }
        for (var _c = 0, regularRoutes_1 = regularRoutes; _c < regularRoutes_1.length; _c++) {
            var route = regularRoutes_1[_c];
            routes.push(route);
        }
        return routes;
    };
    WebServerRouter.getRoutes = function () {
        return WebServerRouter.RouteFeatures(WebServerRouter.features, [
            { path: '', component: webserver_component_1.WebServerComponent },
            { path: ':section', component: webserver_component_1.WebServerComponent }
        ]);
    };
    WebServerRouter.features = ["App-Pools", "WebSites", "WebApps", "Vdirs"];
    return WebServerRouter;
}());
// - Updated Export
exports.Routing = router_1.RouterModule.forChild(WebServerRouter.getRoutes());
//# sourceMappingURL=webserver.routes.js.map