import { Component, Input, Output, Inject, EventEmitter } from '@angular/core';
import { NotificationService } from '../notification/notification.service';
import { Humanizer } from '../common/primitives';
import { FilesService } from '../files/files.service';
import { FileNavService } from '../files/file-nav.service';
import { ApiFile } from './file';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'file',
    template: `
        <div *ngIf="model" class="grid-item row" [class.background-editing]="_editing && !_location" [class.background-selected]="_editing && _location" (keyup.f2)="onRename($event)" tabindex="-1">
            <div class="col-xs-9 col-sm-5 col-lg-4 fi" [ngClass]="[model.type, model.extension, (isRoot ? 'location' : '')]">
                <div *ngIf="!_editing || _location">
                    <a class="color-normal hover-color-active" nofocus (click)="onClickName($event)"><i></i>{{model.alias || model.name}}</a>
                </div>
                <div *ngIf="_editing && !_location">
                    <i></i>
                    <input class="form-control inline-block" type="text" 
                           [ngModel]="model.name"
                           (ngModelChange)="rename($event)"
                           (blur)="onBlur($event)"
                           (keyup.enter)="_editing=false"
                           (keyup.esc)="onCancel($event)"
                           (keyup.delete)="$event.stopImmediatePropagation()"
                           (dblclick)="prevent($event)"
                           required throttle autofocus/>
                </div>
            </div>
            <div class="col-sm-3 col-md-2 hidden-xs valign support">
                <span *ngIf="model.last_modified">{{displayDate}}</span>
            </div>
            <div class="col-md-2 visible-lg visible-md valign support">
                {{this.model.description}}
            </div>
            <div class="col-md-1 visible-lg visible-md valign text-right support">
                <span *ngIf="model.size">{{getSize()}}</span>
            </div>
            <div class="actions">
                <div class="action-selector">
                    <button title="More" (click)="selector.toggle()" (dblclick)="prevent($event)" [class.background-active]="(selector && selector.opened) || false">
                        <i class="fa fa-ellipsis-h"></i>
                    </button>
                    <selector #selector [right]="true">
                        <ul>
                            <li><button *ngIf="!isRoot" #menuButton class="edit" title="Rename" (click)="onRename($event)">Rename</button></li>
                            <li><button *ngIf="isRoot" #menuButton class="edit" title="Edit" (click)="onEdit($event)">Edit</button></li>
                            <li><button class="download" #menuButton title="Download" *ngIf="model.type=='file'" (click)="onDownload($event)">Download</button></li>
                            <li><button *ngIf="!isRoot" #menuButton class="delete" title="Delete" (click)="onDelete($event)">Delete</button></li>
                            <li><button *ngIf="isRoot" #menuButton class="delete" title="Delete" (click)="onDelete($event)">Remove</button></li>
                        </ul>
                    </selector>
                </div>
            </div>
        </div>
        <selector #editSelector [opened]="true" *ngIf="_location && _editing" class="container-fluid" (hide)="cancel()">
            <edit-location *ngIf="_location && _editing" [model]="_location" (cancel)="cancel()" (dblclick)="prevent($event)" (keyup.delete)="prevent($event)"></edit-location>
        </selector>
    `,
    styles: [`
        a {
            display: inline;
            background: transparent;
        }

        [class*="col-"] {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .support {
            font-size: 85%;
        }

        .form-control {
            width: 90%;
        }

        .row {
            margin: 0px;
        }
    `],
    styleUrls: [
        'file-icons.css'
    ]
})
export class FileComponent {
    @Input() model: ApiFile;
    @Output() modelChanged: EventEmitter<any> = new EventEmitter();
    private _date = null;
    private _location = null;
    private _editing = false;

    constructor(
        @Inject("FilesService") private _svc: FilesService,
        private _nav: FileNavService,
        private _notificationService: NotificationService,
        private _route: ActivatedRoute,
    ) {
    }

    get isRoot(): boolean {
        return this.model.isLocation;
    }

    get displayDate(): string {
        if (!this._date) {
            this._date = Humanizer.date(this.model.last_modified);
        }

        return this._date;
    }

    rename(name: string) {
        if (name) {
            this._svc.rename(this.model, name);
            this.modelChanged.emit(this.model);
        }

        this._editing = false;
    }

    onRename(e: Event) {
        e.preventDefault();

        this._editing = true;
    }

    onEdit(e: Event) {
        e.preventDefault();

        this._svc.getLocation(this.model.id)
            .then(loc => {
                this._location = loc;
                this._editing = true;
            })
    }

    onBlur(event: Event) {
        if (event && event.target && (<HTMLInputElement>event.target).value === this.model.name) {

            //
            // No change. Force cancel
            this.cancel();
        }
    }

    onCancel(e: Event) {
        e.preventDefault();

        this.cancel();
    }

    onDelete(e: Event) {
        e.preventDefault();

        let title = this.model.isLocation ? "Remove Root Folder" : "Delete File";

        let msg = this.model.isLocation ? "Are you sure you want to remove the root folder '" + this.model.name + "'?" :
            "Are you sure you want to delete '" + this.model.name + "'?";

        this._notificationService.confirm(title, msg)
            .then(confirmed => {
                if (confirmed) {
                    if (!this.model.isLocation) {
                        this._svc.delete([this.model]);
                    }
                    else {
                        this._svc.deleteLocations([this.model]);
                    }
                }
            });

    }

    onDownload(e: Event) {
        e.preventDefault();

        this._svc.download(this.model);
    }

    prevent(e: Event) {
        e.preventDefault();
    }

    cancel() {
        this._editing = false;
        this._location = null;
    }

     nClickName(e: Event) {
        e.preventDefault();
        this._nav.load(this.model.physical_path);
    }

    getSize() {
        return this.model.size ? Humanizer.number(Math.ceil(this.model.size / 1024)) + ' KB' : null;
    }
}
