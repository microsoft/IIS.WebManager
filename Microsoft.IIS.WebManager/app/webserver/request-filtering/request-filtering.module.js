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
var switch_component_1 = require("../../common/switch.component");
var loading_component_1 = require("../../notification/loading.component");
var override_mode_component_1 = require("../../common/override-mode.component");
var string_list_component_1 = require("../../common/string-list.component");
var error_component_1 = require("../../error/error.component");
var tabs_component_1 = require("../../common/tabs.component");
var request_filtering_service_1 = require("./request-filtering.service");
var file_extensions_component_1 = require("./file-extensions.component");
var request_filtering_component_1 = require("./request-filtering.component");
var rules_component_1 = require("./rules.component");
var RequestFilteringModule = /** @class */ (function () {
    function RequestFilteringModule() {
    }
    RequestFilteringModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                router_1.RouterModule,
                bmodel_1.Module,
                switch_component_1.Module,
                loading_component_1.Module,
                override_mode_component_1.Module,
                string_list_component_1.Module,
                error_component_1.Module,
                tabs_component_1.Module
            ],
            declarations: [
                file_extensions_component_1.FileExtensionsComponent,
                file_extensions_component_1.FileExtensionComponent,
                request_filtering_component_1.RequestFilteringComponent,
                rules_component_1.RulesComponent,
                rules_component_1.RuleComponent
            ],
            providers: [
                request_filtering_service_1.RequestFilteringService
            ]
        })
    ], RequestFilteringModule);
    return RequestFilteringModule;
}());
exports.RequestFilteringModule = RequestFilteringModule;
//# sourceMappingURL=request-filtering.module.js.map