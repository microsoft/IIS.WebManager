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
var router_1 = require("@angular/router");
var angulartics2_ga_1 = require("angulartics2/src/providers/angulartics2-ga");
var selector_1 = require("../common/selector");
var SettingsMenuComponent = /** @class */ (function () {
    function SettingsMenuComponent(_router, _angulartics2GoogleAnalytics) {
        var _this = this;
        this._router = _router;
        this._angulartics2GoogleAnalytics = _angulartics2GoogleAnalytics;
        this._subscriptions = [];
        this._window = window;
        this._subscriptions.push(this._router.events.subscribe(function (e) {
            if (e instanceof router_1.NavigationStart) {
                _this._settingsMenu.close();
            }
        }));
    }
    SettingsMenuComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    SettingsMenuComponent.prototype.onClickSettings = function () {
        this._settingsMenu.toggle();
    };
    __decorate([
        core_1.ViewChild('settingsMenu'),
        __metadata("design:type", selector_1.Selector)
    ], SettingsMenuComponent.prototype, "_settingsMenu", void 0);
    SettingsMenuComponent = __decorate([
        core_1.Component({
            selector: 'settings',
            template: "\n        <div title=\"Options\" class=\"s-container nav-button hover-primary2\" [class.background-primary2]=\"settingsMenu && settingsMenu.isOpen()\" (click)=\"onClickSettings()\">\n            <i class=\"fa fa-cog\"></i>\n        </div>\n        <selector #settingsMenu class=\"color-normal\" [right]=\"true\">\n            <ul>\n                <li class=\"hover-editing\">\n                    <a class=\"color-normal server\" [routerLink]=\"['/settings/servers']\" (click)=\"_settingsMenu.close()\">Add or Remove Servers</a>\n                </li>\n                <li class=\"hover-editing\">\n                    <a class=\"color-normal download\" [routerLink]=\"['/get']\" (click)=\"_settingsMenu.close()\">Download Microsoft IIS Administration</a>\n                </li>\n                <li class=\"hover-editing\">\n                    <a class=\"color-normal dev\" href=\"https://github.com/microsoft/iis.administration\" target=\"_blank\">Developers</a>\n                </li>\n            </ul>\n        </selector>\n    ",
            styles: ["\n        .s-container {\n            font-size: 120%;\n        }\n\n        selector {\n            position: absolute;\n            right: 0;\n            top: 34px;\n        }\n\n        ul {\n            margin-bottom: 0;\n        }\n\n        li {\n            white-space: nowrap;\n        }\n\n        a, button {\n            padding: 7px 5px;\n            display: block;\n        }\n\n        a:before,\n        button:before {\n            font-family: FontAwesome;\n            font-size: 120%;\n            line-height: 22px;\n            width: 25px;\n            display: inline-block;\n        }\n\n        li button {\n            text-align: left;\n            font-size: 14px;\n        }\n\n        .server:before {\n            content: \"\\f233\";\n        }\n\n        .dev:before {\n            content: \"\\f121\";\n        }\n\n        .download:before {\n            content: \"\\f019\";\n        }\n    "]
        }),
        __param(1, core_1.Optional()),
        __metadata("design:paramtypes", [router_1.Router,
            angulartics2_ga_1.Angulartics2GoogleAnalytics])
    ], SettingsMenuComponent);
    return SettingsMenuComponent;
}());
exports.SettingsMenuComponent = SettingsMenuComponent;
//# sourceMappingURL=settings-menu.component.js.map