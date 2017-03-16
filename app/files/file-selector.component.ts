import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { Selector } from '../common/selector';

import { ApiFile } from './file';
import { FilesComponent } from './files.component';


@Component({
    selector: 'server-file-selector',
    template: `
        <selector class="container-fluid" #selector>
            <div class="fixed">
                <file-viewer
                    *ngIf="selector.opened"
                    [types]="types" 
                    [useHash]="false"></file-viewer>
            </div>
            <p class="pull-right">
                <button class="ok" [attr.disabled]="!canAccept() || null" (click)="accept()">OK</button>
                <button class="cancel" (click)="cancel()">Cancel</button>
            </p>
        </selector>
    `,
    styles: [`
        .fixed {
            max-height: 50vh;
            overflow-x: hidden;
            margin-right: -15px;
            margin-left: -15px;
            margin-top: -20px;
            padding-right: 15px;
            padding-left: 15px;
            padding-top: 10px;
        }

        button {
            min-width: 85px;
        }

        selector {
            display: block;
        }
    `]
})
export class FileSelectorComponent {
    @Input() public types: Array<string> = [];
    @Input() public multi: boolean = false;
    @Output() public selected: EventEmitter<Array<ApiFile>> = new EventEmitter<Array<ApiFile>>();

    @ViewChild(Selector) private _selector: Selector;
    @ViewChild(FilesComponent) private _fileList: FilesComponent;

    public toggle(): void {
        this._selector.toggle();
    }

    public cancel() {
        this._selector.close();
    }

    public accept() {
        this.selected.next(this._fileList.selected);
        this._selector.close();
    }

    public isOpen() {
        return this._selector.isOpen();
    }

    private canAccept(): boolean {
        return this._fileList && 
                        (this._fileList.selected.length == 1 ||
                            this.multi && this._fileList.selected.length > 0)
    }
}
