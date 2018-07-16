"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// - Routes instead of RouteConfig
// - RouterModule instead of provideRoutes
var router_1 = require("@angular/router");
//
// Components
var app_pool_component_1 = require("./app-pool.component");
var routes = [
    { path: ':id', component: app_pool_component_1.AppPoolComponent },
    { path: ':id/:section', component: app_pool_component_1.AppPoolComponent }
];
// - Updated Export
exports.Routing = router_1.RouterModule.forChild(routes);
//# sourceMappingURL=app-pool.routes.js.map