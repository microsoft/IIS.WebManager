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
var selector_1 = require("../../common/selector");
var websites_service_1 = require("./websites.service");
var NavigatorComponent = /** @class */ (function () {
    function NavigatorComponent(_service, injector) {
        this._service = _service;
        if (!this._service) {
            this._service = injector.get("WebSitesService");
        }
    }
    NavigatorComponent.prototype.ngOnInit = function () {
        this.filterModel();
    };
    NavigatorComponent.prototype.ngOnChanges = function (changes) {
        if (changes["model"]) {
            this.filterModel();
        }
    };
    NavigatorComponent.prototype.onNavigate = function (e) {
        e.stopPropagation();
    };
    NavigatorComponent.prototype.openNavigator = function (e) {
        e.preventDefault();
        this.navigator.toggle();
    };
    NavigatorComponent.prototype.getUrl = function (i) {
        return this._service.getUrl(this.model[i], this.path);
    };
    NavigatorComponent.prototype.getFriendlyUrl = function (i) {
        var url = this.getUrl(i);
        return url.substr(url.indexOf("://") + 3);
    };
    NavigatorComponent.prototype.isHttps = function (i) {
        return this.model[i].is_https;
    };
    NavigatorComponent.prototype.filterModel = function () {
        // Sort bindings by HTTPS
        this.model = this.model.filter(function (b) {
            return b.protocol.indexOf("http") == 0;
        }).sort(function (b1, b2) {
            if (b2.is_https && !b1.is_https) {
                return 1;
            }
            return 0;
        });
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], NavigatorComponent.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], NavigatorComponent.prototype, "path", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], NavigatorComponent.prototype, "small", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], NavigatorComponent.prototype, "left", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], NavigatorComponent.prototype, "right", void 0);
    __decorate([
        core_1.ViewChild('navigator'),
        __metadata("design:type", selector_1.Selector)
    ], NavigatorComponent.prototype, "navigator", void 0);
    NavigatorComponent = __decorate([
        core_1.Component({
            selector: 'navigator',
            template: "\n        <div class=\"wrapper\">\n            <div class=\"url inline-block\">\n                <a class=\"hidden-xs\" *ngIf=\"model.length > 0\" [hidden]=\"small\" [class.cert]=\"isHttps(0)\" title=\"{{getUrl(0)}}\" href=\"{{getUrl(0)}}\" (click)=\"onNavigate($event)\">\n                    <span>{{getFriendlyUrl(0)}}</span>\n                </a>\n            </div>\n            <div class=\"selector-wrapper\" *ngIf=\"model.length > 0\">\n                <button class=\"no-border\" [class.visible-xs]=\"model.length == 1 && !small\" [class.background-active]=\"navigator.opened\" (click)=\"openNavigator($event)\">\n                    <span [class.visible-xs]=\"!small\" class=\"browse\">Browse </span>\n                    <span class=\"hidden-xs\" *ngIf=\"!small\"></span>\n                </button>\n                <div class=\"selector\" [class.right-align]=\"right\" [class.left-align]=\"left\">\n                    <selector #navigator>\n                        <ul class=\"grid-list\">\n                            <li *ngFor=\"let b of model; let i = index\" class=\"grid-item hover-active\">\n                                <a [class.cert]=\"isHttps(i)\" href=\"{{getUrl(i)}}\" title=\"{{getUrl(i)}}\" target=\"_blank\" (click)=\"onNavigate($event)\"><span>{{getFriendlyUrl(i)}}</span></a>\n                            </li>\n                        </ul>\n                    </selector>\n                </div>\n            </div>\n        </div>\n    ",
            styles: ["\n        .wrapper {\n            dispay: block;\n            overflow: hidden;\n        }\n\n        .url {\n            margin-right: -10px;\n            padding-right: 15px;\n            max-width:90%;\n            float: left;\n            line-height: 25px;\n        }\n        .selector-wrapper {\n            float: left;\n            display: inline-flex;\n        }\n\n        button > span:after {\n            font-family: FontAwesome;\n            font-size: 16px;\n            content: \"\\f0d7\";\n        }\n\n        .selector {\n            margin-top: 29px;\n        }\n\n        .selector.right-align {\n            margin-left: -302px;            \n        }\n\n        .selector.left-align {\n            position: absolute;\n        }\n\n        ul {\n            margin-bottom: 0px;\n        }\n\n        .grid-item {\n            padding: 0;\n            width: 300px;\n            border-width: 0px;\n        }\n\n        a {\n            content: \" \";\n            padding-left: 15px;\n        }\n\n        a.cert {\n            padding-left: 0px;\n        }\n\n        .grid-item a {\n            line-height: 35px;\n            width: 100%;\n            padding-right: 10px;\n            padding-left: 20px;\n        }\n\n        .grid-item a.cert {\n            padding-left: 5px;\n        }\n\n        .cert span:before {\n            font-family: FontAwesome;\n            content: \"\\f023\";\n            padding-right: 5px;\n        }\n\n        .cert span {\n            vertical-align: middle;\n        }\n\n        .browse:before {\n            content: \"\";\n            padding: 0;\n        }\n\n        .browse.cert:after {\n            content: \"\\f0d7\";\n        }\n        .browse:after {\n            margin-left: 5px;\n        }\n    "]
        }),
        __param(0, core_1.Optional()),
        __metadata("design:paramtypes", [websites_service_1.WebSitesService, core_1.Injector])
    ], NavigatorComponent);
    return NavigatorComponent;
}());
exports.NavigatorComponent = NavigatorComponent;
//# sourceMappingURL=navigator.component.js.map