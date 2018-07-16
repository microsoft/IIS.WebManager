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
var OutboundRulesComponent = /** @class */ (function () {
    function OutboundRulesComponent(_service) {
        var _this = this;
        this._service = _service;
        this._rules = [];
        this._subscriptions = [];
        this._subscriptions.push(this._service.outboundSettings.subscribe(function (settings) { return _this._settings = settings; }));
        this._subscriptions.push(this._service.outboundRules.subscribe(function (r) {
            _this._rules = r;
            _this.initializeNewRule();
        }));
        this.initializeNewRule();
    }
    OutboundRulesComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    OutboundRulesComponent.prototype.initializeNewRule = function () {
        var _this = this;
        this._newRule = new url_rewrite_1.OutboundRule();
        this._newRule.name = "New Rule";
        var i = 1;
        while (this._rules.find(function (r) { return r.name.toLocaleLowerCase() == _this._newRule.name.toLocaleLowerCase(); })) {
            this._newRule.name = "New Rule " + i++;
        }
        this._newRule.pattern = "(.*)";
        this._newRule.pattern_syntax = url_rewrite_1.PatternSyntax.RegularExpression;
        this._newRule.enabled = true;
        this._newRule.ignore_case = true;
        this._newRule.negate = false;
        this._newRule.condition_match_constraints = url_rewrite_1.ConditionMatchConstraints.MatchAll;
        //
        // condition
        this._newRule.conditions = [];
        //
        // action
        this._newRule.rewrite_value = "{R:1}";
        this._newRule.match_type = url_rewrite_1.OutboundMatchType.Response;
        this._newRule.server_variable = "";
        this._newRule.tag_filters = new url_rewrite_1.OutboundTags();
    };
    OutboundRulesComponent.prototype.saveNew = function () {
        var _this = this;
        this._service.addOutboundRule(this._newRule)
            .then(function () { return _this._newRuleSelector.close(); });
    };
    OutboundRulesComponent.prototype.onModelChanged = function () {
        this._service.saveOutbound(this._settings);
    };
    OutboundRulesComponent.prototype.onRevert = function () {
        this._service.revertOutbound();
    };
    __decorate([
        core_1.ViewChild(selector_1.Selector),
        __metadata("design:type", selector_1.Selector)
    ], OutboundRulesComponent.prototype, "_newRuleSelector", void 0);
    OutboundRulesComponent = __decorate([
        core_1.Component({
            selector: 'outbound-rules',
            template: "\n        <error [error]=\"_service.outboundError\"></error>\n        <div *ngIf=\"!_service.outboundError && _settings\">\n            <override-mode class=\"pull-right\"\n                [metadata]=\"_settings.metadata\"\n                [scope]=\"_settings.scope\"\n                (revert)=\"onRevert()\" \n                (modelChanged)=\"onModelChanged()\"></override-mode>\n            <div>\n                <fieldset>\n                    <label>Rewrite Before Caching</label>\n                    <switch *ngIf=\"_settings.rewrite_before_cache !== undefined\" [(model)]=\"_settings.rewrite_before_cache\" (modelChanged)=\"onModelChanged()\">{{_settings.rewrite_before_cache ? \"On\" : \"Off\"}}</switch>\n                </fieldset>\n                \n                <button class=\"create\" [class.background-active]=\"newRule.opened\" (click)=\"newRule.toggle()\">Create Rule <i class=\"fa fa-caret-down\"></i></button>\n                <selector #newRule class=\"container-fluid create\" (hide)=\"initializeNewRule()\">\n                    <outbound-rule-edit [rule]=\"_newRule\" (save)=\"saveNew()\" (cancel)=\"newRule.close()\"></outbound-rule-edit>\n                </selector>\n            </div>\n\n            <div>\n                <div class=\"container-fluid\">\n                    <div class=\"row hidden-xs border-active grid-list-header\">\n                        <label class=\"col-sm-3\">Name</label>\n                        <label class=\"visible-lg col-lg-2\">Action Type</label>\n                        <label class=\"col-sm-3 col-lg-2\">Pattern</label>\n                        <label class=\"col-sm-4\">Substitution Value</label>\n                    </div>\n                </div>\n\n                <ul class=\"grid-list container-fluid\">\n                    <li *ngFor=\"let rule of _rules\">\n                        <outbound-rule [rule]=\"rule\"></outbound-rule>\n                    </li>\n                </ul>\n            </div>\n        </div>\n    ",
            styles: ["\n        button.create {\n            margin: 30px 0 0 0;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [url_rewrite_service_1.UrlRewriteService])
    ], OutboundRulesComponent);
    return OutboundRulesComponent;
}());
exports.OutboundRulesComponent = OutboundRulesComponent;
//# sourceMappingURL=outbound-rules.component.js.map