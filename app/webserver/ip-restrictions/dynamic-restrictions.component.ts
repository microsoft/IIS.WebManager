/// <reference path="../../../node_modules/@angular/core/src/core.d.ts" />

import {Component, Input, Output, EventEmitter} from '@angular/core';

import {IpRestrictions} from './ip-restrictions'

@Component({
    selector: 'dynamic-restrictions',
    template: `
        <div class="block">
            <fieldset class="inline-block">
                <label>Restrict Concurrent Requests</label>
                <switch class="block" [(model)]="model.deny_by_concurrent_requests.enabled" (modelChanged)="onModelChanged()">{{model.deny_by_concurrent_requests.enabled ? "Yes" : "No"}}</switch>
            </fieldset>
            <fieldset class="inline-block" *ngIf="model.deny_by_concurrent_requests.enabled">
                <label>Max Concurrent Requests</label>
                <input class="form-control" type="number" required [(ngModel)]="model.deny_by_concurrent_requests.max_concurrent_requests" throttle (modelChanged)="onModelChanged()" />
            </fieldset>
        </div>

        <div class="block">
            <fieldset class="inline-block">
                <label>Restrict Request Rate</label>
                <switch class="block" [(model)]="model.deny_by_request_rate.enabled" (modelChanged)="onModelChanged()">{{model.deny_by_request_rate.enabled ? "Yes" : "No"}}</switch>
            </fieldset>
            <fieldset class="inline-block">
                <fieldset class="inline-block" *ngIf="model.deny_by_request_rate.enabled">
                    <label>Max Requests</label>
                    <input class="form-control" type="number" required [(ngModel)]="model.deny_by_request_rate.max_requests" throttle (modelChanged)="onModelChanged()" />
                </fieldset>
                <fieldset class="inline-block" *ngIf="model.deny_by_request_rate.enabled">
                    <label>Per Time Period<span class="units"> (ms)</span></label>
                    <input class="form-control" type="number" required [(ngModel)]="model.deny_by_request_rate.time_period" throttle (modelChanged)="onModelChanged()" />
                </fieldset>
            </fieldset>
        </div>

        <fieldset>
            <label>Log Only When Denied</label>
            <switch class="block" [(model)]="model.logging_only_mode" (modelChanged)="onModelChanged()">{{model.logging_only_mode ? "On" : "Off"}}</switch>
        </fieldset>
    `,
    styles: [`
        .block > .inline-block:first-of-type {
            width: 250px;
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