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
var notification_service_1 = require("../../../notification/notification.service");
var status_1 = require("../../../common/status");
var api_error_1 = require("../../../error/api-error");
var httpclient_1 = require("../../../common/httpclient");
var global_service_1 = require("./global.service");
var inbound_service_1 = require("./inbound.service");
var UrlRewriteService = /** @class */ (function () {
    function UrlRewriteService(_http, _notificationService, route) {
        this._http = _http;
        this._notificationService = _notificationService;
        this._status = status_1.Status.Unknown;
        this._urlRewrite = new BehaviorSubject_1.BehaviorSubject(null);
        this._outboundSettings = new BehaviorSubject_1.BehaviorSubject(null);
        this._outboundRules = new BehaviorSubject_1.BehaviorSubject([]);
        this._rewriteMapSettings = new BehaviorSubject_1.BehaviorSubject(null);
        this._rewriteMaps = new BehaviorSubject_1.BehaviorSubject([]);
        this._providersSettings = new BehaviorSubject_1.BehaviorSubject(null);
        this._providers = new BehaviorSubject_1.BehaviorSubject([]);
        this._serverVariablesSettings = new BehaviorSubject_1.BehaviorSubject(null);
        this._webserverScope = route.snapshot.parent.url[0].path.toLocaleLowerCase() == 'webserver';
        this._inboundService = new inbound_service_1.InboundService(this._http, this._notificationService);
        this._globalService = new global_service_1.GlobalService(this._http, this._notificationService);
    }
    UrlRewriteService_1 = UrlRewriteService;
    Object.defineProperty(UrlRewriteService.prototype, "inboundError", {
        get: function () {
            return this.inboundService.error;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UrlRewriteService.prototype, "globalError", {
        get: function () {
            return this.globalService.error;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UrlRewriteService.prototype, "status", {
        get: function () {
            return this._status;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UrlRewriteService.prototype, "webserverScope", {
        get: function () {
            return this._webserverScope;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UrlRewriteService.prototype, "urlRewrite", {
        get: function () {
            return this._urlRewrite.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UrlRewriteService.prototype, "inboundSettings", {
        get: function () {
            return this.webserverScope ?
                this.globalService.settings :
                this._inboundService.settings;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UrlRewriteService.prototype, "inboundRules", {
        get: function () {
            return this.webserverScope ?
                this.globalService.rules :
                this._inboundService.rules;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UrlRewriteService.prototype, "outboundSettings", {
        get: function () {
            return this._outboundSettings.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UrlRewriteService.prototype, "outboundRules", {
        get: function () {
            return this._outboundRules.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UrlRewriteService.prototype, "rewriteMapSettings", {
        get: function () {
            return this._rewriteMapSettings.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UrlRewriteService.prototype, "rewriteMaps", {
        get: function () {
            return this._rewriteMaps.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UrlRewriteService.prototype, "providersSettings", {
        get: function () {
            return this._providersSettings.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UrlRewriteService.prototype, "providers", {
        get: function () {
            return this._providers.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UrlRewriteService.prototype, "serverVariablesSettings", {
        get: function () {
            return this._serverVariablesSettings.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UrlRewriteService.prototype, "inboundService", {
        get: function () {
            return this._inboundService;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UrlRewriteService.prototype, "globalService", {
        get: function () {
            return this._globalService;
        },
        enumerable: true,
        configurable: true
    });
    UrlRewriteService.prototype.revertInbound = function () {
        this.webserverScope ?
            this.globalService.revert() :
            this._inboundService.revert();
    };
    UrlRewriteService.prototype.revertOutbound = function () {
        var _this = this;
        this._http.delete(this._outboundSettings.getValue()._links.self.href.replace("/api", ""))
            .then(function (_) {
            _this.loadOutboundSettings().then(function (set) { return _this.loadOutboundRules(); });
        });
    };
    UrlRewriteService.prototype.revertServerVariables = function () {
        var _this = this;
        this._http.delete(this._serverVariablesSettings.getValue()._links.self.href.replace("/api", ""))
            .then(function (_) {
            _this.loadServerVariableSettings();
        });
    };
    UrlRewriteService.prototype.revertRewriteMaps = function () {
        var _this = this;
        this._http.delete(this._rewriteMapSettings.getValue()._links.self.href.replace("/api", ""))
            .then(function (_) {
            _this.loadRewriteMapSection().then(function (set) { return _this.loadRewriteMaps(); });
        });
    };
    UrlRewriteService.prototype.revertProviders = function () {
        var _this = this;
        this._http.delete(this._providersSettings.getValue()._links.self.href.replace("/api", ""))
            .then(function (_) {
            _this.loadProvidersSettings().then(function (set) { return _this.loadProviders(); });
        });
    };
    UrlRewriteService.prototype.install = function () {
        var _this = this;
        this._status = status_1.Status.Starting;
        return this._http.post(UrlRewriteService_1.URL, "")
            .then(function (feature) {
            _this._status = status_1.Status.Started;
            _this.initialize(feature.id);
        })
            .catch(function (e) {
            _this.error = e;
            throw e;
        });
    };
    UrlRewriteService.prototype.uninstall = function () {
        var _this = this;
        this._status = status_1.Status.Stopping;
        var id = this._urlRewrite.getValue().id;
        this._urlRewrite.next(null);
        return this._http.delete(UrlRewriteService_1.URL + id)
            .then(function () {
            _this._status = status_1.Status.Stopped;
        })
            .catch(function (e) {
            _this.error = e;
            throw e;
        });
    };
    UrlRewriteService.prototype.initialize = function (id) {
        var _this = this;
        this.load(id).then(function (feature) {
            //
            // Inbound rules
            if (!feature.scope) {
                //
                // Global rules exposed at webserver
                _this.globalService.initialize(feature);
            }
            else {
                _this.inboundService.initialize(feature);
            }
            //
            // Outbound rules
            _this.loadOutboundSettings().then(function (set) { return _this.loadOutboundRules(); });
            //
            // Rewrite Maps
            _this.loadRewriteMapSection().then(function (set) { return _this.loadRewriteMaps(); });
            //
            // Providers
            _this.loadProvidersSettings().then(function (set) { return _this.loadProviders(); });
            //
            // Allowed server variables
            _this.loadServerVariableSettings();
        });
    };
    UrlRewriteService.prototype.load = function (id) {
        var _this = this;
        return this._http.get(UrlRewriteService_1.URL + id)
            .then(function (feature) {
            _this._status = status_1.Status.Started;
            _this._urlRewrite.next(feature);
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
    //
    // Inbound
    UrlRewriteService.prototype.saveInbound = function (settings) {
        return this.webserverScope ?
            this.globalService.saveSettings(settings) :
            this.inboundService.saveSettings(settings);
    };
    UrlRewriteService.prototype.addInboundRule = function (rule) {
        return this.webserverScope ?
            this.globalService.addRule(rule) :
            this.inboundService.addRule(rule);
    };
    UrlRewriteService.prototype.saveInboundRule = function (rule) {
        return this.webserverScope ?
            this.globalService.saveRule(rule) :
            this.inboundService.saveRule(rule);
    };
    UrlRewriteService.prototype.deleteInboundRule = function (rule) {
        this.webserverScope ?
            this.globalService.deleteRule(rule) :
            this.inboundService.deleteRule(rule);
    };
    UrlRewriteService.prototype.copyInboundRule = function (rule) {
        return this.webserverScope ?
            this.globalService.copyRule(rule) :
            this.inboundService.copyRule(rule);
    };
    UrlRewriteService.prototype.moveInboundUp = function (rule) {
        this.webserverScope ?
            this.globalService.moveUp(rule) :
            this.inboundService.moveUp(rule);
    };
    UrlRewriteService.prototype.moveInboundDown = function (rule) {
        this.webserverScope ?
            this.globalService.moveDown(rule) :
            this.inboundService.moveDown(rule);
    };
    //
    // Outbound
    UrlRewriteService.prototype.loadOutboundSettings = function () {
        var _this = this;
        var feature = this._urlRewrite.getValue();
        var outboundLink = feature._links.outbound.href;
        return this._http.get(outboundLink.replace('/api', ''))
            .then(function (settings) {
            _this._outboundSettings.next(settings);
            return settings;
        })
            .catch(function (e) {
            _this.outboundError = e;
            throw e;
        });
    };
    UrlRewriteService.prototype.loadOutboundRules = function () {
        var _this = this;
        var settings = this._outboundSettings.getValue();
        var rulesLink = settings._links.rules.href;
        return this._http.get(rulesLink.replace('/api', '') + "&fields=*")
            .then(function (rulesObj) {
            var rules = rulesObj.rules;
            _this._outboundRules.next(rules);
            return rules;
        });
    };
    UrlRewriteService.prototype.saveOutbound = function (settings) {
        var _this = this;
        return this._http.patch(settings._links.self.href.replace('/api', ''), JSON.stringify(settings))
            .then(function (s) {
            Object.assign(settings, s);
            _this.loadOutboundRules();
            return settings;
        });
    };
    UrlRewriteService.prototype.addOutboundRule = function (rule) {
        var _this = this;
        var settings = this._outboundSettings.getValue();
        var rulesLink = settings._links.rules.href;
        rule.url_rewrite = this._urlRewrite.getValue();
        return this._http.post(rulesLink.replace('/api', ''), JSON.stringify(rule))
            .then(function (newRule) {
            var rules = _this._outboundRules.getValue();
            rules.push(newRule);
            _this._outboundRules.next(rules);
            return newRule;
        });
    };
    UrlRewriteService.prototype.saveOutboundRule = function (rule) {
        return this._http.patch(rule._links.self.href.replace('/api', ''), JSON.stringify(rule))
            .then(function (r) {
            Object.assign(rule, r);
            return rule;
        });
    };
    UrlRewriteService.prototype.deleteOutboundRule = function (rule) {
        var _this = this;
        this._http.delete(rule._links.self.href.replace('/api', ''))
            .then(function () {
            var rules = _this._outboundRules.getValue();
            rules = rules.filter(function (r) { return r.id != rule.id; });
            _this._outboundRules.next(rules);
        });
    };
    UrlRewriteService.prototype.copyOutboundRule = function (rule) {
        var copy = JSON.parse(JSON.stringify(rule));
        var i = 2;
        copy.name = rule.name + " - Copy";
        copy.priority = null;
        while (this._outboundRules.getValue().find(function (r) { return r.name.toLocaleLowerCase() == copy.name.toLocaleLowerCase(); }) != null) {
            copy.name = rule.name + " - Copy (" + (i++) + ")";
        }
        return this.addOutboundRule(copy);
    };
    UrlRewriteService.prototype.moveOutboundUp = function (rule) {
        var _this = this;
        if (rule.priority == 0) {
            return;
        }
        var oldPriority = rule.priority;
        rule.priority = oldPriority - 1;
        this.saveOutboundRule(rule).then(function (r) {
            var rules = _this._outboundRules.getValue();
            //
            // Move the rule in the client view of rules list
            rules.splice(oldPriority, 1);
            //
            // Update the index of the rule which got pushed down
            rules[rule.priority].priority++;
            rules.splice(rule.priority, 0, rule);
            _this._outboundRules.next(rules);
        });
    };
    UrlRewriteService.prototype.moveOutboundDown = function (rule) {
        var _this = this;
        var oldPriority = rule.priority;
        if (oldPriority + 1 == this._outboundRules.getValue().length) {
            return;
        }
        rule.priority = oldPriority + 1;
        this.saveOutboundRule(rule).then(function (r) {
            var rules = _this._outboundRules.getValue();
            rules.splice(oldPriority, 1);
            rules[oldPriority].priority--;
            rules.splice(rule.priority, 0, rule);
            _this._outboundRules.next(rules);
        });
    };
    //
    // Rewrite Maps
    UrlRewriteService.prototype.loadRewriteMapSection = function () {
        var _this = this;
        var feature = this._urlRewrite.getValue();
        var rewriteMapLink = feature._links.rewrite_maps.href;
        return this._http.get(rewriteMapLink.replace('/api', ''))
            .then(function (settings) {
            _this._rewriteMapSettings.next(settings);
            return settings;
        })
            .catch(function (e) {
            _this.rewriteMapsError = e;
            throw e;
        });
    };
    UrlRewriteService.prototype.loadRewriteMaps = function () {
        var _this = this;
        var settings = this._rewriteMapSettings.getValue();
        var mapsLink = settings._links.entries.href;
        return this._http.get(mapsLink.replace('/api', '') + "&fields=*")
            .then(function (mapsObj) {
            var entries = mapsObj.entries;
            _this._rewriteMaps.next(entries);
            return entries;
        });
    };
    UrlRewriteService.prototype.saveRewriteMapSettings = function (settings) {
        var _this = this;
        return this._http.patch(settings._links.self.href.replace('/api', ''), JSON.stringify(settings))
            .then(function (s) {
            Object.assign(settings, s);
            _this.loadRewriteMaps();
            return settings;
        });
    };
    UrlRewriteService.prototype.addRewriteMap = function (map) {
        var _this = this;
        var settings = this._rewriteMapSettings.getValue();
        var mapsLink = settings._links.entries.href;
        map.url_rewrite = this._urlRewrite.getValue();
        return this._http.post(mapsLink.replace('/api', ''), JSON.stringify(map))
            .then(function (newRule) {
            var maps = _this._rewriteMaps.getValue();
            maps.push(newRule);
            _this._rewriteMaps.next(maps);
            return newRule;
        });
    };
    UrlRewriteService.prototype.saveRewriteMap = function (map) {
        return this._http.patch(map._links.self.href.replace('/api', ''), JSON.stringify(map))
            .then(function (r) {
            Object.assign(map, r);
            return map;
        });
    };
    UrlRewriteService.prototype.deleteRewriteMap = function (map) {
        var _this = this;
        this._http.delete(map._links.self.href.replace('/api', ''))
            .then(function () {
            var maps = _this._rewriteMaps.getValue();
            maps = maps.filter(function (r) { return r.id != map.id; });
            _this._rewriteMaps.next(maps);
        });
    };
    UrlRewriteService.prototype.copyRewriteMap = function (map) {
        var copy = JSON.parse(JSON.stringify(map));
        var i = 2;
        copy.name = map.name + " - Copy";
        while (this._rewriteMaps.getValue().find(function (r) { return r.name.toLocaleLowerCase() == copy.name.toLocaleLowerCase(); }) != null) {
            copy.name = map.name + " - Copy (" + (i++) + ")";
        }
        return this.addRewriteMap(copy);
    };
    //
    // Providers
    UrlRewriteService.prototype.loadProvidersSettings = function () {
        var _this = this;
        var feature = this._urlRewrite.getValue();
        var providersLink = feature._links.providers.href;
        return this._http.get(providersLink.replace('/api', ''))
            .then(function (settings) {
            _this._providersSettings.next(settings);
            return settings;
        })
            .catch(function (e) {
            _this.providersError = e;
            throw e;
        });
    };
    UrlRewriteService.prototype.loadProviders = function () {
        var _this = this;
        var settings = this._providersSettings.getValue();
        var providersLink = settings._links.entries.href;
        return this._http.get(providersLink.replace('/api', '') + "&fields=*")
            .then(function (providersObj) {
            var providers = providersObj.entries;
            _this._providers.next(providers);
            return providers;
        });
    };
    UrlRewriteService.prototype.saveProviders = function (settings) {
        var _this = this;
        return this._http.patch(settings._links.self.href.replace('/api', ''), JSON.stringify(settings))
            .then(function (s) {
            Object.assign(settings, s);
            _this.loadProviders();
            return settings;
        });
    };
    UrlRewriteService.prototype.addProvider = function (provider) {
        var _this = this;
        var settings = this._providersSettings.getValue();
        var providersLink = settings._links.entries.href;
        provider.url_rewrite = this._urlRewrite.getValue();
        return this._http.post(providersLink.replace('/api', ''), JSON.stringify(provider))
            .then(function (newProvider) {
            var providers = _this._providers.getValue();
            providers.push(newProvider);
            _this._providers.next(providers);
            return newProvider;
        });
    };
    UrlRewriteService.prototype.saveProvider = function (provider) {
        return this._http.patch(provider._links.self.href.replace('/api', ''), JSON.stringify(provider))
            .then(function (r) {
            Object.assign(provider, r);
            return provider;
        });
    };
    UrlRewriteService.prototype.deleteProvider = function (provider) {
        var _this = this;
        this._http.delete(provider._links.self.href.replace('/api', ''))
            .then(function () {
            var providers = _this._providers.getValue();
            providers = providers.filter(function (r) { return r.id != provider.id; });
            _this._providers.next(providers);
        });
    };
    UrlRewriteService.prototype.copyProvider = function (provider) {
        var copy = JSON.parse(JSON.stringify(provider));
        var i = 2;
        copy.name = provider.name + " - Copy";
        while (this._providers.getValue().find(function (r) { return r.name.toLocaleLowerCase() == copy.name.toLocaleLowerCase(); }) != null) {
            copy.name = provider.name + " - Copy (" + (i++) + ")";
        }
        return this.addProvider(copy);
    };
    //
    // Server Variables
    UrlRewriteService.prototype.loadServerVariableSettings = function () {
        var _this = this;
        var feature = this._urlRewrite.getValue();
        var serverVariablesLink = feature._links.allowed_server_variables.href;
        return this._http.get(serverVariablesLink.replace('/api', ''))
            .then(function (settings) {
            _this._serverVariablesSettings.next(settings);
            return settings;
        })
            .catch(function (e) {
            _this.serverVariablesError = e;
            throw e;
        });
    };
    UrlRewriteService.prototype.saveServerVariables = function (settings) {
        return this._http.patch(settings._links.self.href.replace('/api', ''), JSON.stringify(settings))
            .then(function (s) {
            Object.assign(settings, s);
            return settings;
        });
    };
    UrlRewriteService.URL = "/webserver/url-rewrite/";
    UrlRewriteService = UrlRewriteService_1 = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [httpclient_1.HttpClient, notification_service_1.NotificationService, router_1.ActivatedRoute])
    ], UrlRewriteService);
    return UrlRewriteService;
    var UrlRewriteService_1;
}());
exports.UrlRewriteService = UrlRewriteService;
//# sourceMappingURL=url-rewrite.service.js.map