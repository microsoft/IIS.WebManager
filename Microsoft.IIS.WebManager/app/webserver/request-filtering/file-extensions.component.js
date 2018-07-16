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
var diff_1 = require("../../utils/diff");
var request_filtering_1 = require("./request-filtering");
var component_1 = require("../../utils/component");
var request_filtering_service_1 = require("./request-filtering.service");
var FileExtensionComponent = /** @class */ (function () {
    function FileExtensionComponent(_eRef, _service) {
        this._eRef = _eRef;
        this._service = _service;
        this.enter = new core_1.EventEmitter();
        this.leave = new core_1.EventEmitter();
        this._editable = true;
    }
    FileExtensionComponent.prototype.ngOnInit = function () {
        this._original = JSON.parse(JSON.stringify(this.model));
        if (this.model) {
            if (!this.model.extension) {
                this._editing = true;
                this.scheduleScroll();
            }
        }
    };
    FileExtensionComponent.prototype.ngOnChanges = function (changes) {
        if (changes["model"]) {
            this.setModel(changes["model"].currentValue);
        }
    };
    FileExtensionComponent.prototype.setEditable = function (val) {
        this._editable = val;
    };
    FileExtensionComponent.prototype.onEdit = function () {
        this.enter.emit(null);
        this._editing = true;
        this.scheduleScroll();
    };
    FileExtensionComponent.prototype.onDelete = function () {
        if (confirm("Are you sure you want to delete this extension?\nExtension: " + this.model.extension)) {
            this._service.deleteFileExtension(this.model);
        }
    };
    FileExtensionComponent.prototype.onSave = function () {
        var _this = this;
        if (!this.isValid()) {
            return;
        }
        this._editing = false;
        if (this.model.id) {
            var changes = diff_1.DiffUtil.diff(this._original, this.model);
            if (Object.keys(changes).length > 0) {
                this._service.updateFileExtension(this.model, changes)
                    .then(function () { return _this.setModel(_this.model); });
            }
        }
        else {
            this._service.addFileExtension(this.model);
        }
        this.leave.emit(null);
    };
    FileExtensionComponent.prototype.onDiscard = function () {
        if (this._editing) {
            var keys = Object.keys(this._original);
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                this.model[key] = JSON.parse(JSON.stringify(this._original[key] || null));
            }
            this._editing = false;
            this.leave.emit(null);
        }
    };
    FileExtensionComponent.prototype.isValid = function () {
        return !!this.model.extension;
    };
    FileExtensionComponent.prototype.scheduleScroll = function () {
        var _this = this;
        setTimeout(function () {
            component_1.ComponentUtil.scrollTo(_this._eRef);
        });
    };
    FileExtensionComponent.prototype.setModel = function (model) {
        this.model = model;
        this._original = JSON.parse(JSON.stringify(this.model));
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", request_filtering_1.FileExtension)
    ], FileExtensionComponent.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], FileExtensionComponent.prototype, "locked", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], FileExtensionComponent.prototype, "enter", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], FileExtensionComponent.prototype, "leave", void 0);
    FileExtensionComponent = __decorate([
        core_1.Component({
            selector: 'file-extension',
            template: "\n        <div *ngIf=\"model\" class=\"grid-item row\" [class.background-editing]=\"_editing\">\n\n            <div class=\"actions\">\n                <button class=\"no-border\" *ngIf=\"!_editing\" [class.inactive]=\"!_editable\" title=\"Edit\" (click)=\"onEdit()\">\n                    <i class=\"fa fa-pencil color-active\"></i>\n                </button>\n                <button class=\"no-border\" *ngIf=\"_editing\" [disabled]=\"!isValid() || locked\" title=\"Ok\" (click)=\"onSave()\">\n                    <i class=\"fa fa-check color-active\"></i>\n                </button>\n                <button class=\"no-border\" title=\"Cancel\" *ngIf=\"_editing\" (click)=\"onDiscard()\">\n                    <i class=\"fa fa-times red\"></i>\n                </button>\n                <button class=\"no-border\" *ngIf=\"model.id\" [disabled]=\"locked\" title=\"Delete\" [class.inactive]=\"!_editable\" (click)=\"onDelete()\">\n                    <i class=\"fa fa-trash-o red\"></i>\n                </button>\n            </div>\n\n            <fieldset class=\"col-xs-8 col-sm-4\">\n                <label class=\"visible-xs\">Extension</label>\n                <label class=\"hidden-xs\" [hidden]=\"!_editing\">Extension</label>\n                <i class=\"fa fa-circle green hidden-xs\" *ngIf=\"model.allow && !_editing\"></i>\n                <i class=\"fa fa-ban red hidden-xs\" *ngIf=\"!model.allow && !_editing\"></i>\n                <input class=\"form-control\" *ngIf=\"_editing\" type=\"text\" [disabled]=\"locked\" [(ngModel)]=\"model.extension\" throttle required />\n                <span *ngIf=\"!_editing\">{{model.extension}}</span>\n                <div *ngIf=\"!_editing\">\n                    <br class=\"visible-xs\" />\n                </div>\n            </fieldset>\n\n            <fieldset class=\"col-xs-12 col-sm-4\">\n                <label class=\"visible-xs\">Allowed</label>\n                <label class=\"hidden-xs\" [hidden]=\"!_editing\">Allowed</label>\n                <span *ngIf=\"!_editing\">{{model.allow ? \"Allow\" : \"Deny\"}}</span>\n                <switch class=\"block\" *ngIf=\"_editing\" [disabled]=\"locked\" [(model)]=\"model.allow\">{{model.allow ? \"Allow\" : \"Deny\"}}</switch>\n            </fieldset>\n\n        </div>\n    ",
            styles: ["\n        .grid-item:not(.background-editing) fieldset {\n            padding-top: 5px;\n            padding-bottom: 0;\n        }\n\n        .fa-circle,\n        .fa-ban {\n            font-size: 20px;\n            margin-right: 10px;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [core_1.ElementRef, request_filtering_service_1.RequestFilteringService])
    ], FileExtensionComponent);
    return FileExtensionComponent;
}());
exports.FileExtensionComponent = FileExtensionComponent;
var FileExtensionsComponent = /** @class */ (function () {
    function FileExtensionsComponent(_service) {
        this._service = _service;
        this.extensions = [];
        this._subscriptions = [];
    }
    FileExtensionsComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._subscriptions.push(this._service.fileExtensions.subscribe(function (extensions) { return _this.extensions = extensions; }));
    };
    FileExtensionsComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    FileExtensionsComponent.prototype.onAdd = function () {
        if (this._newExtension) {
            return;
        }
        this.setEditable(false);
        this._newExtension = new request_filtering_1.FileExtension();
        this._newExtension.extension = '';
        this._newExtension.allow = false;
    };
    FileExtensionsComponent.prototype.setEditable = function (val) {
        this._editing = !val;
        var extensions = this.extensionComponents.toArray();
        extensions.forEach(function (extension, i) {
            extension.setEditable(val);
        });
    };
    FileExtensionsComponent.prototype.onEnter = function () {
        this.setEditable(false);
    };
    FileExtensionsComponent.prototype.onLeave = function () {
        this.setEditable(true);
    };
    FileExtensionsComponent.prototype.onLeaveNew = function () {
        this._newExtension = null;
        this.setEditable(true);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], FileExtensionsComponent.prototype, "extensions", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], FileExtensionsComponent.prototype, "locked", void 0);
    __decorate([
        core_1.ViewChildren(FileExtensionComponent),
        __metadata("design:type", core_1.QueryList)
    ], FileExtensionsComponent.prototype, "extensionComponents", void 0);
    FileExtensionsComponent = __decorate([
        core_1.Component({
            selector: 'file-extensions',
            template: "\n        <div *ngIf=\"extensions\">\n            <button class=\"create\" (click)=\"onAdd()\" [disabled]=\"locked\" [class.inactive]=\"_editing\"><i class=\"fa fa-plus color-active\"></i><span>Add</span></button>\n\n            <div class=\"container-fluid\" [hidden]=\"!extensions || extensions.length < 1\">\n                <div class=\"row hidden-xs border-active grid-list-header\">\n                    <label class=\"col-xs-12 col-sm-4\">Extension</label>\n                    <label class=\"col-xs-12 col-sm-4\">Action</label>\n                </div>\n            </div>\n\n            <ul class=\"grid-list container-fluid\">\n                <li *ngIf=\"_newExtension\">\n                    <file-extension [model]=\"_newExtension\" [locked]=\"locked\" (leave)=\"onLeaveNew()\"></file-extension>\n                </li>\n                <li *ngFor=\"let fe of extensions; let i = index;\">\n                    <file-extension [model]=\"fe\" [locked]=\"locked\" (enter)=\"onEnter()\" (leave)=\"onLeave()\"></file-extension>\n                </li>\n            </ul>\n        </div> \n    "
        }),
        __metadata("design:paramtypes", [request_filtering_service_1.RequestFilteringService])
    ], FileExtensionsComponent);
    return FileExtensionsComponent;
}());
exports.FileExtensionsComponent = FileExtensionsComponent;
//# sourceMappingURL=file-extensions.component.js.map