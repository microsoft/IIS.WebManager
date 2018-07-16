"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var Subject_1 = require("rxjs/Subject");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var api_error_1 = require("../error/api-error");
var notification_1 = require("./notification");
var modal_1 = require("./modal");
var NotificationService = /** @class */ (function () {
    function NotificationService() {
        this._modal = new Subject_1.Subject();
        this._notifications = new BehaviorSubject_1.BehaviorSubject([]);
        this._activate = new BehaviorSubject_1.BehaviorSubject(false);
    }
    Object.defineProperty(NotificationService.prototype, "notifications", {
        get: function () {
            return this._notifications.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    NotificationService.prototype.getNotifications = function () {
        return this._data;
    };
    Object.defineProperty(NotificationService.prototype, "modal", {
        get: function () {
            return this._modal.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NotificationService.prototype, "activate", {
        get: function () {
            return this._activate.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NotificationService.prototype, "_data", {
        get: function () {
            return this._notifications.getValue();
        },
        enumerable: true,
        configurable: true
    });
    NotificationService.prototype.warn = function (message) {
        var notification = {
            type: notification_1.NotificationType.Warning,
            componentName: 'WarningComponent',
            module: 'app/notification/warning.component#Module',
            data: {
                warning: message
            },
            highPriority: false
        };
        this._data.push(notification);
        this._notifications.next(this._data);
    };
    NotificationService.prototype.confirm = function (title, message) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var args = new modal_1.ModalArgs();
            args.title = title;
            args.message = message;
            args.onConfirm = function () { resolve(true); };
            args.onCancel = function () { resolve(false); };
            _this._modal.next(args);
        });
    };
    NotificationService.prototype.notify = function (notification) {
        this._data.push(notification);
        this._notifications.next(this._data);
    };
    NotificationService.prototype.clearWarnings = function () {
        this._notifications.next(this._data.filter(function (n) {
            return n.type !== notification_1.NotificationType.Warning;
        }));
    };
    NotificationService.prototype.show = function () {
        if (!this._activate.getValue()) {
            this._activate.next(true);
        }
    };
    NotificationService.prototype.hide = function () {
        if (this._activate.getValue()) {
            this._activate.next(false);
        }
    };
    NotificationService.prototype.remove = function (notification) {
        var index = this._data.findIndex(function (n) {
            return n === notification;
        });
        if (index >= 0) {
            this._data.splice(index, 1);
            this._notifications.next(this._data);
        }
    };
    NotificationService.prototype.apiError = function (error) {
        if (error.type === api_error_1.ApiErrorType.FeatureNotInstalled) {
            return;
        }
        var msg = error.message || error.detail;
        if (msg) {
            this.warn(msg);
        }
    };
    NotificationService.prototype.remoteServerCantBeReached = function (conn) {
        this.warn("'" + (conn.displayName || conn.hostname()) + "' could not be reached at: " + conn.url);
    };
    NotificationService.prototype.unauthorized = function () {
        this.warn("Unauthorized");
    };
    NotificationService.prototype.invalidAccessToken = function () {
        this.warn("Invalid access token");
    };
    NotificationService = __decorate([
        core_1.Injectable()
    ], NotificationService);
    return NotificationService;
}());
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map