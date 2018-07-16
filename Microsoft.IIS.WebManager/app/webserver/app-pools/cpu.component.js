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
var CpuComponent = /** @class */ (function () {
    function CpuComponent() {
        this.modelChanged = new core_1.EventEmitter();
    }
    CpuComponent.prototype.onModelChanged = function () {
        this.modelChanged.emit(null);
    };
    CpuComponent.prototype.onLimitCpu = function (value) {
        if (value) {
            this.model.limit = 100000;
        }
        else {
            this.model.limit = 0;
        }
        this.onModelChanged();
    };
    CpuComponent.prototype.onThrottled = function (value) {
        if (value) {
            this.model.action = app_pool_1.ProcessorAction.Throttle;
        }
        else {
            this.model.action = app_pool_1.ProcessorAction.NoAction;
        }
        this.onModelChanged();
    };
    CpuComponent.prototype.onThrottleUnderLoad = function (value) {
        if (value) {
            this.model.action = app_pool_1.ProcessorAction.ThrottleUnderLoad;
        }
        else {
            this.model.action = app_pool_1.ProcessorAction.Throttle;
        }
        this.onModelChanged();
    };
    CpuComponent.prototype.onKillProcess = function (value) {
        if (value) {
            this.model.action = app_pool_1.ProcessorAction.KillW3wp;
        }
        else {
            this.model.action = app_pool_1.ProcessorAction.NoAction;
        }
        this.onModelChanged();
    };
    CpuComponent.prototype.onCpuLimit = function (value) {
        if (value > 100 || value <= 0) {
            return;
        }
        this.model.limit = value * 1000;
        this.onModelChanged();
    };
    CpuComponent.prototype.isThrottled = function () {
        return this.model.action == app_pool_1.ProcessorAction.Throttle || this.model.action == app_pool_1.ProcessorAction.ThrottleUnderLoad;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", app_pool_1.Cpu)
    ], CpuComponent.prototype, "model", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], CpuComponent.prototype, "modelChanged", void 0);
    CpuComponent = __decorate([
        core_1.Component({
            selector: 'cpu',
            template: "            \n        <fieldset>\n            <label>CPU Limit</label>\n            <switch class=\"block\" [model]=\"model.limit != 0\" (modelChange)=\"onLimitCpu($event)\">\n                {{model.limit != 0 ? \"On\" : \"Off\"}}\n            </switch>\n        </fieldset>\n\n        <div *ngIf=\"model.limit != 0\">\n            <fieldset class='inline-block'>\n                <label>% CPU Utilization</label>\n                <input class=\"form-control\" type=\"number\" [ngModel]=\"model.limit / 1000\" (ngModelChange)=\"onCpuLimit($event)\" min=\"1\" max=\"100\" step=\"any\" required throttle />\n            </fieldset>\n            <fieldset class='inline-block' *ngIf=\"!isThrottled()\">\n                <label>Interval <span class=\"units\">(min)</span></label>\n                <input class=\"form-control\" type=\"number\" [(ngModel)]=\"model.limit_interval\" throttle (modelChanged)=\"onModelChanged()\" />\n            </fieldset>\n        </div>\n\n        <div *ngIf=\"model.limit != 0\">\n            <fieldset class='inline-block'>\n                <label>Throttle CPU</label>\n                <switch class=\"block\" [model]=\"isThrottled()\" (modelChange)=\"onThrottled($event)\">\n                    {{isThrottled() ? \"On\" : \"Off\"}}\n                </switch>\n            </fieldset>\n\n            <fieldset class='inline-block' *ngIf='isThrottled()'>\n                <label>Under Load Only</label>\n                <switch class=\"block\" [model]=\"model.action == 'ThrottleUnderLoad'\" (modelChange)=\"onThrottleUnderLoad($event)\">\n                    {{model.action == 'ThrottleUnderLoad' ? \"On\" : \"Off\"}}\n                </switch>\n            </fieldset>\n\n            <fieldset>\n                <label>Kill Worker Process</label>\n                <switch class=\"block\" [model]=\"model.action == 'KillW3wp'\" (modelChange)=\"onKillProcess($event)\">\n                    {{model.action == 'KillW3wp' ? \"On\" : \"Off\"}}\n                </switch>\n            </fieldset>\n        </div>\n\n        <fieldset class='inline-block'>\n            <label>CPU Affinity</label>\n            <switch class=\"block\" [(model)]=\"model.processor_affinity_enabled\" (modelChanged)=\"onModelChanged()\">\n                {{model.processor_affinity_enabled ? \"On\" : \"Off\"}}\n            </switch>\n        </fieldset>\n        <div *ngIf=\"model.processor_affinity_enabled\" class='inline-block'>\n            <fieldset class='inline-block'>\n                <label>Affinity Mask 32bit</label>\n                <input class=\"form-control\" type=\"text\" [(ngModel)]=\"model.processor_affinity_mask32\" (modelChanged)=\"onModelChanged()\" required pattern=\"0[xX][0-9a-fA-F]+\" throttle />\n            </fieldset>\n            <fieldset class='inline-block'>\n                <label>Affinity Mask 64bit</label>\n                <input class=\"form-control\" type=\"text\" [(ngModel)]=\"model.processor_affinity_mask64\" (modelChanged)=\"onModelChanged()\" required pattern=\"0[xX][0-9a-fA-F]+\" throttle />\n            </fieldset>\n        </div>\n    "
        })
    ], CpuComponent);
    return CpuComponent;
}());
exports.CpuComponent = CpuComponent;
//# sourceMappingURL=cpu.component.js.map