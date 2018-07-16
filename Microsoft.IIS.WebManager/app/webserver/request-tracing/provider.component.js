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
var forms_1 = require("@angular/forms");
var diff_1 = require("../../utils/diff");
var component_1 = require("../../utils/component");
var request_tracing_1 = require("./request-tracing");
var request_tracing_service_1 = require("./request-tracing.service");
var ProviderComponent = /** @class */ (function () {
    function ProviderComponent(_eRef, _service) {
        this._eRef = _eRef;
        this._service = _service;
        this.edit = new core_1.EventEmitter();
        this.close = new core_1.EventEmitter();
    }
    ProviderComponent.prototype.ngOnInit = function () {
        this.set(this.model);
        if (!this.model.id) {
            this.onEdit();
        }
    };
    ProviderComponent.prototype.onEdit = function () {
        this._isEditing = true;
        this.edit.emit(null);
        this.scheduleScroll();
    };
    ProviderComponent.prototype.onOk = function () {
        var _this = this;
        if (this.model.id) {
            var changes = diff_1.DiffUtil.diff(this._original, this.model);
            if (Object.keys(changes).length > 0) {
                this._service.updateProvider(this.model, changes).then(function (_) {
                    _this.set(_this.model);
                    _this.hide();
                });
            }
            else {
                this.hide();
            }
        }
        else {
            // Create new
            this._service.createProvider(this.model).then(function (_) {
                _this.set(_this.model);
                _this.hide();
            });
        }
    };
    ProviderComponent.prototype.onCancel = function () {
        //
        // Revert changes
        var original = JSON.parse(JSON.stringify(this._original));
        for (var k in original)
            this.model[k] = original[k];
        this.hide();
    };
    ProviderComponent.prototype.onDelete = function () {
        if (this.model.id) {
            this._service.deleteProvider(this.model);
        }
        this.hide();
    };
    ProviderComponent.prototype.set = function (provider) {
        this._original = JSON.parse(JSON.stringify(provider));
    };
    ProviderComponent.prototype.scheduleScroll = function () {
        var _this = this;
        setTimeout(function () { return component_1.ComponentUtil.scrollTo(_this._eRef); });
    };
    ProviderComponent.prototype.hide = function () {
        this._isEditing = false;
        this.close.emit(null);
    };
    ProviderComponent.prototype.isValid = function () {
        if (this.validators) {
            var vs = this.validators.toArray();
            for (var _i = 0, vs_1 = vs; _i < vs_1.length; _i++) {
                var control = vs_1[_i];
                if (!control.valid) {
                    return false;
                }
            }
        }
        return true;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", request_tracing_1.Provider)
    ], ProviderComponent.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ProviderComponent.prototype, "readonly", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], ProviderComponent.prototype, "edit", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], ProviderComponent.prototype, "close", void 0);
    __decorate([
        core_1.ViewChildren(forms_1.NgModel),
        __metadata("design:type", core_1.QueryList)
    ], ProviderComponent.prototype, "validators", void 0);
    ProviderComponent = __decorate([
        core_1.Component({
            selector: 'provider',
            template: "\n        <div *ngIf=\"model\" class=\"grid-item row\" [class.background-editing]=\"_isEditing\">\n            <div class=\"actions\">\n                <button class=\"no-border no-editing\" [class.inactive]=\"readonly\" title=\"Edit\" (click)=\"onEdit()\">\n                    <i class=\"fa fa-pencil color-active\"></i>\n                </button>\n                <button class=\"no-border editing\" title=\"Ok\" (click)=\"onOk()\" [disabled]=\"!isValid() || null\">\n                    <i class=\"fa fa-check color-active\"></i>\n                </button>\n                <button class=\"no-border editing\" title=\"Cancel\" (click)=\"onCancel()\">\n                    <i class=\"fa fa-times red\"></i>\n                </button>\n                <button class=\"no-border\" *ngIf=\"model.id\" title=\"Delete\" [class.inactive]=\"readonly\" (click)=\"onDelete()\">\n                    <i class=\"fa fa-trash-o red\"></i>\n                </button>\n            </div>\n            <fieldset>\n                <label [hidden]=\"!_isEditing\">Name</label>\n                <input class=\"form-control name\" *ngIf=\"_isEditing\" type=\"text\" [(ngModel)]=\"model.name\" required throttle/>\n                <span>{{model.name}}</span>\n            </fieldset>\n            <fieldset class=\"name\" *ngIf=\"_isEditing\">\n                <label>Guid</label>\n                <input *ngIf=\"!model.id\" class=\"form-control\" type=\"text\" [(ngModel)]=\"model.guid\" required pattern=\"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$\" throttle/>\n                <span *ngIf=\"model.id\" class=\"editing form-control\">{{model.guid}}</span>\n            </fieldset>\n            <div *ngIf=\"_isEditing\">\n                <fieldset>\n                    <button (click)=\"areas.add()\" class=\"background-normal\" ><i class=\"fa fa-plus color-active\" ></i><span>Add Area</span></button>\n                </fieldset>\n                <string-list class=\"name\"  #areas=\"stringList\" [(model)]=\"model.areas\"></string-list>\n            </div>\n        </div>\n    ",
            styles: ["\n        fieldset.has-list {\n            padding-bottom: 0;\n        }\n\n        .grid-item:not(.background-editing) fieldset {\n            padding-top: 5px;\n            padding-bottom: 0;\n        }\n\n        string-list {\n            display: block;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [core_1.ElementRef, request_tracing_service_1.RequestTracingService])
    ], ProviderComponent);
    return ProviderComponent;
}());
exports.ProviderComponent = ProviderComponent;
//# sourceMappingURL=provider.component.js.map