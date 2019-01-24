import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiFile } from '../../files/file';
import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { ResponseCompression } from './compression'
import { CompressionService } from './compression.service';
import { NotificationService } from '../../notification/notification.service';

@Component({
    template: `
        <loading *ngIf="service.status == 'unknown' && !service.error"></loading>
        <error [error]="_error"></error>
        <switch class="install" *ngIf="service.webserverScope && service.status != 'unknown'" #s
                [auto]="false"
                [model]="service.status == 'started' || service.status == 'starting'"
                [disabled]="service.status == 'starting' || service.status == 'stopping'"
                (modelChanged)="install(!s.model)">
                    <span *ngIf="!isPending()">{{s.model ? "On" : "Off"}}</span>
                    <span *ngIf="isPending()" class="loading"></span>
        </switch>
        <span *ngIf="service.status == 'stopped' && !service.webserverScope">Response Compression is off. Turn it on <a [routerLink]="['/webserver/response-compression']">here</a></span>
        <override-mode class="pull-right" *ngIf="model" [scope]="model.scope" (revert)="onRevert()" [metadata]="model.metadata" (modelChanged)="onModelChanged()"></override-mode>
        <div *ngIf="model">
            <fieldset>
                <label>Dynamic Compression</label>
                <switch class="block" [disabled]="_locked" [(model)]="model.do_dynamic_compression" (modelChanged)="onModelChanged()">{{model.do_dynamic_compression ? "On" : "Off"}}</switch>
            </fieldset>
            <fieldset>
                <label>Static Compression</label>
                <switch class="block" [disabled]="_locked" [(model)]="model.do_static_compression" (modelChanged)="onModelChanged()">{{model.do_static_compression ? "On" : "Off"}}</switch>
            </fieldset>

            <!-- Settings only visible at Web Server level -->
            <div *ngIf="!model.scope">
                <fieldset class="path">
                    <label>Directory</label>
                    <input type="text" class="form-control left-with-button" [(ngModel)]="model.directory" (modelChanged)="onModelChanged()" throttle required />
                    <button title="Select Directory" [class.background-active]="fileSelector.isOpen()" class="select" (click)="fileSelector.toggle()"></button>
                    <server-file-selector #fileSelector [types]="['directory']" [defaultPath]="model.directory" (selected)="onSelectPath($event)"></server-file-selector>
                </fieldset>
                <fieldset class="inline-block">
                    <label>Limit Storage</label>
                    <switch class="block" [model]="model.do_disk_space_limitting" (modelChange)="onSpaceLimit($event)">{{model.do_disk_space_limitting ? "Yes" : "No"}}</switch>
                </fieldset>
                <div *ngIf="model.do_disk_space_limitting" class="inline-block">
                    <fieldset class="inline-block">
                        <label>Storage Quota<span class="units"> (MB)</span></label>
                        <input class="form-control" type="number" [(ngModel)]="model.max_disk_space_usage" (modelChanged)="onModelChanged()" min="1" required throttle />
                    </fieldset>
                    <fieldset class="inline-block">
                        <label>Min File Size<span class="units"> (Bytes)</span></label>
                        <input class="form-control" type="number" [(ngModel)]="model.min_file_size" (modelChanged)="onModelChanged()" min="1" required throttle />
                    </fieldset>
                </div>
            </div>
        </div>
    `
})
export class CompressionComponent implements OnInit, OnDestroy {
    public id: string;
    private _error: any;
    private model: ResponseCompression;
    private _original: ResponseCompression;
    private _locked: boolean;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _service: CompressionService,
                private _notificationService: NotificationService) {
    }

    public ngOnInit() {
        this._service.initialize(this.id);
        this._subscriptions.push(this._service.compression.subscribe(compression => {
            this.setFeature(compression);
        }));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    get service() {
        return this._service;
    }

    private onModelChanged() {
        if (!this.isValid()) {
            return;
        }

        let changes = DiffUtil.diff(this._original, this.model);
        if (Object.keys(changes).length > 0) {
            this._service.update(changes);
        }
}

    private onRevert() {
        this._service.revert();
    }

    private onSpaceLimit(value: boolean) {
        if (!value) {
            this.model.max_disk_space_usage = this._original.max_disk_space_usage;
            this.model.min_file_size = this._original.min_file_size;
        }

        this.model.do_disk_space_limitting = value;
        this.onModelChanged();
    }

    private setFeature(feature: ResponseCompression) {
        if (feature) {
            this._locked = feature.metadata.is_locked ? true : null;
        }

        this.model = feature;
        this._original = JSON.parse(JSON.stringify(feature));
    }

    private isValid(): boolean {
        return (!this.model.do_disk_space_limitting || ((this.model.max_disk_space_usage > 1) && (this.model.min_file_size > 1))) &&
            (!!this.model.scope || !!this.model.directory);
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
            this._notificationService.confirm("Turn Off Response Compression", 'This will turn off "Response Compression" for the entire web server.')
                .then(confirmed => {
                    if (confirmed) {
                        this._service.uninstall();
                    }
                });
        }
    }

    private onSelectPath(event: Array<ApiFile>) {
        if (event.length == 1) {
            this.model.directory = event[0].physical_path;
            this.onModelChanged();
        }
    }
}
