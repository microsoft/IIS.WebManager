"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// - Routes instead of RouteConfig
// - RouterModule instead of provideRoutes
var router_1 = require("@angular/router");
//
// Components
var webapp_component_1 = require("./webapp.component");
var routes = [
    { path: ':id', component: webapp_component_1.WebAppComponent },
    { path: ':id/:section', component: webapp_component_1.WebAppComponent }
];
// - Updated Export
exports.Routing = router_1.RouterModule.forChild(routes);
//# sourceMappingURL=webapp.routes.js.map