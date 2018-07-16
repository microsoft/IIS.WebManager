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
var checkbox_component_1 = require("../../common/checkbox.component");
var switch_component_1 = require("../../common/switch.component");
var loading_component_1 = require("../../notification/loading.component");
var override_mode_component_1 = require("../../common/override-mode.component");
var error_component_1 = require("../../error/error.component");
var enum_component_1 = require("../../common/enum.component");
var tooltip_component_1 = require("../../common/tooltip.component");
var selector_1 = require("../../common/selector");
var authorization_service_1 = require("./authorization.service");
var authorization_component_1 = require("./authorization.component");
var rules_component_1 = require("./rules.component");
var rule_component_1 = require("./rule.component");
var rule_edit_component_1 = require("./rule-edit.component");
var AuthorizationModule = /** @class */ (function () {
    function AuthorizationModule() {
    }
    AuthorizationModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                router_1.RouterModule,
                bmodel_1.Module,
                checkbox_component_1.Module,
                switch_component_1.Module,
                loading_component_1.Module,
                override_mode_component_1.Module,
                error_component_1.Module,
                enum_component_1.Module,
                tooltip_component_1.Module,
                selector_1.Module
            ],
            declarations: [
                authorization_component_1.AuthorizationComponent,
                rules_component_1.RulesComponent,
                rule_component_1.RuleComponent,
                rule_edit_component_1.RuleEditComponent
            ],
            providers: [
                authorization_service_1.AuthorizationService
            ]
        })
    ], AuthorizationModule);
    return AuthorizationModule;
}());
exports.AuthorizationModule = AuthorizationModule;
//# sourceMappingURL=authorization.module.js.map