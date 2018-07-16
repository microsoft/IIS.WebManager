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
var component_1 = require("../../utils/component");
var static_content_1 = require("../static-content/static-content");
var static_content_service_1 = require("../static-content/static-content.service");
var MimeMapListItem = /** @class */ (function () {
    function MimeMapListItem(_eRef, _service) {
        this._eRef = _eRef;
        this._service = _service;
        this.enter = new core_1.EventEmitter();
        this.leave = new core_1.EventEmitter();
        this._editable = true;
    }
    MimeMapListItem.prototype.ngOnInit = function () {
        this._original = JSON.parse(JSON.stringify(this.model));
        if (this.model && !this.model.id) {
            this._editing = true;
            this.scheduleScroll();
        }
    };
    MimeMapListItem.prototype.ngOnChanges = function (changes) {
        if (changes["model"]) {
            this.setModel(changes["model"].currentValue);
        }
    };
    MimeMapListItem.prototype.setEditable = function (val) {
        this._editable = val;
    };
    MimeMapListItem.prototype.onEdit = function () {
        this.enter.emit(null);
        this._editing = true;
        this.scheduleScroll();
    };
    MimeMapListItem.prototype.onDelete = function () {
        if (confirm("Are you sure you want to delete this mime map?\nFile Extension: " + this.model.file_extension)) {
            this._service.deleteMap(this.model);
        }
    };
    MimeMapListItem.prototype.onSave = function () {
        var _this = this;
        if (!this.isValid()) {
            return;
        }
        this._editing = false;
        if (this.model.id) {
            var changes = diff_1.DiffUtil.diff(this._original, this.model);
            if (Object.keys(changes).length > 0) {
                this._service.updateMap(this.model, changes)
                    .then(function () { return _this.setModel(_this.model); });
            }
        }
        else {
            this._service.addMap(this.model);
        }
        this.leave.emit(null);
    };
    MimeMapListItem.prototype.onDiscard = function () {
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
    MimeMapListItem.prototype.isValid = function () {
        return (this.model
            && !!this.model.file_extension
            && !!this.model.mime_type);
    };
    MimeMapListItem.prototype.scheduleScroll = function () {
        var _this = this;
        setTimeout(function () {
            component_1.ComponentUtil.scrollTo(_this._eRef);
        });
    };
    MimeMapListItem.prototype.setModel = function (model) {
        this.model = model;
        this._original = JSON.parse(JSON.stringify(this.model));
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", static_content_1.MimeMap)
    ], MimeMapListItem.prototype, "model", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], MimeMapListItem.prototype, "enter", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], MimeMapListItem.prototype, "leave", void 0);
    MimeMapListItem = __decorate([
        core_1.Component({
            selector: 'mime-map',
            template: "        \n        <div *ngIf=\"model\" class=\"grid-item row\" [class.background-editing]=\"_editing\">\n\n            <div class=\"actions\">\n                <button *ngIf=\"!_editing\" class=\"no-border\" [class.inactive]=\"!_editable\" title=\"Edit\" (click)=\"onEdit()\">\n                    <i class=\"fa fa-pencil color-active\"></i>\n                </button>\n                <button *ngIf=\"_editing\" class=\"no-border\" [disabled]=\"!isValid(model)\" title=\"Ok\" (click)=\"onSave()\">\n                    <i class=\"fa fa-check color-active\"></i>\n                </button>\n                <button *ngIf=\"_editing\" class=\"no-border\" title=\"Cancel\" (click)=\"onDiscard()\">\n                    <i class=\"fa fa-times red\"></i>\n                </button>\n                <button class=\"no-border\" *ngIf=\"model.id\" title=\"Delete\" [class.inactive]=\"!_editable\" (click)=\"onDelete()\">\n                    <i class=\"fa fa-trash-o red\"></i>\n                </button>\n            </div>\n\n            <fieldset class=\"col-xs-8 col-sm-3 col-md-4\">\n                <label class=\"visible-xs\">File Extension</label>\n                <label class=\"hidden-xs\" *ngIf=\"_editing\">File Extension</label>\n                <input *ngIf=\"_editing\" class=\"form-control\" type=\"text\" [(ngModel)]=\"model.file_extension\" throttle required />\n                <span *ngIf=\"!_editing\">{{model.file_extension}}</span>\n                <div *ngIf=\"!_editing\">\n                    <br class=\"visible-xs\" />\n                </div>\n            </fieldset>\n\n            <fieldset class=\"col-xs-12 col-sm-5 col-md-4\">\n                <label class=\"visible-xs\">Mime Type</label>\n                <label class=\"hidden-xs\" *ngIf=\"_editing\">Mime Type</label>\n                <input *ngIf=\"_editing\" class=\"form-control\" type=\"text\" [(ngModel)]=\"model.mime_type\" throttle required />\n                <span *ngIf=\"!_editing\">{{model.mime_type}}</span>\n            </fieldset>\n\n        </div>\n    ",
            styles: ["\n        .grid-item:not(.background-editing) fieldset {\n            padding-top: 5px;\n            padding-bottom: 0;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [core_1.ElementRef, static_content_service_1.StaticContentService])
    ], MimeMapListItem);
    return MimeMapListItem;
}());
exports.MimeMapListItem = MimeMapListItem;
var MimeMapsListComponent = /** @class */ (function () {
    function MimeMapsListComponent(_service) {
        this._service = _service;
        this._subscriptions = [];
    }
    MimeMapsListComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._subscriptions.push(this._service.mimeMaps.subscribe(function (mimeMaps) { return _this.mimeMaps = mimeMaps; }));
    };
    MimeMapsListComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    MimeMapsListComponent.prototype.onAdd = function () {
        if (this._newMap) {
            return;
        }
        this.setEditable(false);
        var mm = new static_content_1.MimeMap();
        mm.file_extension = "";
        mm.mime_type = "";
        this._newMap = mm;
    };
    MimeMapsListComponent.prototype.setEditable = function (val) {
        this._editing = !val;
        this._mimeMapComponents.toArray().forEach(function (map) {
            map.setEditable(val);
        });
    };
    MimeMapsListComponent.prototype.onEnter = function () {
        this.setEditable(false);
    };
    MimeMapsListComponent.prototype.onLeave = function () {
        this.setEditable(true);
    };
    MimeMapsListComponent.prototype.onLeaveNew = function () {
        this._newMap = null;
        this.setEditable(true);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], MimeMapsListComponent.prototype, "mimeMaps", void 0);
    __decorate([
        core_1.ViewChildren(MimeMapListItem),
        __metadata("design:type", core_1.QueryList)
    ], MimeMapsListComponent.prototype, "_mimeMapComponents", void 0);
    MimeMapsListComponent = __decorate([
        core_1.Component({
            selector: 'mime-maps',
            template: "\n        <div *ngIf=\"mimeMaps\">\n            <button class=\"create\" (click)=\"onAdd()\" [class.inactive]=\"_editing\"><i class=\"fa fa-plus color-active\"></i><span>Add</span></button>\n\n            <div class=\"container-fluid\" [hidden]=\"!mimeMaps || mimeMaps.length < 1\">\n                <div class=\"row hidden-xs border-active grid-list-header\">\n                    <label class=\"col-xs-6 col-sm-3 col-md-4\">File Extension</label>\n                    <label class=\"col-xs-6 col-sm-5 col-md-4\">Mime Type</label>\n                </div>\n            </div>\n\n            <ul class=\"grid-list container-fluid\">\n                <li *ngIf=\"_newMap\">\n                    <mime-map [model]=\"_newMap\" (leave)=\"onLeaveNew()\"></mime-map>\n                </li>\n                <li *ngFor=\"let m of mimeMaps; let i = index;\">\n                    <mime-map [model]=\"m\" (enter)=\"onEnter()\" (leave)=\"onLeave()\"></mime-map>\n                </li>\n            </ul>\n        </div>  \n    "
        }),
        __metadata("design:paramtypes", [static_content_service_1.StaticContentService])
    ], MimeMapsListComponent);
    return MimeMapsListComponent;
}());
exports.MimeMapsListComponent = MimeMapsListComponent;
//# sourceMappingURL=mime-maps-list.component.js.map