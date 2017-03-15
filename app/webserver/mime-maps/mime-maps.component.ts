import {Component, OnInit} from '@angular/core';

import {NotificationService} from '../../notification/notification.service';
import {DiffUtil} from '../../utils/diff';

import {StaticContentService} from '../static-content/static-content.service';
import {StaticContent, MimeMap} from '../static-content/static-content';

@Component({
    template: `
        <loading *ngIf="!(staticContent || _error)"></loading>
        <error [error]="_error"></error>
        <div *ngIf="staticContent">
            <override-mode class="pull-right" [metadata]="staticContent.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
            <mime-maps [mimeMaps]="mimeMaps" (modelChanged)="onSave($event)" (delete)="onDelete($event)" (add)="onAdd($event)"><mime-maps>
        <div>
    `
})
export class MimeMapsComponent implements OnInit {

    id: string;
    staticContent: StaticContent;
    mimeMaps: Array<MimeMap>;
    originalMaps: Array<MimeMap>;

    private _original: StaticContent;
    private _error: any;
    private _locked: boolean;

    constructor(private _service: StaticContentService,
                private _notificationService: NotificationService)
    {
    }

    ngOnInit() {
        this.initialize();
    }

    onModelChanged() {

        if (this.staticContent) {

            var changes = DiffUtil.diff(this._original, this.staticContent);

            if (Object.keys(changes).length > 0) {

                this._service.updateFeature(this.staticContent, changes)
                    .then(feature => {
                        this._notificationService.clearWarnings();
                        this.setFeature(feature);
                    });
            }
            else {
                this._notificationService.clearWarnings();
            }
        }
    }

    onAdd(index: number) {
        let map = this.mimeMaps[index];
        map.static_content = this.staticContent;

        this._service.addMap(this.staticContent, map)
            .then(map => {
                this.setMap(index, map);
            }).catch((e) => {
                this.mimeMaps.splice(index, 1);
            });
    }

    onSave(index) {

        if (this.mimeMaps && this.mimeMaps[index] && this.mimeMaps[index].id) {

            var mapChanges = DiffUtil.diff(this.originalMaps[index], this.mimeMaps[index]);

            if (Object.keys(mapChanges).length > 0) {

                this._service.updateMap(this.mimeMaps[index], mapChanges)
                    .then(map => {
                        this.setMap(index, map);
                    })
                    .catch((e) => {
                        this.mimeMaps[index] = JSON.parse(JSON.stringify(this.originalMaps[index]));
                    });
            }
            else {
                this._notificationService.clearWarnings();
            }
        }
    }


    onDelete(index: number) {
        let map = this.mimeMaps[index];

        this._service.deleteMap(map)
            .then(r => {
                this.mimeMaps.splice(index, 1);
                this.originalMaps.splice(index, 1);

                this._notificationService.clearWarnings();
            });
    }

    onRevert() {
        this._service.revert(this.staticContent.id)
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
                this.setFeature(s.feature);
                this.mimeMaps = s.mimeMaps;
                this.originalMaps = JSON.parse(JSON.stringify(s.mimeMaps));
            })
            .catch(e => {
                this._error = e;
            });
    }

    private setFeature(feature) {
        this.staticContent = feature;
        this._original = JSON.parse(JSON.stringify(feature));

        this._locked = this.staticContent.metadata.is_locked;
    }

    private setMap(index, map) {
        this.mimeMaps[index] = map;
        this.originalMaps[index] = JSON.parse(JSON.stringify(map));
    }

}