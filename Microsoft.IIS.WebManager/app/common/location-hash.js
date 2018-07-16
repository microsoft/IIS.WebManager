"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var url_1 = require("../utils/url");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var LocationHash = /** @class */ (function () {
    function LocationHash(_route, _location) {
        var _this = this;
        this._route = _route;
        this._location = _location;
        this._subscriptions = [];
        this._hash = new BehaviorSubject_1.BehaviorSubject(this._route.snapshot.fragment);
        this._serviceRoot = this._location.path(false);
        this._subscriptions.push(this._location.subscribe(function (e) {
            if (e.type == 'hashchange') {
                _this._hash.next(_this.trimStart('#', window.location.hash));
            }
        }));
    }
    Object.defineProperty(LocationHash.prototype, "hash", {
        get: function () {
            var _this = this;
            return this._hash.asObservable().filter(function (h) { return _this._location.path(false) == _this._serviceRoot; });
        },
        enumerable: true,
        configurable: true
    });
    LocationHash.prototype.dispose = function () {
        for (var _i = 0, _a = this._subscriptions; _i < _a.length; _i++) {
            var sub = _a[_i];
            sub.unsubscribe();
        }
    };
    Object.defineProperty(LocationHash.prototype, "getHash", {
        get: function () {
            return url_1.UrlUtil.getFragment(this._location.path(true));
        },
        enumerable: true,
        configurable: true
    });
    LocationHash.prototype.setHash = function (hash) {
        var fullHash = '#' + hash;
        var current = this.trimStart('#', window.location.hash);
        if (!current || current != hash) {
            this._location.go(this._location.path(false) + fullHash);
            this._hash.next(hash);
        }
        else {
            this._location.replaceState(this._location.path(false) + fullHash);
            this._hash.next(hash);
        }
    };
    LocationHash.prototype.trimStart = function (val, from) {
        return from.startsWith(val) ? from.substr(val.length) : from;
    };
    return LocationHash;
}());
exports.LocationHash = LocationHash;
//# sourceMappingURL=location-hash.js.map