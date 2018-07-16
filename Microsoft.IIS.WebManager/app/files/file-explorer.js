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
var file_1 = require("./file");
var file_list_1 = require("./file-list");
var files_service_1 = require("./files.service");
var file_nav_service_1 = require("./file-nav.service");
var FileExplorer = /** @class */ (function () {
    function FileExplorer(_svc, _navSvc) {
        var _this = this;
        this._svc = _svc;
        this._navSvc = _navSvc;
        this._subscriptions = [];
        this.options = new file_1.ExplorerOptions(true);
        this.types = [];
        this._subscriptions.push(this._navSvc.current.filter(function (f) { return !!f; }).subscribe(function (f) { return _this._current = f; }));
    }
    Object.defineProperty(FileExplorer.prototype, "selected", {
        get: function () {
            var empty = [];
            return !this._list ? empty : this._list.selected;
        },
        enumerable: true,
        configurable: true
    });
    FileExplorer.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    FileExplorer.prototype.refresh = function () {
        this._list.refresh();
    };
    FileExplorer.prototype.createLocation = function () {
        this._list.createLocation();
    };
    FileExplorer.prototype.createDirectory = function () {
        this._list.createDirectory();
    };
    FileExplorer.prototype.createFile = function () {
        this._list.createFile();
    };
    FileExplorer.prototype.deleteFiles = function (event, files) {
        this._list.deleteFiles(event, files);
    };
    FileExplorer.prototype.upload = function (files) {
        this._svc.upload(this._current, files);
    };
    FileExplorer.prototype.isDir = function (f) {
        return file_1.ApiFile.isDir(f);
    };
    FileExplorer.prototype.atRoot = function () {
        return !!(this._current && !this._current.physical_path);
    };
    FileExplorer.prototype.showNewLocation = function () {
        //
        // If the list is being used to create a folder/dir hide the button
        if (!(this._list && !this._list.creating)) {
            return null;
        }
        return this.atRoot() || null;
    };
    FileExplorer.prototype.showNewFolder = function () {
        //
        // If the list is being used to create a folder/dir disable the button
        if (!(this._list && !this._list.creating)) {
            return false;
        }
        return !this.atRoot() || null;
    };
    __decorate([
        core_1.ViewChild(file_list_1.FileListComponent),
        __metadata("design:type", file_list_1.FileListComponent)
    ], FileExplorer.prototype, "_list", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", file_1.ExplorerOptions)
    ], FileExplorer.prototype, "options", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], FileExplorer.prototype, "types", void 0);
    FileExplorer = __decorate([
        core_1.Component({
            selector: 'file-explorer',
            template: "\n        <file-selector #fileSelector class=\"right\" (selected)=\"upload($event)\" [multiple]=\"true\">\n        </file-selector>\n        <toolbar\n            [refresh]=\"options.EnableRefresh || null\"\n            [newFile]=\"(options.EnableNewFile || null) && !atRoot()\"\n            [newLocation]=\"(options.EnableNewFolder || null) && showNewLocation()\"\n            [newFolder]=\"(options.EnableNewFolder || null) && showNewFolder()\"\n            [upload]=\"(options.EnableUpload || null) && !atRoot()\"\n            [delete]=\"(options.EnableDelete || null) && selected && selected.length > 0\"\n            (onNewLocation)=\"createLocation()\"\n            (onRefresh)=\"refresh()\"\n            (onNewFolder)=\"createDirectory()\"\n            (onNewFile)=\"createFile()\"\n            (onUpload)=\"fileSelector.open()\"\n            (onDelete)=\"deleteFiles($event, selected)\"></toolbar>\n        <navigation></navigation>\n        <file-list *ngIf=\"isDir(_current)\" [types]=\"types\"></file-list>\n    ",
            styles: ["\n        navigation {\n            padding-bottom: 25px;\n            display: block;\n        }\n    "]
        }),
        __param(0, core_1.Inject("FilesService")),
        __metadata("design:paramtypes", [files_service_1.FilesService,
            file_nav_service_1.FileNavService])
    ], FileExplorer);
    return FileExplorer;
}());
exports.FileExplorer = FileExplorer;
//# sourceMappingURL=file-explorer.js.map