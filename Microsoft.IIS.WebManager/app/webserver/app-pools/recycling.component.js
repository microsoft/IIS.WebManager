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
var primitives_1 = require("../../common/primitives");
var string_list_component_1 = require("../../common/string-list.component");
var DailyScheduleComponent = /** @class */ (function () {
    function DailyScheduleComponent() {
        this.modelChange = new core_1.EventEmitter();
    }
    DailyScheduleComponent.prototype.onModelChanged = function () {
        this.modelChange.emit(this.model);
    };
    DailyScheduleComponent.prototype.enable = function (value) {
        if (!value) {
            this.model.splice(0, this.model.length);
        }
        else {
            this.model.push("00:00");
        }
        this.onModelChanged();
    };
    DailyScheduleComponent.prototype.addTime = function () {
        this.times.add();
    };
    DailyScheduleComponent.prototype.validator = function (val) {
        var regexp = /\b(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]\b/;
        return val && regexp.test(val) ? null : { valid: false };
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], DailyScheduleComponent.prototype, "model", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], DailyScheduleComponent.prototype, "modelChange", void 0);
    __decorate([
        core_1.ViewChild('times'),
        __metadata("design:type", string_list_component_1.StringListComponent)
    ], DailyScheduleComponent.prototype, "times", void 0);
    DailyScheduleComponent = __decorate([
        core_1.Component({
            selector: 'daily-schedule',
            template: "\n        <div *ngIf=\"model\">\n            <fieldset class='inline-block'>\n                <label>Schedule</label>\n                <switch class=\"block\" [model]=\"model.length > 0\" (modelChange)=\"enable($event)\">\n                    {{model.length > 0 ? \"On\" : \"Off\"}}\n                </switch>\n            </fieldset>\n            <fieldset class='inline-block add' *ngIf='model.length > 0'>\n                <button (click)=\"addTime()\"><i class=\"fa fa-plus color-active\"></i>Add Time</button>\n            </fieldset>\n            <string-list #times=\"stringList\" [(model)]=\"model\" (modelChanged)=\"onModelChanged($event)\" [validator]=\"validator\" [title]=\"'HH:MM'\"></string-list>\n        </div>\n    ",
            styles: ["\n        .grid-list {\n            margin-left: 0;\n        }\n        \n        fieldset.add {\n            padding-top: 40px;\n            margin-right: 0;\n        }\n    "]
        })
    ], DailyScheduleComponent);
    return DailyScheduleComponent;
}());
exports.DailyScheduleComponent = DailyScheduleComponent;
var RecyclingComponent = /** @class */ (function () {
    function RecyclingComponent() {
        this.modelChanged = new core_1.EventEmitter();
    }
    RecyclingComponent.prototype.onModelChanged = function () {
        this.modelChanged.emit(this.model);
    };
    RecyclingComponent.prototype.onPrivateMemory = function (value) {
        if (!value) {
            this.model.periodic_restart.private_memory = 0;
        }
        else {
            this.model.periodic_restart.private_memory = 500000; // 500MB
        }
    };
    RecyclingComponent.prototype.onVirtualMemory = function (value) {
        if (!value) {
            this.model.periodic_restart.virtual_memory = 0;
        }
        else {
            this.model.periodic_restart.virtual_memory = 1000000; // 1GB
        }
    };
    RecyclingComponent.prototype.onRequestLimit = function (value) {
        if (!value) {
            this.model.periodic_restart.request_limit = 0;
        }
        else {
            this.model.periodic_restart.request_limit = 9999999;
        }
        this.onModelChanged();
    };
    RecyclingComponent.prototype.onTimeInterval = function (value) {
        if (!value) {
            this.model.periodic_restart.time_interval = primitives_1.TimeSpan.MaxMinutes;
        }
        else {
            this.model.periodic_restart.time_interval = 29 * 60; // Default (29 hours)
        }
        this.onModelChanged();
    };
    RecyclingComponent.prototype.onSchedule = function (value) {
        if (!value) {
            this.model.periodic_restart.schedule = [];
        }
        else {
            this.model.periodic_restart.schedule.push("00:00:00");
        }
        this.onModelChanged();
    };
    RecyclingComponent.prototype.addTime = function () {
        this.model.periodic_restart.schedule.splice(0, 0, "01:00:00");
        this.onModelChanged();
    };
    RecyclingComponent.prototype.timeIntervalEnabled = function () {
        return this.model.periodic_restart.time_interval < primitives_1.TimeSpan.MaxMinutes;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", app_pool_1.Recycling)
    ], RecyclingComponent.prototype, "model", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], RecyclingComponent.prototype, "modelChanged", void 0);
    RecyclingComponent = __decorate([
        core_1.Component({
            selector: 'recycling',
            template: "\n    <div class='row'>\n        <div class='col-sm-7 col-lg-4'>\n            <div>\n                <fieldset>\n                    <label>Overlapped Recycle</label>\n                    <switch class=\"block\" [model]=\"!model.disable_overlapped_recycle\" (modelChange)=\"model.disable_overlapped_recycle = !$event\" (modelChanged)=\"onModelChanged()\">\n                        {{model.disable_overlapped_recycle ? \"Off\" : \"On\"}}\n                    </switch>\n                </fieldset>\n                <fieldset>\n                    <label>Config Change</label>\n                    <switch class=\"block\" [model]=\"!model.disable_recycle_on_config_change\" (modelChange)=\"model.disable_recycle_on_config_change = !$event\" (modelChanged)=\"onModelChanged()\">\n                        {{model.disable_recycle_on_config_change ? \"Off\" : \"On\"}}\n                    </switch>\n                </fieldset>\n            </div>\n            <div>\n                <fieldset class='inline-block'>\n                    <label>Private Memory</label>\n                    <switch class=\"block\" [model]=\"model.periodic_restart.private_memory > 0\" (modelChange)=\"onPrivateMemory($event)\">\n                        {{model.periodic_restart.private_memory > 0 ? \"On\" : \"Off\"}}\n                    </switch>\n                </fieldset>\n                <fieldset class='inline-block' *ngIf='model.periodic_restart.private_memory > 0'>\n                    <label>Memory Limit <span class=\"units\">(KB)</span></label>\n                    <input class=\"form-control\" type=\"number\" [(ngModel)]=\"model.periodic_restart.private_memory\" throttle (modelChanged)=\"onModelChanged()\" />\n                </fieldset>\n            </div>    \n            <div>\n                <fieldset class='inline-block'>\n                    <label>Virtual Memory</label>\n                    <switch class=\"block\" [model]=\"model.periodic_restart.virtual_memory > 0\" (modelChange)=\"onVirtualMemory($event)\">\n                        {{model.periodic_restart.virtual_memory > 0 ? \"On\" : \"Off\"}}\n                    </switch>\n                </fieldset>\n                <fieldset class='inline-block' *ngIf='model.periodic_restart.virtual_memory > 0'>\n                    <label>Memory Limit <span class=\"units\">(KB)</span></label>\n                    <input class=\"form-control\" type=\"number\" [(ngModel)]=\"model.periodic_restart.virtual_memory\" throttle (modelChanged)=\"onModelChanged()\" />\n                </fieldset>\n            </div>    \n            <div>\n                <fieldset class='inline-block'>\n                    <label>Request Limit</label>\n                    <switch class=\"block\" [model]=\"model.periodic_restart.request_limit > 0\" (modelChange)=\"onRequestLimit($event)\">\n                        {{model.periodic_restart.request_limit > 0 ? \"On\" : \"Off\"}}\n                    </switch>\n                </fieldset>\n                <fieldset class='inline-block' *ngIf='model.periodic_restart.request_limit > 0'>\n                    <label>Total Requests</label>\n                    <input class=\"form-control\" type=\"number\" [(ngModel)]=\"model.periodic_restart.request_limit\" throttle (modelChanged)=\"onModelChanged()\" />\n                </fieldset>\n            </div>\n            <div>\n                <fieldset class='inline-block'>\n                    <label>Periodically</label>\n                    <switch class=\"block\" [model]=\"timeIntervalEnabled()\" (modelChange)=\"onTimeInterval($event)\">\n                        {{timeIntervalEnabled() ? \"On\" : \"Off\"}}\n                    </switch>\n                </fieldset>\n                <fieldset class='inline-block' *ngIf='timeIntervalEnabled()'>\n                    <label>Time Interval <span class=\"units\">(min)</span></label>\n                    <input class=\"form-control\" type=\"number\" [(ngModel)]=\"model.periodic_restart.time_interval\" throttle (modelChanged)=\"onModelChanged()\" />\n                </fieldset>\n            </div>\n            <div>\n                <daily-schedule [(model)]=\"model.periodic_restart.schedule\" (modelChange)=\"onModelChanged()\"></daily-schedule>\n            </div>\n        </div>\n\n        <div class=\"col-sm-5\">\n            <fieldset>\n                <label>Log Events</label>\n                <div class=\"flags\">\n                    <checkbox2 [(model)]=\"model.log_events.time\" (modelChanged)=\"onModelChanged()\">Time</checkbox2>\n                    <checkbox2 [(model)]=\"model.log_events.requests\" (modelChanged)=\"onModelChanged()\">Requests</checkbox2>\n                    <checkbox2 [(model)]=\"model.log_events.schedule\" (modelChanged)=\"onModelChanged()\">Schedule</checkbox2>\n                    <checkbox2 [(model)]=\"model.log_events.memory\" (modelChanged)=\"onModelChanged()\">Memory</checkbox2>\n                    <checkbox2 [(model)]=\"model.log_events.isapi_unhealthy\" (modelChanged)=\"onModelChanged()\">Isapi Unhealthy</checkbox2>\n                    <checkbox2 [(model)]=\"model.log_events.on_demand\" (modelChanged)=\"onModelChanged()\">On Demand</checkbox2>\n                    <checkbox2 [(model)]=\"model.log_events.config_change\" (modelChanged)=\"onModelChanged()\">Config Change</checkbox2>\n                    <checkbox2 [(model)]=\"model.log_events.private_memory\" (modelChanged)=\"onModelChanged()\">Private Memory</checkbox2>\n                </div>\n            </fieldset>\n        </div>\n    </div>\n    ",
            styles: ["\n    "]
        })
    ], RecyclingComponent);
    return RecyclingComponent;
}());
exports.RecyclingComponent = RecyclingComponent;
//# sourceMappingURL=recycling.component.js.map