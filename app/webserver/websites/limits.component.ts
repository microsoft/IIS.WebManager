
import {Component, Input, Output, EventEmitter} from '@angular/core';
import {NgModel} from '@angular/forms';

import {UInt32} from '../../common/primitives';
import {Limits} from './site';


@Component({
    selector: 'limits',
    template: `
        <fieldset>
            <label>Connection Timeout <span class="units">(s)</span></label>
            <input class="form-control" type="number" required [(ngModel)]="model.connection_timeout" (modelChanged)="onModelChanged()" throttle />
        </fieldset>
        <div>
            <fieldset class="inline-block">
                <label>Network Throttling</label>
                <switch class="block" [model]="hasBandwidthLimit()" (modelChange)="onBandwidth($event)">{{hasBandwidthLimit() ? "On" : "Off"}}</switch>
            </fieldset>
            <fieldset *ngIf="hasBandwidthLimit()" class="inline-block">
                <label>Bandwidth <span class="units">(bytes/s)</span></label>
                <input class="form-control" type="number" required [(ngModel)]="model.max_bandwidth" (modelChanged)="onModelChanged()" throttle />
            </fieldset>
        </div>
        <div>
            <fieldset class="inline-block">
                <label>Client Connections</label>
                <switch class="block" [model]="hasConnectionsLimit()" (modelChange)="onConnectionsLimit($event)">{{hasConnectionsLimit() ? "On" : "Off"}}</switch>
            </fieldset>

            <fieldset *ngIf="hasConnectionsLimit()" class="inline-block">
                <label>Max Connections</label>
                <input class="form-control" type="number" required [(ngModel)]="model.max_connections" (modelChanged)="onModelChanged()" throttle />
            </fieldset>
        </div>
        <fieldset>
            <label>Max Url Segments</label>
            <input class="form-control" type="number" required [(ngModel)]="model.max_url_segments" (modelChanged)="onModelChanged()" throttle/>
        </fieldset>
    `,
    styles: [`
    `
    ]
})
export class LimitsComponent {
    @Input() model: Limits;
    @Output() modelChanged: EventEmitter<any> = new EventEmitter();

    onModelChanged() {
        this.modelChanged.emit(null);
    }

    onBandwidth(value: boolean) {
        if (!value) {
            this.model.max_bandwidth = UInt32.Max;
        }
        else {
            this.model.max_bandwidth = 10 * 1000 * 1024; // 10MB/s
        }

        this.onModelChanged();
    }

    onConnectionsLimit(value: boolean) {
        if (!value) {
            this.model.max_connections = UInt32.Max;
        }
        else {
            this.model.max_connections = 1000000;
        }

        this.onModelChanged();
    }

    hasBandwidthLimit(): boolean {
        return this.model.max_bandwidth < UInt32.Max;
    }

    hasConnectionsLimit(): boolean {
        return this.model.max_connections < UInt32.Max;
    }
}
