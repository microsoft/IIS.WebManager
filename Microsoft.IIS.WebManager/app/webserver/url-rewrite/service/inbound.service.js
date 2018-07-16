"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var api_error_1 = require("../../../error/api-error");
var InboundService = /** @class */ (function () {
    function InboundService(_http, _notificationService) {
        this._http = _http;
        this._notificationService = _notificationService;
        this._settings = new BehaviorSubject_1.BehaviorSubject(null);
        this._rules = new BehaviorSubject_1.BehaviorSubject([]);
    }
    Object.defineProperty(InboundService.prototype, "settings", {
        get: function () {
            return this._settings.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InboundService.prototype, "rules", {
        get: function () {
            return this._rules.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    InboundService.prototype.revert = function () {
        var _this = this;
        this._http.delete(this._settings.getValue()._links.self.href.replace("/api", ""))
            .then(function (_) {
            _this.loadSettings().then(function (set) { return _this.loadRules(); });
        });
    };
    InboundService.prototype.initialize = function (urlRewrite) {
        var _this = this;
        this._urlRewrite = urlRewrite;
        this.loadSettings()
            .then(function (settings) { return _this.loadRules(); });
    };
    InboundService.prototype.loadSettings = function () {
        var _this = this;
        var feature = this._urlRewrite;
        var inboundLink = feature._links.inbound.href;
        return this._http.get(inboundLink.replace('/api', ''))
            .then(function (settings) {
            _this._settings.next(settings);
            return settings;
        })
            .catch(function (e) {
            _this.error = e;
            throw e;
        });
    };
    InboundService.prototype.loadRules = function () {
        var _this = this;
        var settings = this._settings.getValue();
        var rulesLink = settings._links.rules.href;
        return this._http.get(rulesLink.replace('/api', '') + "&fields=*")
            .then(function (rulesObj) {
            var rules = rulesObj.rules;
            _this._rules.next(rules);
            return rules;
        });
    };
    InboundService.prototype.saveSettings = function (settings) {
        var _this = this;
        return this._http.patch(settings._links.self.href.replace('/api', ''), JSON.stringify(settings))
            .then(function (s) {
            Object.assign(settings, s);
            _this.loadRules();
            return settings;
        });
    };
    InboundService.prototype.addRule = function (rule) {
        var _this = this;
        var settings = this._settings.getValue();
        var rulesLink = settings._links.rules.href;
        rule.url_rewrite = this._urlRewrite;
        return this._http.post(rulesLink.replace('/api', ''), JSON.stringify(rule))
            .then(function (newRule) {
            var rules = _this._rules.getValue();
            rules.push(newRule);
            _this._rules.next(rules);
            return newRule;
        })
            .catch(function (e) {
            //
            // Caused by adding unallowed server variables
            if (e.type == api_error_1.ApiErrorType.SectionLocked && e.name == "system.webServer/rewrite/allowedServerVariables") {
                _this._notificationService.warn("The specified server variables could not be added");
            }
            throw e;
        });
    };
    InboundService.prototype.saveRule = function (rule) {
        var _this = this;
        return this._http.patch(rule._links.self.href.replace('/api', ''), JSON.stringify(rule))
            .then(function (r) {
            Object.assign(rule, r);
            return rule;
        })
            .catch(function (e) {
            //
            // Caused by adding unallowed server variables
            if (e.type == api_error_1.ApiErrorType.SectionLocked && e.name == "system.webServer/rewrite/allowedServerVariables") {
                _this._notificationService.warn("The specified server variables could not be added");
            }
            throw e;
        });
    };
    InboundService.prototype.deleteRule = function (rule) {
        var _this = this;
        this._http.delete(rule._links.self.href.replace('/api', ''))
            .then(function () {
            var rules = _this._rules.getValue();
            rules.forEach(function (r, i) { if (i > rule.priority)
                r.priority--; });
            rules = rules.filter(function (r) { return r.id != rule.id; });
            _this._rules.next(rules);
        });
    };
    InboundService.prototype.copyRule = function (rule) {
        var copy = JSON.parse(JSON.stringify(rule));
        var i = 2;
        copy.name = rule.name + " - Copy";
        copy.priority = null;
        while (this._rules.getValue().find(function (r) { return r.name.toLocaleLowerCase() == copy.name.toLocaleLowerCase(); }) != null) {
            copy.name = rule.name + " - Copy (" + (i++) + ")";
        }
        return this.addRule(copy);
    };
    InboundService.prototype.moveUp = function (rule) {
        var _this = this;
        if (rule.priority == 0) {
            return;
        }
        var oldPriority = rule.priority;
        rule.priority = oldPriority - 1;
        this.saveRule(rule).then(function (r) {
            var rules = _this._rules.getValue();
            //
            // Move the rule in the client view of rules list
            rules.splice(oldPriority, 1);
            //
            // Update the index of the rule which got pushed down
            rules[rule.priority].priority++;
            rules.splice(rule.priority, 0, rule);
            _this._rules.next(rules);
        });
    };
    InboundService.prototype.moveDown = function (rule) {
        var _this = this;
        var oldPriority = rule.priority;
        if (oldPriority + 1 == this._rules.getValue().length) {
            return;
        }
        rule.priority = oldPriority + 1;
        this.saveRule(rule).then(function (r) {
            var rules = _this._rules.getValue();
            rules.splice(oldPriority, 1);
            rules[oldPriority].priority--;
            rules.splice(rule.priority, 0, rule);
            _this._rules.next(rules);
        });
    };
    return InboundService;
}());
exports.InboundService = InboundService;
//# sourceMappingURL=inbound.service.js.map