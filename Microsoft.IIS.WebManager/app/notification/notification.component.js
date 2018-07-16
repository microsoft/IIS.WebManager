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
var router_1 = require("@angular/router");
var notification_service_1 = require("./notification.service");
var notification_1 = require("./notification");
var dynamic_component_1 = require("../common/dynamic.component");
var NotificationComponent = /** @class */ (function () {
    function NotificationComponent(_service, _router) {
        this._service = _service;
        this._router = _router;
        this._subscriptions = [];
        this._notifications = [];
        this._warningTimeout = 1 * 1000; // ms
        this._showNext = true;
        this.initialize();
    }
    NotificationComponent.prototype.initialize = function () {
        var _this = this;
        this._subscriptions.push(this._service.notifications.subscribe(function (notifications) {
            _this._notifications = notifications.filter(function (notification) {
                return notification.type == notification_1.NotificationType.Information;
            });
            // Get warning
            var warnings = notifications.filter(function (not) { return not.type == notification_1.NotificationType.Warning; });
            _this._warning = warnings.length > 0 ? warnings[warnings.length - 1] : null;
            _this.rebindWarning();
            if (_this._showNext) {
                _this._active = true;
                _this._showNext = false;
            }
        }));
        this._subscriptions.push(this._service.activate.subscribe(function (a) {
            if (a) {
                _this._notifications.forEach(function (n) { return n._hidden = false; });
            }
            _this._active = a;
        }));
        //
        // Hide whenever the user navigates
        this._subscriptions.push(this._router.events.subscribe(function (event) {
            if (event instanceof router_1.NavigationStart) {
                _this._service.hide();
            }
        }));
    };
    NotificationComponent.prototype.toggle = function () {
        this._active = !this._active;
    };
    NotificationComponent.prototype.clearWarning = function () {
        this._service.remove(this._warning);
        this._service.clearWarnings();
    };
    NotificationComponent.prototype.dismiss = function (index) {
        var notification = this._notifications[index];
        if (notification.highPriority) {
            notification._hidden = true;
        }
        else {
            this._service.remove(notification);
        }
        if (this._notifications.filter(function (n) { return !n._hidden; }).length == 0) {
            this._service.hide();
            this._showNext = true;
        }
    };
    NotificationComponent.prototype.ngOnDestroy = function () {
        while (this._subscriptions.length > 0) {
            this._subscriptions.pop().unsubscribe();
        }
    };
    NotificationComponent.prototype.rebindWarning = function () {
        if (this._dynamics && this._warning) {
            for (var _i = 0, _a = this._dynamics.toArray(); _i < _a.length; _i++) {
                var dynamic = _a[_i];
                if (dynamic.name == this._warning.componentName) {
                    dynamic.rebind(this._warning.data);
                }
            }
        }
    };
    NotificationComponent.prototype.resetWarningTimer = function () {
        var _this = this;
        if (this._warningTimer > 0) {
            clearTimeout(this._warningTimer);
        }
        this._warningTimer = setTimeout(function () {
            _this.clearWarning();
        }, this._warningTimeout);
    };
    NotificationComponent.prototype.onBlur = function () {
        this.resetWarningTimer();
    };
    NotificationComponent.prototype.onFocus = function () {
        if (this._warningTimer <= 0) {
            this.resetWarningTimer();
        }
        else {
            clearTimeout(this._warningTimer);
        }
    };
    __decorate([
        core_1.ViewChildren(dynamic_component_1.DynamicComponent),
        __metadata("design:type", core_1.QueryList)
    ], NotificationComponent.prototype, "_dynamics", void 0);
    NotificationComponent = __decorate([
        core_1.Component({
            selector: 'notifications',
            exportAs: 'notifications',
            styles: ["\n        .notifications {\n            width: 100%;\n            position: absolute;\n            top: 0;\n            margin-top: 35px;\n            color: #444;\n            overflow: hidden;\n            font-size:16px;\n        }\n        .exit {\n            cursor: pointer;\n            position: absolute;\n            right: 15px;\n            top: 10px;\n            font-size: 120%;\n        }\n        .entry {\n            position:relative;\n            border-bottom-width: 1px;\n            border-bottom-style: solid;\n            white-space: normal;\n        }\n    "],
            template: "\n        <div class=\"notifications shadow\">\n            <div *ngIf=\"_warning\" class=\"entry warning border-active\" (keyup.esc)=\"clearWarning()\" tabindex=\"-1\" autofocus (blur)=\"onBlur()\" (focus)=\"onFocus()\">\n                <i class=\"fa fa-times exit\" (click)=\"clearWarning()\" title=\"Dismiss\"></i>\n                <dynamic [name]=\"_warning.componentName\" [module]=\"_warning.module\" [data]=\"_warning.data\" [eager]=\"true\"></dynamic>\n            </div>\n            <div [hidden]=\"!_active\">\n                <div *ngFor=\"let notification of _notifications; let i = index;\" [hidden]=\"notification._hidden\" class=\"entry background-normal border-active\">\n                    <i class=\"fa fa-times exit\" (click)=\"dismiss(i)\" title=\"Dismiss\"></i>\n                    <dynamic [name]=\"notification.componentName\" [module]=\"notification.module\" [data]=\"notification.data\" [eager]=\"true\"></dynamic>\n                </div>\n            </div>\n        </div>\n    "
        }),
        __metadata("design:paramtypes", [notification_service_1.NotificationService, router_1.Router])
    ], NotificationComponent);
    return NotificationComponent;
}());
exports.NotificationComponent = NotificationComponent;
//# sourceMappingURL=notification.component.js.map