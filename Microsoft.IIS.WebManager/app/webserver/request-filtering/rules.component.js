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
var diff_1 = require("../../utils/diff");
var request_filtering_1 = require("./request-filtering");
var component_1 = require("../../utils/component");
var string_list_component_1 = require("../../common/string-list.component");
var request_filtering_service_1 = require("./request-filtering.service");
var RuleComponent = /** @class */ (function () {
    function RuleComponent(_service, _eRef) {
        this._service = _service;
        this._eRef = _eRef;
        this.enter = new core_1.EventEmitter();
        this.leave = new core_1.EventEmitter();
        this._editable = true;
    }
    RuleComponent.prototype.ngOnInit = function () {
        this._original = JSON.parse(JSON.stringify(this.model));
        if (this.model) {
            this._displayHeaders = this.model.headers.length > 0;
            this._displayFileExtensions = this.model.file_extensions.length > 0;
            if (!this.model.name) {
                this._editing = true;
                this.scheduleScroll();
            }
        }
    };
    RuleComponent.prototype.ngOnChanges = function (changes) {
        if (changes["model"]) {
            this.setModel(changes["model"].currentValue);
        }
    };
    RuleComponent.prototype.onEdit = function () {
        this.enter.emit(null);
        this._editing = true;
        this.scheduleScroll();
    };
    RuleComponent.prototype.onDelete = function () {
        if (confirm("Are you sure you want to delete this rule?\nName: " + this.model.name)) {
            this._service.deleteFilteringRule(this.model);
        }
    };
    RuleComponent.prototype.onSave = function () {
        var _this = this;
        if (!this.isValid()) {
            return;
        }
        if (!this._displayHeaders) {
            this.model.headers.splice(0);
        }
        if (!this._displayFileExtensions) {
            this.model.file_extensions.splice(0);
        }
        this._editing = false;
        if (this.model.id) {
            var changes = diff_1.DiffUtil.diff(this._original, this.model);
            if (Object.keys(changes).length > 0) {
                this._service.updateFilteringRule(this.model, changes)
                    .then(function () { return _this.setModel(_this.model); });
            }
        }
        else {
            this._service.addFilteringRule(this.model);
        }
        this.leave.emit(null);
    };
    RuleComponent.prototype.onDiscard = function () {
        this._editing = false;
        for (var _i = 0, _a = Object.keys(this._original); _i < _a.length; _i++) {
            var key = _a[_i];
            this.model[key] = JSON.parse(JSON.stringify(this._original[key] || null));
        }
        this.leave.emit(null);
    };
    RuleComponent.prototype.setEditable = function (val) {
        this._editable = val;
    };
    RuleComponent.prototype.addHeader = function () {
        this.headers.add();
    };
    RuleComponent.prototype.addFileExtension = function () {
        this.fileExtensions.add();
    };
    RuleComponent.prototype.addDenyString = function () {
        this.denyStrings.add();
    };
    RuleComponent.prototype.removeHeader = function (index) {
        this.model.headers.splice(index, 1);
    };
    RuleComponent.prototype.removeFileExtension = function (index) {
        this.model.file_extensions.splice(index, 1);
    };
    RuleComponent.prototype.removeDenyString = function (index) {
        this.model.deny_strings.splice(index, 1);
    };
    RuleComponent.prototype.isValid = function () {
        return !!this.model.name;
    };
    RuleComponent.prototype.scheduleScroll = function () {
        var _this = this;
        setTimeout(function () {
            component_1.ComponentUtil.scrollTo(_this._eRef);
        });
    };
    RuleComponent.prototype.denyStringsVisible = function () {
        if (!this.denyStrings) {
            return this.model.deny_strings.length > 0;
        }
        return this.denyStrings.list.length > 0;
    };
    RuleComponent.prototype.setModel = function (model) {
        this.model = model;
        this._original = JSON.parse(JSON.stringify(this.model));
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", request_filtering_1.FilteringRule)
    ], RuleComponent.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], RuleComponent.prototype, "locked", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], RuleComponent.prototype, "enter", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], RuleComponent.prototype, "leave", void 0);
    __decorate([
        core_1.ViewChild('headers'),
        __metadata("design:type", string_list_component_1.StringListComponent)
    ], RuleComponent.prototype, "headers", void 0);
    __decorate([
        core_1.ViewChild('fileExtensions'),
        __metadata("design:type", string_list_component_1.StringListComponent)
    ], RuleComponent.prototype, "fileExtensions", void 0);
    __decorate([
        core_1.ViewChild('ds'),
        __metadata("design:type", string_list_component_1.StringListComponent)
    ], RuleComponent.prototype, "denyStrings", void 0);
    RuleComponent = __decorate([
        core_1.Component({
            selector: 'rule',
            template: "\n        <div *ngIf=\"model\" class=\"grid-item row\" [class.background-editing]=\"_editing\">\n            <div class=\"actions\">\n                <button class=\"no-border no-editing\" [class.inactive]=\"!_editable\" title=\"Edit\" (click)=\"onEdit()\">\n                    <i class=\"fa fa-pencil color-active\"></i>\n                </button>\n                <button class=\"no-border editing\" [disabled]=\"!isValid() || locked\" title=\"Ok\" (click)=\"onSave()\">\n                    <i class=\"fa fa-check color-active\"></i>\n                </button>\n                <button class=\"no-border editing\" title=\"Cancel\" (click)=\"onDiscard()\">\n                    <i class=\"fa fa-times red\"></i>\n                </button>\n                <button class=\"no-border\" *ngIf=\"model.id\" [disabled]=\"locked\" title=\"Delete\" [class.inactive]=\"!_editable\" (click)=\"onDelete()\">\n                    <i class=\"fa fa-trash-o red\"></i>\n                </button>\n            </div>\n\n            <fieldset class=\"col-xs-8 col-sm-3\" *ngIf=\"!_editing\">\n                <label class=\"visible-xs\">Name</label>\n                <span>{{model.name}}</span>\n                <div>\n                    <br class=\"visible-xs\" />\n                </div>\n            </fieldset>\n\n            <fieldset class=\"col-xs-8 col-md-9 col-lg-10\" *ngIf=\"_editing\">\n                <label class=\"block\">Name</label>\n                <input class=\"form-control\" type=\"text\" [disabled]=\"locked\" [(ngModel)]=\"model.name\" throttle required />\n            </fieldset>\n\n            <fieldset class=\"col-xs-8 col-sm-5 col-md-6\" *ngIf=\"!_editing\">\n                <label class=\"visible-xs\">Denied Values</label>\n                <span>{{model.deny_strings.join(', ')}}</span>\n            </fieldset>\n    \n            <div *ngIf=\"_editing\" class=\"col-xs-12\">\n                <div class=\"row\">\n                    <div class=\"col-lg-4 col-md-5 col-xs-12\">\n\n                        <fieldset>\n                            <label>Scan Url</label>\n                            <switch class=\"block\" [disabled]=\"locked\" [(model)]=\"model.scan_url\">{{model.scan_url ? \"Yes\" : \"No\"}}</switch>\n                        </fieldset>\n                        <fieldset>\n                            <label>Scan Query String</label>\n                            <switch class=\"block\" [disabled]=\"locked\" [(model)]=\"model.scan_query_string\">{{model.scan_query_string ? \"Yes\" : \"No\"}}</switch>\n                        </fieldset>\n\n                        <fieldset [class.has-list]=\"_displayHeaders\">\n                            <label class=\"block\">Scan Headers</label>\n                            <div>\n                                <switch [disabled]=\"locked\" [(model)]=\"_displayHeaders\">{{_displayHeaders ? \"Yes\" : \"No\"}}</switch>\n                                <button class=\"background-normal pull-right\" *ngIf=\"_displayHeaders\" (click)=\"addHeader()\"><i class=\"fa fa-plus color-active\"></i><span>Add</span></button>\n                            </div>\n                        </fieldset>\n                        <fieldset *ngIf=\"_displayHeaders\">\n                            <string-list #headers=\"stringList\" [(model)]=\"model.headers\"></string-list>\n                        </fieldset>\n\n                        <fieldset [class.has-list]=\"_displayFileExtensions\">\n                            <label class=\"block\">Filter by File Extension</label>\n                            <div>\n                                <switch [disabled]=\"locked\" [(model)]=\"_displayFileExtensions\">{{_displayFileExtensions ? \"Yes\" : \"No\"}}</switch>\n                                <button class=\"background-normal pull-right\" *ngIf=\"_displayFileExtensions\" (click)=\"addFileExtension()\"><i class=\"fa fa-plus color-active\"></i><span>Add</span></button>\n                            </div>\n                        </fieldset>\n                        <fieldset *ngIf=\"_displayFileExtensions\">\n                            <string-list #fileExtensions=\"stringList\" [(model)]=\"model.file_extensions\"></string-list>\n                        </fieldset>\n\n                    </div>\n                    <div class=\"col-lg-6 col-md-7 col-xs-12\">\n                        <fieldset class=\"inline-block has-list\">\n                            <label class=\"block\">Denied Values</label>\n                        </fieldset>\n                        <button class=\"background-normal pull-right\" *ngIf=\"denyStringsVisible()\" (click)=\"addDenyString()\"><i class=\"fa fa-plus color-active\"></i><span>Add</span></button>\n                        <fieldset>\n                            <string-list #ds=\"stringList\" [(model)]=\"model.deny_strings\"></string-list>\n                            <button class=\"add background-normal\" *ngIf=\"ds.list.length == 0\" (click)=\"addDenyString()\"><i class=\"fa fa-plus color-active\"></i><span>Add</span></button>\n                        </fieldset>\n                    </div>\n                </div>\n\n            </div>\n        </div>\n    ",
            styles: ["\n        fieldset.has-list {\n            padding-bottom: 0;\n        }\n        \n        div.inline-block {\n            float: right;\n        }\n\n        [class*=\"col-\"] {\n            white-space: nowrap;\n        }\n        \n        .grid-item:not(.background-editing) fieldset {\n            padding-top: 5px;\n            padding-bottom: 0;\n        }\n    "],
        }),
        __metadata("design:paramtypes", [request_filtering_service_1.RequestFilteringService, core_1.ElementRef])
    ], RuleComponent);
    return RuleComponent;
}());
exports.RuleComponent = RuleComponent;
var RulesComponent = /** @class */ (function () {
    function RulesComponent(_service) {
        this._service = _service;
        this.rules = [];
        this._subscriptions = [];
    }
    RulesComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._subscriptions.push(this._service.filteringRules.subscribe(function (rules) { return _this.rules = rules; }));
    };
    RulesComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    RulesComponent.prototype.onAdd = function () {
        if (this._newRule) {
            return;
        }
        this.setEditable(false);
        this._newRule = new request_filtering_1.FilteringRule();
        this._newRule.name = '';
        this._newRule.headers = [];
        this._newRule.file_extensions = [];
        this._newRule.deny_strings = [];
    };
    RulesComponent.prototype.setEditable = function (val) {
        this._editing = !val;
        var rules = this.ruleComponents.toArray();
        rules.forEach(function (rule, i) {
            rule.setEditable(val);
        });
    };
    RulesComponent.prototype.enterRule = function (index) {
        this.setEditable(false);
    };
    RulesComponent.prototype.leaveRule = function (index) {
        this.setEditable(true);
    };
    RulesComponent.prototype.leaveNewRule = function () {
        this._newRule = null;
        this.setEditable(true);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], RulesComponent.prototype, "rules", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], RulesComponent.prototype, "locked", void 0);
    __decorate([
        core_1.ViewChildren(RuleComponent),
        __metadata("design:type", core_1.QueryList)
    ], RulesComponent.prototype, "ruleComponents", void 0);
    RulesComponent = __decorate([
        core_1.Component({
            selector: 'rules',
            template: "\n        <div *ngIf=\"rules\">\n            <button class=\"create\" (click)=\"onAdd()\" [disabled]=\"locked\" [class.inactive]=\"_editing\"><i class=\"fa fa-plus color-active\"></i><span>Add</span></button>\n\n            <div class=\"container-fluid\" [hidden]=\"!rules || rules.length < 1\">\n                <div class=\"row hidden-xs border-active grid-list-header\">\n                    <label class=\"col-sm-3\">Name</label>\n                    <label class=\"col-sm-5 col-md-6\">Denied Values</label>\n                </div>\n            </div>\n\n            <ul class=\"grid-list container-fluid\">\n                <li *ngIf=\"_newRule\">\n                    <rule [model]=\"_newRule\" [locked]=\"locked\" (leave)=\"leaveNewRule()\"></rule>\n                </li>\n                <li *ngFor=\"let r of rules; let i = index;\">\n                    <rule [model]=\"r\" [locked]=\"locked\" (enter)=\"enterRule(i)\" (leave)=\"leaveRule(i)\"></rule>\n                </li>                \n            </ul>\n        </div>  \n    ",
        }),
        __metadata("design:paramtypes", [request_filtering_service_1.RequestFilteringService])
    ], RulesComponent);
    return RulesComponent;
}());
exports.RulesComponent = RulesComponent;
//# sourceMappingURL=rules.component.js.map