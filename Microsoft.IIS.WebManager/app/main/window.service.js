"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var WindowService = /** @class */ (function () {
    function WindowService() {
        this._scroll = new BehaviorSubject_1.BehaviorSubject(null);
        this._resize = new BehaviorSubject_1.BehaviorSubject(null);
    }
    Object.defineProperty(WindowService.prototype, "scroll", {
        get: function () {
            return this._scroll.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WindowService.prototype, "resize", {
        get: function () {
            return this._resize.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    WindowService.prototype.initialize = function (eRef, renderer) {
        var _this = this;
        renderer.listen(eRef.nativeElement, 'scroll', function (evt) {
            _this._scroll.next(evt);
        });
        renderer.listenGlobal('window', 'resize', function (evt) {
            _this._resize.next(evt);
        });
    };
    WindowService.prototype.trigger = function () {
        try {
            window.dispatchEvent(new Event('resize'));
        }
        catch (e) {
            var event_1 = document.createEvent("Event");
            event_1.initEvent("resize", false, true);
            // args: string type, boolean bubbles, boolean cancelable
            window.dispatchEvent(event_1);
        }
    };
    WindowService = __decorate([
        core_1.Injectable()
    ], WindowService);
    return WindowService;
}());
exports.WindowService = WindowService;
//# sourceMappingURL=window.service.js.map