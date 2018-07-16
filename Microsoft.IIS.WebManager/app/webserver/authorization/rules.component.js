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
var selector_1 = require("../../common/selector");
var notification_service_1 = require("../../notification/notification.service");
var authorization_service_1 = require("./authorization.service");
var authorization_1 = require("./authorization");
var RulesComponent = /** @class */ (function () {
    function RulesComponent(_service, _notificationService) {
        var _this = this;
        this._service = _service;
        this._notificationService = _notificationService;
        this._subscriptions = [];
        this._subscriptions.push(this._service.rules.subscribe(function (rules) { return _this._rules = rules; }));
        this.initializeNewRule();
    }
    RulesComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    RulesComponent.prototype.saveRule = function (rule) {
        this._service.saveRule(rule);
    };
    RulesComponent.prototype.initializeNewRule = function () {
        var newRule = new authorization_1.AuthRule();
        newRule.users = "*";
        newRule.roles = "";
        newRule.verbs = "";
        newRule.access_type = "deny";
        this._newRule = newRule;
    };
    RulesComponent.prototype.saveNew = function () {
        var _this = this;
        this._service.addRule(this._newRule)
            .then(function () { return _this._newRuleSelector.close(); });
    };
    __decorate([
        core_1.ViewChild(selector_1.Selector),
        __metadata("design:type", selector_1.Selector)
    ], RulesComponent.prototype, "_newRuleSelector", void 0);
    RulesComponent = __decorate([
        core_1.Component({
            selector: 'auth-rules',
            template: "\n        <div *ngIf=\"_rules\">\n\n            <button [disabled]=\"_locked\" [class.background-active]=\"newRule.opened\" (click)=\"newRule.toggle()\">Create Rule <i class=\"fa fa-caret-down\"></i></button>\n            <selector #newRule class=\"container-fluid create\" (hide)=\"initializeNewRule()\">\n                <edit-rule *ngIf=\"newRule.opened\" [rule]=\"_newRule\" (save)=\"saveNew($event)\" (cancel)=\"newRule.close()\"></edit-rule>\n            </selector>\n\n            <div class=\"container-fluid\">\n                <div class=\"row hidden-xs hidden-sm border-active grid-list-header\" [hidden]=\"_rules.length == 0\">\n                    <label class=\"col-md-2\">Access Type</label>\n                    <label class=\"col-md-4\">Users</label>\n                    <label class=\"col-sm-4\">Http Methods</label>\n                </div>\n            </div>\n            <ul class=\"grid-list container-fluid\">\n                <li *ngFor=\"let rule of _rules; let i = index;\">\n                    <rule [rule]=\"rule\" (modelChanged)=\"saveRule(rule)\" [locked]=\"_locked\"></rule>\n                </li>\n            </ul>\n        </div>\n    "
        }),
        __metadata("design:paramtypes", [authorization_service_1.AuthorizationService,
            notification_service_1.NotificationService])
    ], RulesComponent);
    return RulesComponent;
}());
exports.RulesComponent = RulesComponent;
//# sourceMappingURL=rules.component.js.map