
import {Component, OnInit} from '@angular/core';

import {DiffUtil} from '../../utils/diff';

import {DefaultDocuments, File} from './default-documents';
import {DefaultDocumentsService} from './default-documents.service';


@Component({
    template: `
        <loading *ngIf="!_defDoc"></loading>
        <div *ngIf="_defDoc" [attr.disabled]="_defDoc.metadata.is_locked ? true : null">
            <override-mode class="pull-right" [metadata]="_defDoc.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
            <fieldset>
                <switch class="block" [(model)]="_defDoc.enabled" (modelChanged)="onModelChanged()">{{_defDoc.enabled ? "On" : "Off"}}</switch>
            </fieldset>
            <files *ngIf="_defDoc.enabled"></files>
        </div>
    `,
    styles: [`
        files {
            display: block;
            margin-top: 23px;
        }   
    `]
})
export class DefaultDocumentsComponent implements OnInit {
    id: string;
    private _defDoc: DefaultDocuments;
    private _original: DefaultDocuments;

    constructor(private _service: DefaultDocumentsService){
    }

    ngOnInit() {
        this._service.get(this.id).then(d => this.setFeature(d));
    }

    onModelChanged() {
        if (this._defDoc) {
            var changes = DiffUtil.diff(this._original, this._defDoc);
            
            if (Object.keys(changes).length > 0) {
                this._service.update(changes)
                    .then(feature => {
                        this.setFeature(feature)
                    });
            }
        }
    }

    private onRevert() {
        this._service.revert().then(d => this.setFeature(d));
    }

    private setFeature(defDoc: DefaultDocuments) {
        this._defDoc = defDoc;
        this._original = JSON.parse(JSON.stringify(defDoc));
    }
}
