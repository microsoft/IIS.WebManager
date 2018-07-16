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
var http_response_headers_service_1 = require("./http-response-headers.service");
var notification_service_1 = require("../../notification/notification.service");
var diff_1 = require("../../utils/diff");
var HttpResponseHeadersComponent = /** @class */ (function () {
    function HttpResponseHeadersComponent(_service, _notificationService) {
        this._service = _service;
        this._notificationService = _notificationService;
    }
    HttpResponseHeadersComponent.prototype.ngOnInit = function () {
        this.initialize();
    };
    HttpResponseHeadersComponent.prototype.onModelChanged = function () {
        var _this = this;
        if (this.httpResponseHeaders) {
            var changes = diff_1.DiffUtil.diff(this._original, this.httpResponseHeaders);
            if (Object.keys(changes).length > 0) {
                this._service.patchFeature(this.httpResponseHeaders, changes)
                    .then(function (feature) {
                    _this._notificationService.clearWarnings();
                    _this.setFeature(feature);
                });
            }
            else {
                this._notificationService.clearWarnings();
            }
        }
    };
    HttpResponseHeadersComponent.prototype.onRevert = function () {
        var _this = this;
        this._service.revert(this.httpResponseHeaders.id)
            .then(function (_) {
            _this.initialize();
        })
            .catch(function (e) {
            _this._error = e;
        });
    };
    HttpResponseHeadersComponent.prototype.saveHeaderChanges = function (index, isCustom) {
        var _this = this;
        if (isCustom && this.customHeaders && this.customHeaders[index] && this.customHeaders[index].id) {
            var mapChanges = diff_1.DiffUtil.diff(this.originalCustomHeaders[index], this.customHeaders[index]);
            var header = this.customHeaders[index];
        }
        else if (!isCustom && this.redirectHeaders && this.redirectHeaders[index] && this.redirectHeaders[index].id) {
            var mapChanges = diff_1.DiffUtil.diff(this.originalRedirectHeaders[index], this.redirectHeaders[index]);
            var header = this.redirectHeaders[index];
        }
        else {
            return;
        }
        if (mapChanges && header && Object.keys(mapChanges).length > 0) {
            this._service.patchHeader(header, mapChanges)
                .then(function (map) {
                _this.setHeader(index, map, isCustom);
            });
        }
        else {
            this._notificationService.clearWarnings();
        }
    };
    HttpResponseHeadersComponent.prototype.deleteHeader = function (header) {
        this._service.deleteHeader(header);
    };
    HttpResponseHeadersComponent.prototype.addHeader = function (index, isCustom) {
        var _this = this;
        if (isCustom) {
            this._service.addCustomHeader(this.httpResponseHeaders, this.customHeaders[index])
                .then(function (header) {
                _this.setHeader(index, header, isCustom);
            })
                .catch(function (e) {
                _this.initialize();
            });
        }
        else {
            this._service.addRedirectHeader(this.httpResponseHeaders, this.redirectHeaders[index])
                .then(function (header) {
                _this.setHeader(index, header, isCustom);
            })
                .catch(function (e) {
                _this.initialize();
            });
        }
    };
    HttpResponseHeadersComponent.prototype.initialize = function () {
        var _this = this;
        this._service.get(this.id)
            .then(function (s) {
            _this.setFeature(s.feature);
            _this.customHeaders = s.customHeaders;
            _this.originalCustomHeaders = JSON.parse(JSON.stringify(s.customHeaders));
            _this.redirectHeaders = s.redirectHeaders;
            _this.originalRedirectHeaders = JSON.parse(JSON.stringify(s.redirectHeaders));
        })
            .catch(function (e) {
            _this._error = e;
        });
    };
    HttpResponseHeadersComponent.prototype.setFeature = function (feature) {
        this.httpResponseHeaders = feature;
        this._original = JSON.parse(JSON.stringify(feature));
        this._locked = this.httpResponseHeaders.metadata.is_locked ? true : null;
    };
    HttpResponseHeadersComponent.prototype.setHeader = function (index, header, isCustom) {
        if (isCustom) {
            this.customHeaders[index] = header;
            this.originalCustomHeaders[index] = JSON.parse(JSON.stringify(header));
        }
        else {
            this.redirectHeaders[index] = header;
            this.originalRedirectHeaders[index] = JSON.parse(JSON.stringify(header));
        }
    };
    HttpResponseHeadersComponent = __decorate([
        core_1.Component({
            template: "\n        <loading *ngIf=\"!(httpResponseHeaders || _error)\"></loading>\n        <error [error]=\"_error\"></error>\n        <div *ngIf=\"httpResponseHeaders\">\n            <override-mode class=\"pull-right\" [metadata]=\"httpResponseHeaders.metadata\" (revert)=\"onRevert()\" (modelChanged)=\"onModelChanged()\"></override-mode>\n            <fieldset>\n                <label>Keep Alive</label>\n                <switch class=\"block\" [disabled]=\"_locked\" [(model)]=\"httpResponseHeaders.allow_keep_alive\" (modelChanged)=\"onModelChanged()\">{{httpResponseHeaders.allow_keep_alive ? \"On\" : \"Off\"}}</switch>\n            </fieldset>\n            <tabs>\n                <tab [name]=\"'Custom Headers'\">\n                    <custom-headers [model]=\"httpResponseHeaders\" [headers]=\"customHeaders\" [originalHeaders]=\"originalCustomHeaders\"\n                                    (add)=\"addHeader($event, true)\" (delete)=\"deleteHeader($event)\" (save)=\"saveHeaderChanges($event, true)\" [locked]=\"_locked\"></custom-headers> \n                </tab>\n                <tab [name]=\"'Redirect Headers'\">\n                    <redirect-headers [model]=\"httpResponseHeaders\" [headers]=\"redirectHeaders\" [originalHeaders]=\"originalRedirectHeaders\"\n                                    (add)=\"addHeader($event, false)\" (delete)=\"deleteHeader($event)\" (save)=\"saveHeaderChanges($event, false)\" [locked]=\"_locked\"></redirect-headers> \n                </tab>\n            </tabs>\n        </div>\n    ",
            styles: ["\n        fieldset:first-of-type {\n            padding-top: 0;\n            margin-bottom: 30px;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [http_response_headers_service_1.HttpResponseHeadersService,
            notification_service_1.NotificationService])
    ], HttpResponseHeadersComponent);
    return HttpResponseHeadersComponent;
}());
exports.HttpResponseHeadersComponent = HttpResponseHeadersComponent;
//# sourceMappingURL=http-response-headers.component.js.map