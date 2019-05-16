import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiFile } from '../../files/file';
import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { Logging } from './logging';
import { LoggingService } from './logging.service';
import { NotificationService } from '../../notification/notification.service';

@Component({
    template: `
        <loading *ngIf="service.status == 'unknown' && !service.error"></loading>
        <error [error]="service.error"></error>
        <switch label="Enable"
                *ngIf="service.webserverScope && service.status != 'unknown'"
                class="install" #s
                [auto]="false"
                [model]="service.status == 'started' || service.status == 'starting'"
                [disabled]="service.status == 'starting' || service.status == 'stopping'"
                (modelChanged)="install(!s.model)">
                    <span *ngIf="!isPending()">{{s.model ? "On" : "Off"}}</span>
                    <span *ngIf="isPending()" class="loading"></span>
        </switch>
        <span *ngIf="service.status == 'stopped' && !service.webserverScope">Logging is off. Turn it on <a [routerLink]="['/webserver/logging']">here</a></span>
        <override-mode class="pull-right" *ngIf="logging" [scope]="logging.scope" [metadata]="logging.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
        <div *ngIf="logging">
            <fieldset class="collect">
                <switch label="Collect Logs" class="block" [(model)]="logging.enabled" (modelChanged)="onModelChanged()">{{logging.enabled ? "On" : "Off"}}</switch>
            </fieldset>
            <tabs [hidden]="!logging.enabled && logging.scope">
                <tab *ngIf="this.logging.scope && logging.log_per_site" [name]="'Logs'">
                    <log-files></log-files>
                </tab>
                <tab *ngIf="'true'" [name]="'Settings'">
                    <fieldset class="path">
                        <label>Directory</label>
                        <input [disabled]="!logging.log_per_site && logging.website" type="text" class="form-control left-with-button" [(ngModel)]="logging.directory" throttle (modelChanged)="onModelChanged()" throttle required />
                        <button title="Select Folder" [class.background-active]="fileSelector.isOpen()" class="select" (click)="fileSelector.toggle()"></button>
                        <server-file-selector #fileSelector [types]="['directory']" [defaultPath]="logging.directory" (selected)="onSelectPath($event)"></server-file-selector>
                    </fieldset>
                    <fieldset *ngIf="!logging.website">
                        <switch label="Separate Log per Web Site" class="block" [(model)]="logging.log_per_site" (modelChanged)="onModelChanged()">{{logging.log_per_site ? "On" : "Off"}}</switch>
                    </fieldset>
                    <fieldset>
                        <format [model]="logging" (modelChange)="onModelChanged()"></format>
                    </fieldset>
                </tab>
                <tab *ngIf="logging.log_per_site || !logging.website" [name]="'Rollover'">
                    <rollover [model]="logging.rollover" (modelChange)="onModelChanged()"></rollover>
                </tab>
                <tab *ngIf="logging.log_fields" [name]="'Log Fields'">
                    <logfields [model]="logging.log_fields" (modelChange)="onModelChanged()"></logfields>
                    <br />
                    <customfields *ngIf="logging.custom_log_fields" [(model)]="logging.custom_log_fields" (modelChange)="onModelChanged()"></customfields>
                </tab>
            </tabs>
        </div>
    `,
    styles: [`
        .collect {
            margin-bottom: 30px;
        }

        fieldset {
            padding-left: 0;
        }
    `]
})
export class LoggingComponent implements OnInit, OnDestroy {
    id: string;
    logging: Logging;

    private _original: Logging;
    private _error: any;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _service: LoggingService,
                private _notificationService: NotificationService) {
    }

    get service() {
        return this._service;
    }

    ngOnInit() {
        this._subscriptions.push(this._service.logging.subscribe(logging => this.setFeature(logging)));
        this._service.initialize(this.id);
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    onModelChanged() {
        if (!this.logging) {
            return;
        }

        // Set up diff object
        var changes = DiffUtil.diff(this._original, this.logging);
        if (Object.keys(changes).length == 0) {
            return;
        }

        //
        // Update
        this._service.update(changes);
    }

    onRevert() {
        this._service.revert();
    }

    private setFeature(logging: Logging) {
        this.logging = logging;
        this._original = JSON.parse(JSON.stringify(logging));
    }

    private onSelectPath(target: Array<ApiFile>) {
        this.logging.directory = target[0].physical_path;
        this.onModelChanged();
    }

    private isPending(): boolean {
        return this._service.status == Status.Starting
            || this._service.status == Status.Stopping;
    }

    private install(val: boolean) {
        if (val) {
            return this._service.install();
        }
        else {
            this._notificationService.confirm("Turn Off Logging", 'This will turn off "Logging" for the entire web server.')
                .then(confirmed => {
                    if (confirmed) {
                        this._service.uninstall();
                    }
                });
        }
    }
}
