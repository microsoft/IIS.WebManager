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
var autosize_1 = require("../../common/autosize");
var bmodel_1 = require("../../common/bmodel");
var checkbox_component_1 = require("../../common/checkbox.component");
var switch_component_1 = require("../../common/switch.component");
var loading_component_1 = require("../../notification/loading.component");
var sort_pipe_1 = require("../../common/sort.pipe");
var override_mode_component_1 = require("../../common/override-mode.component");
var enum_component_1 = require("../../common/enum.component");
var string_list_component_1 = require("../../common/string-list.component");
var virtual_list_component_1 = require("../../common/virtual-list.component");
var selector_1 = require("../../common/selector");
var error_component_1 = require("../../error/error.component");
var selectable_1 = require("../../common/selectable");
var toolbar_component_1 = require("../../files/toolbar.component");
var warning_component_1 = require("../../notification/warning.component");
var tabs_component_1 = require("../../common/tabs.component");
var files_module_1 = require("../../files/files.module");
var request_tracing_service_1 = require("./request-tracing.service");
var provider_list_component_1 = require("./provider-list.component");
var provider_component_1 = require("./provider.component");
var request_tracing_component_1 = require("./request-tracing.component");
var rule_list_component_1 = require("./rule-list.component");
var rule_component_1 = require("./rule.component");
var trace_component_1 = require("./trace.component");
var trace_file_list_component_1 = require("./trace-file-list.component");
var trace_file_component_1 = require("./trace-file.component");
var RequestTracingModule = /** @class */ (function () {
    function RequestTracingModule(_svc) {
        this._svc = _svc;
    }
    RequestTracingModule.prototype.ngOnDestroy = function () {
        if (this._svc) {
            this._svc.dispose();
            this._svc = null;
        }
    };
    RequestTracingModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                router_1.RouterModule,
                autosize_1.Module,
                bmodel_1.Module,
                checkbox_component_1.Module,
                switch_component_1.Module,
                loading_component_1.Module,
                sort_pipe_1.Module,
                override_mode_component_1.Module,
                enum_component_1.Module,
                string_list_component_1.Module,
                virtual_list_component_1.Module,
                selector_1.Module,
                error_component_1.Module,
                selectable_1.Module,
                toolbar_component_1.Module,
                warning_component_1.Module,
                tabs_component_1.Module,
                files_module_1.FilesModule
            ],
            declarations: [
                provider_list_component_1.ProvidersComponent,
                provider_component_1.ProviderComponent,
                request_tracing_component_1.RequestTracingComponent,
                rule_list_component_1.RulesComponent,
                rule_component_1.RuleComponent,
                trace_component_1.TraceComponent,
                trace_file_component_1.TraceFileComponent,
                trace_file_list_component_1.TraceFileListComponent
            ],
            providers: [
                request_tracing_service_1.RequestTracingService
            ]
        }),
        __metadata("design:paramtypes", [request_tracing_service_1.RequestTracingService])
    ], RequestTracingModule);
    return RequestTracingModule;
}());
exports.RequestTracingModule = RequestTracingModule;
//# sourceMappingURL=request-tracing.module.js.map