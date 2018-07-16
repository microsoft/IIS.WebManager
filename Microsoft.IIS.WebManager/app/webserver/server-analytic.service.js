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
var httpclient_1 = require("../common/httpclient");
var connect_service_1 = require("../connect/connect.service");
var ServerAnalyticService = /** @class */ (function () {
    function ServerAnalyticService(_httpClient, _connectSvc) {
        var _this = this;
        this._httpClient = _httpClient;
        this._connectSvc = _connectSvc;
        this._subscriptions = [];
        this._subscriptions.push(this._connectSvc.active.subscribe(function (c) {
            if (c != null) {
                _this.getServerId(c);
            }
        }));
    }
    ServerAnalyticService.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) {
            sub.unsubscribe();
        });
    };
    Object.defineProperty(ServerAnalyticService.prototype, "gaTrackCode", {
        get: function () {
            return SETTINGS && SETTINGS.ga_track;
        },
        enumerable: true,
        configurable: true
    });
    ServerAnalyticService.prototype.getServerId = function (connection) {
        var _this = this;
        var clientId = connection._hostId;
        if (clientId) {
            this.setupAnalytics(clientId);
        }
        else {
            this._httpClient.get("/webserver").then(function (res) {
                clientId = res.id;
                connection._hostId = clientId;
                _this.setupAnalytics(clientId);
            })
                .catch(function (e) {
                // NoOp
            });
        }
    };
    ServerAnalyticService.prototype.setupAnalytics = function (clientId) {
        (function (i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r;
            i[r] = i[r] || function () {
                (i[r].q = i[r].q || []).push(arguments);
            }, i[r].l = 1 * (new Date());
            a = s.createElement(o),
                m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m);
        })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga', null, null);
        var ga = window.ga;
        //
        // Create ga using hash of IIS Administration webserver id
        ga('create', this.gaTrackCode, {
            storage: "none",
            clientId: clientId,
            storeGac: false
        });
        //
        // Anonymize
        ga('set', 'anonymizeIp', true);
    };
    ServerAnalyticService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [httpclient_1.HttpClient,
            connect_service_1.ConnectService])
    ], ServerAnalyticService);
    return ServerAnalyticService;
}());
exports.ServerAnalyticService = ServerAnalyticService;
//# sourceMappingURL=server-analytic.service.js.map