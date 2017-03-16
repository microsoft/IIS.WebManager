import {Component, OnInit} from '@angular/core';

import {DiffUtil} from '../../utils/diff';

import {ResponseCompression} from './compression'
import {CompressionService} from './compression.service';


@Component({
    template: `
        <loading *ngIf="!(model || _error)"></loading>
        <error [error]="_error"></error>
        <div *ngIf="model">
            <override-mode class="pull-right" (revert)="onRevert()" [metadata]="model.metadata" (modelChanged)="onModelChanged()"></override-mode>
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
                <fieldset>
                    <label>Directory</label>
                    <input class="form-control path" type="text" [(ngModel)]="model.directory" throttle (modelChanged)="onModelChanged()" required />
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
export class CompressionComponent implements OnInit {
    id: string;
    model: ResponseCompression;

    private _error: any;
    private _original: ResponseCompression;
    private _locked: boolean;

    constructor(private _service: CompressionService) {
    }

    ngOnInit() {
        this.initialize();
    }

    onModelChanged() {
        if (!this.isValid()) {
            return;
        }

        if (this.model) {

            var changes = DiffUtil.diff(this._original, this.model);

            if (Object.keys(changes).length > 0) {
                
                this._service.update(this.model, changes)
                    .then(model => {
                        this.set(model)
                    });
            }
        }
    }

    onRevert() {
        this._service.revert(this.model.id)
            .then(_ => {
                this.initialize();
            });
    }

    onSpaceLimit(value: boolean) {
        if (!value) {
            this.model.max_disk_space_usage = this._original.max_disk_space_usage;
            this.model.min_file_size = this._original.min_file_size;
        }

        this.model.do_disk_space_limitting = value;
        this.onModelChanged();
    }

    private initialize() {
        this._service.get(this.id)
            .then(s => {
                this.model = s;
                this._original = JSON.parse(JSON.stringify(s));
            })
            .catch(e => {
                this._error = e;
            });
    }

    private set(model) {
        this.model = model;
        this._original = JSON.parse(JSON.stringify(model));

        this._locked = this.model.metadata.is_locked;
    }

    private isValid(): boolean {
        return (!this.model.do_disk_space_limitting || ((this.model.max_disk_space_usage > 1) && (this.model.min_file_size > 1))) &&
               (!!this.model.scope || !!this.model.directory);
    }
}
