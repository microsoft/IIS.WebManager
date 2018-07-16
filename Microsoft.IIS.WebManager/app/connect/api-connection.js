"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ApiConnection = /** @class */ (function () {
    function ApiConnection(url) {
        this.url = url;
        this._id = (new Date().getTime()).toString();
    }
    Object.defineProperty(ApiConnection, "DefaultPort", {
        get: function () { return "55539"; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ApiConnection, "Protocol", {
        get: function () { return "https"; },
        enumerable: true,
        configurable: true
    });
    ApiConnection.clone = function (data) {
        if (!data) {
            return null;
        }
        var o = (data);
        var conn = new ApiConnection(o._url);
        conn.accessToken = o.accessToken;
        conn.displayName = o.displayName;
        conn.persist = o.persist;
        conn._id = o._id;
        return conn;
    };
    Object.defineProperty(ApiConnection.prototype, "url", {
        get: function () {
            return this._url;
        },
        set: function (value) {
            this._url = "";
            this._url = value ? ApiConnection.normalizeUrl(value.trim().toLowerCase()) : "";
        },
        enumerable: true,
        configurable: true
    });
    ApiConnection.prototype.id = function () {
        return this._id;
    };
    ApiConnection.prototype.hostname = function () {
        if (!this._url) {
            return undefined;
        }
        var i = this._url.indexOf("://");
        var j = this._url.lastIndexOf(":");
        if (i <= 0 || j <= 0) {
            return undefined;
        }
        i += 3;
        return this.url.substr(i, j - i);
    };
    ApiConnection.normalizeUrl = function (url) {
        if (url.indexOf("://") < 0) {
            url = ApiConnection.Protocol + "://" + url;
        }
        // Authority [0; a]
        var a = url.indexOf("/", ApiConnection.Protocol.length + 3);
        if (a < 0) {
            a = url.length;
        }
        //
        // Port [p; a]
        var p = url.lastIndexOf(":", a);
        if (url[p + 1] == '/' && url[p - 1] != ']') {
            // No port, use the default
            url = url.substr(0, a) + ":" + ApiConnection.DefaultPort + url.substr(a);
        }
        return url;
    };
    return ApiConnection;
}());
exports.ApiConnection = ApiConnection;
//# sourceMappingURL=api-connection.js.map