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
var selector_1 = require("../../common/selector");
var app_pool_1 = require("./app-pool");
var app_pools_service_1 = require("./app-pools.service");
var AppPoolHeaderComponent = /** @class */ (function () {
    function AppPoolHeaderComponent(_service, _router) {
        this._service = _service;
        this._router = _router;
    }
    AppPoolHeaderComponent.prototype.onStart = function () {
        this._service.start(this.pool);
        this._selector.close();
    };
    AppPoolHeaderComponent.prototype.onStop = function () {
        this._service.stop(this.pool);
        this._selector.close();
    };
    AppPoolHeaderComponent.prototype.onDelete = function () {
        var _this = this;
        if (confirm("Are you sure you would like to delete this application pool?\nName: " + this.pool.name)) {
            this._service.delete(this.pool)
                .then(function () {
                _this._router.navigate(["/WebServer"]);
            });
        }
        this._selector.close();
    };
    AppPoolHeaderComponent.prototype.onRecycle = function () {
        this._service.recycle(this.pool);
        this._selector.close();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", app_pool_1.ApplicationPool)
    ], AppPoolHeaderComponent.prototype, "pool", void 0);
    __decorate([
        core_1.ViewChild(selector_1.Selector),
        __metadata("design:type", selector_1.Selector)
    ], AppPoolHeaderComponent.prototype, "_selector", void 0);
    AppPoolHeaderComponent = __decorate([
        core_1.Component({
            selector: 'app-pool-header',
            template: "\n        <div class=\"feature-header\" *ngIf=\"pool\">\n            <div class=\"actions\">\n                <div class=\"selector-wrapper\">\n                    <button title=\"Actions\" (click)=\"_selector.toggle()\" [class.background-active]=\"(_selector && _selector.opened) || false\"><i class=\"fa fa-caret-down\"></i></button>\n                    <selector [right]=\"true\">\n                        <ul>\n                            <li><button class=\"refresh\" title=\"Recycle\" [attr.disabled]=\"pool.status != 'started' ? true : null\" (click)=\"onRecycle()\">Recycle</button></li>\n                            <li><button class=\"start\" title=\"Start\" [attr.disabled]=\"pool.status != 'stopped' ? true : null\" (click)=\"onStart()\">Start</button></li>\n                            <li><button class=\"stop\" title=\"Stop\" [attr.disabled]=\"pool.status != 'started' ? true : null\" (click)=\"onStop()\">Stop</button></li>\n                            <li><button class=\"delete\" title=\"Delete\" (click)=\"onDelete()\">Delete</button></li>\n                        </ul>\n                    </selector>\n                </div>\n            </div>\n            <div class=\"feature-title\">\n                <h1 [ngClass]=\"pool.status\">{{pool.name}}</h1>\n                <span class=\"status\" *ngIf=\"pool.status == 'stopped'\">{{pool.status}}</span>\n            </div>\n        </div>\n    ",
            styles: ["\n        .selector-wrapper {\n            position: relative;\n        }\n\n        .feature-title h1:before {\n            content: \"\\f085\";\n        }\n\n        .status {\n            display: block;\n            text-align: right;\n        }\n    "]
        }),
        __param(0, core_1.Inject("AppPoolsService")),
        __metadata("design:paramtypes", [app_pools_service_1.AppPoolsService,
            router_1.Router])
    ], AppPoolHeaderComponent);
    return AppPoolHeaderComponent;
}());
exports.AppPoolHeaderComponent = AppPoolHeaderComponent;
//# sourceMappingURL=app-pool-header.component.js.map