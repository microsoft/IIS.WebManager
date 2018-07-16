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
var common_1 = require("@angular/common");
var location_hash_1 = require("../common/location-hash");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var Navigator = /** @class */ (function () {
    function Navigator(_route, _location, _useHash, defaultPath) {
        if (defaultPath === void 0) { defaultPath = null; }
        this._route = _route;
        this._location = _location;
        this._useHash = _useHash;
        this._path = new BehaviorSubject_1.BehaviorSubject(defaultPath || "");
        if (_useHash) {
            this._hashWatcher = new location_hash_1.LocationHash(_route, _location);
        }
    }
    Object.defineProperty(Navigator.prototype, "path", {
        get: function () {
            return this._hashWatcher ? this._hashWatcher.hash : this._path.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Navigator.prototype.dispose = function () {
        if (this._hashWatcher) {
            this._hashWatcher.dispose();
            this._hashWatcher = null;
        }
    };
    Navigator.prototype.getPath = function () {
        return this._hashWatcher ? this._hashWatcher.getHash : this._path.getValue();
    };
    Navigator.prototype.setPath = function (path) {
        if (this._hashWatcher) {
            this._hashWatcher.setHash(path);
        }
        else {
            this._path.next(path);
        }
    };
    Navigator = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [router_1.ActivatedRoute,
            common_1.Location, Boolean, String])
    ], Navigator);
    return Navigator;
}());
exports.Navigator = Navigator;
//# sourceMappingURL=navigator.js.map