import { Component, Input, Output, EventEmitter, ViewChild, OnInit } from '@angular/core';

import { Selector } from '../common/selector';

import { ApiFile, ExplorerOptions } from './file';
import { FilesComponent } from './files.component';


@Component({
    selector: 'server-file-selector',
    template: `
        <selector class="container-fluid" #selector>
            <div class="fixed">
                <file-viewer
                    *ngIf="selector.opened"
                    [types]="types" 
                    [options]="_explorerOptions"
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
export class FileSelectorComponent implements OnInit {
    @Input() public types: Array<string> = [];
    @Input() public multi: boolean = false;
    @Output() public selected: EventEmitter<Array<ApiFile>> = new EventEmitter<Array<ApiFile>>();

    private _explorerOptions: ExplorerOptions;
    @ViewChild(Selector) private _selector: Selector;
    @ViewChild(FilesComponent) private _fileList: FilesComponent;

    constructor() {
        this._explorerOptions = new ExplorerOptions(false);
        this._explorerOptions.EnableRefresh = this._explorerOptions.EnableNewFolder = true;
    }

    public ngOnInit() {
        if (this.types.find(t => t.toLocaleLowerCase() == 'file')) {
            this._explorerOptions.EnableNewFile = true;
        }
    }

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
