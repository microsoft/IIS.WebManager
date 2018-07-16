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
var notification_service_1 = require("../../notification/notification.service");
var authorization_1 = require("./authorization");
var authorization_service_1 = require("./authorization.service");
var RuleComponent = /** @class */ (function () {
    function RuleComponent(_service, _notificationService) {
        this._service = _service;
        this._notificationService = _notificationService;
    }
    RuleComponent.prototype.ngOnChanges = function (changes) {
        if (changes["rule"]) {
            this._original = JSON.parse(JSON.stringify(changes["rule"].currentValue));
        }
    };
    RuleComponent.prototype.ngOnInit = function () {
        this._initializing = !("id" in this.rule) || (this.rule.id == "");
        this._editing = this._initializing;
        this._allVerbs = (this.rule.verbs == "");
    };
    RuleComponent.prototype.edit = function () {
        this._editing = true;
    };
    RuleComponent.prototype.delete = function () {
        var _this = this;
        this._notificationService.confirm("Delete Rule", "Are you sure you want to delete this authorization rule?")
            .then(function (confirmed) { return confirmed && _this._service.deleteRule(_this.rule); });
    };
    RuleComponent.prototype.save = function () {
        var _this = this;
        this._service.saveRule(this.rule)
            .then(function () { return _this._original = JSON.parse(JSON.stringify(_this.rule)); });
        this._editing = false;
    };
    RuleComponent.prototype.discard = function () {
        this.rule = JSON.parse(JSON.stringify(this._original));
        this._editing = false;
    };
    RuleComponent.prototype.targetName = function () {
        if (this.rule.users == "*") {
            return "All";
        }
        else if (this.rule.users == "?") {
            return "Anonymous";
        }
        else if (this.rule.roles) {
            return this.rule.roles;
        }
        else {
            return this.rule.users;
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", authorization_1.AuthRule)
    ], RuleComponent.prototype, "rule", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], RuleComponent.prototype, "locked", void 0);
    RuleComponent = __decorate([
        core_1.Component({
            selector: 'rule',
            template: "\n        <div *ngIf=\"rule\" class=\"row grid-item\" [class.background-selected]=\"_editing\" (dblclick)=\"edit()\">\n            <div class=\"actions\">\n                <div class=\"action-selector\">\n                    <button title=\"More\" (click)=\"selector.toggle()\" (dblclick)=\"$event.preventDefault()\" [class.background-active]=\"(selector && selector.opened) || _editing || false\">\n                        <i class=\"fa fa-ellipsis-h\"></i>\n                    </button>\n                    <selector #selector [right]=\"true\">\n                        <ul>\n                            <li><button #menuButton class=\"edit\" title=\"Edit\" [disabled]=\"locked\" (click)=\"edit()\">Edit</button></li>\n                            <li><button #menuButton class=\"delete\" title=\"Delete\" [disabled]=\"locked\" (click)=\"delete()\">Delete</button></li>\n                        </ul>\n                    </selector>\n                </div>\n            </div>\n            <fieldset class=\"col-xs-8 col-sm-8 col-md-2\">\n                <label class=\"visible-xs visible-sm\">Access Type</label>\n                <i class=\"fa fa-circle green hidden-xs hidden-sm\" *ngIf=\"rule.access_type == 'allow'\"></i>\n                <i class=\"fa fa-ban red hidden-xs hidden-sm\" *ngIf=\"rule.access_type == 'deny'\"></i>\n                <span class=\"capitalize\">{{rule.access_type}}</span>\n            </fieldset> \n            <fieldset class=\"col-xs-12 col-sm-12 col-md-4\">\n                <label class=\"visible-xs visible-sm\">Users</label>\n                <span>{{targetName()}}</span>\n            </fieldset>\n            <fieldset class=\"col-xs-12 col-sm-12 col-md-4\">\n                <label class=\"visible-xs visible-sm\">Http Methods</label>\n                <span>{{_allVerbs ? \"All\" : rule.verbs}}</span>\n            </fieldset>\n        </div>\n        <selector #editSelector [opened]=\"true\" *ngIf=\"_editing\" class=\"container-fluid\" (hide)=\"discard()\">\n            <edit-rule [rule]=\"rule\" (save)=\"save($event)\" (cancel)=\"discard()\"></edit-rule>\n        </selector>\n    ",
            styles: ["\n        .checkbox {\n            margin: 6px 0 0 0;\n        }\n\n        .fa-circle,\n        .fa-ban {\n            font-size: 20px;\n            margin-right: 10px;\n        }\n\n        .grid-item:not(.background-editing) fieldset {\n            padding-top: 5px;\n            padding-bottom: 0;\n        }\n\n        label.visible-xs {\n            margin-bottom: 5px;\n        }\n\n        .column-pad {\n            padding-left: 15px;\n        }\n\n        fieldset.no-label {\n            padding-top: 0;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [authorization_service_1.AuthorizationService, notification_service_1.NotificationService])
    ], RuleComponent);
    return RuleComponent;
}());
exports.RuleComponent = RuleComponent;
//# sourceMappingURL=rule.component.js.map