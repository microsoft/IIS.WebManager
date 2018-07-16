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
var NetworkChart = /** @class */ (function () {
    function NetworkChart(_svc) {
        this._svc = _svc;
        this._subscriptionId = null;
        this._length = 20;
        this._snapshot = null;
        this.formatNumber = primitives_1.Humanizer.number;
        this.formatMemory = primitives_1.Humanizer.memory;
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
                                if (value == 0) {
                                    return value;
                                }
                                // float values less than five causing y axis scale label clipping https://github.com/chartjs/Chart.js/issues/729
                                else if (values[0] < 6) {
                                    return value.toFixed(1);
                                }
                                else if (value < 1) {
                                    return value.toFixed(1);
                                }
                                else if (value < 1024) {
                                    return value;
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
                    fill: false
                }
            }
        };
        this._colors = monitoring_component_1.MonitoringComponent.DefaultColors;
        this._bytesSentSecValues = [];
        this._bytesRecvSecValues = [];
        this._labels = [];
        this._data = [
            { data: this._bytesSentSecValues, label: 'Bytes Sent / sec' },
            { data: this._bytesRecvSecValues, label: 'Bytes Recv /sec' }
        ];
        for (var i = 0; i < this._length; i++) {
            this._labels.push('');
        }
        this.activate();
    }
    NetworkChart.prototype.activate = function () {
        var _this = this;
        this._subscriptionId = this._svc.subscribe(function (snapshot) { return _this.consumeSnapshot(snapshot); });
    };
    NetworkChart.prototype.deactivate = function () {
        this._svc.unsubscribe(this._subscriptionId);
    };
    NetworkChart.prototype.ngOnDestroy = function () {
        this.deactivate();
    };
    NetworkChart.prototype.consumeSnapshot = function (snapshot) {
        this._snapshot = snapshot;
        //
        // Network
        this._bytesSentSecValues.push(snapshot.network.bytes_sent_sec);
        if (this._bytesSentSecValues.length > this._length) {
            this._bytesSentSecValues.shift();
        }
        this._bytesRecvSecValues.push(snapshot.network.bytes_recv_sec);
        if (this._bytesRecvSecValues.length > this._length) {
            this._bytesRecvSecValues.shift();
        }
        //
        // Update graphs
        if (this._networkChart && this._networkChart.chart) {
            this._networkChart.chart.update();
        }
    };
    __decorate([
        core_1.ViewChild('chart'),
        __metadata("design:type", ng2_charts_1.BaseChartDirective)
    ], NetworkChart.prototype, "_networkChart", void 0);
    NetworkChart = __decorate([
        core_1.Component({
            selector: 'network-chart',
            template: "\n        <div class=\"row chart-info\" *ngIf=\"_snapshot\">\n            <div class=\"col-xs-4\">\n                <label class=\"block\">\n                    Total Bytes Sent\n                </label>\n                {{formatMemory(_snapshot.network.total_bytes_sent)}}\n            </div>\n            <div class=\"col-xs-4\">\n                <label class=\"block\">\n                    Total Bytes Received\n                </label>\n                {{formatMemory(_snapshot.network.total_bytes_recv)}}\n            </div>\n            <div class=\"col-xs-4\">\n                <div>\n                    <label>\n                        Active Connections\n                    </label>\n                    <tooltip>\n                        Total number of current network connections that are open on the web server.\n                    </tooltip>\n                </div>\n                {{formatNumber(_snapshot.network.current_connections)}}\n            </div>\n            <div class=\"clearfix visible-xs-block\"></div>\n        </div>\n        <div class=\"block\">\n            <canvas #chart='base-chart' baseChart width=\"600\" height=\"200\"\n                        [datasets]=\"_data\"\n                        [labels]=\"_labels\"\n                        [options]=\"_options\"\n                        [colors]=\"_colors\"\n                        [legend]=\"true\"\n                        [chartType]=\"'line'\"></canvas>\n        </div>\n    ",
            styleUrls: [
                'app/webserver/monitoring/monitoring.css'
            ]
        }),
        __metadata("design:paramtypes", [monitoring_service_1.MonitoringService])
    ], NetworkChart);
    return NetworkChart;
}());
exports.NetworkChart = NetworkChart;
//# sourceMappingURL=network-chart.js.map