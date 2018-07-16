"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var router_1 = require("@angular/router");
var ng2_charts_1 = require("ng2-charts");
var bmodel_1 = require("../../common/bmodel");
var tooltip_component_1 = require("../../common/tooltip.component");
var monitoring_component_1 = require("./monitoring.component");
var requests_chart_1 = require("./requests-chart");
var network_chart_1 = require("./network-chart");
var memory_chart_1 = require("./memory-chart");
var cpu_chart_1 = require("./cpu-chart");
var monitoring_service_1 = require("./monitoring.service");
var MonitoringModule = /** @class */ (function () {
    function MonitoringModule() {
    }
    MonitoringModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                router_1.RouterModule,
                bmodel_1.Module,
                tooltip_component_1.Module,
                ng2_charts_1.ChartsModule
            ],
            declarations: [
                monitoring_component_1.MonitoringComponent,
                requests_chart_1.RequestsChart,
                network_chart_1.NetworkChart,
                memory_chart_1.MemoryChart,
                cpu_chart_1.CpuChart
            ],
            providers: [
                monitoring_service_1.MonitoringService
            ]
        })
    ], MonitoringModule);
    return MonitoringModule;
}());
exports.MonitoringModule = MonitoringModule;
//# sourceMappingURL=monitoring.module.js.map