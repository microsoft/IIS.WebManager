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
var IntervalObservable_1 = require("rxjs/observable/IntervalObservable");
var httpclient_1 = require("../../common/httpclient");
var MonitoringService = /** @class */ (function () {
    function MonitoringService(_http) {
        this._http = _http;
        this.apiInstalled = true;
        this._requestInterval = 1000;
        this._subscribers = new Map();
        this._subscription = null;
        this._active = true;
    }
    MonitoringService.prototype.getSnapshot = function () {
        var _this = this;
        return this._http.get("/webserver/monitoring", null, false)
            .catch(function (e) {
            if (e.status == 404) {
                _this.apiInstalled = false;
            }
            throw e;
        });
    };
    MonitoringService.prototype.subscribe = function (func) {
        var subscriptionId = this._subscribers.size;
        this._subscribers.set(subscriptionId, func);
        if (this._subscription == null) {
            this.setupPollingSubscription();
        }
        return subscriptionId;
    };
    MonitoringService.prototype.unsubscribe = function (subscriptionId) {
        this._subscribers.set(subscriptionId, null);
        var stillSubscribers = false;
        this._subscribers.forEach(function (sub) {
            if (sub) {
                stillSubscribers = true;
            }
        });
        if (!stillSubscribers && this._subscription) {
            this._subscribers.clear();
            this._subscription.unsubscribe();
        }
    };
    MonitoringService.prototype.activate = function () {
        this._active = true;
        if (this._subscribers.size > 0) {
            this.setupPollingSubscription();
        }
    };
    MonitoringService.prototype.deactivate = function () {
        this._active = false;
        if (this._subscription) {
            this._subscription.unsubscribe();
        }
    };
    MonitoringService.prototype.setupPollingSubscription = function () {
        var _this = this;
        var requesting = false;
        this._subscription = IntervalObservable_1.IntervalObservable.create(this._requestInterval).subscribe(function () {
            if (!_this.apiInstalled || !_this._active) {
                return;
            }
            if (!requesting) {
                requesting = true;
                _this.getSnapshot()
                    .then(function (snapshot) {
                    requesting = false;
                    _this._subscribers.forEach(function (callback) { return callback(snapshot); });
                })
                    .catch(function (e) {
                    requesting = false;
                    throw e;
                });
            }
        });
    };
    MonitoringService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [httpclient_1.HttpClient])
    ], MonitoringService);
    return MonitoringService;
}());
exports.MonitoringService = MonitoringService;
//# sourceMappingURL=monitoring.service.js.map