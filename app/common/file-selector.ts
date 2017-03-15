import {NgModule, Component, Output, Input, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'file-selector',
    template: `
        <div class="file-upload">
            <input #fileInput type="file" [attr.multiple]="multiple || null" (change)="onFileChange($event)"/>
        </div>
    `,
    styles: [`
        .file-upload {
            display: inline-block;
        }

        .file-upload input {
            display: none;
        }
    `]
})
export class FileSelector {
    @Input() multiple: boolean;
    @Output() selected: EventEmitter<Array<File>> = new EventEmitter<Array<File>>();


    @ViewChild('fileInput') fileInput: ElementRef;

    private _selected: Array<File>;

    private onFileChange(evt: any) {
        let files: Array<File> = evt.target.files;
        this._selected = files;

        if (files.length > 0) {
            this.selected.next(files);
        }
    }

    public open() {
        this.fileInput.nativeElement.click();
    }
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        FileSelector
    ],
    declarations: [
        FileSelector
    ]
})
export class Module { }