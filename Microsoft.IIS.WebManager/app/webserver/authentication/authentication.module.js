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
var tabs_component_1 = require("../../common/tabs.component");
var authentication_service_1 = require("./authentication.service");
var anon_auth_component_1 = require("./anon-auth.component");
var authentication_component_1 = require("./authentication.component");
var basic_auth_component_1 = require("./basic-auth.component");
var digest_auth_component_1 = require("./digest-auth.component");
var win_auth_component_1 = require("./win-auth.component");
var AuthenticationModule = /** @class */ (function () {
    function AuthenticationModule() {
    }
    AuthenticationModule = __decorate([
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
                tabs_component_1.Module
            ],
            declarations: [
                anon_auth_component_1.AnonymousAuthenticationComponent,
                authentication_component_1.AuthenticationComponent,
                basic_auth_component_1.BasicAuthenticationComponent,
                digest_auth_component_1.DigestAuthenticationComponent,
                win_auth_component_1.WindowsAuthenticationComponent
            ],
            providers: [
                authentication_service_1.AuthenticationService
            ]
        })
    ], AuthenticationModule);
    return AuthenticationModule;
}());
exports.AuthenticationModule = AuthenticationModule;
//# sourceMappingURL=authentication.module.js.map