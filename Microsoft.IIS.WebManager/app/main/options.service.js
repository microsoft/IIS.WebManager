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
require("rxjs/add/observable/fromEvent");
var window_service_1 = require("./window.service");
var OptionsService = /** @class */ (function () {
    function OptionsService(_window) {
        var _this = this;
        this._window = _window;
        //
        // By default: not active on small, active on large
        this._active = [false, true];
        this._subs = [];
        //
        // Resize Window
        this._subs.push(_window.resize.subscribe(function (e) { return _this.refresh(); }));
    }
    OptionsService_1 = OptionsService;
    OptionsService.prototype.dispose = function () {
        this._subs.forEach(function (s) { return s.unsubscribe(); });
    };
    Object.defineProperty(OptionsService.prototype, "active", {
        get: function () {
            return this._active[this.activeIndex];
        },
        enumerable: true,
        configurable: true
    });
    OptionsService.prototype.show = function () {
        this.set(true);
    };
    OptionsService.prototype.hide = function () {
        this.set(false);
    };
    OptionsService.prototype.toggle = function () {
        this.active ? this.hide() : this.show();
    };
    OptionsService.prototype.refresh = function () {
        if (window.innerWidth < OptionsService_1.BREAK_POINT) {
            this.set(false);
        }
        this.set(this.active);
    };
    OptionsService.prototype.set = function (value, refreshWindow) {
        if (refreshWindow === void 0) { refreshWindow = true; }
        if (this.active == value) {
            return;
        }
        this._active[this.activeIndex] = value;
    };
    Object.defineProperty(OptionsService.prototype, "activeIndex", {
        get: function () {
            if (window.innerWidth < OptionsService_1.BREAK_POINT) {
                return 0;
            }
            else {
                return 1;
            }
        },
        enumerable: true,
        configurable: true
    });
    OptionsService.BREAK_POINT = 768; //px
    OptionsService = OptionsService_1 = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [window_service_1.WindowService])
    ], OptionsService);
    return OptionsService;
    var OptionsService_1;
}());
exports.OptionsService = OptionsService;
//# sourceMappingURL=options.service.js.map