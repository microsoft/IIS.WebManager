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
var notfound_component_1 = require("../../common/notfound.component");
var checkbox_component_1 = require("../../common/checkbox.component");
var switch_component_1 = require("../../common/switch.component");
var dynamic_component_1 = require("../../common/dynamic.component");
var vtabs_component_1 = require("../../common/vtabs.component");
var loading_component_1 = require("../../notification/loading.component");
var sort_pipe_1 = require("../../common/sort.pipe");
var selector_1 = require("../../common/selector");
var tabs_component_1 = require("../../common/tabs.component");
var virtual_list_component_1 = require("../../common/virtual-list.component");
var enum_component_1 = require("../../common/enum.component");
var module_1 = require("./module");
var module_2 = require("../app-pools/module");
var files_module_1 = require("../../files/files.module");
var certificates_module_1 = require("../../certificates/certificates.module");
var website_routes_1 = require("./website.routes");
var website_component_1 = require("./website.component");
var website_header_component_1 = require("./website-header.component");
var website_general_component_1 = require("./website-general.component");
var website_list_1 = require("./website-list");
var website_list_component_1 = require("./website-list.component");
var new_website_component_1 = require("./new-website.component");
var binding_list_component_1 = require("./binding-list.component");
var limits_component_1 = require("./limits.component");
var WebSitesModule = /** @class */ (function () {
    function WebSitesModule() {
    }
    WebSitesModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                module_1.Module,
                module_2.Module,
                files_module_1.FilesModule,
                certificates_module_1.CertificatesModule,
                website_routes_1.Routing,
                bmodel_1.Module,
                notfound_component_1.Module,
                checkbox_component_1.Module,
                switch_component_1.Module,
                dynamic_component_1.Module,
                vtabs_component_1.Module,
                loading_component_1.Module,
                sort_pipe_1.Module,
                selector_1.Module,
                tabs_component_1.Module,
                virtual_list_component_1.Module,
                enum_component_1.Module,
                router_1.RouterModule
            ],
            declarations: [
                website_component_1.WebSiteComponent,
                website_header_component_1.WebSiteHeaderComponent,
                website_general_component_1.WebSiteGeneralComponent,
                website_list_1.WebSiteList,
                website_list_1.WebSiteItem,
                website_list_component_1.WebSiteListComponent,
                new_website_component_1.NewWebSiteComponent,
                binding_list_component_1.BindingList,
                binding_list_component_1.BindingItem,
                limits_component_1.LimitsComponent
            ]
        })
    ], WebSitesModule);
    return WebSitesModule;
}());
exports.WebSitesModule = WebSitesModule;
//# sourceMappingURL=websites.module.js.map