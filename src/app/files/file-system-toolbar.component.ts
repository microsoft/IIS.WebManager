import { NgModule, Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListModule } from 'common/list';

export type FileSystemFunc = () => Promise<any>;

@Component({
    selector: 'file-system-toolbar',
    template: `
    <div class="file-toolbar">
        <button *ngIf="newLocation !== null"
            class="list-action-button new-root"
            title="New File System Mapping"
            (click)="onNewLocation.next()"
            [attr.disabled]="newLocation === false || null">
            New File System Mapping
        </button>
        <button *ngIf="refresh !== null"
            class="list-action-button refresh"
            title="Refresh"
            (click)="onRefresh.next()"
            [attr.disabled]="refresh === false || null">
            Refresh
        </button>
        <button *ngIf="newFile !== null"
            class="list-action-button new-file"
            title="New File"
            (click)="onNewFile.next()"
            [attr.disabled]="newFile === false || null">
            New File
        </button>
        <button *ngIf="newFolder !== null"
            class="list-action-button new-folder"
            title="New Folder"
            (click)="onNewFolder.next()"
            [attr.disabled]="newFolder === false || null">
            New Folder
        </button>
        <button *ngIf="upload !== null"
            class="list-action-button upload"
            title="Upload"
            (click)="onUpload.next()"
            [attr.disabled]="upload === false || null">
            Upload
        </button>
        <button *ngIf="edit !== null"
            class="list-action-button edit"
            title="Edit"
            (click)="onEdit.next($event)"
            [attr.disabled]="edit === false || null">
            Edit
        </button>
        <button *ngIf="delete !== null"
            class="list-action-button delete"
            title="Delete"
            (click)="onDelete.next($event)"
            [attr.disabled]="delete === false || null">
            {{deleteButtonText}}
        </button>
    </div>
    <div class="clear"></div>
`,
    styles : [ `
.file-toolbar {
    padding-bottom: 20px;
}
`
    ],
    styleUrls: [
        'file-icons.css'
    ],
})
export class FileSystemToolbarComponent {
    @Input() newLocation: boolean = null;
    @Input() refresh: boolean;
    @Input() newFile: boolean = null;
    @Input() newFolder: boolean = null;
    @Input() upload: boolean = null;
    @Input() edit: boolean = null;
    @Input() delete: boolean = null;
    @Input() atRoot: boolean = false;

    @Output() onNewLocation: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRefresh: EventEmitter<any> = new EventEmitter<any>();
    @Output() onNewFile: EventEmitter<any> = new EventEmitter<any>();
    @Output() onNewFolder: EventEmitter<any> = new EventEmitter<any>();
    @Output() onUpload: EventEmitter<any> = new EventEmitter<any>();
    @Output() onEdit: EventEmitter<any> = new EventEmitter<any>();
    @Output() onDelete: EventEmitter<any> = new EventEmitter<any>();

    get deleteButtonText() {
        if (this.atRoot) {
            return "Remove";
        } else {
            return "Delete";
        }
    }
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        ListModule,
    ],
    exports: [
        FileSystemToolbarComponent,
    ],
    declarations: [
        FileSystemToolbarComponent,
    ]
})
export class Module { }
