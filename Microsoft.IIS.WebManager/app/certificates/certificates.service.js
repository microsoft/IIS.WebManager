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
var Subject_1 = require("rxjs/Subject");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var httpclient_1 = require("../common/httpclient");
var CertificatesService = /** @class */ (function () {
    function CertificatesService(_http) {
        this._http = _http;
        this._certificates = new BehaviorSubject_1.BehaviorSubject([]);
        this._stopRetrievals = new Subject_1.Subject();
        this._loading = 0;
    }
    CertificatesService_1 = CertificatesService;
    Object.defineProperty(CertificatesService.prototype, "certificates", {
        get: function () {
            return this._certificates.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CertificatesService.prototype, "loading", {
        get: function () {
            return this._loading != 0;
        },
        enumerable: true,
        configurable: true
    });
    CertificatesService.prototype.load = function () {
        var _this = this;
        this._certificates.getValue().splice(0);
        this._certificates.next(this._certificates.getValue());
        return this.supportsRange()
            .then(function (result) {
            if (result) {
                _this._stopRetrievals.next(true);
                return _this.getAllByRange();
            }
            else {
                return _this.getAll();
            }
        });
    };
    CertificatesService.prototype.get = function (id) {
        var _this = this;
        var cached = this._certificates.getValue().find(function (c) { return c.id === id; });
        if (cached) {
            return Promise.resolve(cached);
        }
        return this._http.get(CertificatesService_1.URL + id)
            .then(function (cert) {
            cached = _this._certificates.getValue().find(function (c) { return c.id === id; });
            if (!cached) {
                _this._certificates.getValue().push(cert);
                _this._certificates.next(_this._certificates.getValue());
                return cert;
            }
        });
    };
    CertificatesService.prototype.getAll = function () {
        var _this = this;
        this._loading++;
        return this._http.get(CertificatesService_1.URL + "?fields=" + CertificatesService_1.FIELDS)
            .then(function (obj) {
            _this._loading--;
            var certs = obj.certificates;
            var current = _this._certificates.getValue();
            certs.forEach(function (c) { return current.push(c); });
            _this._certificates.next(current);
            return current;
        })
            .catch(function (e) {
            _this._loading--;
            throw e;
        });
    };
    CertificatesService.prototype.getAllByRange = function (start, total) {
        var _this = this;
        if (start === void 0) { start = 0; }
        if (total === void 0) { total = 0; }
        var stop = false;
        var sub = this._stopRetrievals.take(1).subscribe(function () {
            stop = true;
        });
        if (start == 0) {
            this._loading++;
        }
        return (total == 0 ? this.getTotal() : Promise.resolve(total))
            .then(function (total) {
            var length = start + CertificatesService_1.RANGE_SIZE > total ? total - start : CertificatesService_1.RANGE_SIZE;
            return _this.getRange(start, length)
                .then(function (certs) {
                if (stop) {
                    _this._loading--;
                    return _this._certificates.getValue();
                }
                var current = _this._certificates.getValue();
                certs.forEach(function (c) { return current.push(c); });
                _this._certificates.next(current);
                if (start + length < total && !stop) {
                    return _this.getAllByRange(start + length, total);
                }
                else {
                    _this._loading--;
                    sub.unsubscribe();
                    return _this._certificates.getValue();
                }
            })
                .catch(function (e) {
                _this._loading--;
                sub.unsubscribe();
                throw e;
            });
        });
    };
    CertificatesService.prototype.getRange = function (start, length) {
        var args = {};
        args.headers = new http_1.Headers();
        args.headers.append('range', 'certificates=' + start + '-' + (start + length - 1));
        return this._http.get(CertificatesService_1.URL + "?fields=" + CertificatesService_1.FIELDS, args)
            .then(function (res) {
            return res.certificates;
        });
    };
    //
    // Range not supported in 1.0.39 and below
    CertificatesService.prototype.supportsRange = function () {
        return this._http.head(CertificatesService_1.URL)
            .then(function (res) {
            return !!res.headers.get('Accept-Ranges');
        });
    };
    CertificatesService.prototype.getTotal = function () {
        return this._http.head(CertificatesService_1.URL)
            .then(function (res) {
            return Number.parseInt(res.headers.get('x-total-count'));
        });
    };
    CertificatesService.URL = "/certificates/";
    CertificatesService.FIELDS = "alias,name,friendly_name,issued_by,subject,thumbprint,signature_algorithm,valid_to,valid_from,intended_purposes,subject_alternative_names,store";
    CertificatesService.RANGE_SIZE = 50;
    CertificatesService = CertificatesService_1 = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [httpclient_1.HttpClient])
    ], CertificatesService);
    return CertificatesService;
    var CertificatesService_1;
}());
exports.CertificatesService = CertificatesService;
//# sourceMappingURL=certificates.service.js.map