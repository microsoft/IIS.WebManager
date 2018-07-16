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
var constants_1 = require("./constants");
var connection_type_1 = require("./connection-type");
var connect_service_1 = require("./connect.service");
var api_connection_1 = require("./api-connection");
var ConnectComponent = /** @class */ (function () {
    function ConnectComponent(_service, _router) {
        var _this = this;
        this._service = _service;
        this._router = _router;
        this._conn = this.localConnection;
        this._advancedState = new api_connection_1.ApiConnection("");
        this._subs = [];
        this._connectionType = connection_type_1.ConnectionType.Simple;
        this._subs.push(this._service.editting.subscribe(function (c) {
            if (c) {
                _this.initializeConnection(c);
            }
        }));
        this._subs.push(this._service.connecting.subscribe(function (c) {
            if (c) {
                _this.initializeConnection(c);
            }
            _this._connecting = (c != null);
        }));
    }
    ConnectComponent.prototype.ngOnDestroy = function () {
        this._subs.forEach(function (s) { return s.unsubscribe(); });
        // Stop if still connecting
        if (this._connecting) {
            this._service.cancel();
        }
        //
        // Restore
        if (this._original) {
            for (var k in this._original)
                this._conn[k] = this._original[k];
        }
    };
    Object.defineProperty(ConnectComponent.prototype, "localConnection", {
        get: function () {
            var c = new api_connection_1.ApiConnection(constants_1.Constants.localUrl);
            c.displayName = constants_1.Constants.localDisplayName;
            return c;
        },
        enumerable: true,
        configurable: true
    });
    ConnectComponent.prototype.save = function () {
        var _this = this;
        this._service.save(this._conn);
        this._service.active.subscribe(function (c) {
            if (!c) {
                _this._service.connect(_this._conn);
            }
        }).unsubscribe();
        this._conn = new api_connection_1.ApiConnection("");
        this._original = null;
        this._router.navigate(["/"]);
    };
    ConnectComponent.prototype.connect = function () {
        var _this = this;
        if (!this._conn.url && this._urlField) {
            this._urlField.nativeElement.focus();
        }
        if (!this._conn.accessToken) {
            this._tokenField.nativeElement.focus();
        }
        if (!this.isValid) {
            return;
        }
        this._service.connect(this._conn).then(function (conn) {
            _this._service.save(_this._conn);
        });
    };
    ConnectComponent.prototype.cancel = function () {
        this._service.cancel();
        this._service.edit(this._conn);
    };
    ConnectComponent.prototype.tokenLink = function () {
        if (this._conn.url) {
            return this._conn.url + "/security/tokens";
        }
        return null;
    };
    ConnectComponent.prototype.connName = function () {
        return this._conn.displayName || this._conn.hostname();
    };
    ConnectComponent.prototype.setAccessToken = function (value) {
        this._conn.accessToken = value;
    };
    ConnectComponent.prototype.setUrl = function (url) {
        var _this = this;
        this._conn.url = "";
        setTimeout(function (_) {
            _this._conn.url = url;
        });
    };
    ConnectComponent.prototype.gotoAccessToken = function (evt) {
        evt.preventDefault();
        window.open(this.tokenLink());
    };
    ConnectComponent.prototype.onAdvanced = function () {
        this._connectionType = connection_type_1.ConnectionType.Advanced;
        if (this._advancedState.url || this._advancedState.displayName) {
            this._conn.url = this._advancedState.url;
            this._conn.displayName = this._advancedState.displayName;
            this._conn.accessToken = this._advancedState.accessToken;
        }
    };
    ConnectComponent.prototype.onSimple = function () {
        this._connectionType = connection_type_1.ConnectionType.Simple;
        this._advancedState.url = this._conn.url;
        this._advancedState.displayName = this._conn.displayName;
        this._advancedState.accessToken = this._conn.accessToken;
        this._conn.url = constants_1.Constants.localUrl;
        this._conn.displayName = constants_1.Constants.localDisplayName;
    };
    ConnectComponent.prototype.initializeConnection = function (connection) {
        this._conn = connection;
        this._original = api_connection_1.ApiConnection.clone(this._conn);
        this._advancedState = new api_connection_1.ApiConnection("");
        this._connecting = false;
        if (!connection.url) {
            this._disableSimple = false;
            this.onSimple();
        }
        else {
            this._disableSimple = true;
            this.onAdvanced();
        }
    };
    Object.defineProperty(ConnectComponent.prototype, "isValid", {
        get: function () {
            return !!this._conn.url && !!this._conn.accessToken;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        core_1.ViewChild('urlField'),
        __metadata("design:type", core_1.ElementRef)
    ], ConnectComponent.prototype, "_urlField", void 0);
    __decorate([
        core_1.ViewChild('tokenField'),
        __metadata("design:type", core_1.ElementRef)
    ], ConnectComponent.prototype, "_tokenField", void 0);
    ConnectComponent = __decorate([
        core_1.Component({
            template: "\n    <div class=\"center\">\n        <div *ngIf='!_connecting'>\n            <h1 [class.advanced]=\"_connectionType == 'advanced'\">Connect</h1>\n            <p *ngIf=\"_connectionType == 'simple'\">to Local Server</p>\n            <fieldset *ngIf=\"_connectionType == 'advanced'\">\n                <label class=\"inline-block\">Server Url</label>\n                <tooltip>\n                        The URL of the server to connect to. The default port for the IIS Administration API is 55539.\n                </tooltip>\n                <input type=\"text\" placeholder=\"ex. contoso.com\" class=\"form-control\" #urlField [ngModel]=\"_conn.url\" (ngModelChange)=\"setUrl($event)\" required throttle/>\n            </fieldset>\n            <fieldset *ngIf=\"_connectionType == 'advanced'\">\n                <label>Display Name</label>\n                <input type=\"text\" class=\"form-control\" [(ngModel)]=\"_conn.displayName\"/>\n            </fieldset>\n            <fieldset>\n                <label class=\"inline-block\">Access Token</label>\n                <tooltip>\n                    An access token is an auto generated value that is used to connect to the IIS Administration API. Only Administrators can create these tokens. <a class=\"link\" title=\"More Information\" href=\"https://docs.microsoft.com/en-us/IIS-Administration/management-portal/connecting#acquiring-an-access-token\"></a>\n                </tooltip>\n                <input type=\"text\" autocomplete=\"off\" #tokenField\n                    class=\"form-control\"\n                    [ngModel]=\"''\"\n                    (ngModelChange)=\"setAccessToken($event)\"\n                    [attr.placeholder]=\"!_conn.accessToken ? null : '******************************'\" \n                    [attr.required]=\"!_conn.accessToken || null\"/>\n            </fieldset>\n            <p class=\"tokenLink\">Don't have an access token? <a [attr.disabled]=\"!tokenLink() ? true : null\" (click)=\"gotoAccessToken($event)\" [attr.href]=\"tokenLink()\">Get access token</a></p>\n            <fieldset class=\"rememberMe\">\n                <checkbox2 [(model)]=\"_conn.persist\"><b>Keep me connected from now on</b></checkbox2>\n                <tooltip>\n                    Your Access Token and Connection will be stored locally.<br/>\n                    Use only if your device is trusted!\n                </tooltip>\n            </fieldset>\n            <fieldset>\n                <button class=\"active right\" (click)=\"connect()\">Connect</button>\n            </fieldset>\n\n            <div class=\"advanced\" *ngIf=\"_connectionType == 'simple'\">\n                <button (click)=\"onAdvanced()\">Remote Server or Manual Setup<i class=\"fa fa-arrow-right\"></i></button>\n            </div>\n            <div class=\"simple\" *ngIf=\"_connectionType == 'advanced' && !_disableSimple\">\n                <button (click)=\"onSimple()\">Local Server Setup<i class=\"fa fa-arrow-right\"></i></button>\n            </div>\n        </div>\n\n        <div class=\"in-progress\" *ngIf='_connecting'>\n            <h1>Connecting</h1>\n            to <a [attr.href]=\"_conn.url\">{{connName()}}</a>\n            <p><i class=\"fa fa-spinner fa-pulse fa-3x\"></i></p>\n            <button class=\"bordered\" (click)=\"cancel()\">Cancel</button>\n        </div>\n    </div>\n    <div class=\"get hidden-xs\" *ngIf='!_connecting'>\n        <a class=\"bttn bordered\" [routerLink]=\"['/get']\"><small>Get Microsoft IIS Administration</small></a>\n    </div>\n    ",
            styles: ["\n        h1.advanced,\n        h1 + p {\n            margin-bottom: 40px;\n        }\n\n        h1 + p {\n            display: block;\n            margin-left: 5px;\n        }\n\n        button {\n            margin-left: 5px;\n            margin-top: 20px;\n            width: 100px;\n        }\n\n        input,\n        button {\n            height: 40px;\n        }\n\n        fieldset {\n            margin-top: 10px;\n        }\n\n        .in-progress {\n            text-align: center;\n        }\n        \n        .in-progress > p {\n            margin-top: 40px;\n            margin-bottom: 40px;\n        }\n\n        .get {\n            text-align: right;\n            margin-top: 30px;\n        }\n\n        enum {\n            display: block;\n            position: fixed;\n            top: 70px;\n            left: 15px;\n        }\n\n        .advanced {\n            margin-top: 35px;\n        }\n\n        .advanced button,\n        .simple button {\n            height: 30px;\n            margin-top: 0;\n            width: 46px;\n            vertical-align: middle;\n            padding: 0;\n            font-size: 12px;\n            width: auto;\n            border: none;\n            padding-left: 8px;\n            padding-right: 8px;\n        }\n        \n        .advanced i,\n        .simple i {\n            margin-left: 5px;\n        }\n\n        .tokenLink {\n            float:right;\n            margin-top: -12px;\n        }\n\n        tooltip {\n            margin-left: 5px;\n        }\n\n        .rememberMe {\n            margin-top: 35px;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [connect_service_1.ConnectService, router_1.Router])
    ], ConnectComponent);
    return ConnectComponent;
}());
exports.ConnectComponent = ConnectComponent;
//# sourceMappingURL=connect.component.js.map