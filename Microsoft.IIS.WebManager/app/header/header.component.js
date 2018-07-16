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
var loading_service_1 = require("../notification/loading.service");
var options_service_1 = require("../main/options.service");
var angulartics2_ga_1 = require("angulartics2/src/providers/angulartics2-ga");
var HeaderComponent = /** @class */ (function () {
    function HeaderComponent(loadingSvc, _options, _angulartics2GoogleAnalytics) {
        var _this = this;
        this._options = _options;
        this._angulartics2GoogleAnalytics = _angulartics2GoogleAnalytics;
        this._subs = [];
        this._window = window;
        this._subs.push(loadingSvc.active.subscribe(function (active) {
            if (active) {
                _this._timeout = setTimeout(function (_) {
                    _this._inProgress = true;
                }, 200);
            }
            else {
                if (_this._timeout) {
                    clearTimeout(_this._timeout);
                    _this._timeout = 0;
                    setTimeout(function (_) { return _this._inProgress = false; }, 300);
                }
            }
        }));
    }
    HeaderComponent.prototype.ngOnDestroy = function () {
        this._subs.forEach(function (s) { return s.unsubscribe(); });
    };
    HeaderComponent = __decorate([
        core_1.Component({
            selector: 'header',
            template: "\n        <div class=\"nav background-active\">\n            <button class=\"fa fa-bars nav-item nav-options hover-primary2\" [attr.title]=\"this._options.active ? 'Hide Sidebar' : 'Show Sidebar'\" (click)=\"this._options.toggle()\" [class.background-primary2]=\"this._options.active\"></button>\n            <a [routerLink]=\"['/']\" title=\"Home\" class=\"nav-brand nav-item background-active hover-primary2 nav-height\">\n                <span class=\"v-center hidden-xs\">Microsoft IIS</span>\n                <span class=\"v-center visible-xs\">IIS</span>\n            </a>\n            <div class=\"separator\"></div>\n            <connection-picker class=\"nav-item\"></connection-picker>\n\n            <notifications></notifications>\n            <modal class=\"color-normal\"></modal>\n            \n            <div class=\"abs-right background-active\">\n                <notification-indicator></notification-indicator>\n                <settings></settings>\n            </div>\n        </div>\n        <div class=\"progress background-normal\" [class.animation]='_inProgress'></div>\n    ",
            styles: ["\n        .nav {\n            height:35px; \n            position:absolute; \n            top:0px;\n            left:0px;\n            right:0px;\n            width:100%; \n            z-index:1030;\n            white-space: nowrap;\n        }\n\n        >>> .nav-height {\n            height:35px; \n        }\n\n        .nav-item {\n            display: inline-block;\n            cursor: pointer;\n            vertical-align: top;\n        }\n\n        .nav-options {\n            padding: 10px;\n            height: 35px;\n            border: none;\n        }\n\n        .nav-options::before {\n            line-height: 17px;\n        }\n\n        .nav-brand {\n            padding: 0px 5px;\n            font-size: 14px;\n            padding: 0 10px;\n        }\n\n        .separator {\n            width:1px;\n            display: inline-block;\n            vertical-align: middle;\n            border-left:1px solid white;\n            height:20px;\n            margin-top: 7px;\n            margin-right: 2px;\n            margin-left: 2px;\n        }\n\n        .abs-right {\n            display:inline-block;\n            position: absolute;\n            right: 0;\n        }\n\n        .progress {\n            height:3px; \n            position:absolute; \n            top:0;\n            left:0%;\n            width:100%;\n            z-index:1040;\n            visibility: hidden; \n        }\n\n        .animation {\n            animation-name: progress;\n            animation-duration: 15s;\n            visibility: visible !important;\n        }\n\n        @keyframes progress {\n            from {left: 0%;}\n            to {left: 100%;}\n        }\n\n        .v-center {\n            vertical-align: middle;\n            height: 35px;\n        }\n\n        >>> .nav-button {\n            display: inline-block;\n            vertical-align: top;\n            min-width: 25px;\n            cursor: pointer;\n            padding: 0 15px;\n        }\n\n        >>> .nav-button i,\n        .nav-brand span {\n            line-height: 35px;\n        }\n\n        connection-picker {\n            font-size: 12px;\n        }\n    "]
        }),
        __param(2, core_1.Optional()),
        __metadata("design:paramtypes", [loading_service_1.LoadingService,
            options_service_1.OptionsService,
            angulartics2_ga_1.Angulartics2GoogleAnalytics])
    ], HeaderComponent);
    return HeaderComponent;
}());
exports.HeaderComponent = HeaderComponent;
//# sourceMappingURL=header.component.js.map