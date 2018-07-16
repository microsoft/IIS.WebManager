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
var http_1 = require("@angular/http");
require("rxjs/add/operator/toPromise");
var api_connection_1 = require("../connect/api-connection");
var httpconnection_1 = require("../connect/httpconnection");
var connect_service_1 = require("../connect/connect.service");
var GetComponent = /** @class */ (function () {
    function GetComponent(_http, _service, _router) {
        var _this = this;
        this._http = _http;
        this._service = _service;
        this._router = _router;
        this.DOWNLOAD_URL = SETTINGS.api_download_url;
        this.SETUP_VERSION = SETTINGS.api_setup_version;
        this._subscriptions = [];
        this._client = new httpconnection_1.HttpConnection(_http);
        this._subscriptions.push(this._service.active.subscribe(function (connection) { return _this._activeConnection = connection; }));
    }
    GetComponent_1 = GetComponent;
    GetComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    GetComponent.prototype.download = function (e) {
        if (this._activeConnection) {
            this._router.navigate(["/"]);
            return;
        }
        this._inProgress = true;
        this._status = GetComponent_1.STATUS_MSG[0];
        this.ping();
    };
    GetComponent.prototype.skip = function () {
        if (this._activeConnection) {
            this._router.navigate(["/"]);
            return;
        }
        this._status = GetComponent_1.STATUS_MSG[0];
        this.finish();
    };
    GetComponent.prototype.ping = function (i) {
        var _this = this;
        if (i === void 0) { i = 1; }
        if (i % 4 == 0) {
            var index = Math.floor(i / 4) - 1;
            this._status = GetComponent_1.STATUS_MSG[index % GetComponent_1.STATUS_MSG.length];
        }
        var conn = new api_connection_1.ApiConnection("localhost");
        this._client.get(conn, "/api").toPromise()
            .catch(function (e) {
            if (e.status == 403) {
                // The Access Token isn't specified, it's OK
                _this.finish();
            }
            else {
                if (_this._inProgress) {
                    _this._pingTimeoutId = setTimeout(function () { return _this.ping(i + 1); }, 2000);
                }
            }
        });
    };
    GetComponent.prototype.finish = function () {
        clearTimeout(this._pingTimeoutId);
        this._inProgress = false;
        var conn = new api_connection_1.ApiConnection("");
        this._service.edit(conn);
    };
    GetComponent.STATUS_MSG = [
        'Checking on your progress',
        'Searching for Microsoft IIS Administration',
        'Just a moment',
        'It takes a bit longer',
        'Trying to establish connection'
    ];
    GetComponent = GetComponent_1 = __decorate([
        core_1.Component({
            template: "\n        <div class=\"center\">\n            <div *ngIf='!_inProgress'>\n                <h1>Hi there!</h1>\n                <p>\n                    Start managing your Microsoft IIS Server right here.\n                    <br/>\n                    <a href=\"https://blogs.iis.net/adminapi\">Learn More</a>\n                </p>\n                <p>\n                    <a class=\"bttn background-active\" [attr.href]=\"DOWNLOAD_URL\" (click)=\"download($event)\">\n                        Download Microsoft IIS Administration\n                    </a>\n                    <small class='block'>\n                        Version {{SETUP_VERSION}}\n                        <br/>\n                        For Windows and Windows Server (64-bit)\n                    </small>\n                </p>\n            </div>\n            <div *ngIf='_inProgress'>\n                <h1>Setting Up</h1>\n                <p>\n                    Please follow up the download and complete the installation.<br/><br/>\n                    Then we'll continue from here automatically.\n                </p>\n                <p><i class=\"fa fa-spinner fa-pulse fa-3x\"></i></p>\n                <p><small class='block color-active'>{{_status}}</small></p>\n            </div>\n            <div class=\"skip\">\n                <button class=\"bordered\" (click)=\"skip()\">Skip this</button>\n            </div>\n        </div>\n    ",
            styles: ["\n        .center {\n            text-align: center;\n        }\n\n        h1 {\n            margin-bottom: 50px;\n            font-size: 300%;\n        }\n\n        button {\n          width: 100px;  \n        }\n\n        p {\n            padding-top: 20px;\n            padding-bottom: 20px;\n        }\n\n        small {\n            padding-top: 5px;\n        }\n\n        .bttn {\n            padding-top: 8px;\n            padding-bottom: 8px;\n        }\n\n        .collapse-heading {\n            border: none;\n        }\n\n        h2 {\n            font-size: 16px;\n        }\n\n        .skip {\n            margin-top: 50px;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [http_1.Http,
            connect_service_1.ConnectService,
            router_1.Router])
    ], GetComponent);
    return GetComponent;
    var GetComponent_1;
}());
exports.GetComponent = GetComponent;
//# sourceMappingURL=get.component.js.map