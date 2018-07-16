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
var sort_pipe_1 = require("../../common/sort.pipe");
var default_documents_1 = require("./default-documents");
var default_documents_service_1 = require("./default-documents.service");
var FileListItem = /** @class */ (function () {
    function FileListItem(_service) {
        this._service = _service;
        this.edit = new core_1.EventEmitter();
        this.close = new core_1.EventEmitter();
    }
    FileListItem.prototype.ngOnInit = function () {
        this._original = JSON.parse(JSON.stringify(this.model));
        if (this.model && !this.model.id) {
            this._editing = true;
        }
    };
    FileListItem.prototype.ngOnChanges = function (changes) {
        if (changes["file"]) {
            this._original = JSON.parse(JSON.stringify(changes["file"].currentValue));
        }
    };
    FileListItem.prototype.onEdit = function () {
        this._editing = true;
        this.edit.emit(null);
    };
    FileListItem.prototype.onOk = function () {
        var _this = this;
        if (!this.isValid()) {
            return;
        }
        if (this.model.id) {
            //
            // Update
            var changes = diff_1.DiffUtil.diff(this._original, this.model);
            if (Object.keys(changes).length > 0) {
                this._service.updateFile(this.model, changes).then(function (_) {
                    _this.set(_this.model);
                    _this.hide();
                });
            }
            else {
                this.hide();
            }
        }
        else {
            //
            // Create new
            this._service.addFile(this.model).then(function (_) {
                _this.set(_this.model);
                _this.hide();
            });
        }
    };
    FileListItem.prototype.onCancel = function () {
        //
        // Revert changes
        var original = JSON.parse(JSON.stringify(this._original));
        for (var k in original)
            this.model[k] = original[k];
        this.hide();
    };
    FileListItem.prototype.onDelete = function () {
        if (this.model.id) {
            this._service.deleteFile(this.model);
        }
        this.hide();
    };
    FileListItem.prototype.isValid = function () {
        return !!this.model.name;
    };
    FileListItem.prototype.set = function (file) {
        this._original = JSON.parse(JSON.stringify(file));
    };
    FileListItem.prototype.hide = function () {
        this._editing = false;
        this.close.emit(null);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", default_documents_1.File)
    ], FileListItem.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], FileListItem.prototype, "readonly", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], FileListItem.prototype, "edit", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], FileListItem.prototype, "close", void 0);
    FileListItem = __decorate([
        core_1.Component({
            selector: 'file',
            template: "        \n        <div *ngIf=\"model\" class=\"grid-item row\" [class.background-editing]=\"_editing\">\n            <div class=\"actions\">\n                <button class=\"no-border no-editing\" [class.inactive]=\"readonly\" title=\"Edit\" (click)=\"onEdit()\">\n                    <i class=\"fa fa-pencil color-active\"></i>\n                </button>\n                <button class=\"no-border editing\" [disabled]=\"!isValid(file)\" title=\"Ok\" (click)=\"onOk()\">\n                    <i class=\"fa fa-check color-active\"></i>\n                </button>\n                <button class=\"no-border editing\" title=\"Cancel\" (click)=\"onCancel()\">\n                    <i class=\"fa fa-times red\"></i>\n                </button>\n                <button class=\"no-border\" title=\"Delete\" [class.inactive]=\"readonly\" (click)=\"onDelete()\">\n                    <i class=\"fa fa-trash-o red\"></i>\n                </button>\n            </div>\n            <fieldset class=\"col-xs-8\">\n                <input *ngIf=\"_editing\" class=\"form-control\" type=\"text\" [(ngModel)]=\"model.name\" required />\n                <span *ngIf=\"!_editing\" class=\"form-control\">{{model.name}}</span>\n            </fieldset>\n        </div>\n    ",
            styles: ["\n        .grid-item fieldset {\n            padding-top: 0;\n            padding-bottom: 0;\n            padding-right: 0;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [default_documents_service_1.DefaultDocumentsService])
    ], FileListItem);
    return FileListItem;
}());
exports.FileListItem = FileListItem;
var FileListComponent = /** @class */ (function () {
    function FileListComponent(_service) {
        this._service = _service;
        this._orderBy = new sort_pipe_1.OrderBy();
        this._subs = [];
    }
    FileListComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._subs.push(this._service.files.subscribe(function (files) {
            _this._files = [];
            if (files) {
                files.forEach(function (f) { return _this._files.push(f); });
            }
        }));
    };
    FileListComponent.prototype.ngOnDestroy = function () {
        this._subs.forEach(function (s) { return s.unsubscribe(); });
    };
    FileListComponent.prototype.add = function () {
        this._newFile = new default_documents_1.File();
        this._newFile.name = "";
        this._editing = this._newFile;
    };
    FileListComponent.prototype.edit = function (file) {
        this._editing = file;
    };
    FileListComponent.prototype.close = function () {
        this._newFile = this._editing = null;
    };
    FileListComponent = __decorate([
        core_1.Component({
            selector: 'files',
            template: "\n        <div>\n            <button class=\"create\" (click)=\"add()\" [class.inactive]=\"_editing\"><i class=\"fa fa-plus color-active\"></i><span>Add</span></button>\n            <div *ngIf=\"_files\">\n                <div class=\"col-sm-6 col-lg-4\">\n                    <div class=\"row hidden-xs border-active grid-list-header\" [hidden]=\"_files.length < 1\">\n                        <label [ngClass]=\"_orderBy.css('name')\" (click)=\"_orderBy.sort('name')\">File Name</label>\n                    </div>\n                    <div class=\"grid-list\">\n                        <file *ngIf=\"_newFile\" [model]=\"_newFile\" (close)=\"close()\"></file>\n                        <file *ngFor=\"let f of _files | orderby: _orderBy.Field: _orderBy.Asc\" \n                                        [model]=\"f\" \n                                        [readonly]=\"_editing && f != _editing\"\n                                        (edit)=\"edit(f)\" (close)=\"close()\">\n                        </file>\n                    </div>\n                </div>\n            </div>\n        </div>\n    "
        }),
        __metadata("design:paramtypes", [default_documents_service_1.DefaultDocumentsService])
    ], FileListComponent);
    return FileListComponent;
}());
exports.FileListComponent = FileListComponent;
//# sourceMappingURL=file-list.component.js.map