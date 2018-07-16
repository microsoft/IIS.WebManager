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
var bmodel_1 = require("../../common/bmodel");
var notfound_component_1 = require("../../common/notfound.component");
var checkbox_component_1 = require("../../common/checkbox.component");
var switch_component_1 = require("../../common/switch.component");
var dynamic_component_1 = require("../../common/dynamic.component");
var selector_1 = require("../../common/selector");
var vtabs_component_1 = require("../../common/vtabs.component");
var loading_component_1 = require("../../notification/loading.component");
var enum_component_1 = require("../../common/enum.component");
var string_list_component_1 = require("../../common/string-list.component");
var tabs_component_1 = require("../../common/tabs.component");
var module_1 = require("./module");
var app_pool_routes_1 = require("./app-pool.routes");
var app_pool_component_1 = require("./app-pool.component");
var app_pool_general_component_1 = require("./app-pool-general.component");
var app_pool_header_component_1 = require("./app-pool-header.component");
var cpu_component_1 = require("./cpu.component");
var process_component_1 = require("./process.component");
var rapid_fail_protection_component_1 = require("./rapid-fail-protection.component");
var recycling_component_1 = require("./recycling.component");
var AppPoolsModule = /** @class */ (function () {
    function AppPoolsModule() {
    }
    AppPoolsModule = __decorate([
        core_1.NgModule({
            imports: [
                forms_1.FormsModule,
                common_1.CommonModule,
                module_1.Module,
                app_pool_routes_1.Routing,
                bmodel_1.Module,
                notfound_component_1.Module,
                checkbox_component_1.Module,
                switch_component_1.Module,
                dynamic_component_1.Module,
                selector_1.Module,
                vtabs_component_1.Module,
                loading_component_1.Module,
                enum_component_1.Module,
                string_list_component_1.Module,
                tabs_component_1.Module
            ],
            declarations: [
                app_pool_component_1.AppPoolComponent,
                app_pool_general_component_1.AppPoolGeneralComponent,
                app_pool_header_component_1.AppPoolHeaderComponent,
                cpu_component_1.CpuComponent,
                process_component_1.ProcessModelComponent,
                process_component_1.ProcessOrphaningComponent,
                rapid_fail_protection_component_1.RapidFailProtectionComponent,
                recycling_component_1.DailyScheduleComponent,
                recycling_component_1.RecyclingComponent
            ]
        })
    ], AppPoolsModule);
    return AppPoolsModule;
}());
exports.AppPoolsModule = AppPoolsModule;
//# sourceMappingURL=app-pools.module.js.map