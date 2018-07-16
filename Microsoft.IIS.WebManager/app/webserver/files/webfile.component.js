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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var selector_1 = require("../../common/selector");
var primitives_1 = require("../../common/primitives");
var files_service_1 = require("../../files/files.service");
var webfiles_service_1 = require("./webfiles.service");
var webfile_1 = require("./webfile");
var WebFileComponent = /** @class */ (function () {
    function WebFileComponent(_service, _fileService) {
        this._service = _service;
        this._fileService = _fileService;
        this.modelChanged = new core_1.EventEmitter();
        this._editing = false;
    }
    Object.defineProperty(WebFileComponent.prototype, "href", {
        get: function () {
            return window.location.pathname + "#" + this.model.path;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebFileComponent.prototype, "displayDate", {
        get: function () {
            return primitives_1.Humanizer.date(this.model.file_info.last_modified);
        },
        enumerable: true,
        configurable: true
    });
    WebFileComponent.prototype.rename = function (name) {
        if (this._editing && name) {
            this._service.rename(this.model, name);
            this.modelChanged.emit(this.model);
        }
        this._editing = false;
    };
    WebFileComponent.prototype.onCancel = function (e) {
        e.preventDefault();
        this.selector.close();
        this.cancel();
    };
    WebFileComponent.prototype.onRename = function (e) {
        e.preventDefault();
        this.selector.close();
        if (this.model.type == webfile_1.WebFileType.Vdir) {
            return;
        }
        this._editing = true;
    };
    WebFileComponent.prototype.onDelete = function (e) {
        e.preventDefault();
        this.selector.close();
        if (confirm("Are you sure you want to delete " + this.model.name)) {
            this._service.delete([this.model]);
        }
    };
    WebFileComponent.prototype.onDownload = function (e) {
        e.preventDefault();
        this.selector.close();
        this._fileService.download(this.model.file_info);
    };
    WebFileComponent.prototype.prevent = function (e) {
        e.preventDefault();
    };
    WebFileComponent.prototype.cancel = function () {
        this.selector.close();
        this._editing = false;
    };
    WebFileComponent.prototype.openSelector = function (e) {
        this.selector.toggle();
    };
    WebFileComponent.prototype.getSize = function () {
        return this.model.file_info.size ? primitives_1.Humanizer.number(Math.ceil(this.model.file_info.size / 1024)) + ' KB' : null;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", webfile_1.WebFile)
    ], WebFileComponent.prototype, "model", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], WebFileComponent.prototype, "modelChanged", void 0);
    __decorate([
        core_1.ViewChild(selector_1.Selector),
        __metadata("design:type", selector_1.Selector)
    ], WebFileComponent.prototype, "selector", void 0);
    WebFileComponent = __decorate([
        core_1.Component({
            selector: 'file',
            template: "\n        <div *ngIf=\"model\" class=\"grid-item row\" [class.background-editing]=\"_editing\" (keyup.f2)=\"onRename($event)\" tabindex=\"-1\">\n            <div class=\"col-xs-9 col-sm-5 col-lg-4 fi\" [ngClass]=\"[model.type, model.file_info.extension]\">\n                <div *ngIf=\"!_editing\">\n                    <a class=\"color-normal hover-color-active\" [href]=\"href\" nofocus><i></i>{{model.name}}</a>\n                </div>\n                <div *ngIf=\"_editing\">\n                    <i></i>\n                    <input class=\"form-control\" type=\"text\" \n                           [ngModel]=\"model.name\"\n                           (ngModelChange)=\"rename($event)\"\n                           (keyup.esc)=\"onCancel($event)\"\n                           (keyup.delete)=\"$event.stopImmediatePropagation()\"\n                           required throttle autofocus/>\n                </div>\n            </div>\n            <div class=\"col-sm-3 col-md-2 hidden-xs valign support\">\n                <span *ngIf=\"model.file_info.last_modified\">{{displayDate}}</span>\n            </div>     \n            <div class=\"col-md-2 visible-lg visible-md valign support\">\n                {{this.model.description}}\n            </div>\n            <div class=\"col-md-1 visible-lg visible-md valign text-right support\">\n                <span *ngIf=\"model.file_info.size\">{{getSize()}}</span>\n            </div>\n            <div class=\"actions\">\n                <div class=\"selector-wrapper\">\n                    <button title=\"More\" *ngIf=\"!model.isVirtual\" (click)=\"openSelector($event)\" (dblclick)=\"prevent($event)\" [class.background-active]=\"(selector && selector.opened) || false\">\n                        <i class=\"fa fa-ellipsis-h\"></i>\n                    </button>\n                    <selector [right]=\"true\">\n                        <ul>\n                            <li><button class=\"edit\" title=\"Rename\" *ngIf=\"model.type!='vdir'\" (click)=\"onRename($event)\">Rename</button></li>\n                            <li><button class=\"download\" title=\"Download\" *ngIf=\"model.type=='file'\" (click)=\"onDownload($event)\">Download</button></li>\n                            <li><button class=\"delete\" title=\"Delete\" *ngIf=\"model.type!='vdir'\" (click)=\"onDelete($event)\">Delete</button></li>\n                        </ul>\n                    </selector>\n                </div>\n            </div>\n        </div>\n    ",
            styles: ["\n        a {\n            display: inline;\n            background: transparent;\n        }\n\n        [class*=\"col-\"] {\n            overflow: hidden;\n            text-overflow: ellipsis;\n            white-space: nowrap;\n        }\n\n        .form-control {\n            width: 90%;\n        }\n\n        .fi {\n            padding-left: 0;\n        }\n\n        .row {\n            margin: 0px;\n        }\n\n        .selector-wrapper {\n            position: relative;\n        }\n\n        selector {\n            position:absolute;\n            right:0;\n        }\n\n        selector button {\n            min-width: 125px;\n            width: 100%;\n        }",
                "\n        .fi.vdir i::before,\n        .fi.application i::before {\n            content: \"\\f07b\";\n            color: #FFE68E;\n        }\n\n        .fi.vdir i::after {\n            content: \"\\f0da\";\n        }\n\n        .fi.application i::after {\n            content: \"\\f121\";\n        }\n\t"
            ],
            styleUrls: [
                'app/files/file-icons.css'
            ]
        }),
        __param(1, core_1.Inject("FilesService")),
        __metadata("design:paramtypes", [webfiles_service_1.WebFilesService,
            files_service_1.FilesService])
    ], WebFileComponent);
    return WebFileComponent;
}());
exports.WebFileComponent = WebFileComponent;
//# sourceMappingURL=webfile.component.js.map