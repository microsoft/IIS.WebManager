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
var ip_restrictions_service_1 = require("./ip-restrictions.service");
var diff_1 = require("../../utils/diff");
var ip_restrictions_1 = require("./ip-restrictions");
var RestrictionRuleComponent = /** @class */ (function () {
    function RestrictionRuleComponent(_service) {
        this._service = _service;
        this.edit = new core_1.EventEmitter();
        this.discard = new core_1.EventEmitter();
        this._editable = true;
        this._editing = false;
    }
    RestrictionRuleComponent.prototype.ngOnInit = function () {
        this._editing = !this.model.id;
    };
    RestrictionRuleComponent.prototype.ngOnChanges = function (changes) {
        if (changes["model"]) {
            this.setModel(changes["model"].currentValue);
        }
    };
    RestrictionRuleComponent.prototype.onSave = function () {
        var _this = this;
        this._editing = false;
        if (this.model.id) {
            var changes = diff_1.DiffUtil.diff(this._original, this.model);
            if (Object.keys(changes).length > 0) {
                this._service.updateRule(this.model, changes)
                    .then(function () { return _this.setModel(_this.model); });
            }
            this.discard.emit(null);
        }
        else {
            this._service.addRule(this.model);
            this.discard.emit(null);
        }
    };
    RestrictionRuleComponent.prototype.onEdit = function () {
        this._editing = true;
        this.edit.emit(null);
    };
    RestrictionRuleComponent.prototype.onDiscard = function () {
        this._editing = false;
        for (var _i = 0, _a = Object.keys(this._original); _i < _a.length; _i++) {
            var key = _a[_i];
            this.model[key] = JSON.parse(JSON.stringify(this._original[key] || null));
        }
        this.discard.emit(null);
    };
    RestrictionRuleComponent.prototype.onDelete = function () {
        if (confirm("Are you sure you want to delete this rule?\nIp Address: " + this.model.ip_address)) {
            this._service.deleteRule(this.model);
        }
    };
    RestrictionRuleComponent.prototype.setEditable = function (val) {
        this._editable = val;
    };
    RestrictionRuleComponent.prototype.isValid = function () {
        var valid = !!this._validators;
        if (this._validators) {
            this._validators.forEach(function (v) {
                if (!v.valid) {
                    valid = false;
                }
            });
        }
        return valid;
    };
    RestrictionRuleComponent.prototype.setModel = function (model) {
        this.model = model;
        this._original = JSON.parse(JSON.stringify(this.model));
    };
    RestrictionRuleComponent.prototype.onEnableSubnetMask = function (val) {
        this.model.subnet_mask = val ? "" : "255.255.255.255";
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", ip_restrictions_1.RestrictionRule)
    ], RestrictionRuleComponent.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], RestrictionRuleComponent.prototype, "enableDomainName", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], RestrictionRuleComponent.prototype, "edit", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], RestrictionRuleComponent.prototype, "discard", void 0);
    __decorate([
        core_1.ViewChildren(forms_1.NgModel),
        __metadata("design:type", core_1.QueryList)
    ], RestrictionRuleComponent.prototype, "_validators", void 0);
    RestrictionRuleComponent = __decorate([
        core_1.Component({
            selector: 'restriction-rule',
            template: "\n        <div class=\"row grid-item\" [class.background-editing]=\"_editing\">\n            <div class=\"actions\">\n                <button class=\"no-border\" title=\"Ok\" *ngIf=\"_editing\" [disabled]=\"!isValid() || null\" (click)=\"onSave()\">\n                    <i class=\"fa fa-check blue\"></i>\n                </button>\n                <button enabled class=\"no-border\" title=\"Cancel\" *ngIf=\"_editing\" (click)=\"onDiscard()\">\n                    <i class=\"fa fa-times red\"></i>\n                </button>\n                <button enabled class=\"no-border\" title=\"Edit\" [class.inactive]=\"!_editable\" *ngIf=\"!_editing\" (click)=\"onEdit()\">\n                    <i class=\"fa fa-pencil blue\"></i>\n                </button>\n                <button class=\"no-border\" *ngIf=\"model.id\" title=\"Delete\" [class.inactive]=\"!_editable || _editing\" (click)=\"onDelete()\">\n                    <i class=\"fa fa-trash-o red\"></i>\n                </button>\n            </div>\n            <div *ngIf=\"!_editing\">\n                <fieldset class=\"col-xs-8 col-md-2\">\n                    <label class=\"visible-xs visible-sm\">Status</label>\n                    <i class=\"fa fa-circle green hidden-xs hidden-sm\" *ngIf=\"model.allowed\"></i>\n                    <i class=\"fa fa-ban red hidden-xs hidden-sm\" *ngIf=\"!model.allowed\"></i>\n                    <span>{{model.allowed ? \"Allow\" : \"Deny\"}}</span>\n                </fieldset>\n                <fieldset class=\"col-xs-12 col-md-3\">\n                    <label class=\"visible-xs visible-sm\">IP Address</label>\n                    <span>{{model.ip_address}}</span>\n                </fieldset>\n                <fieldset class=\"col-xs-12 col-md-3\">\n                    <label class=\"visible-xs visible-sm\">Subnet Mask</label>\n                    <span>{{model.subnet_mask}}</span>\n                </fieldset>\n                <fieldset class=\"col-xs-12 col-md-2\" *ngIf=\"enableDomainName && model.domain_name != ''\">\n                    <label class=\"visible-xs visible-sm\">Domain Name</label>\n                    <span>{{model.domain_name}}</span>\n                </fieldset>\n            </div>\n            <div *ngIf=\"_editing\" class=\"col-left\">\n                <fieldset>\n                    <label>Status</label>\n                    <enum [model]=\"model.allowed\" (modelChange)=\"model.allowed=($event==='true')\">\n                        <field name=\"Allow\" value=\"true\"></field>\n                        <field name=\"Deny\" value=\"false\"></field>\n                    </enum>\n                </fieldset>\n                <fieldset>\n                    <label>IP Address</label>\n                    <input class=\"form-control name\" type=\"text\" placeholder=\"Example: 192.168.100.1\" [(ngModel)]=\"model.ip_address\" required pattern=\"^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$\" />\n                </fieldset>\n                <fieldset>\n                    <div class=\"inline-block\">\n                        <label class=\"block\">Restrict by Subnet Mask</label>\n                        <switch #s [model]=\"model.subnet_mask!='255.255.255.255'\" (modelChange)=\"onEnableSubnetMask($event)\">{{s.model ? \"Yes\" : \"No\"}}</switch>\n                    </div>\n                    <div class=\"inline-block no-label\" *ngIf=\"s.model\">\n                        <input class=\"form-control name\" placeholder=\"Example: 255.255.0.0\" type=\"text\" [(ngModel)]=\"model.subnet_mask\" required />\n                    </div>\n                </fieldset>\n                <fieldset *ngIf=\"enableDomainName\">\n                    <label>Domain Name</label>\n                    <input class=\"form-control name\" type=\"text\" [(ngModel)]=\"model.domain_name\" />\n                </fieldset>\n            </div>\n        </div>\n    ",
            styles: ["\n        .fa-circle,\n        .fa-ban {\n            font-size: 20px;\n            margin-right: 10px;\n            padding-left: 1px\n        }\n\n        .grid-item:not(.background-editing) fieldset {\n            padding-top: 5px;\n            padding-bottom: 0;\n        }\n        \n        .col-left {\n            padding-left: 15px;\n        }\n\n        .no-label {\n            vertical-align: bottom;\n        }\n\n        .no-label input {\n            margin-top: 15px;\n        }\n\n        div.inline-block {\n            margin-right:40px;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [ip_restrictions_service_1.IpRestrictionsService])
    ], RestrictionRuleComponent);
    return RestrictionRuleComponent;
}());
exports.RestrictionRuleComponent = RestrictionRuleComponent;
var RestrictionRulesComponent = /** @class */ (function () {
    function RestrictionRulesComponent(_service) {
        this._service = _service;
        this._subscriptions = [];
        this.modelChanged = new core_1.EventEmitter();
    }
    RestrictionRulesComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._subscriptions.push(this._service.rules.subscribe(function (rules) { return _this.setRules(rules); }));
        this._service.loadRules();
    };
    RestrictionRulesComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    RestrictionRulesComponent.prototype.onModelChanged = function () {
        this.modelChanged.emit();
    };
    RestrictionRulesComponent.prototype.createRule = function () {
        if (this._newRule) {
            return;
        }
        this._newRule = new ip_restrictions_1.RestrictionRule();
        this._newRule.ip_address = "";
        this._newRule.allowed = false;
        this._newRule.subnet_mask = "255.255.255.255";
        this.disableEditingExcept(-1); // New rule is not yet added to ruleComponents, therefore disable editing for all
    };
    RestrictionRulesComponent.prototype.onDiscardNew = function () {
        this._newRule = null;
        this.enableEditing();
    };
    RestrictionRulesComponent.prototype.edit = function (index) {
        this._editing = true;
        this.disableEditingExcept(index);
    };
    RestrictionRulesComponent.prototype.discard = function () {
        this._editing = false;
        this.enableEditing();
    };
    RestrictionRulesComponent.prototype.setRule = function (index, rule) {
        this.rules[index] = rule;
    };
    RestrictionRulesComponent.prototype.disableEditingExcept = function (index) {
        var arr = this._ruleComponents.toArray();
        for (var i = 0; i < arr.length; i++) {
            if (i !== index) {
                if (arr[i].model.id) {
                    arr[i].setEditable(false);
                }
            }
        }
    };
    RestrictionRulesComponent.prototype.enableEditing = function () {
        var arr = this._ruleComponents.toArray();
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].model.id) {
                arr[i].setEditable(true);
            }
        }
    };
    RestrictionRulesComponent.prototype.setRules = function (rules) {
        this.rules = rules;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", ip_restrictions_1.IpRestrictions)
    ], RestrictionRulesComponent.prototype, "ipRestrictions", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], RestrictionRulesComponent.prototype, "modelChanged", void 0);
    __decorate([
        core_1.ViewChildren(RestrictionRuleComponent),
        __metadata("design:type", core_1.QueryList)
    ], RestrictionRulesComponent.prototype, "_ruleComponents", void 0);
    RestrictionRulesComponent = __decorate([
        core_1.Component({
            selector: 'restriction-rules',
            template: "\n        <fieldset>\n            <label>Allow Unlisted</label>\n            <switch class=\"block\" [(model)]=\"ipRestrictions.allow_unlisted\" (modelChanged)=\"onModelChanged()\">{{ipRestrictions.allow_unlisted ? \"Yes\" : \"No\"}}</switch>\n        </fieldset>\n        <fieldset>\n            <button class=\"create\" (click)=\"createRule()\" [class.inactive]=\"_editing || _newRule\"><i class=\"fa fa-plus blue\"></i><span>Add</span></button>\n            <div class=\"container-fluid\">\n                <div class=\"row hidden-xs hidden-sm border-active grid-list-header\" [hidden]=\"rules.length == 0\">\n                    <label class=\"col-md-2\">Status</label>\n                    <label class=\"col-md-3\">IP Address</label>\n                    <label class=\"col-md-3\">Subnet Mask</label>\n                    <label class=\"col-md-2\" *ngIf=\"ipRestrictions.enable_reverse_dns\">Domain Name</label>\n                </div>\n            </div>\n            <ul class=\"grid-list container-fluid\">\n                <li *ngIf=\"_newRule\">\n                    <restriction-rule [model]=\"_newRule\"\n                                      [enableDomainName]=\"ipRestrictions.enable_reverse_dns\"\n                                      (discard)=\"onDiscardNew()\">\n                    </restriction-rule>\n                </li>\n                <li *ngFor=\"let rule of rules; let i = index;\">\n                    <restriction-rule [model]=\"rule\"\n                                      [enableDomainName]=\"ipRestrictions.enable_reverse_dns\" \n                                      (edit)=\"edit(i)\"\n                                      (discard)=\"discard()\">\n                    </restriction-rule>\n                </li>\n            </ul>\n        </fieldset>\n    ",
            styles: ["\n        li select,\n        li input {\n            display: inline;\n        }\n\n        .grid-list > li .actions {\n            z-index: 1;\n            position: absolute;\n            right: 0;\n        }\n        .grid-list > li.background-editing .actions {\n            top: 32px;\n        }\n\n        fieldset:first-of-type {\n            margin-bottom: 15px;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [ip_restrictions_service_1.IpRestrictionsService])
    ], RestrictionRulesComponent);
    return RestrictionRulesComponent;
}());
exports.RestrictionRulesComponent = RestrictionRulesComponent;
//# sourceMappingURL=restriction-rules.component.js.map