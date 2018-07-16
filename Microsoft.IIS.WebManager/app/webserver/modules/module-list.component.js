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
var module_component_1 = require("./module.component");
var ModuleListComponent = /** @class */ (function () {
    function ModuleListComponent() {
        this.removeM = new core_1.EventEmitter();
        this.removeE = new core_1.EventEmitter();
        this.removeD = new core_1.EventEmitter();
        this.enable = new core_1.EventEmitter();
        this.disable = new core_1.EventEmitter();
        this.saveManaged = new core_1.EventEmitter();
        this.saveNative = new core_1.EventEmitter();
        this._nativeActions = "edit";
    }
    ModuleListComponent.prototype.ngOnInit = function () {
        if (this.isServerSetting) {
            this._nativeActions += ",delete";
        }
    };
    ModuleListComponent.prototype.removeManaged = function (index) {
        this.removeM.emit(index);
    };
    ModuleListComponent.prototype.removeEnabled = function (index) {
        this.removeE.emit(index);
    };
    ModuleListComponent.prototype.removeDisabled = function (index) {
        this.removeD.emit(index);
    };
    ModuleListComponent.prototype.enableNative = function (index) {
        this.enable.emit(index);
    };
    ModuleListComponent.prototype.disableNative = function (index) {
        this.disable.emit(index);
    };
    ModuleListComponent.prototype.create = function () {
        this._creating = true;
        this.setEditable(false);
    };
    ModuleListComponent.prototype.onEdit = function () {
        this.setEditable(false);
    };
    ModuleListComponent.prototype.onLeave = function () {
        this.setEditable(true);
    };
    ModuleListComponent.prototype.onCancelNew = function () {
        this._creating = false;
        this.setEditable(true);
    };
    ModuleListComponent.prototype.onSaveManaged = function (module) {
        this.saveManaged.emit(module);
        this._creating = false;
        this.setEditable(true);
    };
    ModuleListComponent.prototype.onSaveNative = function (module) {
        this.saveNative.emit(module);
        this._creating = false;
        this.setEditable(true);
    };
    ModuleListComponent.prototype.setEditable = function (val) {
        var comps = this.moduleComponents.toArray();
        for (var _i = 0, comps_1 = comps; _i < comps_1.length; _i++) {
            var comp = comps_1[_i];
            comp.setEditable(val);
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], ModuleListComponent.prototype, "enabledNativeModules", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], ModuleListComponent.prototype, "disabledNativeModules", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], ModuleListComponent.prototype, "managedModules", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ModuleListComponent.prototype, "isServerSetting", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ModuleListComponent.prototype, "locked", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ModuleListComponent.prototype, "removeM", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ModuleListComponent.prototype, "removeE", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ModuleListComponent.prototype, "removeD", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ModuleListComponent.prototype, "enable", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ModuleListComponent.prototype, "disable", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ModuleListComponent.prototype, "saveManaged", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ModuleListComponent.prototype, "saveNative", void 0);
    __decorate([
        core_1.ViewChildren(module_component_1.ModuleComponent),
        __metadata("design:type", core_1.QueryList)
    ], ModuleListComponent.prototype, "moduleComponents", void 0);
    ModuleListComponent = __decorate([
        core_1.Component({
            selector: 'module-list',
            template: "\n        <button class=\"create\" (click)=\"create()\" [class.inactive]=\"_creating\">\n            <i title=\"New Module\" class=\"fa fa-plus color-active\"></i><span>Add</span>\n        </button>\n\n        <div class=\"container-fluid\">\n            <div class=\"row hidden-xs border-active grid-list-header\">\n                <label class=\"col-xs-12 col-sm-3\">Name</label>\n                <label class=\"col-sm-5 col-md-5 col-lg-6\">Image/Type</label>\n                <label class=\"col-xs-12 col-sm-2\">Status</label>\n            </div>\n        </div>\n\n        <div class=\"grid-list container-fluid\">\n\n            <new-module *ngIf=\"_creating\" (cancel)=\"onCancelNew()\" [isServerSetting]=\"isServerSetting\" (saveNative)=\"onSaveNative($event)\" (saveManaged)=\"onSaveManaged($event)\"></new-module>\n\n            <module *ngFor=\"let mModule of managedModules; let i = index;\" [module]=\"mModule\" (delete)=\"removeManaged(i)\" [enabled]=\"true\" [actions]=\"'delete'\">\n            </module>\n\n            <module *ngFor=\"let nModule of enabledNativeModules; let i = index;\" [module]=\"nModule\"\n                                                                                        [enabled]=\"true\"\n                                                                                        [actions]=\"_nativeActions\"\n                                                                                        (enabledChanged)=\"disableNative(i)\"\n                                                                                        (delete)=\"removeEnabled(i)\"\n                                                                                        (edit)=\"onEdit()\"\n                                                                                        (leave)=\"onLeave()\">\n            </module>\n\n            <module *ngFor=\"let nModule of disabledNativeModules; let i = index;\" [module]=\"nModule\"\n                                                                                         [enabled]=\"false\"\n                                                                                         [actions]=\"_nativeActions\"\n                                                                                         (enabledChanged)=\"enableNative(i)\"\n                                                                                         (delete)=\"removeDisabled(i)\"\n                                                                                         (edit)=\"onEdit()\"\n                                                                                         (leave)=\"onLeave()\">\n            </module>\n        </div>\n    "
        })
    ], ModuleListComponent);
    return ModuleListComponent;
}());
exports.ModuleListComponent = ModuleListComponent;
//# sourceMappingURL=module-list.component.js.map