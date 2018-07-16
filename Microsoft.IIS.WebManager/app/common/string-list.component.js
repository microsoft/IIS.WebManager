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
var focus_1 = require("./focus");
var validators_1 = require("./validators");
var StringListComponent = /** @class */ (function () {
    function StringListComponent() {
        this.edit = new core_1.EventEmitter();
        this.modelChange = new core_1.EventEmitter();
        this.modelChanged = new core_1.EventEmitter();
        this._editing = -1;
    }
    StringListComponent.prototype.ngOnInit = function () {
        this.reset();
    };
    StringListComponent.prototype.ngOnChanges = function (changes) {
        if (changes["model"]) {
            if (this.list && this.list.length == 0 || changes["model"].currentValue.length == 0) {
                this.reset();
            }
        }
    };
    StringListComponent.prototype.onModelChanged = function () {
        var _this = this;
        this.model = this.list.filter(function (v, index) { return _this.indexOf(v) === index; })
            .map(function (o) { return o.value; });
        if (this.sort) {
            this.model = this.model.sort();
        }
        this.reset();
        this.modelChange.emit(this.model);
        this.modelChanged.emit(this.model);
    };
    StringListComponent.prototype.add = function () {
        this.onAdd();
    };
    StringListComponent.prototype.onAdd = function () {
        if (this._editing != -1) {
            this.save(this._editing);
        }
        if (this.list.length > this.model.length) {
            this.save(0);
        }
        this.list.splice(0, 0, { value: "" });
        this.onEdit(0);
    };
    StringListComponent.prototype.onEdit = function (i) {
        var l = this.list.length;
        if (this._editing != -1) {
            this.save(this._editing);
        }
        i = i - (l - this.list.length);
        this._editing = i;
        this.edit.emit(i);
    };
    StringListComponent.prototype.delete = function (i) {
        this.list.splice(i, 1);
        this._editing = -1;
        this.list = this.list.filter(function (elem) { return elem.value; });
        this.onModelChanged();
    };
    StringListComponent.prototype.save = function (i) {
        var elem = this.list[i];
        if (!elem.value) {
            this.list.splice(i, 1);
        }
        this._editing = -1;
        this.onModelChanged();
    };
    StringListComponent.prototype.cancel = function (i) {
        if (this.list.length > this.model.length) {
            this.list.splice(i, 1);
        }
        else {
            this.list[i].value = this.model[i];
        }
        this._editing = -1;
    };
    StringListComponent.prototype.reset = function () {
        this.list = this.model.slice(0).map(function (v) { return { value: v }; }); // copy
        this._editing = -1;
    };
    StringListComponent.prototype.indexOf = function (o) {
        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i] == o || this.list[i].value == o.value) {
                return i;
            }
        }
        return -1;
    };
    StringListComponent.prototype.shouldDisable = function (index) {
        return !this._editModel || !this._editModel.valid || this.validator && this.validator(this.list[index].value);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], StringListComponent.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Function)
    ], StringListComponent.prototype, "validator", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], StringListComponent.prototype, "sort", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], StringListComponent.prototype, "useAddButton", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], StringListComponent.prototype, "title", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], StringListComponent.prototype, "edit", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], StringListComponent.prototype, "modelChange", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], StringListComponent.prototype, "modelChanged", void 0);
    __decorate([
        core_1.ViewChild('val'),
        __metadata("design:type", Object)
    ], StringListComponent.prototype, "_editModel", void 0);
    StringListComponent = __decorate([
        core_1.Component({
            selector: 'string-list',
            template: "        \n        <fieldset *ngIf=\"useAddButton\">\n            <button (click)=\"onAdd()\"><i class=\"fa fa-plus color-active\"></i><span>Add</span></button>\n        </fieldset>\n        <div *ngIf='list.length > 0'>\n            <ul class=\"grid-list container-fluid\">\n                <li *ngFor=\"let item of list; let i = index\" class=\"row border-color grid-item\" (dblclick)=\"onEdit(i)\" [class.background-editing]=\"i === _editing\">\n                    <div class=\"col-xs-12\">\n                        <div class=\"actions\">\n                            <button [disabled]=\"shouldDisable(i)\" *ngIf=\"_editing == i\" title=\"Ok\" (click)=\"save(i)\">\n                                <i class=\"fa fa-check color-active\"></i>\n                            </button>\n                            <button *ngIf=\"_editing == i\" title=\"Cancel\" (click)=\"cancel(i)\">\n                                <i class=\"fa fa-times red\"></i>\n                            </button>\n                            <button *ngIf=\"_editing != i\" title=\"Edit\" (click)=\"onEdit(i)\">\n                                <i class=\"fa fa-pencil color-active\"></i>\n                            </button>\n                            <button title=\"Delete\" (click)=\"delete(i)\">\n                                <i class=\"fa fa-trash-o red\"></i>\n                            </button>\n                        </div>\n                        <div>\n                            <span class=\"form-control\" *ngIf=\"_editing != i\">{{item.value}}</span>\n                        </div>\n                        <div *ngIf=\"_editing == i\">\n                            <input  #val='ngModel' autofocus [(ngModel)]=\"list[i].value\" class=\"form-control\" type=\"text\" required [lateBindValidator]=\"validator\" (keyup.enter)=\"save(i)\" [attr.title]=\"!title ? null : title\" />\n                        </div>\n                    </div>\n                </li>\n            </ul>\n        </div>\n    ",
            styles: ["\n        span.form-control {\n            background-color: inherit;\n        }\n\n        .col-xs-12 {\n            padding: 0px;\n            padding-left: 5px;\n        }\n\n        .col-xs-12 > div {\n            white-space: nowrap;\n            overflow: hidden;\n            text-overflow: ellipsis;\n        }\n\n        .actions {\n            padding-left: 5px;\n        }\n    "],
            exportAs: 'stringList'
        })
    ], StringListComponent);
    return StringListComponent;
}());
exports.StringListComponent = StringListComponent;
var Module = /** @class */ (function () {
    function Module() {
    }
    Module = __decorate([
        core_1.NgModule({
            imports: [
                forms_1.FormsModule,
                common_1.CommonModule,
                validators_1.Module,
                focus_1.Module
            ],
            exports: [
                StringListComponent
            ],
            declarations: [
                StringListComponent
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=string-list.component.js.map