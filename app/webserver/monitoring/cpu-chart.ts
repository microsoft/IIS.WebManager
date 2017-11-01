import { Component, OnDestroy, ViewChild } from '@angular/core';

import { BaseChartDirective } from 'ng2-charts';

import { MonitoringService } from './monitoring.service';
import { MonitoringComponent } from './monitoring.component';
import { ServerSnapshot } from './server-snapshot';

@Component({
    selector: 'cpu-chart',
    template: `
        <div class="row chart-info" *ngIf="_snapshot">
            <div class="col-xs-4">
                <div>
                    <label>
                        Processes
                    </label>
                    <tooltip>
                        Total number of web server processes.
                    </tooltip>
                </div>
                {{_snapshot.cpu.processes}}
            </div>
            <div class="col-xs-4">
                <div>
                    <label>
                        Threads
                    </label>
                    <tooltip>
                        Total number of threads in web server processes.
                    </tooltip>
                </div>
                {{_snapshot.cpu.threads}}
            </div>
            <div class="col-xs-4">
                <div>
                    <label>
                        Average CPU
                    </label>
                    <tooltip>
                        Total average CPU usage by web server processes. CPU utilization from other processes is ignored.
                    </tooltip>
                </div>
                {{_avgCpu}} %
            </div>
        </div>
        <div class="block">
            <canvas #chart='base-chart' baseChart width="600" height="200"
                        [datasets]="_data"
                        [labels]="_labels"
                        [options]="_options"
                        [colors]="_colors"
                        [legend]="true"
                        [chartType]="'line'"></canvas>
        </div>
    `,
    styleUrls: [
        'app/webserver/monitoring/monitoring.css'
    ]
})
export class CpuChart implements OnDestroy {

    private _subscriptionId: number = null;
    private _length = 20;
    private _snapshot: ServerSnapshot = null;

    private _options: any = {
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
    }

    private _colors: Array<any> = this.colors

    private _labels: Array<string> = [];
    private _serverCpuValues: Array<number> = [];
    private _systemCpuValues: Array<number> = [];
    private _avgCpu = 0;

    @ViewChild('chart') private _chart: BaseChartDirective;

    private _data: Array<any> = [
        { data: this._serverCpuValues, label: 'Web Server' },
        { data: this._systemCpuValues, label: 'System' }
    ];

    constructor(private _svc: MonitoringService) {

        for (let i = 0; i < this._length; i++) {
            this._labels.push('');
        }

        this.activate();
    }

    public activate() {
        this._subscriptionId = this._svc.subscribe(snapshot => this.consumeSnapshot(snapshot));
    }

    public deactivate() {
        this._svc.unsubscribe(this._subscriptionId);
    }

    public ngOnDestroy() {
        this.deactivate();
    }

    private consumeSnapshot(snapshot: ServerSnapshot) {

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
        this._serverCpuValues.forEach(val => this._avgCpu += val);
        this._avgCpu = Math.floor(this._avgCpu / this._serverCpuValues.length);

        //
        // Update graph
        if (this._chart && this._chart.chart) {
            this._chart.chart.update();
        }
    }

    private get colors() {
        let colors = MonitoringComponent.DefaultColors;

        colors[0].backgroundColor = 'rgba(0,0,0,.1)';

        return colors;
    }
}
