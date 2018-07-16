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
var forms_1 = require("@angular/forms");
var diff_1 = require("../../utils/diff");
var status_1 = require("../../common/status");
var central_certificate_service_1 = require("./central-certificate.service");
var central_certificates_1 = require("./central-certificates");
var CentralCertificateComponent = /** @class */ (function () {
    function CentralCertificateComponent(_service) {
        this._service = _service;
        this._usePvkPass = true;
        this._identityPassword = null;
        this._identityPasswordConfirm = null;
        this._privateKeyPassword = null;
        this._privateKeyPasswordConfirm = null;
        this._subscriptions = [];
    }
    Object.defineProperty(CentralCertificateComponent.prototype, "canEnable", {
        get: function () {
            return !!this._configuration &&
                !!this._configuration.identity.username &&
                !!this._configuration.identity.password &&
                (!this._usePvkPass || !!this._privateKeyPassword);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CentralCertificateComponent.prototype, "canUpdate", {
        get: function () {
            var changes = diff_1.DiffUtil.diff(this._original, this._configuration);
            return !changes.identity || !!changes.identity.password;
        },
        enumerable: true,
        configurable: true
    });
    CentralCertificateComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._service.initialize(this.id);
        this._subscriptions.push(this._service.enabled.subscribe(function (enabled) {
            _this._enabled = enabled;
        }));
        this._subscriptions.push(this._service.configuration.subscribe(function (config) {
            _this.setFeature(config);
        }));
    };
    CentralCertificateComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    CentralCertificateComponent.prototype.setFeature = function (config) {
        if (config) {
            config.identity.password = null;
            config.private_key_password = null;
        }
        this._configuration = config;
        this._original = JSON.parse(JSON.stringify(config));
    };
    CentralCertificateComponent.prototype.onModelChanged = function () {
        var _this = this;
        if ((!this._configuration.id && !this.canEnable) || !this.canUpdate) {
            return;
        }
        var changes = diff_1.DiffUtil.diff(this._original, this._configuration);
        if (Object.keys(changes).length > 0) {
            var action = this._configuration.id ? this._service.update(changes) : this._service.enable(changes);
            action.then(function (_) {
                _this.clearFormData();
            });
        }
    };
    CentralCertificateComponent.prototype.onConfirmIdentityPassword = function (identityPassword) {
        if (identityPassword === this._identityPassword) {
            this._configuration.identity.password = identityPassword;
            this.onModelChanged();
        }
        else {
            this.clearIdentityPassword();
        }
    };
    CentralCertificateComponent.prototype.onConfirmPkPassword = function (pkPassword) {
        if (pkPassword === this._privateKeyPassword) {
            this._configuration.private_key_password = pkPassword;
            this.onModelChanged();
        }
        else {
            this.clearPkPassword();
        }
    };
    CentralCertificateComponent.prototype.onEnabled = function (val) {
        if (!val) {
            if (this._configuration && this._configuration.id) {
                this._service.disable();
            }
            this.clearFormData();
            this._configuration = null;
        }
        else {
            this.setFeature(new central_certificates_1.CentralCertificateConfiguration());
        }
    };
    CentralCertificateComponent.prototype.onSelectPath = function (event) {
        if (event.length == 1) {
            this._configuration.path = event[0].physical_path;
            this.onModelChanged();
        }
    };
    CentralCertificateComponent.prototype.onPvkPassRequired = function (val) {
        if (!val) {
            this._privateKeyPassword = null;
            this.clearPkPassword();
            this.onModelChanged();
        }
    };
    CentralCertificateComponent.prototype.clearIdentityPassword = function (f) {
        if (f === void 0) { f = null; }
        this._configuration.identity.password = null;
    };
    CentralCertificateComponent.prototype.clearPkPassword = function () {
        this._configuration.private_key_password = null;
    };
    CentralCertificateComponent.prototype.clearFormData = function () {
        this._privateKeyPassword = null;
        this._privateKeyPasswordConfirm = null;
        this._identityPassword = null;
        this._identityPasswordConfirm = null;
    };
    Object.defineProperty(CentralCertificateComponent.prototype, "isPending", {
        get: function () {
            return this._service.status == status_1.Status.Starting
                || this._service.status == status_1.Status.Stopping;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        core_1.ViewChildren(forms_1.NgModel),
        __metadata("design:type", core_1.QueryList)
    ], CentralCertificateComponent.prototype, "_validators", void 0);
    CentralCertificateComponent = __decorate([
        core_1.Component({
            template: "\n        <fieldset>\n            <switch #s\n                [model]=\"_enabled\"\n                (modelChange)=\"onEnabled($event)\"\n                [disabled]=\"_service.status == 'starting' || _service.status == 'stopping'\">\n                    <span *ngIf=\"!isPending\">{{s.model ? \"On\" : \"Off\"}}</span>\n                    <span *ngIf=\"isPending\" class=\"loading\"></span>\n            </switch>\n        </fieldset>\n        <div *ngIf=\"_configuration\">\n            <fieldset class=\"path\">\n                <label>Physical Path</label>\n                <button title=\"Select Folder\" [class.background-active]=\"fileSelector.isOpen()\" class=\"right select\" (click)=\"fileSelector.toggle()\" [attr.disabled]=\"isPending || null\" ></button>\n                <div class=\"fill\">\n                    <input type=\"text\" class=\"form-control\" [(ngModel)]=\"_configuration.path\" (modelChanged)=\"onModelChanged()\" throttle required [attr.disabled]=\"isPending || null\" />\n                </div>\n                <server-file-selector #fileSelector (selected)=\"onSelectPath($event)\" [defaultPath]=\"_configuration.path\" [types]=\"['directory']\"></server-file-selector>\n            </fieldset>\n            <label class=\"block\">Connection Credentials</label>\n            <div class=\"in\">\n                <fieldset>\n                    <label>Username</label>\n                    <input type=\"text\" class=\"form-control name\" [(ngModel)]=\"_configuration.identity.username\" required (modelChanged)=\"onModelChanged()\" throttle [attr.disabled]=\"isPending || null\" />\n                </fieldset>\n                <fieldset>\n                    <label>Password</label>\n                    <input type=\"password\" class=\"form-control name\" #identityPassword [(ngModel)]=\"_identityPassword\" \n                        [attr.required]=\"!_configuration.id ? true : null\" (modelChanged)=\"clearIdentityPassword(f)\" \n                        [attr.placeholder]=\"_configuration.id ? '*************' : null\" throttle \n                        [attr.disabled]=\"isPending || null\" />\n                </fieldset>\n                <fieldset *ngIf=\"identityPassword.value\">\n                    <label>Confirm Password</label>\n                    <input type=\"password\" class=\"form-control name\" [(ngModel)]=\"_identityPasswordConfirm\" (ngModelChange)=\"onConfirmIdentityPassword($event)\" [validateEqual]=\"_identityPassword\" throttle [attr.disabled]=\"isPending || null\" />\n                </fieldset>\n            </div>\n            <div>\n                <label class=\"block\" title=\"Specify the password that is used to encrypt the private key for each certificate file.\">Use Private Key Password</label>\n                <switch style=\"display:inline-block;margin-bottom:5px;\" [(model)]=\"_usePvkPass\" (modelChange)=\"onPvkPassRequired($event)\" [attr.disabled]=\"isPending || null\" ></switch>\n            </div>\n            <div class=\"in\" *ngIf=\"_usePvkPass\">\n                <fieldset>\n                    <label>Password</label>\n                    <input type=\"password\" class=\"form-control name\" #pvkPass [(ngModel)]=\"_privateKeyPassword\" (modelChanged)=\"clearPkPassword()\" [attr.required]=\"!_configuration.id ? true : null\" throttle \n                        [attr.disabled]=\"isPending || null\" />\n                </fieldset>\n                <fieldset *ngIf=\"pvkPass.value\">\n                    <label>Confirm Password</label>\n                    <input type=\"password\" class=\"form-control name\" [(ngModel)]=\"_privateKeyPasswordConfirm\" (ngModelChange)=\"onConfirmPkPassword($event)\" [validateEqual]=\"_privateKeyPassword\" throttle [attr.disabled]=\"isPending || null\" />\n                </fieldset>\n            </div>\n        </div>\n    ",
            styles: ["\n        .in {\n            padding-left: 30px;\n            padding-top: 15px;\n            padding-bottom: 15px;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [central_certificate_service_1.CentralCertificateService])
    ], CentralCertificateComponent);
    return CentralCertificateComponent;
}());
exports.CentralCertificateComponent = CentralCertificateComponent;
//# sourceMappingURL=central-certificate.component.js.map