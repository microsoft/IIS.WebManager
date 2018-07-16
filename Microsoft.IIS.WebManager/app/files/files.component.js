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
var files_service_1 = require("./files.service");
var file_nav_service_1 = require("./file-nav.service");
var navigation_helper_1 = require("./navigation-helper");
var file_explorer_1 = require("./file-explorer");
var FilesComponent = /** @class */ (function () {
    function FilesComponent(_svc, _navSvc) {
        var _this = this;
        this._svc = _svc;
        this._navSvc = _navSvc;
        this._subscriptions = [];
        this.options = file_1.ExplorerOptions.AllEnabled;
        this.types = [];
        this.useHash = true;
        this.defaultPath = null;
        this._subscriptions.push(this._navSvc.current.filter(function (dir) { return !!dir; }).subscribe(function (dir) { return _this._current = dir; }));
    }
    Object.defineProperty(FilesComponent.prototype, "selected", {
        get: function () {
            var empty = [];
            return !this._list ? empty : this._list.selected;
        },
        enumerable: true,
        configurable: true
    });
    FilesComponent.prototype.ngOnInit = function () {
        this._navSvc.init(this.useHash, this.defaultPath);
    };
    FilesComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
        if (this._navSvc) {
            this._navSvc.dispose();
            this._navSvc = null;
        }
    };
    FilesComponent.prototype.isDir = function (f) {
        return file_1.ApiFile.isDir(f);
    };
    __decorate([
        core_1.ViewChild(file_explorer_1.FileExplorer),
        __metadata("design:type", file_explorer_1.FileExplorer)
    ], FilesComponent.prototype, "_list", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", file_1.ExplorerOptions)
    ], FilesComponent.prototype, "options", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], FilesComponent.prototype, "types", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], FilesComponent.prototype, "useHash", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], FilesComponent.prototype, "defaultPath", void 0);
    FilesComponent = __decorate([
        core_1.Component({
            selector: 'file-viewer',
            template: "\n        <file-editor *ngIf=\"_current && !isDir(_current)\" [file]=\"_current\"></file-editor>\n        <file-explorer *ngIf=\"isDir(_current)\" [types]=\"types\" [options]=\"options\"></file-explorer>\n    ",
            providers: [
                file_nav_service_1.FileNavService,
                { provide: "INavigation", useClass: navigation_helper_1.NavigationHelper }
            ]
        }),
        __param(0, core_1.Inject("FilesService")),
        __metadata("design:paramtypes", [files_service_1.FilesService,
            file_nav_service_1.FileNavService])
    ], FilesComponent);
    return FilesComponent;
}());
exports.FilesComponent = FilesComponent;
//# sourceMappingURL=files.component.js.map