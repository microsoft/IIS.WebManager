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
var file_nav_service_1 = require("./file-nav.service");
var files_service_1 = require("./files.service");
core_1.Injectable();
var NavigationHelper = /** @class */ (function () {
    function NavigationHelper(_svc, _navSvc) {
        var _this = this;
        this._svc = _svc;
        this._navSvc = _navSvc;
        this._current = this._navSvc.current.filter(function (dir) { return !!dir; }).map(function (dir) { return '/' + _this._navSvc.toAlias(dir.physical_path); });
    }
    Object.defineProperty(NavigationHelper.prototype, "path", {
        get: function () {
            return this._current;
        },
        enumerable: true,
        configurable: true
    });
    NavigationHelper.prototype.onPathChanged = function (path) {
        if (path.startsWith('/')) {
            path = path.substr(1);
        }
        this._navSvc.load(path);
    };
    NavigationHelper.prototype.drop = function (drop) {
        var _this = this;
        this._navSvc.fromAlias(drop.destination)
            .then(function (path) {
            _this._svc.drop(drop.event, path);
        });
    };
    NavigationHelper = __decorate([
        __param(0, core_1.Inject("FilesService")),
        __param(1, core_1.Inject(file_nav_service_1.FileNavService)),
        __metadata("design:paramtypes", [files_service_1.FilesService,
            file_nav_service_1.FileNavService])
    ], NavigationHelper);
    return NavigationHelper;
}());
exports.NavigationHelper = NavigationHelper;
//# sourceMappingURL=navigation-helper.js.map