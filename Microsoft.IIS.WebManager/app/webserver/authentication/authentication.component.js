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
var authentication_service_1 = require("./authentication.service");
var notification_service_1 = require("../../notification/notification.service");
var AuthenticationComponent = /** @class */ (function () {
    function AuthenticationComponent(_service, _notificationService) {
        this._service = _service;
        this._notificationService = _notificationService;
        this._subscriptions = [];
    }
    AuthenticationComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._subscriptions.push(this._service.settings.subscribe(function (settings) {
            _this.setFeature(settings);
        }));
        this._service.initialize(this.id);
    };
    AuthenticationComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    AuthenticationComponent.prototype.setFeature = function (feature) {
        this.settings = feature;
        this._original = JSON.parse(JSON.stringify(feature));
    };
    AuthenticationComponent = __decorate([
        core_1.Component({
            template: "\n        <loading *ngIf=\"!settings\"></loading>\n        <tabs *ngIf=\"settings\">\n            <tab [name]=\"'Anonymous'\">\n                <anon-auth></anon-auth>\n            </tab>\n            <tab [name]=\"'Basic'\">\n                <basic-auth></basic-auth>\n            </tab>\n            <tab [name]=\"'Digest'\">\n                <digest-auth></digest-auth>\n            </tab>\n            <tab [name]=\"'Windows'\">\n                <win-auth></win-auth>\n            </tab>\n        </tabs>\n    "
        }),
        __metadata("design:paramtypes", [authentication_service_1.AuthenticationService, notification_service_1.NotificationService])
    ], AuthenticationComponent);
    return AuthenticationComponent;
}());
exports.AuthenticationComponent = AuthenticationComponent;
//# sourceMappingURL=authentication.component.js.map