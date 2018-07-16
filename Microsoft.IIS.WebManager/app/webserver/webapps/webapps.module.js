"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var bmodel_1 = require("../../common/bmodel");
var notfound_component_1 = require("../../common/notfound.component");
var switch_component_1 = require("../../common/switch.component");
var dynamic_component_1 = require("../../common/dynamic.component");
var vtabs_component_1 = require("../../common/vtabs.component");
var loading_component_1 = require("../../notification/loading.component");
var sort_pipe_1 = require("../../common/sort.pipe");
var selector_1 = require("../../common/selector");
var tabs_component_1 = require("../../common/tabs.component");
var module_1 = require("../websites/module");
var module_2 = require("../app-pools/module");
var files_module_1 = require("../../files/files.module");
var webapp_routes_1 = require("./webapp.routes");
var webapps_service_1 = require("./webapps.service");
var webapp_component_1 = require("./webapp.component");
var webapp_list_component_1 = require("./webapp-list.component");
var webapp_list_1 = require("./webapp-list");
var webapp_header_component_1 = require("./webapp-header.component");
var webapp_general_component_1 = require("./webapp-general.component");
var new_webapp_component_1 = require("./new-webapp.component");
var WebAppsModule = /** @class */ (function () {
    function WebAppsModule(_svc) {
        this._svc = _svc;
    }
    WebAppsModule.prototype.ngOnDestroy = function () {
        this._svc.destroy();
    };
    WebAppsModule = __decorate([
        core_1.NgModule({
            imports: [
                forms_1.FormsModule,
                common_1.CommonModule,
                module_1.Module,
                module_2.Module,
                files_module_1.FilesModule,
                webapp_routes_1.Routing,
                bmodel_1.Module,
                notfound_component_1.Module,
                switch_component_1.Module,
                dynamic_component_1.Module,
                vtabs_component_1.Module,
                loading_component_1.Module,
                sort_pipe_1.Module,
                selector_1.Module,
                tabs_component_1.Module
            ],
            declarations: [
                webapp_component_1.WebAppComponent,
                webapp_list_component_1.WebAppListComponent,
                webapp_list_1.WebAppItem,
                webapp_list_1.WebAppList,
                webapp_header_component_1.WebAppHeaderComponent,
                webapp_general_component_1.WebAppGeneralComponent,
                new_webapp_component_1.NewWebAppComponent
            ],
            providers: [
                { provide: "WebAppsService", useClass: webapps_service_1.WebAppsService }
            ]
        }),
        __param(0, core_1.Inject("WebAppsService")),
        __metadata("design:paramtypes", [webapps_service_1.WebAppsService])
    ], WebAppsModule);
    return WebAppsModule;
}());
exports.WebAppsModule = WebAppsModule;
//# sourceMappingURL=webapps.module.js.map