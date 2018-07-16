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
var httpclient_1 = require("../../common/httpclient");
var HttpResponseHeadersService = /** @class */ (function () {
    function HttpResponseHeadersService(_http) {
        this._http = _http;
    }
    HttpResponseHeadersService_1 = HttpResponseHeadersService;
    HttpResponseHeadersService.prototype.get = function (id) {
        var _this = this;
        var settings = {
            anonymous: null,
            basic: null,
            digest: null,
            windows: null
        };
        return this.getFeature(id).then(function (feature) {
            return _this.getCustomHeaders(feature).then(function (customHeaders) {
                return _this.getRedirectHeaders(feature).then(function (redirectHeaders) {
                    return {
                        feature: feature,
                        customHeaders: customHeaders,
                        redirectHeaders: redirectHeaders
                    };
                });
            });
        });
    };
    HttpResponseHeadersService.prototype.revert = function (id) {
        return this._http.delete(HttpResponseHeadersService_1.URL + id);
    };
    // Both header types share the same patch function, no type restriction
    HttpResponseHeadersService.prototype.patchHeader = function (header, data) {
        return this._http.patch(header._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(function (header) {
            return header;
        });
    };
    HttpResponseHeadersService.prototype.patchFeature = function (feature, data) {
        return this._http.patch(feature._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(function (feature) {
            return feature;
        });
    };
    HttpResponseHeadersService.prototype.addCustomHeader = function (feature, header) {
        return this._http.post(feature._links.custom_headers.href.replace("/api", ""), JSON.stringify(header))
            .then(function (header) {
            return header;
        });
    };
    HttpResponseHeadersService.prototype.addRedirectHeader = function (feature, header) {
        return this._http.post(feature._links.redirect_headers.href.replace("/api", ""), JSON.stringify(header))
            .then(function (header) {
            return header;
        });
    };
    // Both header types share the same delete function, no type restriction
    HttpResponseHeadersService.prototype.deleteHeader = function (header) {
        return this._http.delete(header._links.self.href.replace("/api", ""));
    };
    HttpResponseHeadersService.prototype.getFeature = function (id) {
        return this._http.get(HttpResponseHeadersService_1.URL + id)
            .then(function (feature) {
            return feature;
        });
    };
    HttpResponseHeadersService.prototype.getCustomHeaders = function (feature) {
        return this._http.get(feature._links.custom_headers.href.replace("/api", ""))
            .then(function (headers) {
            return headers.custom_headers;
        });
    };
    HttpResponseHeadersService.prototype.getRedirectHeaders = function (feature) {
        return this._http.get(feature._links.redirect_headers.href.replace("/api", ""))
            .then(function (headers) {
            return headers.redirect_headers;
        });
    };
    HttpResponseHeadersService.URL = "/webserver/http-response-headers/";
    HttpResponseHeadersService = HttpResponseHeadersService_1 = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [httpclient_1.HttpClient])
    ], HttpResponseHeadersService);
    return HttpResponseHeadersService;
    var HttpResponseHeadersService_1;
}());
exports.HttpResponseHeadersService = HttpResponseHeadersService;
//# sourceMappingURL=http-response-headers.service.js.map