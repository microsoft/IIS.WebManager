
import {Component, Input, Output, EventEmitter} from '@angular/core';

import {IpRestrictions} from './ip-restrictions'

@Component({
    selector: 'dynamic-restrictions',
    template: `
        <div class="block">
            <fieldset class="first-fieldset">
                <switch label="Restrict Concurrent Requests" class="block" [(model)]="model.deny_by_concurrent_requests.enabled" (modelChanged)="onModelChanged()">{{model.deny_by_concurrent_requests.enabled ? "Yes" : "No"}}</switch>
            </fieldset>
            <fieldset *ngIf="model.deny_by_concurrent_requests.enabled">
                <label>Max Concurrent Requests</label>
                <input class="form-control" type="number" required [(ngModel)]="model.deny_by_concurrent_requests.max_concurrent_requests" throttle (modelChanged)="onModelChanged()" />
            </fieldset>
        </div>

        <div class="block">
            <fieldset class="first-fieldset">
                <switch label="Restrict Request Rate" class="block" [(model)]="model.deny_by_request_rate.enabled" (modelChanged)="onModelChanged()">{{model.deny_by_request_rate.enabled ? "Yes" : "No"}}</switch>
            </fieldset>
            <fieldset *ngIf="model.deny_by_request_rate.enabled">
                <label>Max Requests</label>
                <input class="form-control" type="number" required [(ngModel)]="model.deny_by_request_rate.max_requests" throttle (modelChanged)="onModelChanged()" />
            </fieldset>
            <fieldset *ngIf="model.deny_by_request_rate.enabled">
                <label>Per Time Period<span class="units"> (ms)</span></label>
                <input class="form-control" type="number" required [(ngModel)]="model.deny_by_request_rate.time_period" throttle (modelChanged)="onModelChanged()" />
            </fieldset>
        </div>

        <fieldset>
            <switch label="Log Only When Denied" class="block" [(model)]="model.logging_only_mode" (modelChanged)="onModelChanged()">{{model.logging_only_mode ? "Yes" : "No"}}</switch>
        </fieldset>
    `,
    styles: [`
        .block > .first-fieldset {
            width: 250px;
        }

        fieldset {
            display: inline-block;
            margin-right: 32px;
        }
    `]
})
export class DynamicRestrictionsComponent {
    @Input() model: IpRestrictions;
    @Output() modelChange: any = new EventEmitter();

    onModelChanged() {
        this.modelChange.emit(this.model);
    }
}
