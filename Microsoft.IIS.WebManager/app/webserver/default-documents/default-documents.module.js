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
var error_component_1 = require("../../error/error.component");
var sort_pipe_1 = require("../../common/sort.pipe");
var default_documents_service_1 = require("./default-documents.service");
var default_documents_component_1 = require("./default-documents.component");
var file_list_component_1 = require("./file-list.component");
var DefaultDocumentsModule = /** @class */ (function () {
    function DefaultDocumentsModule() {
    }
    DefaultDocumentsModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                router_1.RouterModule,
                bmodel_1.Module,
                switch_component_1.Module,
                loading_component_1.Module,
                sort_pipe_1.Module,
                override_mode_component_1.Module,
                error_component_1.Module
            ],
            declarations: [
                default_documents_component_1.DefaultDocumentsComponent,
                file_list_component_1.FileListItem,
                file_list_component_1.FileListComponent
            ],
            providers: [
                default_documents_service_1.DefaultDocumentsService
            ]
        })
    ], DefaultDocumentsModule);
    return DefaultDocumentsModule;
}());
exports.DefaultDocumentsModule = DefaultDocumentsModule;
//# sourceMappingURL=default-documents.module.js.map