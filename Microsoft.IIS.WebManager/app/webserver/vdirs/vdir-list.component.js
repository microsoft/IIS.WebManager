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
var vdir_1 = require("./vdir");
var vdirs_service_1 = require("./vdirs.service");
var notification_service_1 = require("../../notification/notification.service");
var site_1 = require("../websites/site");
var webapp_1 = require("../webapps/webapp");
var VdirListItem = /** @class */ (function () {
    function VdirListItem(_service) {
        this._service = _service;
        this._editable = true;
        this.edit = new core_1.EventEmitter();
        this.leave = new core_1.EventEmitter();
    }
    VdirListItem.prototype.ngOnInit = function () {
        this.resetOriginal(this.model);
        if (!this.model.id) {
            this._editing = true;
        }
    };
    VdirListItem.prototype.ngOnChanges = function (changes) {
        if (changes["model"]) {
            this.resetOriginal(this.model);
        }
    };
    VdirListItem.prototype.onSave = function () {
        var _this = this;
        var preExisting = !!this.model.id;
        if (preExisting) {
            this._service.update(this.model)
                .then(function (vdir) {
                _this.resetOriginal(vdir);
            });
        }
        else {
            //
            // Create new
            if (!this.isValid()) {
                return;
            }
            this._service.create(this.model);
        }
        this._editing = false;
        this.leave.emit(this.model);
    };
    VdirListItem.prototype.onEdit = function () {
        this._editing = true;
        this.edit.emit(this.model);
    };
    VdirListItem.prototype.onDelete = function () {
        if (confirm("Are you sure you would like to delete this virtual directory?\nPath: " + this.model.path.replace("/", "") + "?")) {
            this._service.delete(this.model);
        }
    };
    VdirListItem.prototype.onCancel = function () {
        if (this._editing) {
            this.discardChanges();
            this._editing = false;
        }
        this.leave.emit(this.model);
    };
    VdirListItem.prototype.onUseCustomIdentity = function (val) {
        if (val) {
            this.model.identity.username = this._original.identity.username;
        }
        else {
            this.model.identity.username = "";
            this.model.identity.password = "";
        }
    };
    VdirListItem.prototype.onConfirmPassword = function (value) {
        if (this._password == this._confirm) {
            this.model.identity.password = this._confirm;
        }
    };
    VdirListItem.prototype.discardChanges = function () {
        if (!this.model.id) {
            return;
        }
        var keys = Object.keys(this._original);
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            this.model[key] = JSON.parse(JSON.stringify(this._original[key] || null));
        }
    };
    VdirListItem.prototype.isValid = function () {
        return this.model.path
            && this.model.physical_path
            && (this._password === this._confirm);
    };
    VdirListItem.prototype.resetOriginal = function (vdir) {
        this._original = JSON.parse(JSON.stringify(vdir));
    };
    VdirListItem.prototype.getNavPath = function () {
        var appPath = this.model.webapp.path;
        if (appPath === "/") {
            appPath = "";
        }
        return appPath + this.model.path;
    };
    VdirListItem.prototype.onSelectPath = function (event) {
        if (event.length == 1) {
            this.model.physical_path = event[0].physical_path;
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", vdir_1.Vdir)
    ], VdirListItem.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], VdirListItem.prototype, "readonly", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], VdirListItem.prototype, "edit", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], VdirListItem.prototype, "leave", void 0);
    VdirListItem = __decorate([
        core_1.Component({
            selector: 'vdir',
            template: "\n        <div *ngIf=\"model\" class=\"row grid-item\" [class.background-editing]=\"_editing\">\n            <div class=\"actions\">\n                <button class=\"no-border no-editing\" title=\"Edit\" [class.inactive]=\"readonly\" (click)=\"onEdit()\">\n                    <i class=\"fa fa-pencil color-active\"></i>\n                </button>\n                <button [disabled]=\"!isValid()\" class=\"no-border editing\" title=\"Ok\" (click)=\"onSave()\">\n                    <i class=\"fa fa-check color-active\"></i>\n                </button>\n                <button class=\"no-border editing\" title=\"Cancel\" (click)=\"onCancel()\">\n                    <i class=\"fa fa-times red\"></i>\n                </button>\n                <button class=\"no-border\" *ngIf=\"model.id\" title=\"Delete\" [class.inactive]=\"readonly\" (click)=\"onDelete()\">\n                    <i class=\"fa fa-trash-o red\"></i>\n                </button>\n            </div>\n\n            <div *ngIf=\"!_editing\">\n                <div class=\"col-xs-8 col-sm-4 col-lg-3\" [class.v-align]=\"!model.identity.username\">\n                    <div class=\"name\">\n                        <span>{{model.path}}</span>\n                        <small>{{model.identity.username}}</small>\n                    </div>\n                </div>\n                <div class=\"col-xs-12 col-sm-4 v-align\">\n                    <span>{{model.physical_path}}</span>\n                </div>\n                <div *ngIf=\"model.website && model.webapp\" class='hidden-xs col-sm-2 col-md-3 col-lg-4 overflow-visible'>\n                    <div class=\"v-align hidden-xs\"></div>\n                    <navigator [model]=\"model.website.bindings\" [path]=\"getNavPath()\" [right]=\"true\"></navigator>\n                </div>\n            </div>\n\n            <div *ngIf=\"_editing\">                \n                <fieldset class=\"col-xs-8 col-sm-4 col-lg-3\">\n                    <label>Path</label>\n                    <input class=\"form-control\" type=\"text\" (ngModelChange)=\"model.path=$event\" [ngModel]=\"model.path\" throttle required />\n                </fieldset>\n                <fieldset class=\"col-xs-12 overflow\">\n                    <label class=\"block\">Physical Path</label>\n                    <button title=\"Select Folder\" [class.background-active]=\"fileSelector.isOpen()\" class=\"right select\" (click)=\"fileSelector.toggle()\"></button>\n                    <div class=\"fill\">\n                        <input type=\"text\" class=\"form-control block\" [(ngModel)]=\"model.physical_path\" throttle required />\n                    </div>\n                    <server-file-selector #fileSelector [types]=\"['directory']\" [defaultPath]=\"model.physical_path\" (selected)=\"onSelectPath($event)\"></server-file-selector>\n                </fieldset>\n                <div class=\"col-xs-12\">\n                    <fieldset>\n                        <label>Custom Identity</label>\n                        <switch class=\"block\" #customIdentity=\"switchVal\" [model]=\"model.identity.username\" (modelChange)=\"onUseCustomIdentity($event)\">{{model.identity.username ? \"On\" : \"Off\"}}</switch>\n                    </fieldset>\n                    <div *ngIf=\"customIdentity.model\">\n                        <div class=\"row\">\n                            <fieldset class=\"col-sm-4 col-xs-12\">\n                                <label>Username</label>\n                                <input class=\"form-control\" type=\"text\" [(ngModel)]=\"model.identity.username\" throttle />\n                                <span>{{model.username}}</span>\n                            </fieldset>\n                        </div>\n                        <div class=\"row\">\n                            <fieldset class=\"col-sm-4 col-xs-12\">\n                                <label>Password</label>\n                                <input class=\"form-control\" type=\"password\" [(ngModel)]=\"_password\" (modelChanged)=\"_confirm=''\"/>\n                            </fieldset>\n                            <fieldset *ngIf=\"!!_password\" class=\"col-sm-4 col-xs-12\">\n                                <label>Confirm Password</label>\n                                <input class=\"form-control\" type=\"password\" [(ngModel)]=\"_confirm\" (modelChanged)=\"onConfirmPassword\" [validateEqual]=\"_password\" />\n                            </fieldset>\n                        </div>\n                        <fieldset>\n                            <label>Logon Method</label>\n                            <enum [(model)]=\"model.identity.logon_method\">\n                                <field name=\"Clear Text\" value=\"network_cleartext\"></field>\n                                <field name=\"Network\" value=\"network\"></field>\n                                <field name=\"Interactive\" value=\"interactive\"></field>\n                                <field name=\"Batch\" value=\"batch\"></field>\n                            </enum>\n                        </fieldset>\n                    </div>\n                </div>\n            </div>\n        </div>\n    ",
            styles: ["\n        .grid-item:not(.background-editing) fieldset {\n            padding-top: 5px;\n            padding-bottom: 0;\n        }\n\n        .grid-item:not(.background-editing) [class*=\"col-\"] {\n            padding-left: 0;\n        }\n\n        >>> [hidden] {\n            display: none !important;\n        }\n\n        .name span:first-of-type {            \n            font-size: 16px;\n        }\n\n        .name small {\n            font-size: 12px;\n        }\n\n        div.h-align {\n            min-height: 1px;\n            display:inline-block;\n        }\n\n        .v-align {\n            padding-top: 5px;\n        }\n\n        .overflow {\n            overflow: visible !important;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [vdirs_service_1.VdirsService])
    ], VdirListItem);
    return VdirListItem;
}());
exports.VdirListItem = VdirListItem;
var VdirListComponent = /** @class */ (function () {
    function VdirListComponent(_service, _notificationService) {
        this._service = _service;
        this._notificationService = _notificationService;
        this._editing = null;
        this.sort("path");
    }
    VdirListComponent.prototype.ngOnInit = function () {
        this.activate();
    };
    VdirListComponent.prototype.activate = function () {
        var _this = this;
        if (this._vdirs) {
            return;
        }
        if (this.website) {
            //
            // Load by WebSite
            this._service.getBySite(this.website).then(function (_) {
                _this._service.vdirs.subscribe(function (vdirs) {
                    _this._vdirs = [];
                    vdirs.forEach(function (v) {
                        if (v.website.id == _this.website.id
                            && !_this.isRootVdir(v)
                            && !_this.isNonSiteVdir(v)) {
                            _this._vdirs.push(v);
                        }
                    });
                });
            });
        }
        if (this.webapp) {
            //
            // Load by WebApp
            this._service.getByApp(this.webapp).then(function (_) {
                _this._service.vdirs.subscribe(function (vdirs) {
                    _this._vdirs = [];
                    vdirs.forEach(function (v) {
                        if (v.webapp.id == _this.webapp.id && v.path != '/') {
                            _this._vdirs.push(v);
                        }
                    });
                });
            });
        }
    };
    VdirListComponent.prototype.onEdit = function (vdir) {
        this._editing = vdir;
    };
    VdirListComponent.prototype.onLeave = function () {
        this._new = null;
        this._editing = null;
    };
    VdirListComponent.prototype.isRootVdir = function (vdir) {
        return vdir.path === "/";
    };
    VdirListComponent.prototype.isNonSiteVdir = function (vdir) {
        return vdir.webapp.path !== "/";
    };
    VdirListComponent.prototype.onCreate = function () {
        if (this._new) {
            return;
        }
        var newVdir = new vdir_1.Vdir();
        newVdir.physical_path = "";
        newVdir.path = "";
        newVdir.identity = {
            username: "",
            logon_method: vdir_1.LogonMethod.NetworkCleartext,
            password: ""
        };
        if (this.website) {
            newVdir.website = this.website;
        }
        else {
            newVdir.webapp = this.webapp;
        }
        this._new = newVdir;
        this._editing = this._new;
    };
    VdirListComponent.prototype.sort = function (field) {
        this._orderByAsc = (field == this._orderBy) ? !this._orderByAsc : true;
        this._orderBy = field;
    };
    VdirListComponent.prototype.sortStyle = function (field) {
        if (this._orderBy == field) {
            return {
                "orderby": true,
                "desc": !this._orderByAsc
            };
        }
        return {};
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", site_1.WebSite)
    ], VdirListComponent.prototype, "website", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", webapp_1.WebApp)
    ], VdirListComponent.prototype, "webapp", void 0);
    __decorate([
        core_1.ViewChildren(VdirListItem),
        __metadata("design:type", core_1.QueryList)
    ], VdirListComponent.prototype, "vdirItems", void 0);
    VdirListComponent = __decorate([
        core_1.Component({
            selector: 'vdir-list',
            template: "\n        <button class=\"create\" (click)=\"onCreate()\"><i class=\"fa fa-plus color-active\"></i><span>Create Virtual Directory</span></button>\n        <div class=\"container-fluid\" [hidden]=\"!_vdirs || _vdirs.length < 1\">\n            <div class=\"row hidden-xs border-active grid-list-header\">\n                <label class=\"col-sm-4 col-lg-3\" [ngClass]=\"sortStyle('path')\" (click)=\"sort('path')\">Path</label>\n                <label class=\"col-sm-4 col-md-7\" [ngClass]=\"sortStyle('physical_path')\" (click)=\"sort('physical_path')\">Physical Path</label>\n            </div>\n        </div>\n        <ul class=\"grid-list container-fluid\" *ngIf=\"_vdirs\">\n            <li *ngIf=\"_new\">\n                <vdir [model]=\"_new\" (leave)=\"onLeave()\"></vdir>\n            </li>\n            <li *ngFor=\"let vdir of _vdirs | orderby: _orderBy: _orderByAsc; let i = index;\">\n                <vdir [model]=\"vdir\" \n                      [readonly]=\"_editing && _editing != vdir\"\n                      (edit)=\"onEdit($event)\"\n                      (leave)=\"onLeave()\"></vdir>\n            </li>\n        </ul>\n    ",
            styles: ["\n        [class*=\"col-\"] {\n            padding-left: 0;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [vdirs_service_1.VdirsService,
            notification_service_1.NotificationService])
    ], VdirListComponent);
    return VdirListComponent;
}());
exports.VdirListComponent = VdirListComponent;
//# sourceMappingURL=vdir-list.component.js.map