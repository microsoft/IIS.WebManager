import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { RequestFilteringService } from './request-filtering.service';
import { NotificationService } from '../../notification/notification.service';
import { RequestFilteringSettings, RequestFilteringChildType, RequestFiltering } from './request-filtering';

@Component({
    template: `
        <loading *ngIf="_service.status == 'unknown' && !_service.error"></loading>
        <error [error]="_service.error"></error>
        <override-mode class="pull-right" *ngIf="settings" [scope]="settings.scope" [metadata]="settings.metadata" (revert)="onRevert()" (modelChanged)="onFeatureChanged()"></override-mode>
        <switch class="install" *ngIf="_service.webserverScope && _service.status != 'unknown'" #s
                [auto]="false"
                [model]="_service.status == 'started' || _service.status == 'starting'" 
                [disabled]="_service.status == 'starting' || _service.status == 'stopping'"
                (modelChanged)="install(!s.model)">
                    <span *ngIf="!isPending()">{{s.model ? "On" : "Off"}}</span>
                    <span *ngIf="isPending()" class="loading"></span>
        </switch>
        <span *ngIf="_service.status == 'stopped' && !_service.webserverScope">Request Filtering is off. Turn it on <a [routerLink]="['/webserver/request-filtering']">here</a></span>
        <div *ngIf="settings">
            <tabs>
                <tab [name]="'Settings'">
                    <div class="row">
                        <div class="col-xs-7 col-md-4 col-lg-3">
                            <fieldset>
                                <label>Unlisted File Extensions</label>
                                <switch class="block" [disabled]="_locked" [(model)]="settings.allow_unlisted_file_extensions" (modelChanged)="onFeatureChanged()">{{settings.allow_unlisted_file_extensions ? "Allow" : "Deny"}}</switch>
                            </fieldset>
                            <fieldset>
                                <label>Unlisted Verbs</label>
                                <switch class="block" [disabled]="_locked" [(model)]="settings.allow_unlisted_verbs" (modelChanged)="onFeatureChanged()">{{settings.allow_unlisted_verbs ? "Allow" : "Deny"}}</switch>
                            </fieldset>
                            <fieldset>
                                <label>High Bit Characters</label>
                                <switch class="block" [disabled]="_locked" [(model)]="settings.allow_high_bit_characters" (modelChanged)="onFeatureChanged()">{{settings.allow_high_bit_characters ? "Allow" : "Deny"}}</switch>
                            </fieldset>
                            <fieldset>
                                <label>Double Escaping</label>
                                <switch class="block" [disabled]="_locked" [(model)]="settings.allow_double_escaping" (modelChanged)="onFeatureChanged()">{{settings.allow_double_escaping ? "Allow" : "Deny"}}</switch>
                            </fieldset>
                        </div>
                        <div class="col-xs-7 col-md-4">
                            <fieldset>
                                <label>Max Content Length <span class="units">(bytes)</span></label>
                                <input class="form-control" [disabled]="_locked" [(ngModel)]="settings.max_content_length" (modelChanged)="onFeatureChanged()" type="number" throttle />
                            </fieldset>
                            <fieldset>
                                <label>Max Url Length <span class="units">(bytes)</span></label>
                                <input class="form-control" [disabled]="_locked" [(ngModel)]="settings.max_url_length" (modelChanged)="onFeatureChanged()" type="number" throttle />
                            </fieldset>
                            <fieldset>
                                <label>Max Query String Length <span class="units">(bytes)</span></label>
                                <input class="form-control" [disabled]="_locked" [(ngModel)]="settings.max_query_string_length" (modelChanged)="onFeatureChanged()" type="number" throttle />
                            </fieldset>
                        </div>
                    </div>
                </tab>
                <tab [name]="'Rules'">
                    <rules [locked]="_locked"></rules>
                </tab>
                <tab [name]="'File Extensions'">
                    <file-extensions [locked]="_locked"></file-extensions>
                </tab>
            </tabs>
        </div>
    `,
    styles: [`
        tabs {
            display: block;
            margin-top: 10px;
            clear: both;
        }

        .install {
            display: inline-block;
            margin-bottom: 15px;
        }
    `]
})
export class RequestFilteringComponent implements OnInit, OnDestroy {
    id: string;
    settings: RequestFiltering;

    private _original: RequestFilteringSettings;
    private _error: any;
    private _locked: boolean;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _service: RequestFilteringService,
                private _notificationService: NotificationService) {
    }

    ngOnInit() {
        this._subscriptions.push(this._service.requestFiltering.subscribe(feature => this.setFeature(feature)));
        this._service.initialize(this.id);
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    onFeatureChanged() {
        var changes = DiffUtil.diff(this._original, this.settings);

        if (Object.keys(changes).length == 0) {
            return;
        }

        this._service.update(changes);
    }

    onRevert() {
        this._service.revert();
    }

    private setFeature(feature: RequestFiltering) {
        if (feature) {
            this._locked = feature.metadata.is_locked;
        }

        this.settings = feature;
        this._original = JSON.parse(JSON.stringify(feature));
    }

    private isPending(): boolean {
        return this._service.status == Status.Starting
            || this._service.status == Status.Stopping;
    }

    public install(val: boolean) {
        if (val) {
            return this._service.install();
        }
        else {
            this._notificationService.confirm("Turn Off Request Filtering", 'This will turn off "Request Filtering" for the entire web server.')
                .then(confirmed => {
                    if (confirmed) {
                        this._service.uninstall();
                    }
                });
        }
    }
}
