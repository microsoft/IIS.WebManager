import { Component, OnDestroy, ViewChild } from '@angular/core';

import { BaseChartDirective } from 'ng2-charts';

import { MonitoringService } from './monitoring.service';
import { ServerSnapshot } from './server-snapshot';

@Component({
    selector: 'requests-chart',
    template: `
        <div class="row" *ngIf="_snapshot">
            <div class="col-xs-4">
                <div>
                    <label>
                        Total Requests
                    </label>
                    <tooltip>
                        Total number of HTTP requests served since the web server started.
                    </tooltip>
                </div>
                {{_snapshot.requests.total}}
            </div>
            <div class="col-xs-4">
                <div>
                    <label>
                        Active Requests
                    </label>
                    <tooltip>
                        Total number of requests that are currently being processed.
                    </tooltip>
                </div>
                {{_snapshot.requests.active}}
            </div>
            <div class="col-xs-4">
                <label class="block">
                    Average Requests / sec
                </label>
                {{_avgRps}}
            </div>
            <div class="clearfix visible-xs-block"></div>
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
export class RequestsChart implements OnDestroy {

    private _subscriptionId: number = null;
    private _length = 20;
    private _snapshot: ServerSnapshot = null;

    private _options: any = {
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

    private _rpsValues: Array<number> = [];
    private _avgRpsValues: Array<number> = [];
    private _labels: Array<string> = [];
    private _avgRps = 0;

    @ViewChild('chart') private _rpsChart: BaseChartDirective;

    private _data: Array<any> = [
        { data: this._rpsValues, label: 'Requests / sec' },
        { data: this._avgRpsValues, label: 'Avg Requests / sec', hidden: true }
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
        // Rps
        this._rpsValues.push(snapshot.requests.per_sec);

        if (this._rpsValues.length > this._length) {
            this._rpsValues.shift();
        }

        //
        // Average Rps
        this._avgRps = 0;
        this._rpsValues.forEach(val => this._avgRps += val);
        this._avgRps = Math.floor(this._avgRps / this._rpsValues.length);

        this._avgRpsValues.push(this._avgRps);

        if (this._avgRpsValues.length > this._length) {
            this._avgRpsValues.shift();
        }

        //
        // Update graphs
        if (this._rpsChart && this._rpsChart.chart) {
            this._rpsChart.chart.update();
        }
    }
}
