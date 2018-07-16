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
var monitoring_service_1 = require("./monitoring.service");
var MonitoringComponent = /** @class */ (function () {
    function MonitoringComponent(_svc) {
        this._svc = _svc;
        this.activate();
    }
    MonitoringComponent.prototype.activate = function () {
        this._svc.activate();
    };
    MonitoringComponent.prototype.deactivate = function () {
        this._svc.deactivate();
    };
    MonitoringComponent.prototype.ngOnDestroy = function () {
        this.deactivate();
    };
    Object.defineProperty(MonitoringComponent, "DefaultColors", {
        get: function () {
            return [
                {
                    backgroundColor: 'rgba(0,0,0,.02)',
                    borderColor: '#0077ce',
                    pointBackgroundColor: '#0077ce',
                    pointBorderColor: '#d4d4d4',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
                },
                {
                    backgroundColor: 'rgba(0,0,0,.02)',
                    borderColor: '#907c48',
                    pointBackgroundColor: '#907c48',
                    pointBorderColor: '#d4d4d4',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
                },
            ];
        },
        enumerable: true,
        configurable: true
    });
    MonitoringComponent = __decorate([
        core_1.Component({
            template: "\n        <div *ngIf=\"!_svc.apiInstalled\">\n            The monitoring component has not been installed. Update to the <a [routerLink]=\"['/get']\">latest version</a> to begin\n            using this feature.\n        </div>\n\n        <div *ngIf=\"_svc.apiInstalled\">\n            <div class=\"row\">\n                <div class=\"col-lg-5\">\n                    <h2>\n                        Requests\n                    </h2>\n                    <requests-chart></requests-chart>\n                </div>\n                <div class=\"col-lg-1 visible-lg\">\n                </div>\n                <div class=\"col-lg-5\">\n                    <h2>\n                        Network\n                    </h2>\n                    <network-chart></network-chart>\n                </div>\n            </div>\n\n\n            <div>\n                <div class=\"row\">\n                    <div class=\"col-lg-5\">\n                        <h2>\n                            Memory\n                        </h2>\n                        <memory-chart></memory-chart>\n                    </div>\n                    <div class=\"col-lg-1 visible-lg\">\n                    </div>\n                    <div class=\"col-lg-5\">\n                        <h2>\n                            CPU\n                        </h2>\n                        <cpu-chart></cpu-chart>\n                    </div>\n                </div>\n            </div>\n        </div>\n    "
        }),
        __metadata("design:paramtypes", [monitoring_service_1.MonitoringService])
    ], MonitoringComponent);
    return MonitoringComponent;
}());
exports.MonitoringComponent = MonitoringComponent;
//# sourceMappingURL=monitoring.component.js.map