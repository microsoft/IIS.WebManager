import {Component, OnInit} from '@angular/core';

import {RequestFilteringSettings, RequestFilteringChildType} from './request-filtering';
import {RequestFilteringService} from './request-filtering.service';
import {NotificationService} from '../../notification/notification.service';

import {DiffUtil} from '../../utils/diff';

@Component({
    template: `
        <loading *ngIf="!(settings && settings.feature || _error)"></loading>
        <error [error]="_error"></error>
        <div *ngIf="settings && settings.feature">
            <override-mode class="pull-right" [metadata]="settings.feature.metadata" (revert)="onRevert()" (modelChanged)="onFeatureChanged()"></override-mode>
            <!-- Feature settings -->
            <div class="row">
                <div class="col-xs-7 col-md-4 col-lg-3">
                    <fieldset>
                        <label>Unlisted File Extensions</label>
                        <switch class="block" [disabled]="_locked" [(model)]="settings.feature.allow_unlisted_file_extensions" (modelChanged)="onFeatureChanged()">{{settings.feature.allow_unlisted_file_extensions ? "Allow" : "Deny"}}</switch>
                    </fieldset>
                    <fieldset>
                        <label>Unlisted Verbs</label>
                        <switch class="block" [disabled]="_locked" [(model)]="settings.feature.allow_unlisted_verbs" (modelChanged)="onFeatureChanged()">{{settings.feature.allow_unlisted_verbs ? "Allow" : "Deny"}}</switch>
                    </fieldset>
                    <fieldset>
                        <label>High Bit Characters</label>
                        <switch class="block" [disabled]="_locked" [(model)]="settings.feature.allow_high_bit_characters" (modelChanged)="onFeatureChanged()">{{settings.feature.allow_high_bit_characters ? "Allow" : "Deny"}}</switch>
                    </fieldset>
                    <fieldset>
                        <label>Double Escaping</label>
                        <switch class="block" [disabled]="_locked" [(model)]="settings.feature.allow_double_escaping" (modelChanged)="onFeatureChanged()">{{settings.feature.allow_double_escaping ? "Allow" : "Deny"}}</switch>
                    </fieldset>
                </div>
                <div class="col-xs-7 col-md-4">
                    <fieldset>
                        <label>Max Content Length <span class="units">(bytes)</span></label>
                        <input class="form-control" [disabled]="_locked" [(ngModel)]="settings.feature.max_content_length" (modelChanged)="onFeatureChanged()" type="number" throttle />
                    </fieldset>
                    <fieldset>
                        <label>Max Url Length <span class="units">(bytes)</span></label>
                        <input class="form-control" [disabled]="_locked" [(ngModel)]="settings.feature.max_url_length" (modelChanged)="onFeatureChanged()" type="number" throttle />
                    </fieldset>
                    <fieldset>
                        <label>Max Query String Length <span class="units">(bytes)</span></label>
                        <input class="form-control" [disabled]="_locked" [(ngModel)]="settings.feature.max_query_string_length" (modelChanged)="onFeatureChanged()" type="number" throttle />
                    </fieldset>
                </div>
            </div>
            <!-- Filtering Rules -->
            <section *ngIf="settings.rules || settings.rulesError">
                <div class="collapse-heading collapsed" data-toggle="collapse" data-target="#rules">
                    <h2>Rules</h2>
                </div>
                <div id="rules" class="collapse">
                    <div *ngIf="settings.rulesError">
                        {{settings.rulesError.message}}
                    </div>

                    <div *ngIf="settings.rules">
                        <rules [rules]="settings.rules"
                               [locked]="_locked"
                               (save)="onSaveChild('rules', $event)"
                               (add)="onAddChild('rules', $event)"
                               (delete)="onDeleteChild('rules', $event)"></rules>
                    </div>  
                </div>
            </section>    
            <!-- File Extensions -->
            <section *ngIf="settings.fileExtensions || settings.fileExtensionsError">
                <div class="collapse-heading collapsed" data-toggle="collapse" data-target="#fileExtensions">
                    <h2>File Extensions</h2>
                </div>
                <div id="fileExtensions" class="collapse">
                    <div *ngIf="settings.fileExtensionsError">
                        {{settings.fileExtensionsError.message}}
                    </div>

                    <div *ngIf="settings.fileExtensions">
                        <file-extensions [fileExtensions]="settings.fileExtensions"
                                         [locked]="_locked"
                                         (save)="onSaveChild('fileExtensions', $event)"
                                         (add)="onAddChild('fileExtensions', $event)"
                                         (delete)="onDeleteChild('fileExtensions', $event)"></file-extensions>
                    </div>
                </div>
            </section>
        </div>
    `
})
export class RequestFilteringComponent implements OnInit {

    id: string;
    settings: RequestFilteringSettings;

    private _original: RequestFilteringSettings;
    private _error: any;
    private _locked: boolean;

    constructor(private _service: RequestFilteringService,
                private _notificationService: NotificationService) {
    }

    ngOnInit() {
        this.initialize();
    }

    onFeatureChanged() {

        if (this.settings.feature) {

            var changes = DiffUtil.diff(this._original.feature, this.settings.feature);

            if (Object.keys(changes).length > 0) {

                this._service.update(this.settings.feature.id, changes)
                    .then(feature => {
                        this._notificationService.clearWarnings();

                        this.settings.feature = feature;
                        this._original.feature = JSON.parse(JSON.stringify(feature));
                    })
                    .catch((e) => {
                        this.settings.feature = JSON.parse(JSON.stringify(this._original.feature));
                    });
            }
            else {
                this._notificationService.clearWarnings();
            }
        }
    }

    onAddChild(childType: RequestFilteringChildType, index: number) {

        let child = this.settings[childType][index];

        let copy = JSON.parse(JSON.stringify(child));
        (Array<any>(this._original[childType])).splice(copy, 0, child);

        this._service.addChild(this.settings.feature, childType, child)
            .then((r) => {
                this._notificationService.clearWarnings();

                this.settings[childType][index] = r;
                this._original[childType][index] = JSON.parse(JSON.stringify(r));
            })
            .catch((e) => {
                // We didn't successfully add the child to the API, we need to remove it from the local list
                let arr: Array<any> = this.settings[childType];
                (Array<any>(this.settings[childType])).splice(index, 1);
                (Array<any>(this._original[childType])).splice(index, 1);
            });
    }

    onSaveChild(childType: RequestFilteringChildType, index: number) {
        let child = this.settings[childType][index];

        let changes = DiffUtil.diff(this._original[childType][index], child);

        if (Object.keys(changes).length > 0) {

            this._service.updateChild(child, changes)
                .then(r => {
                    this._notificationService.clearWarnings();

                    this.settings[childType][index] = r;
                    this._original[childType][index] = JSON.parse(JSON.stringify(r));

                })
                .catch((e) => {
                    this.settings[childType][index] = JSON.parse(JSON.stringify(this._original[childType][index]));
                });
        }
        else {
            this._notificationService.clearWarnings();
        }
    }

    onDeleteChild(childType: RequestFilteringChildType, index: number) {
        let child = this.settings[childType][index];

        if (child.id) {
            this._service.deleteChild(child)
                .then(r => {
                    (<Array<any>>(this.settings[childType])).splice(index, 1);
                    (<Array<any>>(this._original[childType])).splice(index, 1);

                    this._notificationService.clearWarnings();
                });
        }
        else {
            (Array<any>(this.settings[childType])).splice(index, 1);
            let original = this._original[childType][index];
            if (original && !original.id) {
                (Array<any>(this._original[childType])).splice(index, 1);
            }
        }
    }

    onRevert() {
        this._service.revert(this.settings.feature.id)
            .then(_ => {
                this.initialize();
            })
            .catch(e => {
                this._error = e;
            });
    }

    private initialize() {
        this._service.get(this.id)
            .then(s => {
                this.settings = s;
                this._original = JSON.parse(JSON.stringify(s));

                this._locked = this.settings.feature.metadata.is_locked;
            })
            .catch(e => {
                this._error = e;
            });
    }
}