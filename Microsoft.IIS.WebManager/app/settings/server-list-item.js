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
var selector_1 = require("../common/selector");
var api_connection_1 = require("../connect/api-connection");
var connect_service_1 = require("../connect/connect.service");
var notification_service_1 = require("../notification/notification.service");
var ServerListItem = /** @class */ (function () {
    function ServerListItem(_svc, _notificationService) {
        var _this = this;
        this._svc = _svc;
        this._notificationService = _notificationService;
        this.leave = new core_1.EventEmitter();
        this._subscriptions = [];
        this._subscriptions.push(_svc.active.subscribe(function (con) {
            _this._active = con;
        }));
    }
    ServerListItem.prototype.ngOnInit = function () {
        if (!this.model.accessToken) {
            this._new = true;
            this.onEdit();
        }
    };
    ServerListItem.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    ServerListItem.prototype.prevent = function (e) {
        e.preventDefault();
    };
    ServerListItem.prototype.openSelector = function (e) {
        this._selector.toggle();
    };
    ServerListItem.prototype.onEdit = function () {
        if (this._selector) {
            this._selector.close();
        }
        this._original = this.model;
        this.model = api_connection_1.ApiConnection.clone(this.model);
        this._editing = true;
    };
    ServerListItem.prototype.onDblClick = function (e) {
        if (e.defaultPrevented) {
            return;
        }
        if (!this._editing) {
            this.onConnect();
        }
    };
    ServerListItem.prototype.onConnect = function (e) {
        if (e === void 0) { e = null; }
        if (e) {
            e.preventDefault();
        }
        this._svc.connect(this.model);
    };
    ServerListItem.prototype.onDelete = function () {
        var _this = this;
        this._notificationService.confirm("Delete Server", "Are you sure you want to delete this server? Name: " + this.model.displayName)
            .then(function (result) { return result && _this._svc.delete(_this.model); });
    };
    ServerListItem.prototype.onCancel = function () {
        this.discardChanges();
        this._editing = false;
        this.leave.next();
    };
    ServerListItem.prototype.onSave = function () {
        if (!this.model.displayName) {
            this.model.displayName = this.model.hostname();
        }
        this._svc.save(this.model);
        this._editing = false;
        this.model = this._original;
        this._original = null;
        this.leave.next();
    };
    ServerListItem.prototype.tokenLink = function () {
        if (this.model.url) {
            return this.model.url + "/security/tokens";
        }
        return null;
    };
    ServerListItem.prototype.connName = function () {
        return this.model.displayName || this.model.hostname();
    };
    ServerListItem.prototype.setAccessToken = function (value) {
        this.model.accessToken = value;
    };
    ServerListItem.prototype.setUrl = function (url) {
        var _this = this;
        this.model.url = "";
        if (this.model.displayName == 'Local IIS') {
            this.model.displayName = url;
        }
        setTimeout(function (_) {
            _this.model.url = url;
        });
    };
    ServerListItem.prototype.gotoAccessToken = function (evt) {
        evt.preventDefault();
        window.open(this.tokenLink());
    };
    Object.defineProperty(ServerListItem.prototype, "isValid", {
        get: function () {
            return !!this.model.url && !!this.model.accessToken;
        },
        enumerable: true,
        configurable: true
    });
    ServerListItem.prototype.discardChanges = function () {
        this.model = this._original;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", api_connection_1.ApiConnection)
    ], ServerListItem.prototype, "model", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ServerListItem.prototype, "leave", void 0);
    __decorate([
        core_1.ViewChild(selector_1.Selector),
        __metadata("design:type", selector_1.Selector)
    ], ServerListItem.prototype, "_selector", void 0);
    ServerListItem = __decorate([
        core_1.Component({
            selector: 'server',
            template: "\n        <div *ngIf=\"model\" class=\"grid-item row\" [class.background-editing]=\"_editing\" (dblclick)=\"onDblClick($event)\">\n            <div *ngIf=\"!_editing\" class=\"actions\">\n                <div class=\"selector-wrapper\">\n                    <button title=\"More\" (click)=\"openSelector($event)\" (dblclick)=\"prevent($event)\" [class.background-active]=\"(_selector && _selector.opened) || false\">\n                        <i class=\"fa fa-ellipsis-h\"></i>\n                    </button>\n                    <selector [right]=\"true\">\n                        <ul>\n                            <li><button class=\"go\" title=\"Connect\" (click)=\"onConnect()\">Connect</button></li>\n                            <li><button class=\"edit\" title=\"Edit\" (click)=\"onEdit()\">Edit</button></li>\n                            <li><button class=\"delete\" title=\"Delete\" (click)=\"onDelete()\">Delete</button></li>\n                        </ul>\n                    </selector>\n                </div>\n            </div>\n            <div class=\"actions\" *ngIf=\"_editing\">\n                <button class=\"no-border ok\" title=\"Ok\" [disabled]=\"!isValid || null\" (click)=\"onSave()\"></button>\n                <button class=\"no-border cancel\" title=\"Cancel\" (click)=\"onCancel()\"></button>\n            </div>\n            <div *ngIf=\"!_editing\">\n                <div class=\"col-xs-10 col-sm-4 v-align\">\n                    <a title=\"Connect\" href=\"#\" class=\"color-normal hover-color-active\" [class.active]=\"_active === model\" (click)=\"onConnect($event)\">{{connName()}}</a>\n                </div>     \n                <div class=\"hidden-xs col-sm-6 v-align\">\n                    {{model.url}}\n                </div>\n            </div>\n            <div *ngIf=\"_editing\" class=\"name\">\n                <fieldset>\n                    <label>Display Name</label>\n                    <input type=\"text\" class=\"form-control block\" [(ngModel)]=\"model.displayName\"/>\n                </fieldset>\n                <fieldset>\n                    <label class=\"inline-block\">Server Url</label>\n                    <tooltip>\n                            The URL of the server to connect to. The default port for the IIS Administration API is 55539.\n                    </tooltip>\n                    <input type=\"text\" placeholder=\"ex. contoso.com\" class=\"form-control block\" #urlField [ngModel]=\"model.url\" (ngModelChange)=\"setUrl($event)\" required throttle/>\n                </fieldset>\n                <fieldset>\n                    <label class=\"inline-block\">Access Token</label>\n                    <tooltip>\n                        An access token is an auto generated value that is used to connect to the IIS Administration API. Only Administrators can create these tokens. <a class=\"link\" title=\"More Information\" href=\"https://docs.microsoft.com/en-us/IIS-Administration/management-portal/connecting#acquiring-an-access-token\"></a>\n                    </tooltip>\n                    <input type=\"text\" autocomplete=\"off\" #tokenField\n                        class=\"form-control block\"\n                        [ngModel]=\"''\"\n                        (ngModelChange)=\"setAccessToken($event)\"\n                        [attr.placeholder]=\"!model.accessToken ? null : '******************************'\" \n                        [attr.required]=\"!model.accessToken || null\"/>\n                    <a class=\"right\" [attr.disabled]=\"!tokenLink() ? true : null\" (click)=\"gotoAccessToken($event)\" [attr.href]=\"tokenLink()\">Get access token</a>\n                </fieldset>\n                <fieldset>\n                    <checkbox2 [(model)]=\"model.persist\"><b>Remember this server</b></checkbox2>\n                    <tooltip>\n                        Your Access Token and Connection will be stored locally.<br/>\n                        Use only if your device is trusted!\n                    </tooltip>\n                </fieldset>\n            </div>\n        </div>\n    ",
            styles: ["\n        a {\n            display: inline;\n            background: transparent;\n        }\n\n        .row {\n            margin: 0px;\n        }\n\n        .v-align {\n            padding-top: 6px;\n        }\n\n        .selector-wrapper {\n            position: relative;\n        }\n\n        selector {\n            position:absolute;\n            right:0;\n            top: 32px;\n        }\n\n        selector button {\n            min-width: 125px;\n            width: 100%;\n        }\n        \n        .name {\n            padding: 0 15px;\n        }\n\n        tooltip {\n            margin-left: 5px;\n        }\n\n        a.active {\n            font-weight: bold;            \n        }\n    "]
        }),
        __metadata("design:paramtypes", [connect_service_1.ConnectService, notification_service_1.NotificationService])
    ], ServerListItem);
    return ServerListItem;
}());
exports.ServerListItem = ServerListItem;
//# sourceMappingURL=server-list-item.js.map