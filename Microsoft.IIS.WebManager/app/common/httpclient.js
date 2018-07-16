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
var http_1 = require("@angular/http");
require("rxjs/add/operator/map");
require("rxjs/add/operator/toPromise");
var notification_service_1 = require("../notification/notification.service");
var api_error_1 = require("../error/api-error");
var connect_service_1 = require("../connect/connect.service");
var HttpClient = /** @class */ (function () {
    function HttpClient(_http, _notificationService, _connectSvc) {
        var _this = this;
        this._http = _http;
        this._notificationService = _notificationService;
        this._connectSvc = _connectSvc;
        this._headers = new http_1.Headers();
        //
        // Support withCredentials
        //
        // TODO: Use official Angular2 CORS support when merged (https://github.com/angular/angular/issues/4231).
        var _build = _http._backend._browserXHR.build;
        _http._backend._browserXHR.build = function () {
            var _xhr = _build();
            _xhr.withCredentials = true;
            return _xhr;
        };
        this._connectSvc.active.subscribe(function (c) { return _this._conn = c; });
    }
    Object.defineProperty(HttpClient.prototype, "headers", {
        get: function () {
            var headers = new http_1.Headers();
            for (var _i = 0, _a = this._headers.keys(); _i < _a.length; _i++) {
                var key = _a[_i];
                headers.append(key, this._headers.get(key));
            }
            return headers;
        },
        enumerable: true,
        configurable: true
    });
    HttpClient.prototype.setHeader = function (key, value) {
        this._headers.set(key, value);
    };
    HttpClient.prototype.get = function (url, options, warn) {
        if (warn === void 0) { warn = true; }
        var ops = this.getOptions(http_1.RequestMethod.Get, url, options);
        return this.request(url, ops, warn)
            .then(function (res) { return res.status !== 204 ? res.json() : null; });
    };
    HttpClient.prototype.head = function (url, options, warn) {
        if (warn === void 0) { warn = true; }
        var ops = this.getOptions(http_1.RequestMethod.Head, url, options);
        return this.request(url, ops, warn);
    };
    HttpClient.prototype.post = function (url, body, options, warn) {
        if (warn === void 0) { warn = true; }
        options = this.setJsonContentType(options);
        var ops = this.getOptions(http_1.RequestMethod.Post, url, options, body);
        return this.request(url, ops, warn)
            .then(function (res) { return res.status !== 204 ? res.json() : null; });
    };
    HttpClient.prototype.patch = function (url, body, options, warn) {
        if (warn === void 0) { warn = true; }
        options = this.setJsonContentType(options);
        var ops = this.getOptions(http_1.RequestMethod.Patch, url, options, body);
        return this.request(url, ops, warn)
            .then(function (res) { return res.status !== 204 ? res.json() : null; });
    };
    HttpClient.prototype.delete = function (url, options, warn) {
        if (warn === void 0) { warn = true; }
        var ops = this.getOptions(http_1.RequestMethod.Delete, url, options);
        return this.request(url, ops, warn);
    };
    HttpClient.prototype.options = function (url) {
        var ops = this.getOptions(http_1.RequestMethod.Options, url, null);
        return this.request(url, ops);
    };
    HttpClient.prototype.endpoint = function () {
        return this._conn;
    };
    HttpClient.prototype.setJsonContentType = function (options) {
        if (!options) {
            options = {};
        }
        if (!options.headers) {
            options.headers = new http_1.Headers();
        }
        options.headers.set("Content-Type", "application/json");
        return options;
    };
    HttpClient.prototype.request = function (url, options, warn) {
        var _this = this;
        if (!this._conn) {
            this._connectSvc.gotoConnect(true);
            return Promise.reject("Not connected");
        }
        var req;
        var reqOpt = new http_1.RequestOptions(options);
        if (url.toString().indexOf("/") != 0) {
            url = '/' + url;
        }
        reqOpt.url = this._conn.url + '/api' + url;
        req = new http_1.Request(reqOpt);
        //
        // Set Access-Token
        req.headers.set('Access-Token', 'Bearer ' + this._conn.accessToken);
        return this._http.request(req).toPromise()
            .catch(function (e) {
            // Status code 0 possible causes:
            // Untrusted certificate
            // Windows auth, prevents CORS headers from being accessed
            // Service not responding
            if (e.status == 0) {
                //
                // The first request to the API fails because windows auth has not started yet.
                // We repeat the request because in this case the next request will succeed.
                return _this._http.request(req).toPromise()
                    .catch(function (err) {
                    //
                    // Check to see if connected
                    return _this._http.options(_this._conn.url).toPromise()
                        .catch(function (e) {
                        _this._connectSvc.reconnect();
                        return Promise.reject("Not connected");
                    })
                        .then(function (r) {
                        return _this.handleHttpError(err);
                    });
                });
            }
            return _this.handleHttpError(e, warn);
        });
    };
    HttpClient.prototype.handleHttpError = function (err, warn) {
        if (err.status == 403 && err.headers.get("WWW-Authenticate") === "Bearer") {
            this._connectSvc.reconnect();
            return Promise.reject("Not connected");
        }
        var apiError = this.apiErrorFromHttp(err);
        if (apiError && warn) {
            this._notificationService.apiError(apiError);
        }
        throw apiError;
    };
    HttpClient.prototype.getOptions = function (method, url, options, body) {
        var aBody = body ? body : options && options.body ? options.body : undefined;
        var opts = {
            method: method,
            url: url,
            headers: options && options.headers ? options.headers : this.headers,
            search: options && options.search ? options.search : undefined,
            body: aBody
        };
        opts.headers.set("Accept", "application/hal+json");
        return opts;
    };
    HttpClient.prototype.apiErrorFromHttp = function (httpError) {
        var msg = "";
        var apiError = null;
        if ((httpError)._body) {
            try {
                apiError = JSON.parse(httpError._body);
            }
            catch (parseError) {
            }
        }
        if (apiError == null) {
            apiError = new api_error_1.ApiError();
            apiError.status = httpError.status;
        }
        if (httpError.status === 400) {
            if (apiError && apiError.title == "Invalid parameter") {
                var parameterName = this.parseParameterName(apiError.name);
                msg = "An invalid value was given for " + parameterName + ".";
                if (apiError.detail) {
                    msg += "\n" + apiError.detail;
                }
            }
        }
        if (httpError.status == 403) {
            // TODO: Invalid token
            if (apiError && apiError.title == "Object is locked") {
                apiError.type = api_error_1.ApiErrorType.SectionLocked;
                msg = "The feature's settings could not be loaded. This happens when the feature is locked at the current configuration level and the feature's settings have been modified. To fix this, manually remove any local changes to the feature or unlock the feature at the parent level.";
            }
            if (apiError && apiError.title == "Forbidden" && apiError.name) {
                if (apiError[apiError.name]) {
                    msg = "Forbidden: '" + apiError[apiError.name] + "'";
                }
                else {
                    msg = "Forbidden: '" + apiError.name + "'";
                }
                if (apiError.detail) {
                    msg += "\n" + apiError.detail;
                }
            }
        }
        if (httpError.status == 404) {
            if (apiError && apiError.detail === "IIS feature not installed") {
                apiError.type = api_error_1.ApiErrorType.FeatureNotInstalled;
                msg = apiError.detail + "\n" + apiError.name;
            }
            else {
                msg = "The resource could not be found";
                apiError.type = api_error_1.ApiErrorType.NotFound;
            }
        }
        if (httpError.status == 500) {
            // TODO: Invalid token
            if (apiError.detail == "Dism Error") {
                msg = "An error occured enabling " + apiError.feature;
                if (apiError.exit_code == 'B7') {
                    msg += "\nThe specified image is currently being serviced by another DISM operation";
                }
                msg += "\nError code: " + apiError.exit_code;
            }
            else {
                msg = apiError.detail || "";
            }
        }
        apiError.message = msg;
        return apiError;
    };
    HttpClient.prototype.parseParameterName = function (pName) {
        if (!pName) {
            return "";
        }
        while (pName.indexOf(".") != -1) {
            pName = pName.substr(pName.indexOf(".") + 1);
        }
        var parts = pName.split('_');
        for (var i = 0; i < parts.length; i++) {
            parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
        }
        return parts.join(" ");
    };
    HttpClient = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http,
            notification_service_1.NotificationService,
            connect_service_1.ConnectService])
    ], HttpClient);
    return HttpClient;
}());
exports.HttpClient = HttpClient;
//# sourceMappingURL=httpclient.js.map