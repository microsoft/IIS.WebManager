import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

import { NotificationService } from '../notification/notification.service';

import { FilesService } from './files.service';
import { ApiFile, ApiFileType } from './file';

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
export class NewFileComponent {
    @Input() model: ApiFile;
    @Input() parent: ApiFile;
    @Input() type: ApiFileType;

    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
    @Output() save: EventEmitter<any> = new EventEmitter<any>();


    private onOk() {
        if (this.model.name) {
            this.save.next();
        }
    }

    private getIcon() {
        return {
            "fa-file-o": this.type == ApiFileType.File,
            "fa-folder-o": this.type == ApiFileType.Directory
        };
    }

    private getDisplayDate(date: string) {
        return date ? new Date(date).toLocaleString() : null;
    }
}