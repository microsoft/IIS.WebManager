import {Component, OnInit} from '@angular/core';

import {DirectoryBrowsingService} from './directory-browsing.service';
import {Logger} from '../../common/logger';
import {NotificationService} from '../../notification/notification.service';

import {DiffUtil} from '../../utils/diff';

@Component({
    template: `
        <loading *ngIf="!(feature || _error)"></loading>
        <error [error]="_error"></error>
        <div *ngIf="feature">
            <override-mode class="pull-right" [metadata]="feature.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
            <fieldset>
                <switch class="block" [disabled]="_locked" [(model)]="feature.enabled" (modelChanged)="onModelChanged()">{{feature.enabled ? "On" : "Off"}}</switch>
            </fieldset>
            <div [hidden]="!feature.enabled">
                <fieldset>
                    <label>Directory Attributes</label>
                    <ul class="allowed-attributes">
                        <li class="checkbox">
                            <checkbox2 [disabled]="_locked" [(model)]="feature.allowed_attributes.date" (modelChanged)="onModelChanged()">Date</checkbox2>
                        </li>
                        <li class="checkbox">
                            <checkbox2 [disabled]="_locked" [(model)]="feature.allowed_attributes.time" (modelChanged)="onModelChanged()">Time</checkbox2>
                        </li>
                        <li class="checkbox">
                            <checkbox2 [disabled]="_locked" [(model)]="feature.allowed_attributes.size" (modelChanged)="onModelChanged()">Size</checkbox2>
                        </li>
                        <li class="checkbox">
                            <checkbox2 [disabled]="_locked" [(model)]="feature.allowed_attributes.extension" (modelChanged)="onModelChanged()">Extension</checkbox2>
                        </li>
                        <li class="checkbox">
                            <checkbox2 [disabled]="_locked" [(model)]="feature.allowed_attributes.long_date" (modelChanged)="onModelChanged()">Long Date</checkbox2>
                        </li>
                    </ul>
                </fieldset>
            </div>
        </div>
    `,
    styles: [`
        .allowed-attributes li {
            padding:10px;
            padding-left: 0px;
            position:relative;
        }
    `]
})
export class DirectoryBrowsingComponent implements OnInit {
    id: string;
    feature: any;
    
    private _locked: boolean;
    private _original: any;
    private _error: any;

    constructor(private _service: DirectoryBrowsingService,
                private _logger: Logger,
                private _notificationService: NotificationService)
    {
    }

    ngOnInit() {
        this.initialize();
    }

    onModelChanged() {
        
        if (this.feature) {
            
            var changes = DiffUtil.diff(this._original, this.feature);

            if (Object.keys(changes).length > 0) {

                this._service.update(this.feature.id, changes)
                    .then(feature => {
                        this.setFeature(feature);
                    });
            }
        }
    }

    onRevert() {
        this._service.revert(this.feature.id)
            .then(_ => {
                this.initialize();
            })
            .catch(e => {
                this._error = e;
            });
    }

    private initialize() {
        this._service.get(this.id)
            .then(feature => {
                this.setFeature(feature);
            })
            .catch(e => {
                this._error = e;
            });
    }

    private setFeature(feature) {
        this.feature = feature;
        this._original = JSON.parse(JSON.stringify(feature));

        this._locked = this.feature.metadata.is_locked ? true : null;
    }

}
