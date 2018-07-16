"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var bmodel_1 = require("../common/bmodel");
var dynamic_component_1 = require("../common/dynamic.component");
var vtabs_component_1 = require("../common/vtabs.component");
var selector_1 = require("../common/selector");
var loading_component_1 = require("../notification/loading.component");
var webserver_routes_1 = require("./webserver.routes");
var webserver_general_component_1 = require("./webserver-general.component");
var webserver_header_component_1 = require("./webserver-header.component");
var webserver_component_1 = require("./webserver.component");
var WebServerModule = /** @class */ (function () {
    function WebServerModule() {
    }
    WebServerModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                webserver_routes_1.Routing,
                bmodel_1.Module,
                dynamic_component_1.Module,
                vtabs_component_1.Module,
                selector_1.Module,
                loading_component_1.Module
            ],
            declarations: [
                webserver_general_component_1.WebServerGeneralComponent,
                webserver_header_component_1.WebServerHeaderComponent,
                webserver_component_1.WebServerComponent
            ]
        })
    ], WebServerModule);
    return WebServerModule;
}());
exports.WebServerModule = WebServerModule;
//# sourceMappingURL=webserver.module.js.map