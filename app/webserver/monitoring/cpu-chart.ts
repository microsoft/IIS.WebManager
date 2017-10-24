import { Component, OnDestroy, ViewChild } from '@angular/core';

import { BaseChartDirective } from 'ng2-charts';

import { MonitoringService } from './monitoring.service';
import { ServerSnapshot } from './server-snapshot';

@Component({
    selector: 'cpu-chart',
    template: `
        <div class="row" *ngIf="_snapshot">
            <div class="col-xs-4">
                <div>
                    <label>
                        Process Count
                    </label>
                    <tooltip>
                        Total number of all web server worker processes being used to serve requests.
                    </tooltip>
                </div>
                {{_snapshot.cpu.processes}}
            </div>
            <div class="col-xs-4">
                <div>
                    <label>
                        Thread Count
                    </label>
                    <tooltip>
                        Total number of active threads that have been created by web server processes.
                    </tooltip>
                </div>
                {{_snapshot.cpu.threads}}
            </div>
            <div class="col-xs-4">
                <div>
                    <label>
                        Average CPU Usage
                    </label>
                    <tooltip>
                        Average CPU usage by the web server's process. Other processes CPU utilization is ignored.
                    </tooltip>
                </div>
                {{_avgCpu}} %
            </div>
        </div>
        <div *ngIf="_svc.apiInstalled" class="block">
            <canvas #chart='base-chart' baseChart width="600" height="200"
                        [datasets]="_data"
                        [labels]="_labels"
                        [options]="_options"
                        [colors]="_colors"
                        [legend]="true"
                        [chartType]="'line'"></canvas>
        </div>
    `,
})
export class CpuChart implements OnDestroy {

    private _subscriptionId: number = null;
    private _length = 20;
    private _snapshot: ServerSnapshot = null;

    private _options: any = {
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

    private _colors: Array<any> = [
        {
            // Gray
            backgroundColor: 'rgba(148,159,177,0.2)',
            borderColor: 'rgba(148,159,177,1)',
            pointBackgroundColor: 'rgba(148,159,177,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        },
    ];

    private _labels: Array<string> = [];
    private _serverCpuValues: Array<number> = [];
    private _systemCpuValues: Array<number> = [];
    private _avgCpu = 0;

    @ViewChild('chart') private _chart: BaseChartDirective;

    private _data: Array<any> = [
        { data: this._systemCpuValues, label: 'System' },
        { data: this._serverCpuValues, label: 'Web Server' }
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
}
