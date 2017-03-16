import {Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';

import {Logger} from '../../common/logger';
import {NotificationService} from '../../notification/notification.service';

import {FilesService} from '../../files/files.service';
import {WebFilesService} from './webfiles.service';
import {WebFileType, WebFile} from './webfile';

@Component({
    selector: 'new-file',
    template: `
        <div class="grid-item row background-editing">
            <div class="col-xs-8 col-sm-5 col-md-5 col-lg-4 col-left">
                <input [(ngModel)]="model.name" class="form-control" type="text" (keyup.enter)="onOk()" (blur)="cancel.next()" (keyup.esc)="cancel.next()" autofocus>
            </div>
            <div class="actions">
                <button [attr.disabled]="!model.name || null" title="Ok" (click)="onOk()">
                    <i class="fa fa-check blue"></i>
                </button>
                <button title="Cancel" (click)="cancel.next()">
                    <i class="fa fa-times red"></i>
                </button>
            </div>
        </div>
    `,
    styles: [`
        .col-left {
            padding-left: 0;
        }

        .row {
            margin: 0px;
        }
    `]
})
export class NewWebFileComponent {
    @Input() model: WebFile;
    @Input() parent: WebFile;
    @Input() type: WebFileType;

    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
    @Output() save: EventEmitter<any> = new EventEmitter<any>();


    private onOk() {
        if (this.model.name) {
            this.save.next();
        }
    }

    private getIcon() {
        return {
            "fa-file-o": this.type == WebFileType.File,
            "fa-folder-o": this.type == WebFileType.Directory ||
            this.type == WebFileType.Vdir
        };
    }

    private getDisplayDate(date: string) {
        return date ? new Date(date).toLocaleString() : null;
    }
}
