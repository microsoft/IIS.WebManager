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
var status_1 = require("../../common/status");
var authentication_service_1 = require("./authentication.service");
var notification_service_1 = require("../../notification/notification.service");
var WindowsAuthenticationComponent = /** @class */ (function () {
    function WindowsAuthenticationComponent(_service, _notificationService) {
        var _this = this;
        this._service = _service;
        this._notificationService = _notificationService;
        this._subscriptions = [];
        this._subscriptions.push(this._service.windowsAuth.subscribe(function (auth) {
            _this.setFeature(auth);
        }));
    }
    WindowsAuthenticationComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    WindowsAuthenticationComponent.prototype.onModelChanged = function () {
        if (this._model.metadata.is_locked) {
            this.resetModel();
        }
        var changes = diff_1.DiffUtil.diff(this._original, this._model);
        if (Object.keys(changes).length > 0) {
            this._service.update(this._model, changes);
        }
    };
    WindowsAuthenticationComponent.prototype.onRevert = function () {
        this._service.revert(this._model);
    };
    WindowsAuthenticationComponent.prototype.setFeature = function (feature) {
        if (feature) {
            this._locked = feature.metadata.is_locked ? true : null;
        }
        this._model = feature;
        this._original = JSON.parse(JSON.stringify(feature));
    };
    WindowsAuthenticationComponent.prototype.resetModel = function () {
        for (var k in this._original) {
            this._model[k] = JSON.parse(JSON.stringify(this._original[k] || null));
        }
    };
    WindowsAuthenticationComponent.prototype.isPending = function () {
        return this._service.windowsStatus == status_1.Status.Starting
            || this._service.windowsStatus == status_1.Status.Stopping;
    };
    WindowsAuthenticationComponent.prototype.install = function (val) {
        var _this = this;
        if (val) {
            this._service.installWindows(true);
        }
        else {
            this._notificationService.confirm("Turn Off Windows Authentication", 'This will turn off "Windows Authentication" for the entire web server.')
                .then(function (confirmed) {
                if (confirmed) {
                    _this._service.installWindows(false);
                }
            });
        }
    };
    WindowsAuthenticationComponent = __decorate([
        core_1.Component({
            selector: 'win-auth',
            template: "\n        <error [error]=\"_service.windowsError\"></error>\n        <switch class=\"install\" *ngIf=\"_service.webserverScope && _service.windowsStatus != 'unknown'\" #s\n                [auto]=\"false\"\n                [model]=\"_service.windowsStatus == 'started' || _service.windowsStatus == 'starting'\" \n                [disabled]=\"_service.windowsStatus == 'starting' || _service.windowsStatus == 'stopping'\"\n                (modelChanged)=\"install(!s.model)\">\n                    <span *ngIf=\"!isPending()\">{{s.model ? \"On\" : \"Off\"}}</span>\n                    <span *ngIf=\"isPending()\" class=\"loading\"></span>\n        </switch>\n        <span *ngIf=\"_service.windowsStatus == 'stopped' && !_service.webserverScope\">Windows Authentication is off. Turn it on <a [routerLink]=\"['/webserver/authentication']\">here</a></span>\n        <override-mode class=\"pull-right\" *ngIf=\"_model\" [scope]=\"_model.scope\" [metadata]=\"_model.metadata\" (revert)=\"onRevert()\" (modelChanged)=\"onModelChanged()\"></override-mode>\n        <div *ngIf=\"_model\">\n            <fieldset>\n                <label *ngIf=\"!_model.scope\">Web Site Default</label>\n                <switch class=\"block\" [disabled]=\"_locked\" [(model)]=\"_model.enabled\" (modelChanged)=\"onModelChanged()\">{{_model.enabled ? \"On\" : \"Off\"}}</switch>\n            </fieldset>\n            <div class=\"clear\" *ngIf=\"_model.enabled || !_model.scope\">\n                <fieldset>\n                    <label>Use Kernel Mode</label>\n                    <switch class=\"block\" [disabled]=\"_locked\" [(model)]=\"_model.use_kernel_mode\" (modelChanged)=\"onModelChanged()\">{{_model.use_kernel_mode ? \"On\" : \"Off\"}}</switch>\n                </fieldset>\n                <ul>\n                    <li *ngFor=\"let provider of _model.providers; let i = index;\">\n                        <checkbox2 [disabled]=\"_locked\" [(model)]=\"provider.enabled\" (modelChanged)=\"onModelChanged()\">{{provider.name}}</checkbox2>\n                    </li>\n                </ul>\n            </div>\n        </div>\n    "
        }),
        __metadata("design:paramtypes", [authentication_service_1.AuthenticationService,
            notification_service_1.NotificationService])
    ], WindowsAuthenticationComponent);
    return WindowsAuthenticationComponent;
}());
exports.WindowsAuthenticationComponent = WindowsAuthenticationComponent;
//# sourceMappingURL=win-auth.component.js.map