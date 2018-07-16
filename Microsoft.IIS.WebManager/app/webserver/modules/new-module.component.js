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
var modules_1 = require("./modules");
var NewModuleComponent = /** @class */ (function () {
    function NewModuleComponent() {
        this.cancel = new core_1.EventEmitter();
        this.saveManaged = new core_1.EventEmitter();
        this.saveNative = new core_1.EventEmitter();
        this.moduleType = "managed";
        this._creating = false;
    }
    NewModuleComponent.prototype.ngOnInit = function () {
        this.reset();
    };
    NewModuleComponent.prototype.create = function () {
        this._creating = true;
    };
    NewModuleComponent.prototype.onCancel = function () {
        this.reset();
        this.cancel.emit(null);
    };
    NewModuleComponent.prototype.onSave = function () {
        if (this.isValidNativeModule()) {
            this.saveNative.emit(this.newNativeModule);
            this.reset();
        }
        else if (this.isValidManagedModule()) {
            this.saveManaged.emit(this.newManagedModule);
            this.reset();
        }
    };
    NewModuleComponent.prototype.isValid = function () {
        return this.isValidManagedModule() || this.isValidNativeModule();
    };
    NewModuleComponent.prototype.isValidNativeModule = function () {
        return this.moduleType == "native"
            && this.isServerSetting
            && this.newNativeModule.name != ""
            && this.newNativeModule.image != "";
    };
    NewModuleComponent.prototype.isValidManagedModule = function () {
        return this.moduleType == "managed"
            && this.newManagedModule.name != ""
            && this.newManagedModule.type != "";
    };
    NewModuleComponent.prototype.reset = function () {
        this.newManagedModule = new modules_1.LocalModule();
        this.newNativeModule = new modules_1.GlobalModule();
        this.newManagedModule.name = "";
        this.newManagedModule.type = "";
        this.newNativeModule.name = "";
        this.newNativeModule.image = "";
        this._creating = false;
        this.moduleType = "managed";
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], NewModuleComponent.prototype, "isServerSetting", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], NewModuleComponent.prototype, "cancel", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], NewModuleComponent.prototype, "saveManaged", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], NewModuleComponent.prototype, "saveNative", void 0);
    NewModuleComponent = __decorate([
        core_1.Component({
            selector: 'new-module',
            template: "\n        <div class=\"grid-item background-editing row\">\n            <div class=\"actions\">\n                <button class=\"no-border\" [disabled]=\"!isValid()\" (click)=\"onSave()\">\n                    <i class=\"fa fa-check color-active\" title=\"Save\"></i>\n                </button>\n                <button class=\"no-border\" (click)=\"onCancel()\">\n                    <i class=\"fa fa-times red\" title=\"Cancel\"></i>\n                </button>\n            </div>\n            <fieldset class=\"col-xs-8\" *ngIf=\"isServerSetting\">\n                <enum [(model)]=\"moduleType\">\n                    <field name=\"Managed\" value=\"managed\"></field>\n                    <field name=\"Native\" value=\"native\"></field>\n                </enum>\n            </fieldset>\n            <div class=\"col-xs-12\" *ngIf=\"isServerSetting\"></div>\n            <fieldset class=\"col-sm-4 col-md-5\" *ngIf=\"moduleType != 'native'\">\n                <label>Name</label>\n                <input class=\"form-control\" type=\"text\" [(ngModel)]=\"newManagedModule.name\" throttle required />\n            </fieldset>\n            <fieldset class=\"col-sm-5\" *ngIf=\"moduleType != 'native'\">\n                <label>Type</label>\n                <input class=\"form-control\" type=\"text\" [(ngModel)]=\"newManagedModule.type\" throttle required />\n            </fieldset>\n            <fieldset class=\"col-sm-4 col-md-5\" *ngIf=\"moduleType == 'native'\">\n                <label>Name</label>\n                <input class=\"form-control\" type=\"text\" [(ngModel)]=\"newNativeModule.name\" throttle required />\n            </fieldset>\n            <fieldset class=\"col-sm-5\" *ngIf=\"moduleType == 'native'\">\n                <label>Image</label>\n                <input class=\"form-control\" type=\"text\" [(ngModel)]=\"newNativeModule.image\" throttle required />\n            </fieldset>\n        </div>\n    "
        })
    ], NewModuleComponent);
    return NewModuleComponent;
}());
exports.NewModuleComponent = NewModuleComponent;
//# sourceMappingURL=new-module.component.js.map