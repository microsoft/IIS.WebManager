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
var primitives_1 = require("../../common/primitives");
var request_tracing_1 = require("./request-tracing");
var request_tracing_service_1 = require("./request-tracing.service");
var RulesComponent = /** @class */ (function () {
    function RulesComponent(_service) {
        this._service = _service;
    }
    RulesComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._service.rules.then(function (rules) {
            _this._rules = rules;
        });
    };
    RulesComponent.prototype.create = function () {
        var rule = new request_tracing_1.RequestTracingRule();
        rule.status_codes = ["100-999"];
        rule.event_severity = request_tracing_1.EventSeverity.Ignore;
        rule.min_request_execution_time = primitives_1.Int32.Max;
        rule.traces = [];
        rule.path = "";
        this._newRule = rule;
        this._editing = this._newRule;
    };
    RulesComponent.prototype.edit = function (r) {
        this._editing = r;
    };
    RulesComponent.prototype.close = function () {
        this._newRule = null;
        this._editing = null;
    };
    RulesComponent.prototype.sort = function (field) {
        this._orderByAsc = (field == this._orderBy) ? !this._orderByAsc : true;
        this._orderBy = field;
    };
    RulesComponent.prototype.css = function (field) {
        if (this._orderBy == field) {
            return {
                "orderby": true,
                "desc": !this._orderByAsc
            };
        }
        return {};
    };
    RulesComponent = __decorate([
        core_1.Component({
            selector: 'rule-list',
            template: "\n        <div *ngIf=\"_rules\">\n            <button class=\"create\" (click)=\"create()\" [class.inactive]=\"_editing\"><i class=\"fa fa-plus color-active\"></i><span>Create Rule</span></button>\n            <div class=\"container-fluid\">\n                <div class=\"hidden-xs border-active grid-list-header row\" *ngIf=\"_rules.length > 0\">\n                    <label class=\"col-xs-12 col-sm-4 col-md-3\" [ngClass]=\"css('path')\" (click)=\"sort('path')\">Path</label>\n                    <label class=\"hidden-xs col-sm-3 col-md-3 col-lg-2\">Status Code</label>\n                    <label class=\"hidden-xs hidden-sm col-md-3 col-lg-2\" [ngClass]=\"css('min_request_execution_time')\" (click)=\"sort('min_request_execution_time')\">Request Time (s)</label>\n                    <label class=\"hidden-xs hidden-sm hidden-md col-lg-2\" [ngClass]=\"css('event_severity')\" (click)=\"sort('event_severity')\">Event Severity</label>\n                </div>\n                <div class=\"grid-list\">\n                    <rule *ngIf=\"_newRule\" [model]=\"_newRule\" (close)=\"close()\"></rule>\n                    <rule *ngFor=\"let rule of _rules | orderby: _orderBy: _orderByAsc\" \n                                 [model]=\"rule\" \n                                 [readonly]=\"_editing && rule != _editing\"\n                                 (edit)=\"edit(rule)\" (close)=\"close()\" >\n                    </rule>\n                </div>\n            </div>\n        </div>\n    "
        }),
        __metadata("design:paramtypes", [request_tracing_service_1.RequestTracingService])
    ], RulesComponent);
    return RulesComponent;
}());
exports.RulesComponent = RulesComponent;
//# sourceMappingURL=rule-list.component.js.map