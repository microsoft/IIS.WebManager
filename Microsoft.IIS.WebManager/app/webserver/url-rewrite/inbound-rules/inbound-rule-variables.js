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
var InboundRuleVariablesComponent = /** @class */ (function () {
    function InboundRuleVariablesComponent() {
    }
    InboundRuleVariablesComponent.prototype.add = function () {
        var variable = new url_rewrite_1.ServerVariableAssignment();
        variable.name = "";
        variable.value = "";
        variable.replace = true;
        this._newServerVariable = variable;
    };
    InboundRuleVariablesComponent.prototype.saveNew = function (variable) {
        this.rule.server_variables.push(variable);
        this._newServerVariable = null;
    };
    InboundRuleVariablesComponent.prototype.discardNew = function () {
        this._newServerVariable = null;
    };
    InboundRuleVariablesComponent.prototype.onDelete = function (index) {
        this.rule.server_variables.splice(index, 1);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", url_rewrite_1.InboundRule)
    ], InboundRuleVariablesComponent.prototype, "rule", void 0);
    InboundRuleVariablesComponent = __decorate([
        core_1.Component({
            selector: 'inbound-rule-variables',
            template: "\n        <div *ngIf=\"rule\">\n            <button (click)=\"add()\" class=\"create\"><span>Add Server Variable</span></button>\n            <div class=\"container-fluid\">\n                <div class=\"row hidden-xs border-active grid-list-header\">\n                    <label class=\"col-sm-3 col-lg-2\">Name</label>\n                    <label class=\"col-sm-3 col-lg-2\">Value</label>\n                    <label class=\"col-sm-3 col-lg-2\">Replace</label>\n                </div>\n            </div>\n\n            <ul class=\"grid-list container-fluid\">\n                <li *ngIf=\"_newServerVariable\">\n                    <variable-edit [variable]=\"_newServerVariable\" (save)=\"saveNew($event)\" (cancel)=\"discardNew()\"></variable-edit>\n                </li>\n                <li *ngFor=\"let variable of rule.server_variables; let i = index;\">\n                    <inbound-rule-variable [variable]=\"variable\" (delete)=\"onDelete(i)\"></inbound-rule-variable>\n                </li>\n            </ul>\n        </div>\n    "
        })
    ], InboundRuleVariablesComponent);
    return InboundRuleVariablesComponent;
}());
exports.InboundRuleVariablesComponent = InboundRuleVariablesComponent;
var InboundRuleVariableComponent = /** @class */ (function () {
    function InboundRuleVariableComponent() {
        this.deleteEvent = new core_1.EventEmitter();
    }
    InboundRuleVariableComponent.prototype.edit = function () {
        this._editing = true;
    };
    InboundRuleVariableComponent.prototype.onSave = function () {
        this._editing = false;
    };
    InboundRuleVariableComponent.prototype.onCancel = function () {
        this._editing = false;
    };
    InboundRuleVariableComponent.prototype.delete = function () {
        this.deleteEvent.next();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", url_rewrite_1.ServerVariableAssignment)
    ], InboundRuleVariableComponent.prototype, "variable", void 0);
    __decorate([
        core_1.Output('delete'),
        __metadata("design:type", core_1.EventEmitter)
    ], InboundRuleVariableComponent.prototype, "deleteEvent", void 0);
    InboundRuleVariableComponent = __decorate([
        core_1.Component({
            selector: 'inbound-rule-variable',
            template: "\n        <div *ngIf=\"variable && !_editing\" class=\"grid-item row\" (dblclick)=\"edit()\">\n            <div class=\"col-sm-3 col-lg-2 valign\">\n                {{variable.name}}\n            </div>\n            <div class=\"col-sm-3 col-lg-2 valign\">\n                {{variable.value}}\n            </div>\n            <div class=\"col-sm-3 col-lg-2 valign\">\n                {{variable.replace}}\n            </div>\n            <div class=\"actions\">\n                <div class=\"action-selector\">\n                    <button title=\"More\" (click)=\"selector.toggle()\" (dblclick)=\"$event.preventDefault()\" [class.background-active]=\"(selector && selector.opened) || false\">\n                        <i class=\"fa fa-ellipsis-h\"></i>\n                    </button>\n                    <selector #selector [right]=\"true\">\n                        <ul>\n                            <li><button #menuButton class=\"edit\" title=\"Edit\" (click)=\"edit()\">Edit</button></li>\n                            <li><button #menuButton class=\"delete\" title=\"Delete\" (click)=\"delete()\">Delete</button></li>\n                        </ul>\n                    </selector>\n                </div>\n            </div>\n        </div>\n        <variable-edit\n            *ngIf=\"_editing\"\n            [variable]=\"variable\"\n            (save)=\"onSave()\"\n            (cancel)=\"onCancel()\"></variable-edit>\n    "
        })
    ], InboundRuleVariableComponent);
    return InboundRuleVariableComponent;
}());
exports.InboundRuleVariableComponent = InboundRuleVariableComponent;
var VariableEditComponent = /** @class */ (function () {
    function VariableEditComponent() {
        this.cancel = new core_1.EventEmitter();
        this.save = new core_1.EventEmitter();
        this._serverVariables = url_rewrite_1.IIS_SERVER_VARIABLES;
    }
    VariableEditComponent.prototype.isValid = function () {
        return !!this.variable.name && !!this.variable.value;
    };
    VariableEditComponent.prototype.onDiscard = function () {
        this.cancel.emit();
    };
    VariableEditComponent.prototype.onOk = function () {
        this.save.emit(this.variable);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", url_rewrite_1.ServerVariableAssignment)
    ], VariableEditComponent.prototype, "variable", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], VariableEditComponent.prototype, "cancel", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], VariableEditComponent.prototype, "save", void 0);
    VariableEditComponent = __decorate([
        core_1.Component({
            selector: 'variable-edit',
            template: "\n        <div *ngIf=\"variable\" class=\"grid-item row background-editing\">\n            <div class=\"actions\">\n                <button class=\"no-border ok\" [disabled]=\"!isValid()\" title=\"Ok\" (click)=\"onOk()\"></button>\n                <button class=\"no-border cancel\" title=\"Cancel\" (click)=\"onDiscard()\"></button>\n            </div>\n            <fieldset class=\"name\">\n                <label>Name</label>\n                <input type=\"text\" required class=\"form-control\" list=\"server-vars\" [(ngModel)]=\"variable.name\" />\n                <datalist id=\"server-vars\">\n                    <option *ngFor=\"let variable of _serverVariables\" value=\"{{variable}}\">\n                </datalist>\n            </fieldset>\n            <fieldset class=\"name\">\n                <label>Value</label>\n                <input type=\"text\" required class=\"form-control\" [(ngModel)]=\"variable.value\" />\n            </fieldset>\n            <fieldset>\n                <label>Replace</label>\n                <switch [(model)]=\"variable.replace\">{{variable.replace ? 'Yes' : 'No'}}</switch>\n            </fieldset>\n        </div>\n    ",
            styles: ["\n        fieldset {\n            padding-left: 15px;\n            padding-right: 15px;\n        }\n    "]
        })
    ], VariableEditComponent);
    return VariableEditComponent;
}());
exports.VariableEditComponent = VariableEditComponent;
//# sourceMappingURL=inbound-rule-variables.js.map