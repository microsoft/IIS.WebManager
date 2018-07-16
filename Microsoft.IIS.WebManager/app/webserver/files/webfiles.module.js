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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var bmodel_1 = require("../../common/bmodel");
var checkbox_component_1 = require("../../common/checkbox.component");
var switch_component_1 = require("../../common/switch.component");
var loading_component_1 = require("../../notification/loading.component");
var override_mode_component_1 = require("../../common/override-mode.component");
var error_component_1 = require("../../error/error.component");
var sort_pipe_1 = require("../../common/sort.pipe");
var filter_pipe_1 = require("../../common/filter.pipe");
var selector_1 = require("../../common/selector");
var file_selector_1 = require("../../common/file-selector");
var virtual_list_component_1 = require("../../common/virtual-list.component");
var focus_1 = require("../../common/focus");
var selectable_1 = require("../../common/selectable");
var toolbar_component_1 = require("../../files/toolbar.component");
var navigation_component_1 = require("../../files/navigation.component");
var file_editor_1 = require("../../files/file-editor");
var webfiles_service_1 = require("./webfiles.service");
var navigation_helper_1 = require("./navigation-helper");
var webfiles_component_1 = require("./webfiles.component");
var webfile_list_1 = require("./webfile-list");
var webfile_list_item_1 = require("./webfile-list-item");
var webfile_explorer_1 = require("./webfile-explorer");
var new_webfile_component_1 = require("./new-webfile.component");
var WebFilesModule = /** @class */ (function () {
    function WebFilesModule(_svc) {
        this._svc = _svc;
    }
    WebFilesModule.prototype.ngOnDestroy = function () {
        if (this._svc != null) {
            this._svc.dispose();
            this._svc = null;
        }
    };
    WebFilesModule = __decorate([
        core_1.NgModule({
            imports: [
                router_1.RouterModule,
                common_1.CommonModule,
                forms_1.FormsModule,
                bmodel_1.Module,
                checkbox_component_1.Module,
                switch_component_1.Module,
                loading_component_1.Module,
                override_mode_component_1.Module,
                error_component_1.Module,
                sort_pipe_1.Module,
                filter_pipe_1.Module,
                selector_1.Module,
                file_selector_1.Module,
                virtual_list_component_1.Module,
                focus_1.Module,
                selectable_1.Module,
                toolbar_component_1.Module,
                navigation_component_1.Module,
                file_editor_1.Module
            ],
            declarations: [
                webfiles_component_1.WebFilesComponent,
                webfile_list_1.WebFileListComponent,
                webfile_list_item_1.WebFileComponent,
                new_webfile_component_1.NewWebFileComponent,
                webfile_explorer_1.WebFileExplorer
            ],
            providers: [
                webfiles_service_1.WebFilesService,
                { provide: "INavigation", useClass: navigation_helper_1.NavigationHelper }
            ]
        }),
        __metadata("design:paramtypes", [webfiles_service_1.WebFilesService])
    ], WebFilesModule);
    return WebFilesModule;
}());
exports.WebFilesModule = WebFilesModule;
//# sourceMappingURL=webfiles.module.js.map