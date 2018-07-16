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
var selector_1 = require("../common/selector");
var webserver_service_1 = require("./webserver.service");
var webserver_1 = require("./webserver");
var WebServerHeaderComponent = /** @class */ (function () {
    function WebServerHeaderComponent(_service) {
        this._service = _service;
        this._subs = [];
    }
    WebServerHeaderComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._subs.push(this._service.status.subscribe(function (status) { return _this.model.status = status; }));
    };
    WebServerHeaderComponent.prototype.ngOnDestroy = function () {
        this._subs.forEach(function (s) { return s.unsubscribe(); });
    };
    WebServerHeaderComponent.prototype.start = function () {
        this._service.start();
        this._selector.close();
    };
    WebServerHeaderComponent.prototype.stop = function () {
        this._service.stop();
        this._selector.close();
    };
    WebServerHeaderComponent.prototype.restart = function () {
        this._service.restart();
        this._selector.close();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", webserver_1.WebServer)
    ], WebServerHeaderComponent.prototype, "model", void 0);
    __decorate([
        core_1.ViewChild(selector_1.Selector),
        __metadata("design:type", selector_1.Selector)
    ], WebServerHeaderComponent.prototype, "_selector", void 0);
    WebServerHeaderComponent = __decorate([
        core_1.Component({
            selector: 'webserver-header',
            template: "\n        <div class=\"feature-header\">\n            <div class=\"actions\">\n                <div class=\"selector-wrapper\">\n                    <button title=\"Actions\" (click)=\"_selector.toggle()\" [class.background-active]=\"(_selector && _selector.opened) || false\"><i class=\"fa fa-caret-down\"></i></button>\n                    <selector [right]=\"true\">\n                        <ul>\n                            <li><button class=\"refresh\" title=\"Restart\" (click)=\"restart()\">Restart</button></li>\n                            <li><button class=\"start\" title=\"Start\" [attr.disabled]=\"model.status != 'stopped' || null\" (click)=\"start()\">Start</button></li>\n                            <li><button class=\"stop\" title=\"Stop\" [attr.disabled]=\"model.status != 'started' || null\" (click)=\"stop()\">Stop</button></li>\n                        </ul>\n                    </selector>\n                </div>\n            </div>\n            <div class=\"feature-title\">\n                <h1 [ngClass]=\"model.status\">Web Server</h1>\n                <span class=\"status\" *ngIf=\"model.status.startsWith('stop')\">{{model.status}}</span>\n            </div>\n        </div>\n    ",
            styles: ["\n        .selector-wrapper {\n            position: relative;\n        }\n\n        .feature-title h1:before {\n            content: \"\\f233\";\n        }\n\n        .status {\n            display: block;\n            text-align: right;\n        }\n    "]
        }),
        __param(0, core_1.Inject('WebServerService')),
        __metadata("design:paramtypes", [webserver_service_1.WebServerService])
    ], WebServerHeaderComponent);
    return WebServerHeaderComponent;
}());
exports.WebServerHeaderComponent = WebServerHeaderComponent;
//# sourceMappingURL=webserver-header.component.js.map