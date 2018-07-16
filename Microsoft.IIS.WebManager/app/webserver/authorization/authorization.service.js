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
var status_1 = require("../../common/status");
var httpclient_1 = require("../../common/httpclient");
var api_error_1 = require("../../error/api-error");
var AuthorizationService = /** @class */ (function () {
    function AuthorizationService(_http, route) {
        this._http = _http;
        this._status = status_1.Status.Unknown;
        this._authorization = new BehaviorSubject_1.BehaviorSubject(null);
        this._rules = new BehaviorSubject_1.BehaviorSubject([]);
        this._webserverScope = route.snapshot.parent.url[0].path.toLocaleLowerCase() == 'webserver';
    }
    AuthorizationService_1 = AuthorizationService;
    Object.defineProperty(AuthorizationService.prototype, "authorization", {
        get: function () {
            return this._authorization.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AuthorizationService.prototype, "rules", {
        get: function () {
            return this._rules.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AuthorizationService.prototype, "status", {
        get: function () {
            return this._status;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AuthorizationService.prototype, "webserverScope", {
        get: function () {
            return this._webserverScope;
        },
        enumerable: true,
        configurable: true
    });
    AuthorizationService.prototype.initialize = function (id) {
        var _this = this;
        this.loadSettings(id).then(function (feature) {
            _this.loadRules();
        });
    };
    AuthorizationService.prototype.install = function () {
        var _this = this;
        this._status = status_1.Status.Starting;
        return this._http.post(AuthorizationService_1.URL, "")
            .then(function (auth) {
            _this._status = status_1.Status.Started;
            _this._authorization.next(auth);
            _this.loadRules();
        })
            .catch(function (e) {
            _this.error = e;
            throw e;
        });
    };
    AuthorizationService.prototype.uninstall = function () {
        var _this = this;
        this._status = status_1.Status.Stopping;
        var id = this._authorization.getValue().id;
        this._authorization.next(null);
        return this._http.delete(AuthorizationService_1.URL + id)
            .then(function () {
            _this._status = status_1.Status.Stopped;
        })
            .catch(function (e) {
            _this.error = e;
            throw e;
        });
    };
    AuthorizationService.prototype.save = function (settings) {
        var _this = this;
        return this._http.patch(settings._links.self.href.replace('/api', ''), JSON.stringify(settings))
            .then(function (s) {
            Object.assign(settings, s);
            _this.loadRules();
            return settings;
        });
    };
    AuthorizationService.prototype.addRule = function (rule) {
        var _this = this;
        var settings = this._authorization.getValue();
        rule.authorization = settings;
        return this._http.post(settings._links.rules.href.replace('/api', ''), JSON.stringify(rule))
            .then(function (newRule) {
            var rules = _this._rules.getValue();
            rules.push(newRule);
            _this._rules.next(rules);
            return newRule;
        });
    };
    AuthorizationService.prototype.saveRule = function (rule) {
        return this._http.patch(rule._links.self.href.replace('/api', ''), JSON.stringify(rule))
            .then(function (r) {
            Object.assign(rule, r);
            return rule;
        });
    };
    AuthorizationService.prototype.deleteRule = function (rule) {
        var _this = this;
        this._http.delete(rule._links.self.href.replace('/api', ''))
            .then(function () {
            var rules = _this._rules.getValue();
            rules = rules.filter(function (r) { return r.id != rule.id; });
            _this._rules.next(rules);
        });
    };
    AuthorizationService.prototype.revert = function () {
        var _this = this;
        var settings = this._authorization.getValue();
        return this._http.delete(this._authorization.getValue()._links.self.href.replace("/api", ""))
            .then(function (_) {
            return _this.loadSettings(settings.id).then(function (set) { return _this.loadRules(); });
        });
    };
    AuthorizationService.prototype.loadSettings = function (id) {
        var _this = this;
        return this._http.get(AuthorizationService_1.URL + id)
            .then(function (feature) {
            _this._status = status_1.Status.Started;
            _this._authorization.next(feature);
            return feature;
        })
            .catch(function (e) {
            _this.error = e;
            if (e.type && e.type == api_error_1.ApiErrorType.FeatureNotInstalled) {
                _this._status = status_1.Status.Stopped;
                return;
            }
            throw e;
        });
    };
    AuthorizationService.prototype.loadRules = function () {
        var _this = this;
        var feature = this._authorization.getValue();
        return this._http.get(feature._links.rules.href.replace('/api', ''))
            .then(function (rulesObj) {
            _this._rules.next(rulesObj.rules);
            return rulesObj.rules;
        });
    };
    AuthorizationService.URL = "/webserver/authorization/";
    AuthorizationService = AuthorizationService_1 = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [httpclient_1.HttpClient, router_1.ActivatedRoute])
    ], AuthorizationService);
    return AuthorizationService;
    var AuthorizationService_1;
}());
exports.AuthorizationService = AuthorizationService;
//# sourceMappingURL=authorization.service.js.map