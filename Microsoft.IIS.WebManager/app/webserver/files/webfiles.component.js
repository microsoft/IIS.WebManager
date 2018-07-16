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
var webfiles_service_1 = require("./webfiles.service");
var webfile_1 = require("./webfile");
var webfile_list_1 = require("./webfile-list");
var WebFilesComponent = /** @class */ (function () {
    function WebFilesComponent(_svc) {
        var _this = this;
        this._svc = _svc;
        this._subscriptions = [];
        this._subscriptions.push(_svc.current.filter(function (dir) { return !!dir; }).subscribe(function (dir) { return _this._current = dir; }));
    }
    WebFilesComponent.prototype.ngOnInit = function () {
        this._svc.init(this.website);
    };
    WebFilesComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    WebFilesComponent.prototype.isDir = function (file) {
        return webfile_1.WebFile.isDir(file);
    };
    __decorate([
        core_1.ViewChild(webfile_list_1.WebFileListComponent),
        __metadata("design:type", webfile_list_1.WebFileListComponent)
    ], WebFilesComponent.prototype, "_list", void 0);
    WebFilesComponent = __decorate([
        core_1.Component({
            template: "\n        <file-editor *ngIf=\"_current && !isDir(_current)\" [file]=\"_current.file_info\"></file-editor>\n        <webfile-explorer *ngIf=\"isDir(_current)\"></webfile-explorer>\n    "
        }),
        __metadata("design:paramtypes", [webfiles_service_1.WebFilesService])
    ], WebFilesComponent);
    return WebFilesComponent;
}());
exports.WebFilesComponent = WebFilesComponent;
//# sourceMappingURL=webfiles.component.js.map