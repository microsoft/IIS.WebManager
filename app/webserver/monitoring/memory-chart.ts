import { Component, OnDestroy, ViewChild } from '@angular/core';

import { BaseChartDirective } from 'ng2-charts';

import { Humanizer } from '../../common/primitives';
import { MonitoringService } from './monitoring.service';
import { MonitoringComponent } from './monitoring.component';
import { ServerSnapshot } from './server-snapshot';

@Component({
    selector: 'memory-chart',
    template: `
        <div class="row chart-info" *ngIf="_snapshot">
            <div class="col-xs-4">
                <div>
                    <label>
                        Available
                    </label>
                    <tooltip>
                        The amount of memory available for the web server to begin using.
                    </tooltip>
                </div>
                {{humanizeMemory(_snapshot.memory.installed - _snapshot.memory.system_in_use)}}
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
export class MemoryChart implements OnDestroy {

    private _subscriptionId: number = null;
    private _length = 20;
    private _snapshot: ServerSnapshot = null;
    private humanizeMemory = Humanizer.memory;

    private _options: any = {
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
                            return Math.floor(value / 1024 / 1024 / 1024) + ' GB';
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
    }

    private _colors: Array<any> = this.colors;

    private _labels: Array<string> = [];
    private _serverMemValues: Array<number> = [];
    private _systemMemValues: Array<number> = [];

    @ViewChild('chart') private _memChart: BaseChartDirective;

    private _data: Array<any> = [
        { data: this._serverMemValues, label: 'Web Server' },
        { data: this._systemMemValues, label: 'System' }
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
            this._memChart.chart.options.scales.yAxes[0].ticks.max = snapshot.memory.installed
            this._memChart.chart.options.scales.yAxes[0].ticks.stepSize = snapshot.memory.installed
            this._memChart.chart.update();
        }
    }

    private get colors() {
        let colors = MonitoringComponent.DefaultColors;

        colors[0].backgroundColor = 'rgba(0,0,0,.1)';

        return colors;
    }
}
