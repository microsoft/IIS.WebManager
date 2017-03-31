import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { ApiFile } from '../../files/file';
import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { Logging, LogFileFormat } from './logging';
import { LoggingService } from './logging.service';
import { NotificationService } from '../../notification/notification.service';

@Component({
    template: `
        <loading *ngIf="_service.status == 'unknown' && !_service.error"></loading>
        <error [error]="_service.error"></error>
        <switch class="install" *ngIf="_service.webserverScope && _service.status != 'unknown'" #s
                [auto]="false"
                [model]="_service.status == 'started' || _service.status == 'starting'" 
                [disabled]="_service.status == 'starting' || _service.status == 'stopping'"
                (modelChanged)="install(!s.model)">
                    <span *ngIf="!isPending()">{{s.model ? "On" : "Off"}}</span>
                    <span *ngIf="isPending()" class="loading"></span>
        </switch>
        <span *ngIf="_service.status == 'stopped' && !_service.webserverScope">Logging is off. Turn it on <a [routerLink]="['/webserver/logging']">here</a></span>
        <override-mode class="pull-right" *ngIf="logging" [scope]="logging.scope" [metadata]="logging.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
        <div *ngIf="logging">
            <fieldset>
                <label>Collect Logs</label>
                <switch class="block" [(model)]="logging.enabled" (modelChanged)="onModelChanged()">{{logging.enabled ? "On" : "Off"}}</switch>
            </fieldset>
            <div [hidden]="!logging.enabled">
                <fieldset class="path">
                    <label>Directory</label>
                    <button title="Select Folder" [class.background-active]="fileSelector.isOpen()" class="right select" (click)="fileSelector.toggle()"></button>
                    <div class="fill">
                        <input [disabled]="!logging.log_per_site && logging.website" type="text" class="form-control" [(ngModel)]="logging.directory" throttle (modelChanged)="onModelChanged()" throttle required />
                    </div>
                    <server-file-selector #fileSelector [types]="['directory']" (selected)="onSelectPath($event)"></server-file-selector>
                </fieldset>
                <fieldset *ngIf="!logging.website">
                    <label>Separate Log per Web Site</label>
                    <switch class="block" [(model)]="logging.log_per_site" (modelChanged)="onModelChanged()">{{logging.log_per_site ? "On" : "Off"}}</switch>
                </fieldset>
                <fieldset>
                    <format [model]="logging" (modelChange)="onModelChanged()"></format>
                </fieldset>
                <section *ngIf="logging.log_per_site || !logging.website">
                    <div class="collapse-heading collapsed" data-toggle="collapse" data-target="#logginRollover">
                        <h2>Log File Rollover</h2>
                    </div>
                    <div id="logginRollover" class="collapse">
                        <rollover [model]="logging.rollover" (modelChange)="onModelChanged()"></rollover>
                    </div>
                </section>        
                <section *ngIf="logging.log_fields">
                    <div class="collapse-heading collapsed" data-toggle="collapse" data-target="#logFields">
                        <h2>Log Fields</h2>
                    </div>
                    <div class="collapse" id="logFields">
                        <logfields [model]="logging.log_fields" (modelChange)="onModelChanged()"></logfields>
                        <br />
                        <customfields *ngIf="logging.custom_log_fields" [(model)]="logging.custom_log_fields" (modelChange)="onModelChanged()"></customfields>
                    </div>
                </section>
                <section *ngIf="this.logging.scope && logging.log_per_site">
                    <div class="collapse-heading" data-toggle="collapse" data-target="#file-list">
                        <h2>Logs</h2>
                    </div>
                    <div id="file-list" class="collapse in">
                        <log-files></log-files>
                    </div>
                </section>
            </div>
        </div>
    `,
    styles: [`
        fieldset {
            padding-left: 0;
        }

        .install {
            display: inline-block;
            margin-bottom: 15px;
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
