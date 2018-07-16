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
var RequestsChart = /** @class */ (function () {
    function RequestsChart(_svc) {
        this._svc = _svc;
        this._subscriptionId = null;
        this._length = 20;
        this._snapshot = null;
        this.formatNumber = primitives_1.Humanizer.number;
        this._options = {
            responsive: true,
            legend: {
                position: 'bottom'
            },
            scales: {
                yAxes: [
                    {
                        ticks: {
                            min: 0,
                            // Create labels
                            callback: function (value, index, values) {
                                // float values less than five causing y axis scale label clipping https://github.com/chartjs/Chart.js/issues/729
                                if (value > 0 && values[0] < 6) {
                                    return value.toFixed(1);
                                }
                                return value;
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
                    fill: false
                }
            }
        };
        this._colors = monitoring_component_1.MonitoringComponent.DefaultColors;
        this._rpsValues = [];
        this._activeRequestsValues = [];
        this._labels = [];
        this._data = [
            { data: this._rpsValues, label: 'Requests / sec' },
            { data: this._activeRequestsValues, label: 'Active Requests' }
        ];
        for (var i = 0; i < this._length; i++) {
            this._labels.push('');
        }
        this.activate();
    }
    RequestsChart.prototype.activate = function () {
        var _this = this;
        this._subscriptionId = this._svc.subscribe(function (snapshot) { return _this.consumeSnapshot(snapshot); });
    };
    RequestsChart.prototype.deactivate = function () {
        this._svc.unsubscribe(this._subscriptionId);
    };
    RequestsChart.prototype.ngOnDestroy = function () {
        this.deactivate();
    };
    RequestsChart.prototype.consumeSnapshot = function (snapshot) {
        this._snapshot = snapshot;
        //
        // Rps
        this._rpsValues.push(snapshot.requests.per_sec);
        if (this._rpsValues.length > this._length) {
            this._rpsValues.shift();
        }
        //
        // Active Requests
        this._activeRequestsValues.push(snapshot.requests.active);
        if (this._activeRequestsValues.length > this._length) {
            this._activeRequestsValues.shift();
        }
        //
        // Update graphs
        if (this._rpsChart && this._rpsChart.chart) {
            this._rpsChart.chart.update();
        }
    };
    __decorate([
        core_1.ViewChild('chart'),
        __metadata("design:type", ng2_charts_1.BaseChartDirective)
    ], RequestsChart.prototype, "_rpsChart", void 0);
    RequestsChart = __decorate([
        core_1.Component({
            selector: 'requests-chart',
            template: "\n        <div class=\"row chart-info\" *ngIf=\"_snapshot\">\n            <div class=\"col-xs-4\">\n                <div>\n                    <label>\n                        Total Requests\n                    </label>\n                    <tooltip>\n                        Total number of HTTP requests served since the web server started.\n                    </tooltip>\n                </div>\n                {{formatNumber(_snapshot.requests.total)}}\n            </div>\n            <div class=\"col-xs-4\">\n                <label class=\"block\">\n                    Requests / sec\n                </label>\n                {{formatNumber(_snapshot.requests.per_sec)}}\n            </div>\n            <div class=\"col-xs-4\">\n                <div>\n                    <label>\n                        Active Requests\n                    </label>\n                    <tooltip>\n                        Total number of requests that are currently being processed.\n                    </tooltip>\n                </div>\n                {{formatNumber(_snapshot.requests.active)}}\n            </div>\n            <div class=\"clearfix visible-xs-block\"></div>\n        </div>\n        <div class=\"block\">\n            <canvas #chart='base-chart' baseChart width=\"600\" height=\"200\"\n                        [datasets]=\"_data\"\n                        [labels]=\"_labels\"\n                        [options]=\"_options\"\n                        [colors]=\"_colors\"\n                        [legend]=\"true\"\n                        [chartType]=\"'line'\"></canvas>\n        </div>\n    ",
            styleUrls: [
                'app/webserver/monitoring/monitoring.css'
            ]
        }),
        __metadata("design:paramtypes", [monitoring_service_1.MonitoringService])
    ], RequestsChart);
    return RequestsChart;
}());
exports.RequestsChart = RequestsChart;
//# sourceMappingURL=requests-chart.js.map