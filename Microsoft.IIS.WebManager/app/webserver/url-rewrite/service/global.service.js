"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var GlobalService = /** @class */ (function () {
    function GlobalService(_http, _notificationService) {
        this._http = _http;
        this._notificationService = _notificationService;
        this._settings = new BehaviorSubject_1.BehaviorSubject(null);
        this._rules = new BehaviorSubject_1.BehaviorSubject([]);
    }
    Object.defineProperty(GlobalService.prototype, "settings", {
        get: function () {
            return this._settings.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GlobalService.prototype, "rules", {
        get: function () {
            return this._rules.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    GlobalService.prototype.revert = function () {
        var _this = this;
        this._http.delete(this._settings.getValue()._links.self.href.replace("/api", ""))
            .then(function (_) {
            _this.loadSettings().then(function (set) { return _this.loadRules(); });
        });
    };
    GlobalService.prototype.initialize = function (urlRewrite) {
        var _this = this;
        this._urlRewrite = urlRewrite;
        this.loadSettings()
            .then(function (settings) { return _this.loadRules(); });
    };
    GlobalService.prototype.loadSettings = function () {
        var _this = this;
        var feature = this._urlRewrite;
        var globalLink = feature._links.global.href;
        return this._http.get(globalLink.replace('/api', ''))
            .then(function (settings) {
            _this._settings.next(settings);
            return settings;
        })
            .catch(function (e) {
            _this.error = e;
            throw e;
        });
    };
    GlobalService.prototype.loadRules = function () {
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
    GlobalService.prototype.saveSettings = function (settings) {
        var _this = this;
        return this._http.patch(settings._links.self.href.replace('/api', ''), JSON.stringify(settings))
            .then(function (s) {
            Object.assign(settings, s);
            _this.loadRules();
            return settings;
        });
    };
    GlobalService.prototype.addRule = function (rule) {
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
        });
    };
    GlobalService.prototype.saveRule = function (rule) {
        return this._http.patch(rule._links.self.href.replace('/api', ''), JSON.stringify(rule))
            .then(function (r) {
            Object.assign(rule, r);
            return rule;
        });
    };
    GlobalService.prototype.deleteRule = function (rule) {
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
    GlobalService.prototype.copyRule = function (rule) {
        var copy = JSON.parse(JSON.stringify(rule));
        var i = 2;
        copy.name = rule.name + " - Copy";
        copy.priority = null;
        while (this._rules.getValue().find(function (r) { return r.name.toLocaleLowerCase() == copy.name.toLocaleLowerCase(); }) != null) {
            copy.name = rule.name + " - Copy (" + (i++) + ")";
        }
        return this.addRule(copy);
    };
    GlobalService.prototype.moveUp = function (rule) {
        var _this = this;
        if (rule.priority == 0) {
            return;
        }
        var oldPriority = rule.priority;
        rule.priority = oldPriority - 1;
        this.saveRule(rule).then(function (r) {
            var rules = _this._rules.getValue();
            rules.splice(oldPriority, 1);
            rules[rule.priority].priority++;
            rules.splice(rule.priority, 0, rule);
            _this._rules.next(rules);
        });
    };
    GlobalService.prototype.moveDown = function (rule) {
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
    GlobalService.URL = "/webserver/url-rewrite/";
    return GlobalService;
}());
exports.GlobalService = GlobalService;
//# sourceMappingURL=global.service.js.map