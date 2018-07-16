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
var ModuleComponent = /** @class */ (function () {
    function ModuleComponent() {
        this.edit = new core_1.EventEmitter();
        this.delete = new core_1.EventEmitter();
        this.leave = new core_1.EventEmitter();
        this.enabledChanged = new core_1.EventEmitter();
        this._editable = true;
    }
    ModuleComponent.prototype.ngOnInit = function () {
        this._originalEnabled = this.enabled;
        if (this.module && this.module.type) {
            this.displayImage_Type = this.module.type;
        }
        else if (this.module && this.module.image) {
            this.displayImage_Type = this.module.image;
        }
    };
    ModuleComponent.prototype.setEditable = function (val) {
        this._editable = val;
    };
    ModuleComponent.prototype.onEdit = function () {
        this._isEditing = true;
        this.edit.emit(null);
    };
    ModuleComponent.prototype.onDiscardChanges = function () {
        this._isEditing = false;
        this.enabled = this._originalEnabled;
        this.leave.emit(null);
    };
    ModuleComponent.prototype.onFinishEditing = function () {
        this._isEditing = false;
        if (this.enabled != this._originalEnabled) {
            this.enabledChanged.emit(null);
            this._originalEnabled = this.enabled;
        }
        this.leave.emit(null);
    };
    ModuleComponent.prototype.onDelete = function () {
        if (confirm("Are you sure you want to delete " + this.module.name + "?")) {
            this.delete.emit(null);
        }
    };
    ModuleComponent.prototype.allow = function (action) {
        return this.actions && this.actions.indexOf(action) >= 0;
    };
    ModuleComponent.prototype.actionClasses = function () {
        return {
            "background-normal": !this._isEditing,
            "background-editing": this._isEditing
        };
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", modules_1.LocalModule)
    ], ModuleComponent.prototype, "module", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ModuleComponent.prototype, "enabled", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], ModuleComponent.prototype, "actions", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ModuleComponent.prototype, "edit", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ModuleComponent.prototype, "delete", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ModuleComponent.prototype, "leave", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ModuleComponent.prototype, "enabledChanged", void 0);
    ModuleComponent = __decorate([
        core_1.Component({
            selector: "module",
            styles: ["\n        .nowrap,\n        .supporting {\n            white-space: nowrap;\n            overflow: hidden;\n            text-overflow: ellipsis;\n        }\n\n        .actions {\n            right: 0;\n            top: 2px;\n        }\n        \n        .grid-item fieldset {\n            padding-top: 5px;\n            padding-bottom: 0;\n        }\n\n        .fa-circle {\n            margin-right: 2px;\n        }\n\n        .visible-xs-inline-block {\n            margin-left: 15px;\n        }\n    "],
            template: "\n        <div *ngIf=\"module\" class=\"row grid-item\" [class.background-editing]=\"_isEditing\">\n\n            <div class=\"actions\" [ngClass]=\"actionClasses()\">\n                <button class=\"no-border\" title=\"Ok\" *ngIf=\"_isEditing\" (click)=\"onFinishEditing()\">\n                    <i class=\"fa fa-check blue\"></i>\n                </button>\n                <button class=\"no-border\" title=\"Cancel\" *ngIf=\"_isEditing\" (click)=\"onDiscardChanges()\">\n                    <i class=\"fa fa-times red\"></i>\n                </button>\n                <button class=\"no-border\" title=\"Edit\" [disabled]=\"!_editable\" *ngIf=\"!_isEditing && allow('edit')\" (click)=\"onEdit()\">\n                    <i class=\"fa fa-pencil blue\"></i>\n                </button>\n                <button class=\"no-border\" title=\"Delete\" [disabled]=\"!_editable\" *ngIf=\"allow('delete')\" (click)=\"onDelete()\">\n                    <i class=\"fa fa-trash-o red\"></i>\n                </button>\n            </div>\n\n            <fieldset class=\"col-xs-8 col-sm-3\">\n                <label class=\"hidden-xs editing\">Name</label>\n                <div [class.stopped]=\"!enabled\" class=\"nowrap\">\n                    <i class=\"fa fa-circle green\" *ngIf=\"enabled\"></i>\n                    <i class=\"fa fa-circle-o stopped\" *ngIf=\"!enabled\"></i>\n                    {{module.name}}\n                </div>\n            </fieldset>\n            <fieldset class=\"nowrap col-xs-8 col-sm-4 col-md-4 col-lg-5\">\n                <label *ngIf=\"_isEditing\" class=\"hidden-xs block\">{{module.type ? \"Type\" : \"Image\"}}</label>\n                <span class=\"visible-xs-inline-block\"></span>\n                <span [class.stopped]=\"!enabled\" class=\"always visible-xs-inline supporting\">{{displayImage_Type}}</span>\n                <span [class.stopped]=\"!enabled\" class=\"always hidden-xs\">{{displayImage_Type}}</span>\n                <div>\n                    <br *ngIf=\"_isEditing\" class=\"visible-xs\"/>\n                </div>\n            </fieldset>\n            <fieldset class=\"col-xs-8 col-sm-3 col-md-3 col-lg-2\">\n                <label class=\"editing\"><span class=\"visible-xs-inline-block\"></span>Status</label>\n                <div [hidden]=\"!_isEditing\">\n                    <span class=\"visible-xs-inline-block\"></span>\n                    <switch [(model)]=\"enabled\">{{enabled ? 'Enabled' : 'Disabled'}}</switch>\n                </div>\n                <span *ngIf=\"!_isEditing\" class=\"visible-xs-inline-block\"></span>\n                <span *ngIf=\"!_isEditing\" [class.stopped]=\"!enabled\" [class.green]=\"enabled\">{{enabled ? 'Enabled' : 'Disabled'}}</span>\n            </fieldset>\n\n        </div>\n    "
        })
    ], ModuleComponent);
    return ModuleComponent;
}());
exports.ModuleComponent = ModuleComponent;
//# sourceMappingURL=module.component.js.map