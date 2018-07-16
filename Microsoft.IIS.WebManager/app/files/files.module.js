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
var checkbox_component_1 = require("../common/checkbox.component");
var switch_component_1 = require("../common/switch.component");
var loading_component_1 = require("../notification/loading.component");
var sort_pipe_1 = require("../common/sort.pipe");
var filter_pipe_1 = require("../common/filter.pipe");
var selector_1 = require("../common/selector");
var file_selector_1 = require("../common/file-selector");
var virtual_list_component_1 = require("../common/virtual-list.component");
var focus_1 = require("../common/focus");
var selectable_1 = require("../common/selectable");
var toolbar_component_1 = require("./toolbar.component");
var navigation_component_1 = require("./navigation.component");
var file_editor_1 = require("./file-editor");
var file_list_item_1 = require("./file-list-item");
var file_list_1 = require("./file-list");
var files_component_1 = require("./files.component");
var file_explorer_1 = require("./file-explorer");
var new_file_component_1 = require("./new-file.component");
var edit_location_component_1 = require("./edit-location.component");
var file_selector_component_1 = require("./file-selector.component");
var FilesModule = /** @class */ (function () {
    function FilesModule() {
    }
    FilesModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                bmodel_1.Module,
                checkbox_component_1.Module,
                switch_component_1.Module,
                loading_component_1.Module,
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
                file_list_item_1.FileComponent,
                file_list_1.FileListComponent,
                files_component_1.FilesComponent,
                new_file_component_1.NewFileComponent,
                edit_location_component_1.LocationEditComponent,
                file_selector_component_1.FileSelectorComponent,
                file_explorer_1.FileExplorer
            ],
            exports: [
                file_list_item_1.FileComponent,
                file_list_1.FileListComponent,
                files_component_1.FilesComponent,
                new_file_component_1.NewFileComponent,
                file_selector_component_1.FileSelectorComponent,
                file_explorer_1.FileExplorer
            ]
        })
    ], FilesModule);
    return FilesModule;
}());
exports.FilesModule = FilesModule;
//# sourceMappingURL=files.module.js.map