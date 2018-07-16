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
var module_1 = require("../websites/module");
var bmodel_1 = require("../../common/bmodel");
var validators_1 = require("../../common/validators");
var switch_component_1 = require("../../common/switch.component");
var sort_pipe_1 = require("../../common/sort.pipe");
var enum_component_1 = require("../../common/enum.component");
var files_module_1 = require("../../files/files.module");
var vdirs_service_1 = require("./vdirs.service");
var vdir_list_component_1 = require("./vdir-list.component");
var VdirsModule = /** @class */ (function () {
    function VdirsModule(_svc) {
        this._svc = _svc;
    }
    VdirsModule.prototype.ngOnDestroy = function () {
        this._svc.destroy();
    };
    VdirsModule = __decorate([
        core_1.NgModule({
            imports: [
                forms_1.FormsModule,
                common_1.CommonModule,
                files_module_1.FilesModule,
                module_1.Module,
                bmodel_1.Module,
                validators_1.Module,
                switch_component_1.Module,
                sort_pipe_1.Module,
                enum_component_1.Module
            ],
            declarations: [
                vdir_list_component_1.VdirListComponent,
                vdir_list_component_1.VdirListItem
            ],
            providers: [
                vdirs_service_1.VdirsService
            ]
        }),
        __metadata("design:paramtypes", [vdirs_service_1.VdirsService])
    ], VdirsModule);
    return VdirsModule;
}());
exports.VdirsModule = VdirsModule;
//# sourceMappingURL=vdirs.module.js.map