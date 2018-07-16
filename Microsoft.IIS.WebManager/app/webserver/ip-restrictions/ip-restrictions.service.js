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
var diff_1 = require("../../utils/diff");
var status_1 = require("../../common/status");
var httpclient_1 = require("../../common/httpclient");
var api_error_1 = require("../../error/api-error");
var IpRestrictionsService = /** @class */ (function () {
    function IpRestrictionsService(_http, route) {
        this._http = _http;
        this._status = status_1.Status.Unknown;
        this._ipRestrictions = new BehaviorSubject_1.BehaviorSubject(null);
        this._rules = new BehaviorSubject_1.BehaviorSubject([]);
        this._webserverScope = route.snapshot.parent.url[0].path.toLocaleLowerCase() == 'webserver';
    }
    IpRestrictionsService_1 = IpRestrictionsService;
    Object.defineProperty(IpRestrictionsService.prototype, "status", {
        get: function () {
            return this._status;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IpRestrictionsService.prototype, "webserverScope", {
        get: function () {
            return this._webserverScope;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IpRestrictionsService.prototype, "ipRestrictions", {
        get: function () {
            return this._ipRestrictions.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IpRestrictionsService.prototype, "rules", {
        get: function () {
            return this._rules.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    IpRestrictionsService.prototype.initialize = function (id) {
        this.load(id);
    };
    //
    // Feature
    IpRestrictionsService.prototype.updateFeature = function (data) {
        var _this = this;
        var id = this._ipRestrictions.getValue().id;
        return this._http.patch(IpRestrictionsService_1.URL + id, JSON.stringify(data))
            .then(function (feature) {
            var restrictions = _this._ipRestrictions.getValue();
            diff_1.DiffUtil.set(restrictions, feature);
            if (!restrictions.enabled) {
                var rules = _this._rules.getValue();
                rules.splice(0);
                _this._rules.next(rules);
            }
            _this._ipRestrictions.next(restrictions);
        });
    };
    IpRestrictionsService.prototype.revert = function () {
        var _this = this;
        var id = this._ipRestrictions.getValue().id;
        return this._http.delete(IpRestrictionsService_1.URL + id)
            .then(function () { return _this.initialize(id); });
    };
    IpRestrictionsService.prototype.install = function () {
        var _this = this;
        this._status = status_1.Status.Starting;
        return this._http.post(IpRestrictionsService_1.URL, "")
            .then(function (doc) {
            _this._status = status_1.Status.Started;
            _this._ipRestrictions.next(doc);
        })
            .catch(function (e) {
            _this.error = e;
            throw e;
        });
    };
    IpRestrictionsService.prototype.uninstall = function () {
        var _this = this;
        this._status = status_1.Status.Stopping;
        var id = this._ipRestrictions.getValue().id;
        this._ipRestrictions.next(null);
        return this._http.delete(IpRestrictionsService_1.URL + id)
            .then(function () {
            _this._status = status_1.Status.Stopped;
        })
            .catch(function (e) {
            _this.error = e;
            throw e;
        });
    };
    IpRestrictionsService.prototype.load = function (id) {
        var _this = this;
        return this._http.get(IpRestrictionsService_1.URL + id)
            .then(function (feature) {
            _this._status = status_1.Status.Started;
            _this._ipRestrictions.next(feature);
            return feature;
        })
            .catch(function (e) {
            _this.error = e;
            if (e.type && e.type == api_error_1.ApiErrorType.FeatureNotInstalled) {
                _this._status = status_1.Status.Stopped;
            }
            throw e;
        });
    };
    //
    // Rules
    IpRestrictionsService.prototype.addRule = function (rule) {
        var _this = this;
        rule.ip_restriction = this._ipRestrictions.getValue();
        return this._http.post(this._ipRestrictions.getValue()._links.entries.href.replace("/api", ""), JSON.stringify(rule))
            .then(function (rule) {
            var rules = _this._rules.getValue();
            rules.unshift(rule);
            // Adding first rule enables the feature
            if (rules.length == 1) {
                _this.load(_this._ipRestrictions.getValue().id);
            }
            _this._rules.next(rules);
        });
    };
    IpRestrictionsService.prototype.updateRule = function (rule, data) {
        return this._http.patch(rule._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(function (r) {
            diff_1.DiffUtil.set(rule, r);
            return rule;
        });
    };
    IpRestrictionsService.prototype.deleteRule = function (rule) {
        var _this = this;
        return this._http.delete(rule._links.self.href.replace("/api", ""))
            .then(function () {
            var rules = _this._rules.getValue().filter(function (r) { return r !== rule; });
            _this._rules.next(rules);
        });
    };
    IpRestrictionsService.prototype.loadRules = function () {
        var _this = this;
        return this._http.get(this._ipRestrictions.getValue()._links.entries.href.replace("/api", "") + "&fields=*")
            .then(function (rulesArr) {
            _this._rules.next(rulesArr.entries);
        });
    };
    IpRestrictionsService.URL = "/webserver/ip-restrictions/";
    IpRestrictionsService = IpRestrictionsService_1 = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [httpclient_1.HttpClient, router_1.ActivatedRoute])
    ], IpRestrictionsService);
    return IpRestrictionsService;
    var IpRestrictionsService_1;
}());
exports.IpRestrictionsService = IpRestrictionsService;
//# sourceMappingURL=ip-restrictions.service.js.map