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
var router_1 = require("@angular/router");
var selector_1 = require("../../common/selector");
var switch_component_1 = require("../../common/switch.component");
var enum_component_1 = require("../../common/enum.component");
var module_1 = require("../app-pools/module");
var navigator_component_1 = require("./navigator.component");
var app_pool_details_1 = require("./app-pool-details");
var Module = /** @class */ (function () {
    function Module() {
    }
    Module = __decorate([
        core_1.NgModule({
            imports: [
                forms_1.FormsModule,
                common_1.CommonModule,
                router_1.RouterModule,
                module_1.Module,
                selector_1.Module,
                switch_component_1.Module,
                enum_component_1.Module
            ],
            exports: [
                navigator_component_1.NavigatorComponent,
                app_pool_details_1.AppPoolDetailsComponent
            ],
            declarations: [
                navigator_component_1.NavigatorComponent,
                app_pool_details_1.AppPoolDetailsComponent
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=module.js.map