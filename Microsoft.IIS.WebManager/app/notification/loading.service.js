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
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var LoadingService = /** @class */ (function () {
    function LoadingService(router) {
        var _this = this;
        this._activate = new BehaviorSubject_1.BehaviorSubject(false);
        this._subs = [];
        this._counter = 0;
        this._subs.push(router.events.subscribe(function (e) {
            if (e instanceof router_1.NavigationStart && !_this._navStart) {
                _this._navStart = true;
                _this.begin();
            }
            else if (e instanceof router_1.NavigationEnd) {
                _this._navStart = false;
                _this.end();
            }
        }));
    }
    LoadingService.prototype.destroy = function () {
        this._subs.forEach(function (s) { return s.unsubscribe(); });
    };
    Object.defineProperty(LoadingService.prototype, "active", {
        get: function () {
            return this._activate.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    LoadingService.prototype.begin = function () {
        ++this._counter;
        if (!this._activate.getValue()) {
            this._activate.next(true);
        }
    };
    LoadingService.prototype.end = function () {
        if (--this._counter <= 0) {
            this._counter = 0;
            this._activate.next(false);
        }
    };
    LoadingService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [router_1.Router])
    ], LoadingService);
    return LoadingService;
}());
exports.LoadingService = LoadingService;
//# sourceMappingURL=loading.service.js.map