import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

import { NotificationService } from '../notification/notification.service';

import { FilesService } from './files.service';
import { ApiFile, ApiFileType } from './file';

@Component({
    selector: 'new-file',
    template: `
        <div class="grid-item row background-editing">
            <div class="col-xs-8 col-sm-5 col-md-5 col-lg-4 col-left fi" [ngClass]="type || (model && model.type)">
                <i></i>
                <input [(ngModel)]="model.name" class="form-control inline-block" type="text" (keyup.enter)="onOk()" (blur)="onOk()" (keyup.esc)="cancel.next()" autofocus>
            </div>
        </div>
    `,
    styles: [`
        .col-left {
            padding-right: 40px;
        }

        .row {
            margin: 0px;
        }
    `],
    styleUrls: [
        'app/files/file-icons.css'
    ]
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
}
