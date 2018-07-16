"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
//
// Features
var home_component_1 = require("../main/home.component");
var notfound_component_1 = require("../common/notfound.component");
var connect_component_1 = require("../connect/connect.component");
var get_component_1 = require("./get.component");
var fileRoutes = [
    { path: '**', component: home_component_1.HomeComponent, data: { section: 'files' } },
];
var routes = [
    { path: '', component: home_component_1.HomeComponent },
    { path: 'get', component: get_component_1.GetComponent },
    { path: 'connect', component: connect_component_1.ConnectComponent },
    { path: 'settings', loadChildren: './app/settings/settings.module#SettingsModule' },
    { path: 'webserver', loadChildren: './app/webserver/webserver.module#WebServerModule' },
    { path: ':section', component: home_component_1.HomeComponent },
    // Not Found
    { path: '**', component: notfound_component_1.NotFound }
];
// - Updated Export
exports.Routing = router_1.RouterModule.forRoot(routes);
//# sourceMappingURL=app.routes.js.map