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
var notification_service_1 = require("../notification/notification.service");
var notification_1 = require("../notification/notification");
require("rxjs/add/operator/first");
var NotificationIndicator = /** @class */ (function () {
    function NotificationIndicator(_service) {
        var _this = this;
        this._service = _service;
        this._notifications = [];
        this._service.notifications.subscribe(function (notifications) {
            _this._notifications = notifications.filter(function (notification) {
                return notification.type === notification_1.NotificationType.Information;
            });
        });
    }
    NotificationIndicator.prototype.toggleNotifications = function () {
        var active;
        this._service.activate.first().subscribe(function (a) {
            active = a;
        });
        active ? this._service.hide() : this._service.show();
    };
    NotificationIndicator = __decorate([
        core_1.Component({
            selector: 'notification-indicator',
            styles: ["\n        div {\n            display: inline-block;\n            vertical-align: middle;\n            min-width: 25px;\n            cursor: pointer;\n        }\n    "],
            template: "\n        <div class=\"hover-primary2 nav-button\" title=\"Notifications\" *ngIf=\"_notifications.length > 0\" (click)=\"toggleNotifications()\">\n            <i class=\"fa fa-bell\"></i>\n            {{_notifications.length}}\n        </div>\n    "
        }),
        __metadata("design:paramtypes", [notification_service_1.NotificationService])
    ], NotificationIndicator);
    return NotificationIndicator;
}());
exports.NotificationIndicator = NotificationIndicator;
//# sourceMappingURL=notification-indicator.js.map