"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// - Routes instead of RouteConfig
// - RouterModule instead of provideRoutes
var router_1 = require("@angular/router");
//
// Components
var website_component_1 = require("./website.component");
var routes = [
    { path: ':id', component: website_component_1.WebSiteComponent },
    { path: ':id/:section', component: website_component_1.WebSiteComponent }
];
// - Updated Export
exports.Routing = router_1.RouterModule.forChild(routes);
//# sourceMappingURL=website.routes.js.map