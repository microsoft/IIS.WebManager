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
var webfile_list_1 = require("./webfile-list");
var webfiles_service_1 = require("./webfiles.service");
var webfile_1 = require("./webfile");
var WebFileExplorer = /** @class */ (function () {
    function WebFileExplorer(_svc) {
        var _this = this;
        this._svc = _svc;
        this._subscriptions = [];
        this._subscriptions.push(_svc.current.filter(function (dir) { return !!dir; }).subscribe(function (dir) { return _this._current = dir; }));
    }
    WebFileExplorer.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    WebFileExplorer.prototype.refresh = function () {
        this._list.refresh();
    };
    WebFileExplorer.prototype.createDirectory = function () {
        this._list.createDirectory();
    };
    WebFileExplorer.prototype.createFile = function () {
        this._list.createFile();
    };
    WebFileExplorer.prototype.deleteFiles = function (files) {
        this._list.deleteFiles(files);
    };
    WebFileExplorer.prototype.upload = function (files) {
        this._svc.upload(files, this._current);
    };
    WebFileExplorer.prototype.isDir = function (file) {
        return webfile_1.WebFile.isDir(file);
    };
    __decorate([
        core_1.ViewChild(webfile_list_1.WebFileListComponent),
        __metadata("design:type", webfile_list_1.WebFileListComponent)
    ], WebFileExplorer.prototype, "_list", void 0);
    WebFileExplorer = __decorate([
        core_1.Component({
            selector: 'webfile-explorer',
            template: "\n        <file-selector #fileSelector class=\"right\" (selected)=\"upload($event)\" [multiple]=\"true\">\n        </file-selector>\n        <toolbar\n            [newLocation]=\"null\"\n            [refresh]=\"true\"\n            [newFile]=\"_list && !_list.creating\"\n            [newFolder]=\"_list && !_list.creating\"\n            [upload]=\"true\"\n            [delete]=\"_list && _list.selected.length > 0\"\n            (onRefresh)=\"refresh()\"\n            (onNewFolder)=\"createDirectory()\"\n            (onNewFile)=\"createFile()\"\n            (onUpload)=\"fileSelector.open()\"\n            (onDelete)=\"deleteFiles(_list.selected)\">\n\t    </toolbar>\n        <navigation></navigation>\n        <webfile-list *ngIf=\"isDir(_current)\"></webfile-list>\n    ",
            styles: ["\n        navigation {\n            padding-bottom: 25px;\n            display: block;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [webfiles_service_1.WebFilesService])
    ], WebFileExplorer);
    return WebFileExplorer;
}());
exports.WebFileExplorer = WebFileExplorer;
//# sourceMappingURL=webfile-explorer.js.map