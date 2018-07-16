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
var primitives_1 = require("../../common/primitives");
var monitoring_service_1 = require("./monitoring.service");
var monitoring_component_1 = require("./monitoring.component");
var MemoryChart = /** @class */ (function () {
    function MemoryChart(_svc) {
        this._svc = _svc;
        this._subscriptionId = null;
        this._length = 20;
        this._snapshot = null;
        this.humanizeMemory = primitives_1.Humanizer.memory;
        this._options = {
            responsive: true,
            legend: {
                position: 'bottom'
            },
            scales: {
                yAxes: [
                    {
                        scaleLabel: {
                            display: false,
                        },
                        ticks: {
                            min: 0,
                            // Create labels
                            callback: function (value, index, values) {
                                if (value == 0) {
                                    return 0;
                                }
                                return primitives_1.Humanizer.memory(value);
                            }
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
        this._serverMemValues = [];
        this._systemMemValues = [];
        this._data = [
            { data: this._serverMemValues, label: 'Web Server Usage' },
            { data: this._systemMemValues, label: 'Total Usage' }
        ];
        for (var i = 0; i < this._length; i++) {
            this._labels.push('');
        }
        this.activate();
    }
    MemoryChart.prototype.activate = function () {
        var _this = this;
        this._subscriptionId = this._svc.subscribe(function (snapshot) { return _this.consumeSnapshot(snapshot); });
    };
    MemoryChart.prototype.deactivate = function () {
        this._svc.unsubscribe(this._subscriptionId);
    };
    MemoryChart.prototype.ngOnDestroy = function () {
        this.deactivate();
    };
    MemoryChart.prototype.consumeSnapshot = function (snapshot) {
        this._snapshot = snapshot;
        this._options.scales.yAxes[0].ticks.max = snapshot.memory.installed;
        //
        // Memory, Web server in use
        this._serverMemValues.push(snapshot.memory.private_working_set);
        if (this._serverMemValues.length > this._length) {
            this._serverMemValues.shift();
        }
        //
        // Memory, System in use
        this._systemMemValues.push(snapshot.memory.system_in_use);
        if (this._systemMemValues.length > this._length) {
            this._systemMemValues.shift();
        }
        //
        // Update graphs
        if (this._memChart && this._memChart.chart) {
            this._memChart.chart.options.scales.yAxes[0].ticks.max = snapshot.memory.installed;
            var steps = 3;
            var height = this._memChart.chart.height;
            if (height <= 122) {
                steps = 1;
            }
            else if (height >= 229) {
                steps = 7;
            }
            this._memChart.chart.options.scales.yAxes[0].ticks.stepSize = snapshot.memory.installed / steps;
            this._memChart.chart.update();
        }
    };
    Object.defineProperty(MemoryChart.prototype, "colors", {
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
    ], MemoryChart.prototype, "_memChart", void 0);
    MemoryChart = __decorate([
        core_1.Component({
            selector: 'memory-chart',
            template: "\n        <div class=\"row chart-info\" *ngIf=\"_snapshot\">\n            <div class=\"col-xs-4\">\n                <div>\n                    <label>\n                        Available\n                    </label>\n                    <tooltip>\n                        The amount of memory available for the web server to begin using.\n                    </tooltip>\n                </div>\n                {{humanizeMemory(_snapshot.memory.installed - _snapshot.memory.system_in_use)}}\n            </div>\n        </div>\n        <div class=\"block\">\n            <canvas #chart='base-chart' baseChart width=\"600\" height=\"200\"\n                        [datasets]=\"_data\"\n                        [labels]=\"_labels\"\n                        [options]=\"_options\"\n                        [colors]=\"_colors\"\n                        [legend]=\"true\"\n                        [chartType]=\"'line'\"></canvas>\n        </div>\n    ",
            styleUrls: [
                'app/webserver/monitoring/monitoring.css'
            ]
        }),
        __metadata("design:paramtypes", [monitoring_service_1.MonitoringService])
    ], MemoryChart);
    return MemoryChart;
}());
exports.MemoryChart = MemoryChart;
//# sourceMappingURL=memory-chart.js.map