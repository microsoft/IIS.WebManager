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
var url_rewrite_1 = require("../url-rewrite");
var OutboundRuleSettingsComponent = /** @class */ (function () {
    function OutboundRuleSettingsComponent() {
        this._result = "";
        this._testUrl = "";
        this._matches = [];
        this._selected = -1;
        this._serverVariables = url_rewrite_1.IIS_SERVER_VARIABLES;
    }
    OutboundRuleSettingsComponent.prototype.testRegex = function () {
        this.reset();
        if (!this.rule.pattern || !this._testUrl) {
            return;
        }
        var regex;
        try {
            var ignoreCase = +this.rule.ignore_case ? 'i' : '';
            regex = new RegExp(this.rule.pattern, 'g' + ignoreCase);
        }
        catch (e) {
            this._matches = [];
            return;
        }
        this._matches = regex.exec(this._testUrl) || [];
        this._isMatching = (this._matches.length > 0 && !this.rule.negate) ||
            (this._matches.length == 0 && this.rule.negate);
        if (this.rule.negate) {
            this._matches.splice(0, this._matches.length);
        }
        var result = this.rule.rewrite_value || "";
        for (var i = 0; i < this._matches.length; i++) {
            result = result.replace(new RegExp('{R:' + i + '}', 'g'), this._matches[i]);
        }
        this._result = result;
    };
    OutboundRuleSettingsComponent.prototype.reset = function () {
        this._result = "";
        this._selected = -1;
    };
    OutboundRuleSettingsComponent.prototype.addMatch = function (i) {
        if (!this.rule.rewrite_value) {
            this.rule.rewrite_value = "";
        }
        this.rule.rewrite_value += '{R:' + i + '}';
        this.testRegex();
    };
    OutboundRuleSettingsComponent.prototype.addVariable = function (i) {
        if (!this.rule.rewrite_value) {
            this.rule.rewrite_value = "";
        }
        this.rule.rewrite_value += '{' + this._serverVariables[i] + '}';
        this.testRegex();
    };
    OutboundRuleSettingsComponent.prototype.addSelected = function () {
        if (this._selected < this._matches.length) {
            this.addMatch(this._selected);
        }
        else {
            this.addVariable(this._selected - this._matches.length);
        }
    };
    OutboundRuleSettingsComponent.prototype.select = function (i) {
        this._selected = i;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", url_rewrite_1.OutboundRule)
    ], OutboundRuleSettingsComponent.prototype, "rule", void 0);
    OutboundRuleSettingsComponent = __decorate([
        core_1.Component({
            selector: 'outbound-rule-settings',
            template: "\n        <div class=\"row\" *ngIf=\"rule\">\n            <div class=\"col-xs-12 col-lg-6\">\n                <fieldset>\n                    <label>Name</label>\n                    <input type=\"text\" required class=\"form-control\" [(ngModel)]=\"rule.name\" />\n                </fieldset>\n                <fieldset>\n                    <div>\n                        <label class=\"inline-block\">Pattern</label>\n                        <tooltip>\n                            This pattern is compared to either the response body or a server variable to determine if the rule matches.\n                            <a href=\"https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/creating-outbound-rules-for-url-rewrite-module\" class=\"link\"></a>\n                        </tooltip>\n                        <text-toggle onText=\"Matches\" offText=\"Doesn't Match\" [on]=\"false\" [off]=\"true\" [(model)]=\"rule.negate\" (modelChanged)=\"testRegex()\"></text-toggle>\n                        <text-toggle onText=\"Case Insensitive\" offText=\"Case Sensitive\" [(model)]=\"rule.ignore_case\" (modelChanged)=\"testRegex()\"></text-toggle>\n                    </div>\n                    <input type=\"text\" required class=\"form-control\" [(ngModel)]=\"rule.pattern\" (modelChanged)=\"testRegex()\" />\n                </fieldset>\n                <fieldset>\n                    <label class=\"inline-block\">Test Value</label>\n                    <tooltip>\n                        This field can be used to test the matching behavior of the rule pattern.\n                    </tooltip>\n                    <input type=\"text\" class=\"form-control\" [(ngModel)]=\"_testUrl\" (modelChanged)=\"testRegex()\" />\n                </fieldset>\n                <fieldset>\n                    <div>\n                        <label>Substitution Value</label>\n                        <tooltip>\n                            This is the substitution string to use when rewriting the response. The substitution value can include back-references to conditions and the rule pattern as well as server variables.\n                            <a href=\"https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/creating-outbound-rules-for-url-rewrite-module\" class=\"link\"></a>\n                        </tooltip>\n                    </div>\n                    <button class=\"right input\" (click)=\"macros.toggle()\" [class.background-active]=\"(macros && macros.opened) || false\">Macros</button>\n                    <div class=\"fill\">\n                        <input type=\"text\" required [title]=\"_result\" class=\"form-control\" [(ngModel)]=\"rule.rewrite_value\" (modelChanged)=\"testRegex()\" />\n                    </div>\n                    <selector class=\"stretch\" #macros>\n                        <div class=\"table-scroll\">\n                            <table>\n                                <tr *ngFor=\"let match of _matches; let i = index;\" (dblclick)=\"addMatch(i)\" (click)=\"select(i)\" class=\"hover-editing\" [class.background-selected]=\"_selected == i\">\n                                    <td class=\"back-ref border-color\">{{ '{R:' + i + '}' }}</td>\n                                    <td class=\"border-color\">{{match}}</td>\n                                </tr>\n                                <tr *ngFor=\"let variable of _serverVariables; let i = index;\" (dblclick)=\"addVariable(i)\" (click)=\"select(i + _matches.length)\" class=\"hover-editing\" [class.background-selected]=\"_selected == (i + _matches.length)\">\n                                    <td class=\"back-ref border-color\">{{ '{' + variable + '}' }}</td>\n                                    <td class=\"border-color\"></td>\n                                </tr>\n                            </table>\n                        </div>\n                        <p class=\"pull-right\">\n                            <button [attr.disabled]=\"_selected == -1 || null\" (click)=\"addSelected()\">Insert</button>\n                        </p>\n                    </selector>\n                </fieldset>\n            </div>\n        </div>\n    ",
            styles: ["\n        table {\n            width: 100%;\n        }\n\n        .table-scroll {\n            max-height: 295px;\n            overflow-y: auto;\n        }\n\n        p {\n            margin: 10px;\n        }\n    \n        td {\n            border-style: solid;\n            border-width: 1px;\n            padding: 5px;\n            border-top: none;\n        }\n\n        .back-ref {\n            width: 200px;\n        }\n\n        text-toggle,\n        tooltip {\n            margin-right: 20px;\n        }\n    "]
        })
    ], OutboundRuleSettingsComponent);
    return OutboundRuleSettingsComponent;
}());
exports.OutboundRuleSettingsComponent = OutboundRuleSettingsComponent;
//# sourceMappingURL=outbound-rule-settings.js.map