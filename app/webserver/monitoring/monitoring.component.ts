import { Component, OnDestroy } from '@angular/core';

import { MonitoringService } from './monitoring.service';

@Component({
    template: `
        <div *ngIf="!_svc.apiInstalled">
            The monitoring component has not been installed. Update to the <a [routerLink]="['/get']">latest version</a> to begin using this feature.
        </div>
        
        <div *ngIf="_svc.apiInstalled">
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
    `
})
export class MonitoringComponent implements OnDestroy {

    constructor(private _svc: MonitoringService) {
        this.activate();
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
}
