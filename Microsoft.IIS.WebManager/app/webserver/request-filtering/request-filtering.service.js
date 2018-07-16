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
var api_error_1 = require("../../error/api-error");
var httpclient_1 = require("../../common/httpclient");
var RequestFilteringService = /** @class */ (function () {
    function RequestFilteringService(_http, route) {
        this._http = _http;
        this._status = status_1.Status.Unknown;
        this._requestFiltering = new BehaviorSubject_1.BehaviorSubject(null);
        this._filteringRules = new BehaviorSubject_1.BehaviorSubject([]);
        this._fileExtensions = new BehaviorSubject_1.BehaviorSubject([]);
        this._webserverScope = route.snapshot.parent.url[0].path.toLocaleLowerCase() == 'webserver';
    }
    RequestFilteringService_1 = RequestFilteringService;
    Object.defineProperty(RequestFilteringService.prototype, "status", {
        get: function () {
            return this._status;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RequestFilteringService.prototype, "webserverScope", {
        get: function () {
            return this._webserverScope;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RequestFilteringService.prototype, "requestFiltering", {
        get: function () {
            return this._requestFiltering.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RequestFilteringService.prototype, "filteringRules", {
        get: function () {
            return this._filteringRules.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RequestFilteringService.prototype, "fileExtensions", {
        get: function () {
            return this._fileExtensions.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    RequestFilteringService.prototype.initialize = function (id) {
        this.load(id);
    };
    RequestFilteringService.prototype.update = function (data) {
        var _this = this;
        var id = this._requestFiltering.getValue().id;
        return this._http.patch(RequestFilteringService_1.URL + id, JSON.stringify(data))
            .then(function (obj) {
            var requestFiltering = _this._requestFiltering.getValue();
            for (var k in obj)
                requestFiltering[k] = obj[k];
            _this._requestFiltering.next(requestFiltering);
            return requestFiltering;
        });
    };
    RequestFilteringService.prototype.revert = function () {
        var _this = this;
        var id = this._requestFiltering.getValue().id;
        return this._http.delete(RequestFilteringService_1.URL + id)
            .then(function () {
            _this.load(id);
        });
    };
    RequestFilteringService.prototype.install = function () {
        var _this = this;
        this._status = status_1.Status.Starting;
        return this._http.post(RequestFilteringService_1.URL, "")
            .then(function (feature) {
            _this._status = status_1.Status.Started;
            _this._requestFiltering.next(feature);
        })
            .catch(function (e) {
            _this.error = e;
            throw e;
        });
    };
    RequestFilteringService.prototype.uninstall = function () {
        var _this = this;
        this._status = status_1.Status.Stopping;
        var id = this._requestFiltering.getValue().id;
        this._requestFiltering.next(null);
        return this._http.delete(RequestFilteringService_1.URL + id)
            .then(function () {
            _this._status = status_1.Status.Stopped;
        })
            .catch(function (e) {
            _this.error = e;
            throw e;
        });
    };
    //
    // Filtering Rules
    RequestFilteringService.prototype.addFilteringRule = function (rule) {
        var _this = this;
        rule.request_filtering = this._requestFiltering.getValue();
        return this._http.post(RequestFilteringService_1.URL + "rules", JSON.stringify(rule))
            .then(function (rule) {
            _this._filteringRules.getValue().unshift(rule);
            _this._filteringRules.next(_this._filteringRules.getValue());
        });
    };
    RequestFilteringService.prototype.updateFilteringRule = function (rule, data) {
        return this._http.patch(rule._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(function (r) {
            diff_1.DiffUtil.set(rule, r);
            return rule;
        });
    };
    RequestFilteringService.prototype.deleteFilteringRule = function (rule) {
        var _this = this;
        return this._http.delete(rule._links.self.href.replace("/api", ""))
            .then(function () {
            var rules = _this._filteringRules.getValue().filter(function (r) { return r !== rule; });
            _this._filteringRules.next(rules);
        });
    };
    RequestFilteringService.prototype.loadFilteringRules = function () {
        var _this = this;
        this._http.get(this._requestFiltering.getValue()._links.rules.href.replace("/api", "") + "&fields=*")
            .then(function (result) {
            _this._filteringRules.next(result.rules);
        });
    };
    //
    // File Extensions
    RequestFilteringService.prototype.addFileExtension = function (extension) {
        var _this = this;
        extension.request_filtering = this._requestFiltering.getValue();
        return this._http.post(RequestFilteringService_1.URL + "file-extensions", JSON.stringify(extension))
            .then(function (extension) {
            _this._fileExtensions.getValue().unshift(extension);
            _this._fileExtensions.next(_this._fileExtensions.getValue());
        });
    };
    RequestFilteringService.prototype.updateFileExtension = function (extension, data) {
        return this._http.patch(extension._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(function (e) {
            diff_1.DiffUtil.set(extension, e);
            return extension;
        });
    };
    RequestFilteringService.prototype.deleteFileExtension = function (extension) {
        var _this = this;
        return this._http.delete(extension._links.self.href.replace("/api", ""))
            .then(function () {
            var extensions = _this._fileExtensions.getValue().filter(function (e) { return e !== extension; });
            _this._fileExtensions.next(extensions);
        });
    };
    RequestFilteringService.prototype.loadFileExtensions = function () {
        var _this = this;
        this._http.get(this._requestFiltering.getValue()._links.file_extensions.href.replace("/api", "") + "&fields=*")
            .then(function (result) {
            _this._fileExtensions.next(result.file_extensions);
        });
    };
    //
    //
    RequestFilteringService.prototype.load = function (id) {
        var _this = this;
        return this._http.get(RequestFilteringService_1.URL + id)
            .then(function (feature) {
            _this._status = status_1.Status.Started;
            _this._requestFiltering.next(feature);
            _this.loadFileExtensions();
            _this.loadFilteringRules();
        })
            .catch(function (e) {
            _this.error = e;
            if (e.type && e.type == api_error_1.ApiErrorType.FeatureNotInstalled) {
                _this._status = status_1.Status.Stopped;
            }
        });
    };
    RequestFilteringService.URL = "/webserver/http-request-filtering/";
    RequestFilteringService = RequestFilteringService_1 = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [httpclient_1.HttpClient, router_1.ActivatedRoute])
    ], RequestFilteringService);
    return RequestFilteringService;
    var RequestFilteringService_1;
}());
exports.RequestFilteringService = RequestFilteringService;
//# sourceMappingURL=request-filtering.service.js.map