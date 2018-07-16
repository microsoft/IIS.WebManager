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
var url_rewrite_service_1 = require("../service/url-rewrite.service");
var ServerVariablesComponent = /** @class */ (function () {
    function ServerVariablesComponent(_service) {
        var _this = this;
        this._service = _service;
        this._subscriptions = [];
        this._subscriptions.push(this._service.serverVariablesSettings.subscribe(function (settings) { return _this._settings = settings; }));
    }
    ServerVariablesComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    ServerVariablesComponent.prototype.onModelChanged = function () {
        this._service.saveServerVariables(this._settings);
    };
    ServerVariablesComponent.prototype.onRevert = function () {
        this._service.revertServerVariables();
    };
    ServerVariablesComponent = __decorate([
        core_1.Component({
            selector: 'server-variables',
            template: "\n        <error [error]=\"_service.serverVariablesError\"></error>\n        <div *ngIf=\"!_service.serverVariablesError && _settings\">\n            <override-mode class=\"pull-right\"\n                [metadata]=\"_settings.metadata\"\n                [scope]=\"_settings.scope\"\n                (revert)=\"onRevert()\" \n                (modelChanged)=\"onModelChanged()\"></override-mode>\n                <div class=\"row\">\n                    <fieldset [disabled]=\"_settings.metadata.is_locked || null\" class=\"clear col-xs-12 col-sm-10 col-md-8 col-lg-6\">\n                        <string-list useAddButton=\"true\" #fileExtensions=\"stringList\" [(model)]=\"_settings.entries\" (modelChanged)=\"onModelChanged()\"></string-list>\n                    </fieldset>\n                </div>\n        </div>\n    "
        }),
        __metadata("design:paramtypes", [url_rewrite_service_1.UrlRewriteService])
    ], ServerVariablesComponent);
    return ServerVariablesComponent;
}());
exports.ServerVariablesComponent = ServerVariablesComponent;
//# sourceMappingURL=server-variables.component.js.map