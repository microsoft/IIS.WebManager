"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var api_connection_1 = require("./api-connection");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var ConnectionStore = /** @class */ (function () {
    function ConnectionStore() {
        this._connections = new BehaviorSubject_1.BehaviorSubject([]);
        this._active = new BehaviorSubject_1.BehaviorSubject(null);
        try {
            this.load();
        }
        catch (e) {
            console.log(e);
        }
    }
    Object.defineProperty(ConnectionStore.prototype, "connections", {
        get: function () {
            return this._connections.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionStore.prototype, "active", {
        get: function () {
            return this._active.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    ConnectionStore.prototype.save = function (conn) {
        var connection;
        for (var _i = 0, _a = this._data; _i < _a.length; _i++) {
            var c = _a[_i];
            if (c.id() == conn.id()) {
                connection = c;
                break;
            }
        }
        if (connection) {
            //
            // Update existing
            for (var k in conn)
                connection[k] = conn[k]; // Copy
            this.store();
        }
        else {
            //
            // Add new
            this._data.push(conn);
            this.store();
            this._connections.next(this._data);
            connection = conn;
        }
        return connection;
    };
    ConnectionStore.prototype.delete = function (conn) {
        if (this._activeConn && this._activeConn.id() == conn.id()) {
            this.setActive(null);
        }
        for (var i = 0; i < this._data.length; ++i) {
            if (this._data[i].id() == conn.id()) {
                this._data.splice(i, 1);
                conn.url = conn.accessToken = conn.displayName = conn.persist = undefined;
                this.store();
                this._connections.next(this._data);
                break;
            }
        }
    };
    ConnectionStore.prototype.setActive = function (conn) {
        //
        // Update the store
        try {
            if (!this._activeConn) {
                sessionStorage.removeItem(ConnectionStore.ACTIVE_KEY);
                localStorage.removeItem(ConnectionStore.ACTIVE_KEY);
            }
            if (conn) {
                sessionStorage.setItem(ConnectionStore.ACTIVE_KEY, conn.id());
                if (conn.persist) {
                    localStorage.setItem(ConnectionStore.ACTIVE_KEY, conn.id());
                }
            }
        }
        catch (e) {
            console.log(e);
        }
        this._active.next(conn);
    };
    Object.defineProperty(ConnectionStore.prototype, "_data", {
        get: function () {
            return this._connections.getValue();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionStore.prototype, "_activeConn", {
        get: function () {
            return this._active.getValue();
        },
        enumerable: true,
        configurable: true
    });
    ConnectionStore.prototype.load = function () {
        var arr;
        //
        // Load from session storage
        arr = JSON.parse(sessionStorage.getItem(ConnectionStore.CONNECTIONS_KEY));
        if (arr) {
            for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
                var c = arr_1[_i];
                var conn = api_connection_1.ApiConnection.clone(c);
                conn.persist = false;
                this._data.push(conn);
            }
        }
        //
        // Load from local storage
        arr = JSON.parse(localStorage.getItem(ConnectionStore.CONNECTIONS_KEY));
        if (arr) {
            for (var _a = 0, arr_2 = arr; _a < arr_2.length; _a++) {
                var c = arr_2[_a];
                var conn = api_connection_1.ApiConnection.clone(c);
                conn.persist = true;
                this._data.push(conn);
            }
        }
        //
        // Get active
        var activeId = sessionStorage.getItem(ConnectionStore.ACTIVE_KEY) || localStorage.getItem(ConnectionStore.ACTIVE_KEY);
        var conns = activeId ? this._data.filter(function (c) { return c.id() == activeId; }) : [];
        if (conns.length > 0) {
            this.setActive(conns[0]);
        }
        else {
            if (this._data.length > 0) {
                this.setActive(this._data[0]);
            }
        }
    };
    ConnectionStore.prototype.store = function () {
        var persisted = [];
        var session = [];
        this._data.forEach(function (conn) { return conn.persist ? persisted.push(conn) : session.push(conn); });
        //
        // Update storage
        try {
            sessionStorage.setItem(ConnectionStore.CONNECTIONS_KEY, JSON.stringify(session));
            localStorage.setItem(ConnectionStore.CONNECTIONS_KEY, JSON.stringify(persisted));
        }
        catch (e) {
        }
    };
    ConnectionStore.CONNECTIONS_KEY = "ConnectionStore:Connections";
    ConnectionStore.ACTIVE_KEY = "ConnectionStore:ActiveConnection";
    return ConnectionStore;
}());
exports.ConnectionStore = ConnectionStore;
//# sourceMappingURL=connection-store.js.map