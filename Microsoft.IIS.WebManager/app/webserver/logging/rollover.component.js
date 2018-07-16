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
var RolloverComponent = /** @class */ (function () {
    function RolloverComponent() {
        this.modelChange = new core_1.EventEmitter();
    }
    RolloverComponent.prototype.ngOnInit = function () {
        this.rollover_truncate_size = (this.model.truncate_size / 1000) | 0;
    };
    RolloverComponent.prototype.onModelChanged = function () {
        this.modelChange.emit(this.model);
    };
    RolloverComponent.prototype.updateTruncateSize = function () {
        this.model.truncate_size = this.rollover_truncate_size * 1000;
        this.onModelChanged();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], RolloverComponent.prototype, "model", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], RolloverComponent.prototype, "modelChange", void 0);
    RolloverComponent = __decorate([
        core_1.Component({
            selector: 'rollover',
            template: "\n        <fieldset>\n            <label>Rollover Schedule</label>\n            <enum [(model)]=\"model.period\" (modelChanged)=\"onModelChanged()\">\n                <field name=\"Hourly\" value=\"hourly\"></field>\n                <field name=\"Daily\" value=\"daily\"></field>\n                <field name=\"Weekly\" value=\"weekly\"></field>\n                <field name=\"Monthly\" value=\"monthly\"></field>\n            </enum>\n            <fieldset class=\"inline-block\">\n                <checkbox2 [(model)]=\"!model.use_local_time\" (modelChanged)=\"onModelChanged()\">UTC Time</checkbox2>\n            </fieldset>\n        </fieldset>\n        <fieldset>\n            <label>Rollover when the log size exceeds <span class=\"units\">(KB)</span></label>\n            <input [(ngModel)]=\"rollover_truncate_size\" (modelChanged)=\"updateTruncateSize()\" throttle type=\"number\" class=\"form-control\" min=\"1\" step=\"1\" required />\n        </fieldset>\n    "
        })
    ], RolloverComponent);
    return RolloverComponent;
}());
exports.RolloverComponent = RolloverComponent;
//# sourceMappingURL=rollover.component.js.map