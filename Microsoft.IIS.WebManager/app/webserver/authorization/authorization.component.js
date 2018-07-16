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
var status_1 = require("../../common/status");
var notification_service_1 = require("../../notification/notification.service");
var diff_1 = require("../../utils/diff");
var authorization_service_1 = require("./authorization.service");
var AuthorizationComponent = /** @class */ (function () {
    function AuthorizationComponent(_service, _notificationService) {
        var _this = this;
        this._service = _service;
        this._notificationService = _notificationService;
        this._subscriptions = [];
        this._subscriptions.push(this._service.authorization.subscribe(function (settings) { return _this.setFeature(settings); }));
    }
    AuthorizationComponent.prototype.ngOnInit = function () {
        this._service.initialize(this.id);
    };
    AuthorizationComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    AuthorizationComponent.prototype.onModelChanged = function () {
        var changes = diff_1.DiffUtil.diff(this._original, this._authorization);
        if (Object.keys(changes).length > 0) {
            this._service.save(changes);
        }
    };
    AuthorizationComponent.prototype.onRevert = function () {
        this._service.revert();
    };
    AuthorizationComponent.prototype.setFeature = function (feature) {
        this._authorization = feature;
        if (feature) {
            this._original = JSON.parse(JSON.stringify(feature));
            this._locked = this._authorization.metadata.is_locked ? true : null;
        }
    };
    AuthorizationComponent.prototype.isPending = function () {
        return this._service.status == status_1.Status.Starting
            || this._service.status == status_1.Status.Stopping;
    };
    AuthorizationComponent.prototype.install = function (val) {
        var _this = this;
        if (val) {
            return this._service.install();
        }
        else {
            this._notificationService.confirm("Turn Off Authorization", 'This will turn off "Authorization" for the entire web server.')
                .then(function (result) {
                if (result) {
                    _this._service.uninstall();
                }
            });
        }
    };
    AuthorizationComponent = __decorate([
        core_1.Component({
            template: "\n        <loading *ngIf=\"_service.status == 'unknown' && !_service.error\"></loading>\n        <error [error]=\"_service.error\"></error>\n        <switch class=\"install\" *ngIf=\"_service.webserverScope && _service.status != 'unknown'\" #s\n                [auto]=\"false\"\n                [model]=\"_service.status == 'started' || _service.status == 'starting'\" \n                [disabled]=\"_service.status == 'starting' || _service.status == 'stopping'\"\n                (modelChanged)=\"install(!s.model)\">\n                    <span *ngIf=\"!isPending()\">{{s.model ? \"On\" : \"Off\"}}</span>\n                    <span *ngIf=\"isPending()\" class=\"loading\"></span>\n        </switch>\n        <span *ngIf=\"_service.status == 'stopped' && !_service.webserverScope\">Authorization is off. Turn it on <a [routerLink]=\"['/webserver/authorization']\">here</a></span>\n        <override-mode class=\"pull-right\"\n            *ngIf=\"_authorization\"\n            [scope]=\"_authorization.scope\"\n            [metadata]=\"_authorization.metadata\"\n            (revert)=\"onRevert()\"\n            (modelChanged)=\"onModelChanged()\"></override-mode>\n        <div *ngIf=\"_authorization\">\n            <auth-rules></auth-rules>\n        </div>\n    ",
            styles: ["\n        .install {\n            margin-bottom: 40px;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [authorization_service_1.AuthorizationService,
            notification_service_1.NotificationService])
    ], AuthorizationComponent);
    return AuthorizationComponent;
}());
exports.AuthorizationComponent = AuthorizationComponent;
//# sourceMappingURL=authorization.component.js.map