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
var NewVersionNotificationComponent = /** @class */ (function () {
    function NewVersionNotificationComponent(_notificationService) {
        this._notificationService = _notificationService;
    }
    NewVersionNotificationComponent.prototype.onNavigate = function () {
        this._notificationService.remove(this._notificationService.getNotifications().find(function (n) { return n.componentName == 'NewVersionNotificationComponent'; }));
    };
    NewVersionNotificationComponent = __decorate([
        core_1.Component({
            selector: 'new-version',
            styles: ["\n        div {\n            min-height: 80px;\n            line-height: 80px;\n            text-align: center;\n            padding-left: 30px;\n            padding-right: 30px;\n        }\n\n        span {\n            vertical-align: middle;\n            line-height: normal;\n            display: inline-block;\n        }\n    "],
            template: "\n        <div>\n            <span>Version {{version}} is now available. <br/> <a [routerLink]=\"['/get']\" (click)=\"onNavigate()\">Click here</a> to get it.</span>\n        </div>\n    "
        }),
        __metadata("design:paramtypes", [notification_service_1.NotificationService])
    ], NewVersionNotificationComponent);
    return NewVersionNotificationComponent;
}());
exports.NewVersionNotificationComponent = NewVersionNotificationComponent;
//# sourceMappingURL=new-version-notification.component.js.map