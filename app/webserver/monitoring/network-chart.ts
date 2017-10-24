import { Component, OnDestroy, ViewChild } from '@angular/core';

import { BaseChartDirective } from 'ng2-charts';

import { MonitoringService } from './monitoring.service';
import { ServerSnapshot } from './server-snapshot';

@Component({
    selector: 'network-chart',
    template: `
        <div class="row" *ngIf="_snapshot">
            <div class="col-xs-4">
                <label class="block">
                    Total Bytes Sent
                </label>
                {{_snapshot.network.total_bytes_sent}}
            </div>
            <div class="col-xs-4">
                <label class="block">
                    Total Bytes Received
                </label>
                {{_snapshot.network.total_bytes_recv}}
            </div>
            <div class="col-xs-4">
                <div>
                    <label>
                        Active Connections
                    </label>
                    <tooltip>
                        Total number of current network connections that are open on the web server.
                    </tooltip>
                </div>
                {{_snapshot.network.current_connections}}
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
export class NetworkChart implements OnDestroy {

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

    private _bytesSentSecValues: Array<number> = [];
    private _bytesRecvSecValues: Array<number> = [];
    private _labels: Array<string> = [];

    @ViewChild('chart') private _networkChart: BaseChartDirective;

    private _data: Array<any> = [
        { data: this._bytesSentSecValues, label: 'Bytes Sent / sec' },
        { data: this._bytesRecvSecValues, label: 'Bytes Recv /sec' }
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
    }
}
