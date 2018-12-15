import { Component, OnDestroy } from '@angular/core';

import { MonitoringService } from './monitoring.service';

@Component({
    selector: 'monitoring',
    template: `
        <div *ngIf="!svc.apiInstalled">
            The monitoring component has not been installed. Update to the <a [routerLink]="['/get']">latest version</a> to begin
            using this feature.
        </div>

        <div *ngIf="svc.apiInstalled">
            <div class="row">
                <div class="col-lg-5">
                    <h2>
                        Requests
                    </h2>
                    <requests-chart></requests-chart>
                </div>
                <div class="col-lg-1 visible-lg">
                </div>
                <div class="col-lg-5">
                    <h2>
                        Network
                    </h2>
                    <network-chart></network-chart>
                </div>
            </div>


            <div>
                <div class="row">
                    <div class="col-lg-5">
                        <h2>
                            Memory
                        </h2>
                        <memory-chart></memory-chart>
                    </div>
                    <div class="col-lg-1 visible-lg">
                    </div>
                    <div class="col-lg-5">
                        <h2>
                            CPU
                        </h2>
                        <cpu-chart></cpu-chart>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class MonitoringComponent implements OnDestroy {

    constructor(private _svc: MonitoringService) {
        this.activate();
    }

    get svc() {
        return this._svc;
    }

    public activate() {
        this._svc.activate();
    }

    public deactivate() {
        this._svc.deactivate();
    }

    public ngOnDestroy() {
        this.deactivate();
    }

    public static get DefaultColors(): any {
        return [
            {
                backgroundColor: 'rgba(0,0,0,.02)',
                borderColor: '#0077ce',
                pointBackgroundColor: '#0077ce',
                pointBorderColor: '#d4d4d4',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(148,159,177,0.8)'
            },
            {
                backgroundColor: 'rgba(0,0,0,.02)',
                borderColor: '#8b4298',
                pointBackgroundColor: '#8b4298',
                pointBorderColor: '#d4d4d4',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(148,159,177,0.8)'
            },
        ];
    }
}
