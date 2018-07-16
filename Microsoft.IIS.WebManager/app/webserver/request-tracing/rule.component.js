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
var diff_1 = require("../../utils/diff");
var component_1 = require("../../utils/component");
var request_tracing_1 = require("./request-tracing");
var request_tracing_service_1 = require("./request-tracing.service");
var RuleComponent = /** @class */ (function () {
    function RuleComponent(_eRef, _service) {
        this._eRef = _eRef;
        this._service = _service;
        this.edit = new core_1.EventEmitter();
        this.close = new core_1.EventEmitter();
    }
    RuleComponent_1 = RuleComponent;
    RuleComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._service.providers.then(function (providers) { return _this._providers = providers; });
        this.set(this.model);
        if (!this.model.id) {
            this.onEdit();
        }
    };
    RuleComponent.prototype.onEdit = function () {
        this._isEditing = true;
        this.edit.emit(null);
        this.scheduleScroll();
    };
    RuleComponent.prototype.onOk = function () {
        var _this = this;
        if (this.model.id) {
            //
            // Update
            var changes = diff_1.DiffUtil.diff(this._original, this.model);
            if (Object.keys(changes).length > 0) {
                this._service.updateRule(this.model, changes).then(function (_) {
                    _this.set(_this.model);
                    _this.hide();
                });
            }
            else {
                this.hide();
            }
        }
        else {
            //
            // Create new
            this._service.createRule(this.model).then(function (_) {
                _this.set(_this.model);
                _this.hide();
            });
        }
    };
    RuleComponent.prototype.onCancel = function () {
        //
        // Revert changes
        var original = JSON.parse(JSON.stringify(this._original));
        for (var k in original)
            this.model[k] = original[k];
        this.hide();
    };
    RuleComponent.prototype.onDelete = function () {
        if (this.model.id) {
            this._service.deleteRule(this.model);
        }
        this.hide();
    };
    RuleComponent.prototype.set = function (rule) {
        this._original = JSON.parse(JSON.stringify(rule));
    };
    RuleComponent.prototype.friendlyEventSeverity = function (eventSeverity) {
        switch (eventSeverity) {
            case "criticalerror":
                return "Critical Error";
            case "error":
                return "Error";
            case "warning":
                return "Warning";
            case "ignore":
                return "Ignore";
            default:
                return "";
        }
    };
    RuleComponent.prototype.hasMinReqExecutionTime = function () {
        return (this.model.min_request_execution_time < primitives_1.Int32.Max);
    };
    RuleComponent.prototype.enableRequestTime = function (value) {
        if (value) {
            this.model.min_request_execution_time = 60;
        }
        else {
            this.model.min_request_execution_time = primitives_1.Int32.Max;
        }
    };
    RuleComponent.prototype.getTrace = function (p) {
        for (var _i = 0, _a = this.model.traces; _i < _a.length; _i++) {
            var t = _a[_i];
            if (t.provider.id == p.id) {
                return t;
            }
        }
        return null;
    };
    RuleComponent.prototype.isProviderEnabled = function (p) {
        return !!this.getTrace(p);
    };
    RuleComponent.prototype.enableProvider = function (p, value) {
        if (value) {
            var trace = new request_tracing_1.Trace();
            trace.provider = p;
            trace.allowed_areas = RuleComponent_1.toObject(p.areas);
            trace.verbosity = request_tracing_1.Verbosity.Warning;
            this.model.traces.unshift(trace);
        }
        else {
            for (var i = 0; i < this.model.traces.length; ++i) {
                if (this.model.traces[i].provider.id == p.id) {
                    this.model.traces.splice(i, 1);
                    break;
                }
            }
        }
    };
    RuleComponent.toObject = function (arr) {
        var rv = {};
        for (var i in arr) {
            rv[arr[i]] = true;
        }
        return rv;
    };
    RuleComponent.prototype.scheduleScroll = function () {
        var _this = this;
        setTimeout(function () { return component_1.ComponentUtil.scrollTo(_this._eRef); });
    };
    RuleComponent.prototype.hide = function () {
        this._isEditing = false;
        this.close.emit(null);
    };
    RuleComponent.prototype.isValid = function () {
        return !!this.model.path;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", request_tracing_1.RequestTracingRule)
    ], RuleComponent.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], RuleComponent.prototype, "readonly", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], RuleComponent.prototype, "edit", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], RuleComponent.prototype, "close", void 0);
    RuleComponent = RuleComponent_1 = __decorate([
        core_1.Component({
            selector: 'rule',
            template: "\n        <div *ngIf=\"model\" class=\"grid-item row\" [class.background-editing]=\"_isEditing\">\n            <div class=\"actions\">\n                <button class=\"no-border no-editing\" [class.inactive]=\"readonly\" title=\"Edit\" (click)=\"onEdit()\">\n                    <i class=\"fa fa-pencil color-active\"></i>\n                </button>\n                <button class=\"no-border editing\" title=\"Ok\" (click)=\"onOk()\" [disabled]=\"!isValid() || null\">\n                    <i class=\"fa fa-check color-active\"></i>\n                </button>\n                <button class=\"no-border editing\" title=\"Cancel\" (click)=\"onCancel()\">\n                    <i class=\"fa fa-times red\"></i>\n                </button>\n                <button class=\"no-border\" *ngIf=\"model.id\" title=\"Delete\" [class.inactive]=\"readonly\" (click)=\"onDelete()\">\n                    <i class=\"fa fa-trash-o red\"></i>\n                </button>\n            </div>\n            <fieldset class=\"col-xs-8 col-sm-4 col-md-3\" *ngIf=\"!_isEditing\">\n                <span>{{model.path}}</span>\n            </fieldset>\n            <fieldset class=\"col-xs-9\" *ngIf=\"_isEditing\">\n                <label>Path</label>\n                <input autosize placeholder=\"Example: *.aspx\" class=\"form-control\" type=\"text\" [(ngModel)]=\"model.path\" throttle required />\n            </fieldset>\n            <fieldset class=\"hidden-xs col-sm-3 col-md-3 col-lg-2\" *ngIf=\"!_isEditing\">\n                <span>{{model.status_codes.join(\", \")}}</span>\n            </fieldset>\n            <fieldset class=\"hidden-xs hidden-sm col-md-3 col-lg-2\" *ngIf=\"!_isEditing\">\n                <span *ngIf=\"hasMinReqExecutionTime()\">{{model.min_request_execution_time}}</span>\n            </fieldset>\n            <fieldset class=\"hidden-xs hidden-sm hidden-md col-lg-2\" *ngIf=\"!_isEditing\">\n                <span *ngIf=\"model.event_severity != 'ignore'\">{{friendlyEventSeverity(model.event_severity)}}</span>\n            </fieldset>\n            <div *ngIf=\"_isEditing\" id=\"statusCodes\" class=\"col-xs-12\">\n                <fieldset class=\"inline-block has-list\">\n                    <label>Status Code(s)</label>\n                </fieldset>\n                <button class=\"pull-right background-normal\" *ngIf=\"!!(!(statusCodes && statusCodes.list) && model.status_codes.length > 0 || statusCodes.list && statusCodes.list.length> 0)\" (click)=\"statusCodes.add()\" ><i class=\"fa fa-plus color-active\" ></i><span>Add</span></button>\n                <fieldset>\n                    <string-list #statusCodes=\"stringList\" [(model)]=\"model.status_codes\"></string-list>\n                    <button class=\"background-normal\" *ngIf=\"statusCodes.list.length == 0\" (click)=\"statusCodes.add()\"><i class=\"fa fa-plus color-active\"></i><span>Add</span></button>\n                </fieldset>\n            </div>\n            <fieldset *ngIf=\"_isEditing\" class=\"col-xs-12\">\n                <fieldset class=\"inline-block\"> \n                    <label class=\"block\">Min Request Time</label>\n                    <switch [model]=\"hasMinReqExecutionTime()\" (modelChange)=\"enableRequestTime($event)\">{{hasMinReqExecutionTime() ? \"On\" : \"Off\"}}</switch>\n                </fieldset>\n                <fieldset class=\"inline-block\" *ngIf=\"hasMinReqExecutionTime()\">\n                    <label class=\"block\">Length <span class=\"units\">(s)</span></label>\n                    <input class=\"form-control\" type=\"number\" [(ngModel)]=\"model.min_request_execution_time\" throttle />\n                </fieldset>\n            </fieldset>\n            <fieldset *ngIf=\"_isEditing\" class=\"col-xs-12\">\n                <label>Event Severity</label>\n                <enum [(model)]=\"model.event_severity\">\n                    <field name=\"Any\" value=\"ignore\"></field>\n                    <field name=\"Critical Error\" value=\"criticalerror\"></field>\n                    <field name=\"Error\" value=\"error\"></field>\n                    <field name=\"Warning\" value=\"warning\"></field>\n                </enum>\n            </fieldset>\n            <div *ngIf=\"_isEditing\" class=\"col-xs-12 col-sm-12 col-md-7 col-lg-6\">\n                <fieldset *ngFor=\"let p of _providers;\">\n                    <label>{{p.name}}</label>\n                    <switch class=\"block\" [model]=\"isProviderEnabled(p)\" (modelChange)=\"enableProvider(p, $event)\"></switch>\n                    <div class=\"trace\" *ngIf=\"isProviderEnabled(p)\">\n                        <trace [model]=\"getTrace(p)\"></trace>\n                    </div>\n                </fieldset>\n            </div>\n        </div>\n    ",
            styles: ["\n        [autosize] {\n            max-width: 100%;\n            min-width: 215px;\n        }\n\n        .collapse {\n            margin-bottom: 0;\n        }\n\n        fieldset.inline-block {\n            padding-bottom: 0;\n        }\n\n        .grid-item:not(.background-editing) fieldset {\n            padding-top: 5px;\n            padding-bottom: 0;\n        }\n\n        fieldset fieldset.inline-block:nth-of-type(2) {\n            margin: 0;\n        }\n\n        #statusCodes {\n            max-width: 310px;\n            margin-top:15px;\n            margin-bottom:5px;\n            clear: left;\n        }\n\n        .trace {\n            clear:both;\n            padding-top:10px;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [core_1.ElementRef, request_tracing_service_1.RequestTracingService])
    ], RuleComponent);
    return RuleComponent;
    var RuleComponent_1;
}());
exports.RuleComponent = RuleComponent;
//# sourceMappingURL=rule.component.js.map