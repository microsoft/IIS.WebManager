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
var InboundRuleConditionsComponent = /** @class */ (function () {
    function InboundRuleConditionsComponent() {
    }
    InboundRuleConditionsComponent.prototype.add = function () {
        var con = new url_rewrite_1.Condition();
        con.ignore_case = true;
        con.match_type = url_rewrite_1.MatchType.Pattern;
        con.negate = false;
        con.input = "";
        con.pattern = "(.*)";
        this._newCondition = con;
    };
    InboundRuleConditionsComponent.prototype.saveNew = function (condition) {
        this.rule.conditions.push(condition);
        this._newCondition = null;
    };
    InboundRuleConditionsComponent.prototype.discardNew = function () {
        this._newCondition = null;
    };
    InboundRuleConditionsComponent.prototype.onDelete = function (index) {
        this.rule.conditions.splice(index, 1);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", url_rewrite_1.InboundRule)
    ], InboundRuleConditionsComponent.prototype, "rule", void 0);
    InboundRuleConditionsComponent = __decorate([
        core_1.Component({
            selector: 'inbound-rule-conditions',
            template: "\n        <div *ngIf=\"rule\">\n            <fieldset>\n                <label>Match</label>\n                <enum [(model)]=\"rule.condition_match_constraints\">\n                    <field name=\"All\" value=\"match_all\" title=\"All conditions must match for the rule to match\"></field>\n                    <field name=\"Any\" value=\"match_any\" title=\"Atleast one condition must match for the rule to match\"></field>\n                </enum>\n            </fieldset>\n            <fieldset>\n                <div>\n                    <label class=\"inline-block\">Keep All Back References</label>\n                    <tooltip>\n                        Specifies whether to keep back references for all matching conditions or only the last condition evaulated.\n                    </tooltip>\n                </div>\n                <switch [(model)]=\"rule.track_all_captures\">\n                    {{rule.track_all_captures ? 'Yes' : 'No'}}\n                </switch>\n            </fieldset>\n\n            <button (click)=\"add()\" class=\"create\"><span>Add Condition</span></button>\n            <div class=\"container-fluid\">\n                <div class=\"row hidden-xs border-active grid-list-header\">\n                    <label class=\"col-sm-3 col-lg-2\">Server Variable</label>\n                    <label class=\"col-sm-3 col-lg-2\">Match Type</label>\n                    <label class=\"col-sm-3\">Pattern</label>\n                </div>\n            </div>\n\n            <ul class=\"grid-list container-fluid\">\n                <li *ngIf=\"_newCondition\">\n                    <condition-edit [condition]=\"_newCondition\" (save)=\"saveNew($event)\" (cancel)=\"discardNew()\"></condition-edit>\n                </li>\n                <li *ngFor=\"let condition of rule.conditions; let i = index;\">\n                    <inbound-rule-condition [condition]=\"condition\" (delete)=\"onDelete(i)\"></inbound-rule-condition>\n                </li>\n            </ul>\n        </div>\n    ",
            styles: ["\n        .create {\n            margin-top: 50px;\n        }\n    "]
        })
    ], InboundRuleConditionsComponent);
    return InboundRuleConditionsComponent;
}());
exports.InboundRuleConditionsComponent = InboundRuleConditionsComponent;
var InboundRuleConditionComponent = /** @class */ (function () {
    function InboundRuleConditionComponent() {
        this.deleteEvent = new core_1.EventEmitter();
    }
    InboundRuleConditionComponent.prototype.edit = function () {
        this._editing = true;
    };
    InboundRuleConditionComponent.prototype.onSave = function () {
        this._editing = false;
    };
    InboundRuleConditionComponent.prototype.onCancel = function () {
        this._editing = false;
    };
    InboundRuleConditionComponent.prototype.delete = function () {
        this.deleteEvent.next();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", url_rewrite_1.Condition)
    ], InboundRuleConditionComponent.prototype, "condition", void 0);
    __decorate([
        core_1.Output('delete'),
        __metadata("design:type", core_1.EventEmitter)
    ], InboundRuleConditionComponent.prototype, "deleteEvent", void 0);
    InboundRuleConditionComponent = __decorate([
        core_1.Component({
            selector: 'inbound-rule-condition',
            template: "\n        <div *ngIf=\"condition && !_editing\" class=\"grid-item row\" (dblclick)=\"edit()\">\n            <div class=\"col-sm-3 col-lg-2 valign\">\n                {{condition.input}}\n            </div>\n            <div class=\"col-sm-3 col-lg-2 valign\">\n                {{condition.negate ? \"Doesn't Match\" : \"Matches\"}}\n            </div>\n            <div class=\"col-sm-3 valign\">\n                {{condition.pattern}}\n            </div>\n            <div class=\"actions\">\n                <div class=\"action-selector\">\n                    <button title=\"More\" (click)=\"selector.toggle()\" (dblclick)=\"$event.preventDefault()\" [class.background-active]=\"(selector && selector.opened) || false\">\n                        <i class=\"fa fa-ellipsis-h\"></i>\n                    </button>\n                    <selector #selector [right]=\"true\">\n                        <ul>\n                            <li><button #menuButton class=\"edit\" title=\"Edit\" (click)=\"edit()\">Edit</button></li>\n                            <li><button #menuButton class=\"delete\" title=\"Delete\" (click)=\"delete()\">Delete</button></li>\n                        </ul>\n                    </selector>\n                </div>\n            </div>\n        </div>\n        <condition-edit\n            *ngIf=\"_editing\"\n            [condition]=\"condition\"\n            (save)=\"onSave()\"\n            (cancel)=\"onCancel()\"></condition-edit>\n    "
        })
    ], InboundRuleConditionComponent);
    return InboundRuleConditionComponent;
}());
exports.InboundRuleConditionComponent = InboundRuleConditionComponent;
var ConditionEditComponent = /** @class */ (function () {
    function ConditionEditComponent() {
        this.cancel = new core_1.EventEmitter();
        this.save = new core_1.EventEmitter();
        this._serverVariables = url_rewrite_1.IIS_SERVER_VARIABLES;
    }
    ConditionEditComponent.prototype.isValid = function () {
        return !!this.condition.input && !!this.condition.pattern;
    };
    ConditionEditComponent.prototype.onDiscard = function () {
        this.cancel.emit();
    };
    ConditionEditComponent.prototype.onOk = function () {
        this.save.emit(this.condition);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", url_rewrite_1.Condition)
    ], ConditionEditComponent.prototype, "condition", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ConditionEditComponent.prototype, "cancel", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ConditionEditComponent.prototype, "save", void 0);
    ConditionEditComponent = __decorate([
        core_1.Component({
            selector: 'condition-edit',
            template: "\n        <div *ngIf=\"condition\" class=\"grid-item row background-editing\">\n            <div class=\"actions\">\n                <button class=\"no-border ok\" [disabled]=\"!isValid()\" title=\"Ok\" (click)=\"onOk()\"></button>\n                <button class=\"no-border cancel\" title=\"Cancel\" (click)=\"onDiscard()\"></button>\n            </div>\n            <fieldset class=\"name\">\n                <label>Server Variable</label>\n                <input type=\"text\" required class=\"form-control\" list=\"server-vars\" [(ngModel)]=\"condition.input\" />\n                <datalist id=\"server-vars\">\n                    <option *ngFor=\"let variable of _serverVariables\" value=\"{{'{' + variable + '}'}}\">\n                </datalist>\n            </fieldset>\n            <fieldset class=\"name\">\n                <div>\n                    <label class=\"inline-block\">Pattern</label>\n                    <text-toggle onText=\"Matches\" offText=\"Doesn't Match\" [on]=\"false\" [off]=\"true\" [(model)]=\"condition.negate\"></text-toggle>\n                    <text-toggle onText=\"Case Insensitive\" offText=\"Case Sensitive\" [(model)]=\"condition.ignore_case\"></text-toggle>\n                </div>\n                <input type=\"text\" required class=\"form-control\" [(ngModel)]=\"condition.pattern\" />\n            </fieldset>\n        </div>\n    ",
            styles: ["\n        fieldset {\n            padding-left: 15px;\n            padding-right: 15px;\n        }\n\n        .inline-block,\n        text-toggle {\n            margin-right: 20px;\n        }\n    "]
        })
    ], ConditionEditComponent);
    return ConditionEditComponent;
}());
exports.ConditionEditComponent = ConditionEditComponent;
//# sourceMappingURL=inbound-rule-conditions.js.map