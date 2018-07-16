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
var authorization_1 = require("./authorization");
var authorization_service_1 = require("./authorization.service");
var RuleEditComponent = /** @class */ (function () {
    function RuleEditComponent(_service) {
        this._service = _service;
        this.cancel = new core_1.EventEmitter();
        this.save = new core_1.EventEmitter();
        this._users = "";
        this._roles = "";
    }
    RuleEditComponent.prototype.ngOnInit = function () {
        this._allVerbs = (this.rule.verbs == "");
        this.setupTarget();
    };
    RuleEditComponent.prototype.isValid = function () {
        return (this._target == "*") ||
            (this._target == "?") ||
            (this._target == "users" && this._users != null && this._users != "") ||
            (this._target == "roles" && this._roles != null && this._roles != "");
    };
    RuleEditComponent.prototype.onOk = function () {
        switch (this._target) {
            case "*":
            case "?":
                this.rule.users = this._target;
                this.rule.roles = "";
                break;
            case "users":
                this.rule.roles = "";
                this.rule.users = this._users;
                break;
            case "roles":
                this.rule.users = "";
                this.rule.roles = this._roles;
                break;
            default:
                break;
        }
        if (this._allVerbs) {
            this.rule.verbs = "";
        }
        else if (this.rule.verbs == "") {
            this._allVerbs = true;
        }
        if (!this.isValid()) {
            return;
        }
        this.save.emit(this.rule);
    };
    RuleEditComponent.prototype.onDiscard = function () {
        this._users = null;
        this._roles = null;
        this.cancel.emit();
    };
    RuleEditComponent.prototype.setupTarget = function () {
        if (this.rule.users == "*" || this.rule.users == "?") {
            this._target = this.rule.users;
        }
        else if (this.rule.roles) {
            this._target = "roles";
            this._roles = this.rule.roles;
        }
        else {
            this._target = "users";
            this._users = this.rule.users;
        }
    };
    RuleEditComponent.prototype.targetName = function () {
        switch (this._target) {
            case "*":
                return "All";
            case "?":
                return "Anonymous";
            case "users":
                return this.rule.users;
            case "roles":
                return this.rule.roles;
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", authorization_1.AuthRule)
    ], RuleEditComponent.prototype, "rule", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], RuleEditComponent.prototype, "locked", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], RuleEditComponent.prototype, "cancel", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], RuleEditComponent.prototype, "save", void 0);
    RuleEditComponent = __decorate([
        core_1.Component({
            selector: 'edit-rule',
            template: "\n        <div>   \n            <fieldset>\n                <label class=\"inline-block\">Access Type</label>\n                <enum class=\"block\" [disabled]=\"locked\" [(model)]=\"rule.access_type\">\n                    <field name=\"Allow\" value=\"allow\"></field>\n                    <field name=\"Deny\" value=\"deny\"></field>\n                </enum>\n            </fieldset> \n            <fieldset>\n                <label>Users</label>\n                <enum [disabled]=\"locked\" [(model)]=\"_target\">\n                    <field name=\"All\" value=\"*\"></field>\n                    <field name=\"Anonymous\" value=\"?\"></field>\n                    <field name=\"Specific Users\" value=\"users\"></field>\n                    <field name=\"Roles or Groups\" value=\"roles\"></field>\n                </enum>\n            </fieldset>\n            <fieldset class=\"no-label\" *ngIf=\"_target == 'roles' || _target == 'users'\">   \n                <div *ngIf=\"_target == 'roles'\">\n                    <input placeholder=\"ex: Administrators, Power Users\" class=\"form-control name\" type=\"text\" [disabled]=\"locked\" [(ngModel)]=\"_roles\" />\n                </div>\n                <div *ngIf=\"_target == 'users'\">\n                    <input placeholder=\"ex: Administrator, Guest\" class=\"form-control name\" type=\"text\" [disabled]=\"locked\" [(ngModel)]=\"_users\" />\n                </div>\n            </fieldset>\n            <fieldset>\n                <label class=\"inline-block\">Use Specific HTTP Methods</label>\n                <tooltip>\n                    When turned on, the rule will only be applied to requests that use one of the listed HTTP methods.\n                </tooltip>\n                <switch class=\"block\" [model]=\"!_allVerbs\" (modelChange)=\"_allVerbs=!$event\">{{_allVerbs ? \"No\" : \"Yes\"}}</switch>\n            </fieldset>\n            <fieldset class=\"no-label\" *ngIf=\"!_allVerbs\">\n                <input placeholder=\"ex: GET, PUT, POST, DELETE\" class=\"form-control name\" type=\"text\" [disabled]=\"locked\" [(ngModel)]=\"rule.verbs\" />\n            </fieldset>\n            <p class=\"pull-right\">\n                <button [disabled]=\"!isValid()\" class=\"ok\" (click)=\"onOk()\">OK</button>\n                <button (click)=\"onDiscard()\" class=\"cancel\">Cancel</button>\n            </p>\n        </div>\n    ",
            styles: ["\n        .checkbox {\n            margin: 6px 0 0 0;\n        }\n\n        .fa-circle,\n        .fa-ban {\n            font-size: 20px;\n            margin-right: 10px;\n        }\n\n        .grid-item:not(.background-editing) fieldset {\n            padding-top: 5px;\n            padding-bottom: 0;\n        }\n\n        label.visible-xs {\n            margin-bottom: 5px;\n        }\n\n        .column-pad {\n            padding-left: 15px;\n        }\n\n        fieldset.no-label {\n            padding-top: 0;\n        }\n\n        p {\n            margin: 20px 0;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [authorization_service_1.AuthorizationService])
    ], RuleEditComponent);
    return RuleEditComponent;
}());
exports.RuleEditComponent = RuleEditComponent;
//# sourceMappingURL=rule-edit.component.js.map