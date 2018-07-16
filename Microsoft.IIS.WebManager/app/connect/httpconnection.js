"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("@angular/http");
var HttpConnection = /** @class */ (function () {
    function HttpConnection(_http) {
        this._http = _http;
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
    }
    HttpConnection.prototype.get = function (conn, path) {
        if (path.indexOf("/") != 0) {
            path = '/' + path;
        }
        var opts = {
            method: http_1.RequestMethod.Get,
            url: conn.url + path,
            headers: new http_1.Headers(),
            search: undefined,
            body: undefined
        };
        opts.headers.set("Accept", "application/hal+json");
        opts.headers.set('Access-Token', 'Bearer ' + conn.accessToken);
        return this._http.request(new http_1.Request(new http_1.RequestOptions(opts)));
    };
    HttpConnection.prototype.options = function (conn, path) {
        if (path.indexOf("/") != 0) {
            path = '/' + path;
        }
        var opts = {
            method: http_1.RequestMethod.Options,
            url: conn.url + path,
            headers: new http_1.Headers(),
            search: undefined,
            body: undefined
        };
        return this._http.request(new http_1.Request(new http_1.RequestOptions(opts)));
    };
    HttpConnection.prototype.raw = function (conn, path) {
        if (path && path.indexOf("/") != 0) {
            path = '/' + path;
        }
        var opts = {
            method: http_1.RequestMethod.Get,
            url: conn.url + path,
            headers: new http_1.Headers(),
            search: undefined,
            body: undefined
        };
        return this._http.request(new http_1.Request(new http_1.RequestOptions(opts)));
    };
    return HttpConnection;
}());
exports.HttpConnection = HttpConnection;
//# sourceMappingURL=httpconnection.js.map