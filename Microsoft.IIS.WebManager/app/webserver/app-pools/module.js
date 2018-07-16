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
var bmodel_1 = require("../../common/bmodel");
var validators_1 = require("../../common/validators");
var switch_component_1 = require("../../common/switch.component");
var loading_component_1 = require("../../notification/loading.component");
var sort_pipe_1 = require("../../common/sort.pipe");
var selector_1 = require("../../common/selector");
var enum_component_1 = require("../../common/enum.component");
var app_pool_list_1 = require("./app-pool-list");
var app_pool_list_component_1 = require("./app-pool-list.component");
var new_app_pool_component_1 = require("./new-app-pool.component");
var identity_component_1 = require("./identity.component");
var Module = /** @class */ (function () {
    function Module() {
    }
    Module = __decorate([
        core_1.NgModule({
            imports: [
                forms_1.FormsModule,
                common_1.CommonModule,
                router_1.RouterModule,
                bmodel_1.Module,
                validators_1.Module,
                switch_component_1.Module,
                loading_component_1.Module,
                sort_pipe_1.Module,
                selector_1.Module,
                enum_component_1.Module
            ],
            exports: [
                app_pool_list_1.AppPoolList,
                app_pool_list_1.AppPoolItem,
                app_pool_list_component_1.AppPoolListComponent,
                new_app_pool_component_1.NewAppPoolComponent,
                identity_component_1.IdentityComponent
            ],
            declarations: [
                app_pool_list_1.AppPoolList,
                app_pool_list_1.AppPoolItem,
                app_pool_list_component_1.AppPoolListComponent,
                new_app_pool_component_1.NewAppPoolComponent,
                identity_component_1.IdentityComponent
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=module.js.map