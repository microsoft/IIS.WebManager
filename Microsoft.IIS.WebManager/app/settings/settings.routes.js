"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
//
// Components
var settings_component_1 = require("./settings.component");
var routes = [
    { path: '', component: settings_component_1.SettingsComponent },
    { path: ':section', component: settings_component_1.SettingsComponent }
];
// - Updated Export
exports.Routing = router_1.RouterModule.forChild(routes);
//# sourceMappingURL=settings.routes.js.map