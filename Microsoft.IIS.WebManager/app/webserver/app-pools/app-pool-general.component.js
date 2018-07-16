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
var app_pool_1 = require("./app-pool");
var AppPoolGeneralComponent = /** @class */ (function () {
    function AppPoolGeneralComponent() {
        this.modelChanged = new core_1.EventEmitter();
    }
    AppPoolGeneralComponent.prototype.onModelChanged = function () {
        // Bubble up model changed event to parent
        this.modelChanged.emit(null);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", app_pool_1.ApplicationPool)
    ], AppPoolGeneralComponent.prototype, "pool", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], AppPoolGeneralComponent.prototype, "modelChanged", void 0);
    AppPoolGeneralComponent = __decorate([
        core_1.Component({
            selector: 'app-pool-general',
            template: "\n        <tabs>\n            <tab [name]=\"'Settings'\">\n                <fieldset>\n                    <label>Name</label>\n                    <input class=\"form-control name\" type=\"text\" [(ngModel)]=\"pool.name\" (modelChanged)=\"onModelChanged()\" required throttle />\n                </fieldset>\n                <fieldset>\n                    <label>Auto Start</label>\n                    <switch class=\"block\" [(model)]=\"pool.auto_start\" (modelChanged)=\"onModelChanged()\">{{pool.auto_start ? \"On\" : \"Off\"}}</switch>\n                </fieldset>\n                <fieldset>\n                    <identity [model]=\"pool.identity\" (modelChanged)=\"onModelChanged()\"></identity>\n                </fieldset>\n                <fieldset>\n                    <label>Pipeline</label>\n                    <enum [(model)]=\"pool.pipeline_mode\" (modelChanged)=\"onModelChanged()\">\n                        <field name=\"Integrated\" value=\"integrated\"></field>\n                        <field name=\"Classic\" value=\"classic\"></field>\n                    </enum>\n                </fieldset>\n                <fieldset>\n                    <label>.NET Framework</label>\n                    <enum  [(model)]=\"pool.managed_runtime_version\" (modelChanged)=\"onModelChanged()\">\n                        <field name=\"3.5\" value=\"v2.0\"></field>\n                        <field name=\"4.x\" value=\"v4.0\"></field>\n                        <field name=\"None\" value=\"\"></field>\n                    </enum>\n                </fieldset>\n            </tab>\n            <tab [name]=\"'Process'\">\n                <process-model [model]=\"pool\" (modelChanged)=\"onModelChanged()\"></process-model>\n                <process-orphaning [model]=\"pool.process_orphaning\" (modelChanged)=\"onModelChanged()\"></process-orphaning>\n            </tab>\n            <tab [name]=\"'Fail Protection'\">\n                <rapid-fail-protection [model]=\"pool.rapid_fail_protection\" (modelChanged)=\"onModelChanged()\"></rapid-fail-protection>\n            </tab>\n            <tab [name]=\"'Recycling'\">\n                <recycling [model]=\"pool.recycling\" (modelChanged)=\"onModelChanged()\"></recycling>\n            </tab>\n            <tab [name]=\"'Limits'\">\n                <fieldset>\n                    <label>Request Queue Length</label>\n                    <div class=\"validation-container\">\n                        <input class=\"form-control\" type=\"number\" [(ngModel)]=\"pool.queue_length\" throttle (modelChanged)=\"onModelChanged()\" />\n                    </div>\n                </fieldset>\n                <cpu [model]=\"pool.cpu\" (modelChanged)=\"onModelChanged()\"></cpu>\n            </tab>\n        </tabs>\n    "
        })
    ], AppPoolGeneralComponent);
    return AppPoolGeneralComponent;
}());
exports.AppPoolGeneralComponent = AppPoolGeneralComponent;
//# sourceMappingURL=app-pool-general.component.js.map