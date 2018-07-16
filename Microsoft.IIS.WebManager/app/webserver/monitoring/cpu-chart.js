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
var ng2_charts_1 = require("ng2-charts");
var monitoring_service_1 = require("./monitoring.service");
var monitoring_component_1 = require("./monitoring.component");
var CpuChart = /** @class */ (function () {
    function CpuChart(_svc) {
        this._svc = _svc;
        this._subscriptionId = null;
        this._length = 20;
        this._snapshot = null;
        this._options = {
            responsive: true,
            legend: {
                position: 'bottom'
            },
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                            steps: 10,
                            stepValue: 10,
                            min: 0,
                            max: 100
                        }
                    }
                ],
                xAxes: [
                    {
                        gridLines: {
                            display: false
                        }
                    }
                ]
            },
            elements: {
                line: {
                    tension: 0,
                }
            }
        };
        this._colors = this.colors;
        this._labels = [];
        this._serverCpuValues = [];
        this._systemCpuValues = [];
        this._avgCpu = 0;
        this._data = [
            { data: this._serverCpuValues, label: 'Web Server CPU %' },
            { data: this._systemCpuValues, label: 'Total CPU %' }
        ];
        for (var i = 0; i < this._length; i++) {
            this._labels.push('');
        }
        this.activate();
    }
    CpuChart.prototype.activate = function () {
        var _this = this;
        this._subscriptionId = this._svc.subscribe(function (snapshot) { return _this.consumeSnapshot(snapshot); });
    };
    CpuChart.prototype.deactivate = function () {
        this._svc.unsubscribe(this._subscriptionId);
    };
    CpuChart.prototype.ngOnDestroy = function () {
        this.deactivate();
    };
    CpuChart.prototype.consumeSnapshot = function (snapshot) {
        var _this = this;
        this._snapshot = snapshot;
        //
        // CPU
        this._serverCpuValues.push(snapshot.cpu.percent_usage);
        if (this._serverCpuValues.length > this._length) {
            this._serverCpuValues.shift();
        }
        this._systemCpuValues.push(snapshot.cpu.system_percent_usage);
        if (this._systemCpuValues.length > this._length) {
            this._systemCpuValues.shift();
        }
        //
        // Average CPU
        this._avgCpu = 0;
        this._serverCpuValues.forEach(function (val) { return _this._avgCpu += val; });
        this._avgCpu = Math.floor(this._avgCpu / this._serverCpuValues.length);
        //
        // Update graph
        if (this._chart && this._chart.chart) {
            this._chart.chart.update();
        }
    };
    Object.defineProperty(CpuChart.prototype, "colors", {
        get: function () {
            var colors = monitoring_component_1.MonitoringComponent.DefaultColors;
            colors[0].backgroundColor = 'rgba(0,0,0,.1)';
            return colors;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        core_1.ViewChild('chart'),
        __metadata("design:type", ng2_charts_1.BaseChartDirective)
    ], CpuChart.prototype, "_chart", void 0);
    CpuChart = __decorate([
        core_1.Component({
            selector: 'cpu-chart',
            template: "\n        <div class=\"row chart-info\" *ngIf=\"_snapshot\">\n            <div class=\"col-xs-4\">\n                <div>\n                    <label>\n                        CPU Utilization\n                    </label>\n                    <tooltip>\n                        Total CPU usage by web server processes. CPU utilization from other processes is ignored.\n                    </tooltip>\n                </div>\n                {{_snapshot.cpu.percent_usage}} %\n            </div>\n            <div class=\"col-xs-4\">\n                <div>\n                    <label>\n                        Processes\n                    </label>\n                    <tooltip>\n                        Total number of web server processes.\n                    </tooltip>\n                </div>\n                {{_snapshot.cpu.processes}}\n            </div>\n            <div class=\"col-xs-4\">\n                <div>\n                    <label>\n                        Threads\n                    </label>\n                    <tooltip>\n                        Total number of threads in web server processes.\n                    </tooltip>\n                </div>\n                {{_snapshot.cpu.threads}}\n            </div>\n        </div>\n        <div class=\"block\">\n            <canvas #chart='base-chart' baseChart width=\"600\" height=\"200\"\n                        [datasets]=\"_data\"\n                        [labels]=\"_labels\"\n                        [options]=\"_options\"\n                        [colors]=\"_colors\"\n                        [legend]=\"true\"\n                        [chartType]=\"'line'\"></canvas>\n        </div>\n    ",
            styleUrls: [
                'app/webserver/monitoring/monitoring.css'
            ]
        }),
        __metadata("design:paramtypes", [monitoring_service_1.MonitoringService])
    ], CpuChart);
    return CpuChart;
}());
exports.CpuChart = CpuChart;
//# sourceMappingURL=cpu-chart.js.map