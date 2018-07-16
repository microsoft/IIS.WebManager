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
// 
// Don't import rxjs/Rx. Loading is too slow!
// Import only needed operators
var IntervalObservable_1 = require("rxjs/observable/IntervalObservable");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var httpclient_1 = require("../../common/httpclient");
var status_1 = require("../../common/status");
var AppPoolsService = /** @class */ (function () {
    function AppPoolsService(_http) {
        this._http = _http;
        this._data = new Map();
        this._appPools = new BehaviorSubject_1.BehaviorSubject(this._data);
    }
    Object.defineProperty(AppPoolsService.prototype, "appPools", {
        get: function () {
            return this._appPools.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    AppPoolsService.prototype.getAll = function () {
        var _this = this;
        if (this._all) {
            return Promise.resolve(this._data);
        }
        return this._http.get("/webserver/application-pools?fields=name,status,identity,pipeline_mode,managed_runtime_version")
            .then(function (res) {
            res.app_pools.forEach(function (p) { return _this.add(p); });
            _this._all = true;
            _this._appPools.next(_this._data);
            return _this._data;
        });
    };
    AppPoolsService.prototype.get = function (id) {
        var _this = this;
        var pool = this._data.get(id);
        if (pool && pool._full) {
            return Promise.resolve(pool);
        }
        return this.loadAppPool(id).then(function (p) {
            if (_this.add(p)) {
                _this._appPools.next(_this._data);
            }
            return _this._data.get(id);
        });
    };
    AppPoolsService.prototype.update = function (pool, data) {
        var _this = this;
        //
        // Cache it if doesn't exist
        if (!this._data.has(pool.id)) {
            this._data.set(pool.id, pool);
            this._appPools.next(this._data);
        }
        return this._http.patch("/webserver/application-pools/" + pool.id, JSON.stringify(data)).then(function (p) {
            //
            // AppPool Name change will change the id
            if (pool.id != p.id) {
                _this._data.delete(pool.id);
            }
            _this.add(p);
            return pool;
        });
    };
    AppPoolsService.prototype.create = function (data) {
        var _this = this;
        return this._http.post("/webserver/application-pools", JSON.stringify(data)).then(function (p) {
            _this._data.set(p.id, p);
            data.id = p.id;
            _this._appPools.next(_this._data);
            return _this._data.get(p.id);
        });
    };
    AppPoolsService.prototype.start = function (pool) {
        var _this = this;
        pool.status = status_1.Status.Starting;
        this.update(pool, { status: "started" }).then(function (p) {
            pool.status = p.status;
            //
            // Ping
            if (pool.status == status_1.Status.Starting) {
                var ob_1 = IntervalObservable_1.IntervalObservable.create(1000).subscribe(function (i) {
                    _this.loadAppPool(pool.id, "status").then(function (p) {
                        pool.status = p.status;
                        if (pool.status != status_1.Status.Starting || i >= 10) {
                            ob_1.unsubscribe();
                        }
                    });
                });
            }
        });
    };
    AppPoolsService.prototype.stop = function (pool) {
        var _this = this;
        pool.status = status_1.Status.Stopping;
        this.update(pool, { status: "stopped" }).then(function (p) {
            pool.status = p.status;
            //
            // Ping
            if (pool.status == status_1.Status.Stopping) {
                var ob_2 = IntervalObservable_1.IntervalObservable.create(1000).subscribe(function (i) {
                    _this.loadAppPool(pool.id, "status").then(function (p) {
                        pool.status = p.status;
                        if (pool.status != status_1.Status.Stopping || i >= 90) {
                            ob_2.unsubscribe();
                        }
                    });
                });
            }
        });
    };
    AppPoolsService.prototype.recycle = function (pool) {
        var _this = this;
        if (pool.status == status_1.Status.Stopped) {
            this.start(pool);
            return;
        }
        this.stop(pool);
        if (pool.status == status_1.Status.Stopping) {
            var ob_3 = IntervalObservable_1.IntervalObservable.create(200).subscribe(function (i) {
                if (pool.status == status_1.Status.Stopped || i >= 450) {
                    ob_3.unsubscribe();
                    _this.start(pool);
                }
            });
        }
    };
    AppPoolsService.prototype.delete = function (pool) {
        var _this = this;
        return this._http.delete("/webserver/application-pools/" + pool.id).then(function (_) {
            _this._data.delete(pool.id);
            pool.id = undefined; // Invalidate
            _this._appPools.next(_this._data);
        });
    };
    AppPoolsService.prototype.loadAppPool = function (id, fields) {
        var url = "/webserver/application-pools/" + id;
        var hasFields = (fields && fields.length > 0);
        if (hasFields) {
            url += "?fields=" + fields;
        }
        return this._http.get(url).then(function (p) {
            if (!hasFields) {
                p._full = true;
            }
            return p;
        });
    };
    AppPoolsService.prototype.add = function (p) {
        var pool = this._data.get(p.id);
        if (!pool) {
            this._data.set(p.id, p);
            return true;
        }
        else {
            // Update all properties
            // Keep all _links
            var links = pool._links;
            for (var k in p) {
                pool[k] = p[k];
            }
            for (var k in p._links) {
                links[k] = p._links[k];
            }
            pool._links = links;
        }
        return false;
    };
    AppPoolsService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [httpclient_1.HttpClient])
    ], AppPoolsService);
    return AppPoolsService;
}());
exports.AppPoolsService = AppPoolsService;
//# sourceMappingURL=app-pools.service.js.map