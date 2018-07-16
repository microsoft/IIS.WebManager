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
var ProcessModelComponent = /** @class */ (function () {
    function ProcessModelComponent() {
        this.modelChanged = new core_1.EventEmitter();
    }
    ProcessModelComponent.prototype.onModelChanged = function () {
        this.modelChanged.emit(null);
    };
    ProcessModelComponent.prototype.onWebGarden = function (value) {
        if (!value) {
            this.model.process_model.max_processes = 1;
        }
        else {
            this.model.process_model.max_processes = 2;
        }
        this.onModelChanged();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", app_pool_1.ApplicationPool)
    ], ProcessModelComponent.prototype, "model", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ProcessModelComponent.prototype, "modelChanged", void 0);
    ProcessModelComponent = __decorate([
        core_1.Component({
            selector: 'process-model',
            template: "\n        <fieldset>\n            <label>Process Bitness</label>\n            <enum [(model)]=\"model.enable_32bit_win64\" (modelChanged)=\"onModelChanged()\">\n                <field name=\"32 bit\" value=\"true\"></field>\n                <field name=\"64 bit\" value=\"false\"></field>\n            </enum>\n        </fieldset>\n        <div>\n            <fieldset class=\"inline-block\">\n                <label>Web Garden</label>\n                <switch class=\"block\" [model]=\"model.process_model.max_processes > 1\" (modelChange)=\"onWebGarden($event)\">\n                    {{model.process_model.max_processes > 1 ? \"On\" : \"Off\"}}\n                </switch>\n            </fieldset>\n            <fieldset class=\"inline-block\" *ngIf=\"model.process_model.max_processes > 1\">\n                <label>Max Processes</label>\n                <div class=\"validation-container\">\n                    <input class=\"form-control\" type=\"number\" [(ngModel)]=\"model.process_model.max_processes\" throttle (modelChanged)=\"onModelChanged()\" />\n                </div>\n            </fieldset>\n        </div>\n        <div>\n            <fieldset class=\"inline-block\">\n                <label>Idle Timeout <span class=\"units\">(min)</span></label>\n                <div class=\"validation-container\">\n                    <input class=\"form-control\" type=\"number\" [(ngModel)]=\"model.process_model.idle_timeout\" throttle (modelChanged)=\"onModelChanged()\" />\n                </div>\n            </fieldset>\n            <fieldset class=\"inline-block\" *ngIf='model.process_model.idle_timeout_action'>\n                <label>Idle Action</label>\n                <enum [(model)]=\"model.process_model.idle_timeout_action\" (modelChanged)=\"onModelChanged()\">\n                    <field name=\"Terminate\" value=\"Terminate\"></field>\n                    <field name=\"Suspend\" value=\"Suspend\"></field>\n                </enum>\n            </fieldset>\n        </div>\n        <fieldset>\n            <label>Startup Timeout <span class=\"units\">(s)</span></label>\n            <div class=\"validation-container\">\n                <input class=\"form-control\" type=\"number\" [(ngModel)]=\"model.process_model.startup_time_limit\" throttle (modelChanged)=\"onModelChanged()\" />\n            </div>\n        </fieldset>\n        <fieldset>\n            <label>Shutdown Timeout <span class=\"units\">(s)</span></label>\n            <div class=\"validation-container\">\n                <input class=\"form-control\" type=\"number\" [(ngModel)]=\"model.process_model.shutdown_time_limit\" throttle (modelChanged)=\"onModelChanged()\" />\n            </div>\n        </fieldset>\n        <div>\n            <fieldset class=\"inline-block\">\n                <label>Health Monitoring</label>\n                <switch class=\"block\" [(model)]=\"model.process_model.pinging_enabled\" (modelChanged)=\"onModelChanged()\">\n                    {{model.process_model.pinging_enabled ? \"On\" : \"Off\"}}\n                </switch>\n            </fieldset>\n            <div *ngIf=\"model.process_model.pinging_enabled\" class=\"inline-block\">\n                <fieldset class=\"inline-block\">\n                    <label>Ping Interval <span class=\"units\">(s)</span></label>\n                    <div class=\"validation-container\">\n                        <input class=\"form-control\" type=\"number\" [(ngModel)]=\"model.process_model.ping_interval\" throttle (modelChanged)=\"onModelChanged()\" />\n                    </div>\n                </fieldset>\n                <fieldset class=\"inline-block\">\n                    <label>Max Response Time <span class=\"units\">(s)</span></label>\n                    <div class=\"validation-container\">\n                        <input class=\"form-control\" type=\"number\" [(ngModel)]=\"model.process_model.ping_response_time\" throttle (modelChanged)=\"onModelChanged()\" />\n                    </div>\n                </fieldset>\n            </div>\n        </div>\n    "
        })
    ], ProcessModelComponent);
    return ProcessModelComponent;
}());
exports.ProcessModelComponent = ProcessModelComponent;
var ProcessOrphaningComponent = /** @class */ (function () {
    function ProcessOrphaningComponent() {
        this.modelChanged = new core_1.EventEmitter();
    }
    ProcessOrphaningComponent.prototype.onModelChanged = function () {
        this.modelChanged.emit(null);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", app_pool_1.ProcessOrphaning)
    ], ProcessOrphaningComponent.prototype, "model", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ProcessOrphaningComponent.prototype, "modelChanged", void 0);
    ProcessOrphaningComponent = __decorate([
        core_1.Component({
            selector: 'process-orphaning',
            template: "            \n        <fieldset>\n            <label>Process Orphaning</label>\n            <switch class=\"block\" [(model)]=\"model.enabled\" (modelChanged)=\"onModelChanged()\">\n                {{model.enabled ? \"On\" : \"Off\"}}\n            </switch>\n        </fieldset>\n        <div *ngIf=\"model.enabled\">\n            <fieldset>\n                <label>Action Path</label>\n                <input class=\"form-control path\" type=\"text\" [(ngModel)]=\"model.orphan_action_exe\" throttle (modelChanged)=\"onModelChanged()\" />\n            </fieldset>\n            <fieldset>\n                <label>Action Parameters</label>\n                <input class=\"form-control path\" type=\"text\" [(ngModel)]=\"model.orphan_action_params\" throttle (modelChanged)=\"onModelChanged()\" />\n            </fieldset>\n        </div>\n    "
        })
    ], ProcessOrphaningComponent);
    return ProcessOrphaningComponent;
}());
exports.ProcessOrphaningComponent = ProcessOrphaningComponent;
//# sourceMappingURL=process.component.js.map