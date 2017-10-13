import { Component, OnDestroy, ViewChild } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';

import { BaseChartDirective } from 'ng2-charts';

import { MonitoringService } from './monitoring.service';
import { ServerSnapshot } from './server-snapshot';

@Component({
    template: `
        <div>

            <h2>
                Requests
            </h2>
            <div class="row" *ngIf="_snapshot">
                <div class="col-lg-2 col-md-3 col-xs-4">
                    <label class="block">
                        Total Requests
                    </label>
                    {{_snapshot.requests.total}}
                </div>
                <div class="col-lg-2 col-md-3 col-xs-4">
                    <label class="block">
                        Active Requests
                    </label>
                    {{_snapshot.requests.active}}
                </div>
                <div class="col-lg-2 col-md-3 col-xs-4">
                    <label class="block">
                        Average Requests / sec
                    </label>
                    {{_avgRps}}
                </div>
                <div class="clearfix visible-xs-block"></div>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div style="display: block;">
                    <canvas #rpsChart='base-chart' baseChart width="600" height="200"
                                [datasets]="_rpsData"
                                [labels]="_emptyLabels"
                                [options]="_zeroedChartOptions"
                                [colors]="lineChartColors"
                                [legend]="true"
                                [chartType]="'line'"></canvas>
                </div>
              </div>
            </div>

            <h2>
                Memory
            </h2>
            <div class="row" *ngIf="_snapshot">
                <div class="col-lg-2 col-md-3 col-xs-4">
                    <label class="block">
                        Available
                    </label>
                    {{humanizeMemory(_snapshot.memory.installed - _snapshot.memory.system_in_use)}}
                </div>
            </div>
            <div class="row">
              <div class="col-md-6">
                <div style="display: block;">
                    <canvas #memChart='base-chart' baseChart width="600" height="200"
                                [datasets]="_memData"
                                [labels]="_emptyLabels"
                                [options]="_memoryChartOptions"
                                [colors]="lineChartColors"
                                [legend]="true"
                                [chartType]="'line'"></canvas>
                </div>
              </div>
            </div>

            <h2>
                CPU
            </h2>
            <div class="row" *ngIf="_snapshot">
                <div class="col-lg-2 col-md-3 col-xs-4">
                    <label class="block">
                        Process Count
                    </label>
                    {{_snapshot.cpu.processes}}
                </div>
                <div class="col-lg-2 col-md-3 col-xs-4">
                    <label class="block">
                        Thread Count
                    </label>
                    {{_snapshot.cpu.threads}}
                </div>
                <div class="col-lg-2 col-md-3 col-xs-4">
                    <label class="block">
                        Average CPU Usage
                    </label>
                    {{_avgCpu}} %
                </div>
            </div>
            <div class="row">
              <div class="col-md-6">
                <div style="display: block;">
                    <canvas #cpuChart='base-chart' baseChart width="600" height="200"
                                [datasets]="_cpuData"
                                [labels]="_emptyLabels"
                                [options]="_cpuChartOptions"
                                [colors]="lineChartColors"
                                [legend]="true"
                                [chartType]="'line'"></canvas>
                </div>
              </div>
            </div>

            <h2>
                Network
            </h2>
            <div class="row" *ngIf="_snapshot">
                <div class="col-lg-2 col-md-3 col-xs-4">
                    <label class="block">
                        Total Bytes Sent
                    </label>
                    {{_snapshot.network.total_bytes_sent}}
                </div>
                <div class="col-lg-2 col-md-3 col-xs-4">
                    <label class="block">
                        Total Bytes Recv
                    </label>
                    {{_snapshot.network.total_bytes_recv}}
                </div>
                <div class="col-lg-2 col-md-3 col-xs-4">
                    <label class="block">
                        Active Connections
                    </label>
                    {{_snapshot.network.current_connections}}
                </div>
                <div class="clearfix visible-xs-block"></div>
            </div>
            <div class="row">
              <div class="col-md-6">
                <div style="display: block;">
                    <canvas #networkChart='base-chart' baseChart width="600" height="200"
                                [datasets]="_networkData"
                                [labels]="_emptyLabels"
                                [options]="_zeroedChartOptions"
                                [colors]="lineChartColors"
                                [legend]="true"
                                [chartType]="'line'"></canvas>
                </div>
              </div>
            </div>

        </div>
    `,
    styles: [`
        th,
        td {
            margin-right: 15px;
        }
    `]
})
export class MonitoringComponent implements OnDestroy {

    private _subscriptions: Array<Subscription> = [];
    private _snapshot: ServerSnapshot;

    private _chartLength = 20;
    private _requestInterval = 1000;

    private _chartOptions: any = {
        responsive: true
    };

    private _zeroedChartOptions: any = {
        responsive: true,
        scales: {
            yAxes: [
                {
                    ticks: {
                        min: 0
                    }
                }
            ],
            xAxes: [
            ]
        }
    };

    private _cpuChartOptions: any = {
        responsive: true,
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
            ]
        }
    }

    private _memoryChartOptions: any = {
        responsive: true,
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
                            return Math.floor(value / 1024 / 1024 / 1024) + ' GB';
                        }
                    }
                }
            ],
            xAxes: [
            ]
        }
    }

    private _rpsValues: Array<number> = [];
    private _avgRpsValues: Array<number> = [];
    private _emptyLabels: Array<string> = [];
    private _avgRps = 0;

    private _serverMemValues: Array<number> = [];
    private _systemMemValues: Array<number> = [];

    private _serverCpuValues: Array<number> = [];
    private _systemCpuValues: Array<number> = [];
    private _avgCpu = 0;

    private _bytesSentSecValues: Array<number> = [];
    private _bytesRecvSecValues: Array<number> = [];

    @ViewChild('rpsChart') private _rpsChart: BaseChartDirective;
    @ViewChild('memChart') private _memChart: BaseChartDirective;
    @ViewChild('cpuChart') private _cpuChart: BaseChartDirective;
    @ViewChild('networkChart') private _networkChart: BaseChartDirective;

    private _rpsData: Array<any> = [
        { data: this._rpsValues, label: 'Requests / sec' },
        { data: this._avgRpsValues, label: 'Avg Requests / sec', hidden: true }
    ];
    private _memData: Array<any> = [
        { data: this._systemMemValues, label: 'System' },
        { data: this._serverMemValues, label: 'Web Server' }
    ];
    private _cpuData: Array<any> = [
        { data: this._systemCpuValues, label: 'System' },
        { data: this._serverCpuValues, label: 'Web Server' }
    ];
    private _networkData: Array<any> = [
        { data: this._bytesSentSecValues, label: 'Bytes Sent / sec' },
        { data: this._bytesRecvSecValues, label: 'Bytes Recv /sec' }
    ];

    constructor(private _svc: MonitoringService) {
        for (let i = 0; i < this._chartLength; i++) {
            this._emptyLabels.push('');
        }

        this._subscriptions.push(IntervalObservable.create(this._requestInterval).subscribe(() => {
            this._svc.getSnapshot()
                .then(snapshot => {
                    this.consumeSnapshot(snapshot);
                });
        }));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());

        console.log("Destroyed monitoring component.");
    }

    // lineChart

    public lineChartColors: Array<any> = [
        { // grey
            backgroundColor: 'rgba(148,159,177,0.2)',
            borderColor: 'rgba(148,159,177,1)',
            pointBackgroundColor: 'rgba(148,159,177,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        },
    ];

    private _initialized = false;
    private _f = null;
    private consumeSnapshot(snapshot: ServerSnapshot) {
        this._snapshot = snapshot;

        //
        // Rps
        this._rpsValues.push(snapshot.requests.per_sec);

        if (this._rpsValues.length > this._chartLength) {
            this._rpsValues.shift();
        }

        //
        // Average Rps
        this._avgRps = 0;
        this._rpsValues.forEach(val => this._avgRps += val);
        this._avgRps = Math.floor(this._avgRps / this._rpsValues.length);

        this._avgRpsValues.push(this._avgRps);

        if (this._avgRpsValues.length > this._chartLength) {
            this._avgRpsValues.shift();
        }

        this._memoryChartOptions.scales.yAxes[0].ticks.max = snapshot.memory.installed;

        //
        // Memory, Web server in use
        this._serverMemValues.push(snapshot.memory.private_working_set);

        if (this._serverMemValues.length > this._chartLength) {
            this._serverMemValues.shift();
        }

        //
        // Memory, System in use
        this._systemMemValues.push(snapshot.memory.system_in_use);

        if (this._systemMemValues.length > this._chartLength) {
            this._systemMemValues.shift();
        }

        //
        // CPU
        this._serverCpuValues.push(snapshot.cpu.percent_usage);

        if (this._serverCpuValues.length > this._chartLength) {
            this._serverCpuValues.shift();
        }

        this._systemCpuValues.push(snapshot.cpu.system_percent_usage);

        if (this._systemCpuValues.length > this._chartLength) {
            this._systemCpuValues.shift();
        }

        //
        // Average CPU
        this._avgCpu = 0;
        this._serverCpuValues.forEach(val => this._avgCpu += val);
        this._avgCpu = Math.floor(this._avgCpu / this._serverCpuValues.length);

        //
        // Network
        this._bytesSentSecValues.push(snapshot.network.bytes_sent_sec);

        if (this._bytesSentSecValues.length > this._chartLength) {
            this._bytesSentSecValues.shift();
        }

        this._bytesRecvSecValues.push(snapshot.network.bytes_recv_sec);

        if (this._bytesRecvSecValues.length > this._chartLength) {
            this._bytesRecvSecValues.shift();
        }

        //
        // Update graphs
        if (this._rpsChart && this._rpsChart.chart) {
            this._rpsChart.chart.update();
        }

        if (this._memChart && this._memChart.chart) {
            this._memChart.chart.options.scales.yAxes[0].ticks.max = snapshot.memory.installed
            this._memChart.chart.options.scales.yAxes[0].ticks.stepSize = snapshot.memory.installed
            this._memChart.chart.update();
        }

        if (this._cpuChart && this._cpuChart.chart) {
            this._cpuChart.chart.update();
        }

        if (this._networkChart && this._networkChart.chart) {
            this._networkChart.chart.update();
        }
    }

    private humanizeMemory(val: number) {

        const units = ['B', 'KB', 'MB', 'GB'];

        let i = 0;


        while (val > 1024) {
            val /= 1024;
            i++;
        }

        return Math.floor(val) + ' ' + units[i];
    }
}
