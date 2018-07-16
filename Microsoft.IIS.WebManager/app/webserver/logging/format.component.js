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
var logging_1 = require("./logging");
var FormatComponent = /** @class */ (function () {
    function FormatComponent() {
        this.modelChange = new core_1.EventEmitter();
    }
    FormatComponent.prototype.onModelChanged = function () {
        this.modelChange.emit(this.model);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", logging_1.Logging)
    ], FormatComponent.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        core_1.Output(),
        __metadata("design:type", Object)
    ], FormatComponent.prototype, "modelChange", void 0);
    FormatComponent = __decorate([
        core_1.Component({
            selector: 'format',
            template: "\n        <fieldset>\n            <label>Format</label>\n            <enum [disabled]=\"!model.log_per_site && model.website\" [(model)]=\"model.log_file_format\" (modelChanged)=\"onModelChanged()\">\n                <field name=\"W3C\" value=\"w3c\"></field>\n                <field [hidden]=\"!model.log_per_site\" name=\"NCSA\" value=\"ncsa\"></field>\n                <field [hidden]=\"!model.log_per_site\" name=\"IIS\" value=\"iis\"></field>\n                <field [hidden]=\"!model.log_per_site\" name=\"Custom\" value=\"custom\"></field>\n                <field [hidden]=\"model.log_per_site\"  name=\"Binary\" value=\"binary\"></field>\n            </enum>\n        </fieldset>\n\n        <fieldset *ngIf=\"model.log_per_site && model.log_file_format == 'w3c' && model.log_target\" class=\"flags\">\n            <label>Write logs into</label>\n            <checkbox2 [(model)]=\"model.log_target.file\" (modelChanged)=\"onModelChanged()\">Log File(s)</checkbox2>\n            <checkbox2 [(model)]=\"model.log_target.etw\" (modelChanged)=\"onModelChanged()\">Event Tracing for Windows (ETW)</checkbox2>\n        </fieldset>\n\n        <fieldset>\n            <label>Encoding</label>\n            <enum [disabled]=\"model.website\" [(model)]=\"model.log_file_encoding\" (modelChanged)=\"onModelChanged()\">\n                <field name=\"UTF-8\" value=\"utf-8\"></field>\n                <field name=\"ANSI\" value=\"ansi\"></field>\n            </enum>\n        </fieldset>\n    "
        })
    ], FormatComponent);
    return FormatComponent;
}());
exports.FormatComponent = FormatComponent;
//# sourceMappingURL=format.component.js.map