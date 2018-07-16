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
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var router_1 = require("@angular/router");
var bmodel_1 = require("../../common/bmodel");
var checkbox_component_1 = require("../../common/checkbox.component");
var switch_component_1 = require("../../common/switch.component");
var loading_component_1 = require("../../notification/loading.component");
var override_mode_component_1 = require("../../common/override-mode.component");
var enum_component_1 = require("../../common/enum.component");
var error_component_1 = require("../../error/error.component");
var selector_1 = require("../../common/selector");
var virtual_list_component_1 = require("../../common/virtual-list.component");
var selectable_1 = require("../../common/selectable");
var toolbar_component_1 = require("../../files/toolbar.component");
var warning_component_1 = require("../../notification/warning.component");
var tabs_component_1 = require("../../common/tabs.component");
var files_module_1 = require("../../files/files.module");
var logging_service_1 = require("./logging.service");
var format_component_1 = require("./format.component");
var logfields_component_1 = require("./logfields.component");
var logging_component_1 = require("./logging.component");
var rollover_component_1 = require("./rollover.component");
var log_file_component_1 = require("./log-file.component");
var log_files_component_1 = require("./log-files.component");
var LoggingModule = /** @class */ (function () {
    function LoggingModule(_svc) {
        this._svc = _svc;
    }
    LoggingModule.prototype.ngOnDestroy = function () {
        if (this._svc) {
            this._svc.dispose();
            this._svc = null;
        }
    };
    LoggingModule = __decorate([
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
                enum_component_1.Module,
                error_component_1.Module,
                selector_1.Module,
                virtual_list_component_1.Module,
                selectable_1.Module,
                toolbar_component_1.Module,
                warning_component_1.Module,
                files_module_1.FilesModule,
                tabs_component_1.Module
            ],
            declarations: [
                format_component_1.FormatComponent,
                logfields_component_1.CustomFieldsComponent,
                logfields_component_1.LogFieldsComponent,
                logging_component_1.LoggingComponent,
                rollover_component_1.RolloverComponent,
                log_file_component_1.LogFileComponent,
                log_files_component_1.LogFilesComponent
            ],
            providers: [
                logging_service_1.LoggingService
            ]
        }),
        __metadata("design:paramtypes", [logging_service_1.LoggingService])
    ], LoggingModule);
    return LoggingModule;
}());
exports.LoggingModule = LoggingModule;
//# sourceMappingURL=logging.module.js.map