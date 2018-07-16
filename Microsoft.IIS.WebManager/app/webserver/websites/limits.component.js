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
var site_1 = require("./site");
var LimitsComponent = /** @class */ (function () {
    function LimitsComponent() {
        this.modelChanged = new core_1.EventEmitter();
    }
    LimitsComponent.prototype.onModelChanged = function () {
        this.modelChanged.emit(null);
    };
    LimitsComponent.prototype.onBandwidth = function (value) {
        if (!value) {
            this.model.max_bandwidth = primitives_1.UInt32.Max;
        }
        else {
            this.model.max_bandwidth = 10 * 1000 * 1024; // 10MB/s
        }
        this.onModelChanged();
    };
    LimitsComponent.prototype.onConnectionsLimit = function (value) {
        if (!value) {
            this.model.max_connections = primitives_1.UInt32.Max;
        }
        else {
            this.model.max_connections = 1000000;
        }
        this.onModelChanged();
    };
    LimitsComponent.prototype.hasBandwidthLimit = function () {
        return this.model.max_bandwidth < primitives_1.UInt32.Max;
    };
    LimitsComponent.prototype.hasConnectionsLimit = function () {
        return this.model.max_connections < primitives_1.UInt32.Max;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", site_1.Limits)
    ], LimitsComponent.prototype, "model", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], LimitsComponent.prototype, "modelChanged", void 0);
    LimitsComponent = __decorate([
        core_1.Component({
            selector: 'limits',
            template: "\n        <fieldset>\n            <label>Connection Timeout <span class=\"units\">(s)</span></label>\n            <input class=\"form-control\" type=\"number\" required [(ngModel)]=\"model.connection_timeout\" (modelChanged)=\"onModelChanged()\" throttle />\n        </fieldset>\n        <div>\n            <fieldset class=\"inline-block\">\n                <label>Network Throttling</label>\n                <switch class=\"block\" [model]=\"hasBandwidthLimit()\" (modelChange)=\"onBandwidth($event)\">{{hasBandwidthLimit() ? \"On\" : \"Off\"}}</switch>\n            </fieldset>\n            <fieldset *ngIf=\"hasBandwidthLimit()\" class=\"inline-block\">\n                <label>Bandwidth <span class=\"units\">(bytes/s)</span></label>\n                <input class=\"form-control\" type=\"number\" required [(ngModel)]=\"model.max_bandwidth\" (modelChanged)=\"onModelChanged()\" throttle />\n            </fieldset>\n        </div>\n        <div>\n            <fieldset class=\"inline-block\">\n                <label>Client Connections</label>\n                <switch class=\"block\" [model]=\"hasConnectionsLimit()\" (modelChange)=\"onConnectionsLimit($event)\">{{hasConnectionsLimit() ? \"On\" : \"Off\"}}</switch>\n            </fieldset>\n\n            <fieldset *ngIf=\"hasConnectionsLimit()\" class=\"inline-block\">\n                <label>Max Connections</label>\n                <input class=\"form-control\" type=\"number\" required [(ngModel)]=\"model.max_connections\" (modelChanged)=\"onModelChanged()\" throttle />\n            </fieldset>\n        </div>\n        <fieldset>\n            <label>Max Url Segments</label>\n            <input class=\"form-control\" type=\"number\" required [(ngModel)]=\"model.max_url_segments\" (modelChanged)=\"onModelChanged()\" throttle/>\n        </fieldset>\n    ",
            styles: ["\n    "
            ]
        })
    ], LimitsComponent);
    return LimitsComponent;
}());
exports.LimitsComponent = LimitsComponent;
//# sourceMappingURL=limits.component.js.map