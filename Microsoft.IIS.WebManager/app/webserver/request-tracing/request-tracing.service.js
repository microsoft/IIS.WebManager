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
require("rxjs/add/operator/map");
require("rxjs/add/operator/toPromise");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var file_1 = require("../../files/file");
var files_service_1 = require("../../files/files.service");
var status_1 = require("../../common/status");
var httpclient_1 = require("../../common/httpclient");
var request_tracing_1 = require("./request-tracing");
var RequestTracingService = /** @class */ (function () {
    function RequestTracingService(_http, route, _filesService) {
        var _this = this;
        this._http = _http;
        this._filesService = _filesService;
        this._requestTracing = new BehaviorSubject_1.BehaviorSubject(null);
        this._subscriptions = [];
        this._traces = new BehaviorSubject_1.BehaviorSubject([]);
        this._traceError = new BehaviorSubject_1.BehaviorSubject(null);
        this._status = status_1.Status.Unknown;
        this.requestTracing = this._requestTracing.asObservable();
        this._webserverScope = route.snapshot.parent.url[0].path.toLocaleLowerCase() == 'webserver';
        this._subscriptions.push(this._filesService.change.subscribe(function (evt) {
            if (evt.type == file_1.ChangeType.Deleted) {
                _this._traces.next(_this._traces.getValue().filter(function (t) { return t.file_info.id != evt.target.id; }));
            }
        }));
    }
    Object.defineProperty(RequestTracingService.prototype, "status", {
        get: function () {
            return this._status;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RequestTracingService.prototype, "webserverScope", {
        get: function () {
            return this._webserverScope;
        },
        enumerable: true,
        configurable: true
    });
    RequestTracingService.prototype.dispose = function () {
        for (var _i = 0, _a = this._subscriptions; _i < _a.length; _i++) {
            var sub = _a[_i];
            sub.unsubscribe();
        }
    };
    RequestTracingService.prototype.revert = function (feature) {
        if (!feature.scope) {
            return Promise.reject("Invalid scope");
        }
        return this._http.delete(feature._links.self.href.replace("/api", ""));
    };
    RequestTracingService.prototype.init = function (id) {
        this.reset();
        this.get(id);
    };
    RequestTracingService.prototype.update = function (data) {
        var _this = this;
        return this._http.patch(this._requestTracing.getValue()._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(function (obj) {
            var req = _this._requestTracing.getValue();
            for (var k in obj)
                req[k] = obj[k]; // Copy
            _this._requestTracing.next(req);
            return req;
        });
    };
    RequestTracingService.prototype.get = function (id) {
        var _this = this;
        if (this._requestTracing.getValue()) {
            return Promise.resolve(this._requestTracing.getValue());
        }
        return this._http.get("/webserver/http-request-tracing/" + id)
            .then(function (obj) {
            _this._status = status_1.Status.Started;
            _this._requestTracing.next(obj);
            return obj;
        })
            .catch(function (e) {
            _this.error = e;
            if (e.type && e.type == 'FeatureNotInstalled') {
                _this._status = status_1.Status.Stopped;
            }
            throw e;
        });
    };
    RequestTracingService.prototype.install = function () {
        var _this = this;
        this._status = status_1.Status.Starting;
        return this._http.post("/webserver/http-request-tracing/", "")
            .then(function (req) {
            _this._status = status_1.Status.Started;
            _this._requestTracing.next(req);
        })
            .catch(function (e) {
            _this.error = e;
            throw e;
        });
    };
    RequestTracingService.prototype.uninstall = function () {
        var _this = this;
        this._status = status_1.Status.Stopping;
        var id = this._requestTracing.getValue().id;
        this._requestTracing.next(null);
        return this._http.delete("/webserver/http-request-tracing/" + id)
            .then(function () {
            _this._status = status_1.Status.Stopped;
        })
            .catch(function (e) {
            _this.error = e;
            throw e;
        });
    };
    Object.defineProperty(RequestTracingService.prototype, "providers", {
        //
        // Providers
        // 
        get: function () {
            var _this = this;
            if (this._providers) {
                return Promise.resolve(this._providers);
            }
            return this._http.get(this._requestTracing.getValue()._links.providers.href.replace("/api", "") + "&fields=*")
                .then(function (obj) {
                _this._providers = obj.providers.map(function (p) { return _this.providerFromJson(p); });
                return _this._providers;
            });
        },
        enumerable: true,
        configurable: true
    });
    RequestTracingService.prototype.updateProvider = function (provider, data) {
        var _this = this;
        return this._http.patch(provider._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(function (p) {
            p = _this.providerFromJson(p);
            for (var k in p)
                provider[k] = p[k]; // Copy
            return provider;
        });
    };
    RequestTracingService.prototype.createProvider = function (provider) {
        var _this = this;
        provider.request_tracing = { id: this._requestTracing.getValue().id };
        return this._http.post(this._requestTracing.getValue()._links.providers.href.replace("/api", ""), JSON.stringify(provider))
            .then(function (p) {
            p = _this.providerFromJson(p);
            for (var k in p)
                provider[k] = p[k]; // Copy
            _this._providers.push(provider);
            return provider;
        });
    };
    RequestTracingService.prototype.deleteProvider = function (provider) {
        var _this = this;
        return this._http.delete(provider._links.self.href.replace("/api", ""))
            .then(function (_) {
            var i = _this._providers.indexOf(provider);
            if (i >= 0) {
                _this._providers.splice(i, 1);
            }
            provider.id = undefined;
        });
    };
    Object.defineProperty(RequestTracingService.prototype, "rules", {
        //
        // Rules
        //
        get: function () {
            var _this = this;
            if (this._rules) {
                return Promise.resolve(this._rules);
            }
            return this._http.get(this._requestTracing.getValue()._links.rules.href.replace("/api", "") + "&fields=*")
                .then(function (arr) {
                _this._rules = arr.rules.map(function (r) { return _this.ruleFromJson(r); });
                return _this._rules;
            });
        },
        enumerable: true,
        configurable: true
    });
    RequestTracingService.prototype.updateRule = function (rule, data) {
        var _this = this;
        return this._http.patch(rule._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(function (obj) {
            obj = _this.ruleFromJson(obj);
            for (var k in obj)
                rule[k] = obj[k]; // Copy
            return rule;
        });
    };
    RequestTracingService.prototype.createRule = function (data) {
        var _this = this;
        data.request_tracing = { id: this._requestTracing.getValue().id };
        return this._http.post(this._requestTracing.getValue()._links.rules.href.replace("/api", ""), JSON.stringify(data))
            .then(function (obj) {
            _this._rules.push(_this.ruleFromJson(obj));
            return obj;
        });
    };
    RequestTracingService.prototype.deleteRule = function (rule) {
        var _this = this;
        return this._http.delete(rule._links.self.href.replace("/api", ""))
            .then(function (_) {
            var i = _this._rules.indexOf(rule);
            if (i >= 0) {
                _this._rules.splice(i, 1);
            }
            rule.id = undefined;
        });
    };
    Object.defineProperty(RequestTracingService.prototype, "traces", {
        //
        // Traces
        //
        get: function () {
            return this._traces.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RequestTracingService.prototype, "traceError", {
        get: function () {
            return this._traceError.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    RequestTracingService.prototype.loadTraces = function () {
        var _this = this;
        this._http.get(this._requestTracing.getValue()._links.traces.href.replace('/api', ''), null, false)
            .then(function (res) {
            var traces = _this._traces.getValue();
            traces.splice(0, traces.length);
            res.traces.map(function (t) { return request_tracing_1.TraceLog.FromObj(t); }).forEach(function (e) { return traces.push(e); });
            _this._traces.next(traces);
        })
            .catch(function (e) {
            _this._traceError.next(e);
        });
    };
    RequestTracingService.prototype.delete = function (logs) {
        logs = logs.filter(function (l) { return l.file_info && l.file_info.name.endsWith('.xml'); });
        this._filesService.delete(logs.map(function (log) { return log.file_info; }));
    };
    RequestTracingService.prototype.providerFromJson = function (obj) {
        obj.request_tracing = this._requestTracing.getValue();
        // Remove '{}' from the guid
        if (obj.guid && obj.guid[0] == '{') {
            obj.guid = obj.guid.substr(1, obj.guid.length - 2);
        }
        return obj;
    };
    RequestTracingService.prototype.ruleFromJson = function (obj) {
        var _this = this;
        obj.request_tracing = this._requestTracing.getValue();
        if (this._providers) {
            for (var _i = 0, _a = obj.traces; _i < _a.length; _i++) {
                var t = _a[_i];
                for (var _b = 0, _c = this._providers; _b < _c.length; _b++) {
                    var p = _c[_b];
                    if (p.id == t.provider.id) {
                        t.provider = p;
                        break;
                    }
                }
            }
        }
        else {
            this.providers.then(function (_) {
                _this.ruleFromJson(obj);
            });
        }
        return obj;
    };
    RequestTracingService.prototype.reset = function () {
        this.error = null;
        this._providers = null;
        this._rules = null;
        this._traceError.next(null);
        this._traces.next([]);
        this._requestTracing.next(null);
    };
    RequestTracingService = __decorate([
        core_1.Injectable(),
        __param(2, core_1.Optional()), __param(2, core_1.Inject('FilesService')),
        __metadata("design:paramtypes", [httpclient_1.HttpClient,
            router_1.ActivatedRoute,
            files_service_1.FilesService])
    ], RequestTracingService);
    return RequestTracingService;
}());
exports.RequestTracingService = RequestTracingService;
//# sourceMappingURL=request-tracing.service.js.map