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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
require("rxjs/add/operator/first");
var webserver_service_1 = require("../webserver.service");
var primitives_1 = require("../../common/primitives");
var certificate_1 = require("../../certificates/certificate");
var certificates_service_1 = require("../../certificates/certificates.service");
var site_1 = require("./site");
var BindingItem = /** @class */ (function () {
    function BindingItem(_service, _webServerService) {
        this._service = _service;
        this._webServerService = _webServerService;
        this.modelChange = new core_1.EventEmitter();
        this.delete = new core_1.EventEmitter();
        this.editing = new core_1.EventEmitter();
        this.cancel = new core_1.EventEmitter();
    }
    BindingItem.prototype.ngOnInit = function () {
        var _this = this;
        this.setOriginal();
        this.getFullCert();
        this._webServerService.server
            .then(function (server) {
            if (server.supports_sni) {
                _this._supportsSni = true;
            }
        });
    };
    BindingItem.prototype.ngOnChanges = function (changes) {
        if (changes["model"]) {
            this.setOriginal();
        }
    };
    BindingItem.prototype.ipAddress = function () {
        if (this.isHttp()) {
            return this.model.ip_address == '*' ? 'Any' : this.model.ip_address;
        }
        return "";
    };
    BindingItem.prototype.hostname = function () {
        if (this.isHttp()) {
            return this.model.hostname == '' ? 'Any' : this.model.hostname;
        }
        return "";
    };
    BindingItem.prototype.isHttp = function () {
        return this.model.protocol.indexOf("http") === 0;
    };
    BindingItem.prototype.selectCert = function () {
        this._certSelect.first.toggle();
    };
    BindingItem.prototype.onCertSelected = function (cert) {
        if (cert) {
            this._certSelect.first.close();
            if (cert.store && cert.store.name == 'IIS Central Certificate Store') {
                this.model.require_sni = true;
                this.model.hostname = cert.alias.replace(/\.pfx$/g, '');
            }
            this.model.certificate = cert;
        }
        else {
            if (!this.model.certificate) {
                this.model.is_https = false;
            }
        }
    };
    BindingItem.prototype.onHttps = function () {
        var _this = this;
        if (this.model.is_https) {
            if (this.model.port === 80) {
                this.model.port = 443;
            }
            this.model.protocol = "https";
            if (!this.model.certificate) {
                this._certSelect.changes.first().subscribe(function (c) {
                    _this._certSelect.first.open();
                });
            }
        }
        else {
            this.model.protocol = "http";
            if (this.model.port === 443) {
                this.model.port = 80;
            }
        }
    };
    BindingItem.prototype.onCustomProtocol = function (val) {
        if (val) {
            this.model.protocol = "";
        }
        else {
            this.model.protocol = "http";
        }
    };
    BindingItem.prototype.onModelChanged = function () {
        if (!this.isValid()) {
            return;
        }
        this.setOriginal();
        this.modelChange.emit(this.model);
    };
    BindingItem.prototype.onCancel = function () {
        this.discardChanges();
        this.cancel.emit(this.model);
    };
    BindingItem.prototype.onDelete = function () {
        if (confirm("Are you sure you want to delete this binding?\nProtocol: " + this.model.protocol + "\nPort: " + this.model.port)) {
            this.edit = false;
            this.delete.emit(this.model);
        }
    };
    BindingItem.prototype.onEdit = function () {
        this.edit = true;
        this.editing.emit(this.model);
    };
    BindingItem.prototype.onSave = function () {
        if (!this.isValid()) {
            return;
        }
        if (this.isHttp()) {
            this.model.binding_information = null;
        }
        this.edit = false;
        this.model.isNew = false;
        this.onModelChanged();
    };
    BindingItem.prototype.isValid = function () {
        var b = this.model;
        if (!b.protocol) {
            return false;
        }
        var valid = true;
        if (b.protocol.indexOf("http") == 0) {
            valid = b.ip_address && !!b.port;
            if (b.protocol == "https") {
                valid = valid && !!b.certificate;
            }
        }
        else {
            valid = !!b.binding_information;
        }
        return valid;
    };
    BindingItem.prototype.setOriginal = function () {
        this._original = JSON.parse(JSON.stringify(this.model)); // Deep Clone
    };
    BindingItem.prototype.discardChanges = function () {
        var keys = Object.keys(this._original);
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            this.model[key] = JSON.parse(JSON.stringify(this._original[key]));
        }
    };
    BindingItem.prototype.allowed = function (action) {
        return this.allow.indexOf(action) >= 0;
    };
    BindingItem.prototype.isCertExpired = function () {
        return this.model.certificate && this.model.certificate.valid_to && (primitives_1.DateTime.UtcNow > new Date(this.model.certificate.valid_to));
    };
    BindingItem.prototype.certName = function () {
        if (!this.model.certificate) {
            return "";
        }
        var note = "";
        var validTo = new Date(this.model.certificate.valid_to);
        var days2Exp = primitives_1.DateTime.diff(primitives_1.DateTime.UtcNow, validTo, primitives_1.DateTimeUnit.Days);
        if (days2Exp < 0) {
            note = " (Expired)";
        }
        else if (days2Exp < 30) {
            note = " (Will Expire: " + validTo.toDateString() + ")";
        }
        var cert = this.model.certificate;
        var name = cert.name || cert.alias || cert.subject || cert.thumbprint;
        return name + note;
    };
    BindingItem.prototype.name = function () {
        return certificate_1.Certificate.displayName(this.model.certificate);
    };
    BindingItem.prototype.getFullCert = function () {
        var _this = this;
        if (!this.model.certificate || !this._service) {
            return;
        }
        this._service.get(this.model.certificate.id)
            .then(function (cert) {
            _this.model.certificate = cert;
            _this.setOriginal();
        });
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", site_1.Binding)
    ], BindingItem.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], BindingItem.prototype, "allow", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], BindingItem.prototype, "edit", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], BindingItem.prototype, "modelChange", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], BindingItem.prototype, "delete", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], BindingItem.prototype, "editing", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], BindingItem.prototype, "cancel", void 0);
    __decorate([
        core_1.ViewChildren('certSelect'),
        __metadata("design:type", core_1.QueryList)
    ], BindingItem.prototype, "_certSelect", void 0);
    __decorate([
        core_1.ViewChildren(forms_1.NgModel),
        __metadata("design:type", core_1.QueryList)
    ], BindingItem.prototype, "validators", void 0);
    BindingItem = __decorate([
        core_1.Component({
            selector: 'binding-item',
            template: "\n        <div class=\"row grid-item\" [class.background-editing]=\"edit\">\n            <div class=\"actions\">\n                <button title=\"Edit\" [disabled]=\"!allowed('edit')\" class='no-editing' (click)=\"onEdit()\">\n                    <i class=\"fa fa-pencil color-active\"></i>\n                </button>\n                <button title=\"Save\" [disabled]=\"!isValid()\" class=\"editing\" (click)=\"onSave()\">\n                    <i class=\"fa fa-check color-active\"></i>\n                </button>\n                <button title=\"Cancel\" class=\"editing\" (click)=\"onCancel()\">\n                    <i class=\"fa fa-times red\"></i>\n                </button>\n                <button title=\"Delete\" *ngIf=\"!model.isNew\" [disabled]=\"!allowed('delete')\" (click)=\"onDelete()\">\n                    <i class=\"fa fa-trash-o red\"></i>\n                </button>\n            </div>\n\n            <div class='valign' *ngIf=\"!edit\">\n                <div class=\"col-xs-8 col-md-1\">\n                    <label class=\"visible-xs visible-sm\">Protocol</label>\n                    <span class=\"inline-block\">{{model.protocol}}</span>\n                </div>\n                <div class=\"col-xs-8 col-md-3\" *ngIf=\"isHttp()\">\n                    <label class=\"visible-xs visible-sm\">Host Name</label>\n                    <span class=\"inline-block\">{{hostname()}}</span>\n                </div>\n                <div class=\"col-xs-12 col-md-3\" *ngIf=\"isHttp()\">\n                    <label class=\"visible-xs visible-sm\">IP Address</label>\n                    <span class=\"inline-block\">{{ipAddress()}}</span>\n                </div>\n                <div class=\"col-xs-12 col-md-1\" *ngIf=\"isHttp()\">\n                    <label class=\"visible-xs visible-sm\">Port</label>\n                    <span class=\"inline-block\">{{model.port}}</span>\n                </div>\n               \n                <div class=\"cert\">\n                    <div class=\"col-xs-12 col-md-3\" *ngIf=\"model.is_https || model.protocol == 'https'\">\n                        <label class=\"visible-xs visible-sm\">HTTPS</label>\n                        <span *ngIf=\"model.certificate\" [class.expired]=\"isCertExpired()\">\n                            <span class=\"name\" [title]=\"certName()\">{{certName()}}</span>\n                        </span>\n                    </div>\n                </div>\n            </div>\n\n\n            <div class=\"valign\" *ngIf=\"edit\">\n                <fieldset class=\"col-xs-8 col-md-4\" *ngIf=\"isHttp()\">\n                    <label>Host Name</label>\n                    <input class=\"form-control\" type=\"text\" [(ngModel)]=\"model.hostname\"/>\n                </fieldset>\n                <fieldset class=\"col-xs-12 col-sm-10 col-md-4\" *ngIf=\"isHttp()\">\n                    <label>IP Address</label>\n                    <input class=\"form-control\" type=\"text\" [(ngModel)]=\"model.ip_address\" required />\n                </fieldset>\n                <fieldset class=\"col-xs-12 col-sm-2\" *ngIf=\"isHttp()\">\n                    <label>Port</label>\n                    <input class=\"form-control\" type=\"number\" max=\"65535\" min=\"1\" [(ngModel)]=\"model.port\" required />\n                </fieldset>\n\n                <div class=\"col-xs-12 overflow-visible\" *ngIf=\"isHttp()\">   \n                    <fieldset class=\"inline-block\">\n                        <label>HTTPS</label>\n                        <switch class=\"block\" (modelChange)=\"model.is_https=$event\" [model]=\"model.is_https\" (modelChanged)=onHttps()>{{model.is_https ? \"On\" : \"Off\"}}</switch>\n                    </fieldset>\n                    <fieldset class=\"inline-block cert bottom\" *ngIf=\"model.is_https\">\n                        <button (click)=\"selectCert()\" class=\"background-normal select-cert\" [class.background-active]=\"!!_certSelect.first && _certSelect.first.opened\">\n                            <span>{{!model.certificate ? 'Select Certificate' : name()}}</span><i class=\"fa fa-caret-down\"></i>\n                        </button>\n                    </fieldset>\n                    <fieldset class=\"inline-block bottom\" *ngIf=\"model.is_https && _supportsSni\">\n                        <checkbox2 [(model)]=\"model.require_sni\">Require SNI</checkbox2>\n                    </fieldset>\n                    <div class=\"selector\" *ngIf=\"model.is_https\">\n                        <selector #certSelect [hidden]=\"!certSelect || !certSelect.isOpen()\" (hide)=\"onCertSelected()\" class=\"container-fluid\">\n                            <certificates-list #list (itemSelected)=\"onCertSelected($event)\"></certificates-list>\n                        </selector>\n                    </div> \n                    <fieldset class=\"certificate\" *ngIf=\"model.is_https && model.certificate\">\n                        <certificate-details [model]=\"model.certificate\"></certificate-details>\n                    </fieldset>\n                </div>\n                <div class=\"col-xs-8\">\n                    <fieldset class=\"inline-block\">\n                        <label>Custom Protocol</label>\n                        <switch class=\"block\" [model]=\"!isHttp()\" (modelChange)=\"onCustomProtocol($event)\">{{isHttp() ? \"Off\" : \"On\"}}</switch>\n                    </fieldset>\n                    <fieldset class=\"inline-block protocol\" *ngIf=\"!isHttp()\">\n                        <label>Protocol</label>\n                        <input class=\"form-control\" type=\"text\" [(ngModel)]=\"model.protocol\"/>\n                    </fieldset>\n                    <fieldset class=\"inline-block protocol\" *ngIf=\"!isHttp()\">\n                        <label>Binding Information</label>\n                        <input class=\"form-control\" type=\"text\" [(ngModel)]=\"model.binding_information\"/>\n                    </fieldset>\n                </div>\n            </div>\n        </div>\n    ",
            styles: ["\n        .grid-item > div {\n            padding-left: 0px;\n        }\n\n        .fa-lock {\n            padding-right: 5px;\n            font-size: 16px;\n        }\n\n        .selector {\n            display: flex;\n            margin-top: -12px;\n        }\n\n        .cert .name {\n            display: block;\n        }\n\n        .cert .name:before {\n            font-family: FontAwesome;\n            content: \"\\f023\";\n            padding-right: 5px;\n        }\n\n        .cert .expired .name:before {\n            content: \"\\f09c\";\n        }\n\n        .hostname {\n            max-width: 400px;\n            width: 100%;\n        }\n\n        .ip {\n            max-width: 640px;\n            width: 100%;\n        }\n\n        .ip-address {\n            max-width: 400px;\n            width: 100%;\n        }\n\n        .protocol {\n            max-width: 150px;\n            margin-right: 0px;\n        }\n\n        .cert span.inline-block {\n            vertical-align: text-bottom;\n        }\n\n        .bottom {\n            vertical-align: bottom;\n        }\n\n        .bottom checkbox2 {\n            vertical-align: super;\n        }\n\n        label.visible-xs.visible-sm:not(:first-child) {\n            color: green;\n        }\n\n        fieldset.certificate {\n            overflow: visible;\n        }\n\n        .select-cert {\n            max-width: 275px;\n            text-overflow: ellipsis;\n            overflow: hidden;\n            white-space: nowrap;\n        }\n\n        .select-cert span {\n            max-width: 240px;\n            overflow: hidden;\n            display: inline-block;\n            vertical-align: middle;\n        }\n    "]
        }),
        __param(0, core_1.Optional()),
        __param(1, core_1.Inject("WebServerService")),
        __metadata("design:paramtypes", [certificates_service_1.CertificatesService,
            webserver_service_1.WebServerService])
    ], BindingItem);
    return BindingItem;
}());
exports.BindingItem = BindingItem;
var BindingList = /** @class */ (function () {
    function BindingList() {
        this.modelChange = new core_1.EventEmitter();
        this._editing = -1;
    }
    BindingList.prototype.ngOnInit = function () {
        this.reset();
    };
    BindingList.prototype.isEditing = function () {
        return this._editing != -1;
    };
    BindingList.prototype.onModelChanged = function () {
        var _this = this;
        this.model = this.model.filter(function (b) {
            return _this.isBindingValid(b);
        });
        this.modelChange.emit(this.model);
        this.reset();
    };
    BindingList.prototype.add = function () {
        var _this = this;
        var b = new site_1.Binding();
        b.ip_address = "*";
        b.port = 80;
        b.hostname = "";
        b.is_https = false;
        b.protocol = "http";
        b.isNew = true;
        this.model.unshift(b);
        // Watch for binding to be added
        var len = this._items.length;
        var interval = setInterval(function (_) {
            if (_this._items.length > len) {
                _this._items.first.onEdit();
                clearInterval(interval);
            }
        }, 1);
    };
    BindingList.prototype.delete = function (index) {
        this.model.splice(index, 1);
        this._editing = -1;
        this.onModelChanged();
    };
    BindingList.prototype.onEdit = function (i) {
        this._editing = i;
    };
    BindingList.prototype.onCancel = function (i) {
        if (this.model.length > this._original.length) {
            this.model.splice(i, 1);
        }
        this._editing = -1;
    };
    BindingList.prototype.onSave = function (index) {
        this._editing = -1;
        this.onModelChanged();
    };
    BindingList.prototype.allow = function (i) {
        var actions = "save,cancel,";
        if (this.model.length > 1 && (i == this._editing || this._editing < 0)) {
            actions += "delete,";
        }
        if (this._editing < 0 || i == this._editing || this._editing >= this.model.length) {
            actions += "edit";
        }
        return actions;
    };
    BindingList.prototype.isBindingValid = function (b) {
        if (!b.protocol) {
            return false;
        }
        var valid = true;
        if (b.protocol.indexOf("http") == 0) {
            valid = b.ip_address && !!b.port;
            if (b.protocol == "https") {
                valid = valid && !!b.certificate;
            }
        }
        else {
            valid = !!b.binding_information;
        }
        return valid;
    };
    BindingList.prototype.reset = function () {
        this._original = JSON.parse(JSON.stringify(this.model)); // Deep Clone
        this._editing = -1;
    };
    BindingList.prototype.edit = function (i) {
        return this._editing == i;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], BindingList.prototype, "model", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], BindingList.prototype, "modelChange", void 0);
    __decorate([
        core_1.ViewChildren("item"),
        __metadata("design:type", core_1.QueryList)
    ], BindingList.prototype, "_items", void 0);
    BindingList = __decorate([
        core_1.Component({
            selector: 'binding-list',
            styles: ["\n    "],
            template: "\n        <button class=\"create\" [disabled]=\"_editing >= 0 && _editing < model.length\" (click)=\"add()\">\n            <i class=\"fa fa-plus color-active\"></i> Add\n        </button>\n        <div class=\"container-fluid\" [hidden]=\"!model || model.length < 1\">\n            <div class=\"row hidden-xs hidden-sm border-active grid-list-header\">\n                <label class=\"col-md-1\">Protocol</label>\n                <label class=\"col-md-3\">Host Name</label>\n                <label class=\"col-md-3\">IP Address</label>\n                <label class=\"col-md-2\">Port</label>\n            </div>\n            <ul class=\"grid-list\">\n                <li *ngFor=\"let b of model; let i = index;\">\n                    <binding-item #item [(model)]=\"model[i]\" [edit]=\"edit(i)\" (delete)=\"delete(i)\" (editing)=\"onEdit(i)\" (modelChange)=\"onSave(i)\" (cancel)=\"onCancel(i)\" [allow]=\"allow(i)\"></binding-item>\n                </li>\n            </ul>\n        </div>\n    "
        })
    ], BindingList);
    return BindingList;
}());
exports.BindingList = BindingList;
//# sourceMappingURL=binding-list.component.js.map