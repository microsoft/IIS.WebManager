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
var selector_1 = require("../../../common/selector");
var url_rewrite_service_1 = require("../service/url-rewrite.service");
var url_rewrite_1 = require("../url-rewrite");
var InboundRulesComponent = /** @class */ (function () {
    function InboundRulesComponent(_service) {
        var _this = this;
        this._service = _service;
        this._rules = [];
        this._subscriptions = [];
        this._subscriptions.push(this._service.inboundSettings.subscribe(function (settings) { return _this._settings = settings; }));
        this._subscriptions.push(this._service.inboundRules.subscribe(function (r) {
            _this._rules = r;
            _this.initializeNewRule();
        }));
        this.initializeNewRule();
    }
    InboundRulesComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    InboundRulesComponent.prototype.initializeNewRule = function () {
        var _this = this;
        this._newRule = new url_rewrite_1.InboundRule();
        this._newRule.name = "New Rule";
        var i = 1;
        while (this._rules.find(function (r) { return r.name.toLocaleLowerCase() == _this._newRule.name.toLocaleLowerCase(); })) {
            this._newRule.name = "New Rule " + i++;
        }
        this._newRule.pattern = "(.*)";
        this._newRule.pattern_syntax = url_rewrite_1.PatternSyntax.RegularExpression;
        this._newRule.ignore_case = true;
        this._newRule.negate = false;
        this._newRule.action.type = url_rewrite_1.ActionType.Rewrite;
        this._newRule.condition_match_constraints = url_rewrite_1.ConditionMatchConstraints.MatchAll;
        //
        // condition
        this._newRule.conditions = [];
        //
        // server variable
        this._newRule.server_variables = [];
        //
        // action
        this._newRule.action.url = "{R:1}";
        this._newRule.action.append_query_string = true;
        this._newRule.action.status_code = 403;
        this._newRule.action.sub_status_code = 0;
        this._newRule.action.reason = "Forbidden: Access is denied.";
        this._newRule.action.description = "You do not have permission to view this directory or page using the credentials that you supplied";
        this._newRule.response_cache_directive = undefined;
        //
        // Both properties added in Url Rewrite 2.1
        if (this._settings && this._settings.use_original_url_encoding !== undefined) {
            this._newRule.response_cache_directive = url_rewrite_1.ResponseCacheDirective.Auto;
        }
    };
    InboundRulesComponent.prototype.saveNew = function (condition) {
        var _this = this;
        this._service.addInboundRule(this._newRule)
            .then(function () { return _this._newRuleSelector.close(); });
    };
    InboundRulesComponent.prototype.onModelChanged = function () {
        this._service.saveInbound(this._settings);
    };
    InboundRulesComponent.prototype.onRevert = function () {
        this._service.revertInbound();
    };
    __decorate([
        core_1.ViewChild(selector_1.Selector),
        __metadata("design:type", selector_1.Selector)
    ], InboundRulesComponent.prototype, "_newRuleSelector", void 0);
    InboundRulesComponent = __decorate([
        core_1.Component({
            selector: 'inbound-rules',
            template: "\n        <error [error]=\"_service.inboundError\"></error>\n        <div *ngIf=\"!_service.inboundError && _settings\">\n            <override-mode class=\"pull-right\"\n                [metadata]=\"_settings.metadata\"\n                [scope]=\"_settings.scope\"\n                (revert)=\"onRevert()\" \n                (modelChanged)=\"onModelChanged()\"></override-mode>\n            <div>\n                <fieldset>\n                    <label>Original Url Encoding</label>\n                    <switch *ngIf=\"_settings.use_original_url_encoding !== undefined\" [(model)]=\"_settings.use_original_url_encoding\" (modelChanged)=\"onModelChanged()\">{{_settings.use_original_url_encoding ? \"Yes\" : \"No\"}}</switch>\n                </fieldset>\n                \n                <button class=\"create\" [class.background-active]=\"newRule.opened\" (click)=\"newRule.toggle()\">Create Rule <i class=\"fa fa-caret-down\"></i></button>\n                <selector #newRule class=\"container-fluid create\" (hide)=\"initializeNewRule()\">\n                    <inbound-rule-edit [rule]=\"_newRule\" (save)=\"saveNew($event)\" (cancel)=\"newRule.close()\"></inbound-rule-edit>\n                </selector>\n            </div>\n\n            <div>\n                <div class=\"container-fluid\">\n                    <div class=\"row hidden-xs border-active grid-list-header\">\n                        <label class=\"col-sm-3\">Name</label>\n                        <label class=\"visible-lg col-lg-2\">Action Type</label>\n                        <label class=\"col-sm-3 col-lg-2\">Url Pattern</label>\n                        <label class=\"col-sm-4\">Substitution Url</label>\n                    </div>\n                </div>\n\n                <ul class=\"grid-list container-fluid\">\n                    <li *ngFor=\"let rule of _rules; let i = index;\">\n                        <inbound-rule [rule]=\"rule\"></inbound-rule>\n                    </li>\n                </ul>\n            </div>\n        </div>\n    ",
            styles: ["\n        button.create {\n            margin: 30px 0 0 0;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [url_rewrite_service_1.UrlRewriteService])
    ], InboundRulesComponent);
    return InboundRulesComponent;
}());
exports.InboundRulesComponent = InboundRulesComponent;
//# sourceMappingURL=inbound-rules.component.js.map