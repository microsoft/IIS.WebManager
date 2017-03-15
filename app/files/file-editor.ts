import { NgModule, Component, Input, Output, EventEmitter, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ApiFile } from './file';
import { FilesService } from './files.service';

import { Module as Loading } from '../notification/loading.component';
import { Module as Navigation } from './navigation.component';
import { CodeEditorComponent } from "./code-editor.component";


@Component({
    selector: 'file-editor',
    template: `
        <loading *ngIf="!(_text.getValue() != null || _unsupported)"></loading>
        <toolbar *ngIf="!_unsupported" 
            [save]="!!_dirty"
            [reload]="true"
            [compare]="!comparer || null"
            [uncompare]="comparer || null"
            [download]="true"
            (onsave)="save($event)"
            (onreload)="reload()"
            (oncompare)="compare(true)"
            (onuncompare)="compare(false)"
            (ondownload)="download()">
        </toolbar>
        <navigation></navigation>
        <div *ngIf="_unsupported" class="unsupported">
            <p>
              Preview is currently not avaialble.<br>
              Try <a href="" (click)="openAsText($event)">Open As Text</a>
            </p>
            <button class="active" (click)="download($event)">Download</button>
        </div>
        <code-editor #codeEditor (keydown.control.s)="save($event)" 
                    [file]="file" 
                    [content]="text" 
                    (load)="codeEditorLoaded($event)"
                    (change)="onchange($event)">
        </code-editor>
    `,
    styles: [`
        navigation {
            padding-bottom: 25px;
            display: block;
        }

        .unsupported {
            margin-top: 50px;
            text-align: center;
        }

        .unsupported button {
            margin-top: 20px;
        }
    `]
})
export class FileEditor {
    @Input() public file: ApiFile;

    private static MAX_FILE_SIZE: number = (1024 * 1024) * 10; // bytes (10MB)
    private _unsupported: boolean;
    private _text: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    private _dirty;

    @ViewChild(CodeEditorComponent) private _codeEditor: CodeEditorComponent;


    constructor(@Inject("FilesService") private _svc: FilesService) {
    }

    private get text(): Observable<string> {
        return this._text.asObservable();
    }

    private save(e: Event) {
        e.preventDefault();

        if (this._dirty) {
            let content = this._codeEditor.text;
            this._svc.setFileContent(this.file, content).then(() => {
                this._text.next(content);
                this._dirty = false;
            });
        }
    }

    private reload() {
        this._text.next(null);
        this._dirty = false;

        this.getFileText().then(txt => {
            this._text.next(txt);
            this._dirty = false;
           
        });
    }

    private compare(on: boolean) {
        this._codeEditor.compare(on);
    }

    private get comparer(): boolean {
        return this._codeEditor.compareMode;
    }

    private download(e: Event) {
        this._svc.download(this.file);
    }

    private onchange(e) {
        this._dirty = true;
    }

    private openAsText(e: Event) {
        e.preventDefault();

        this._unsupported = false;
        this._text.next(null);

        this.getFileText().then(txt => this._text.next(txt));
    }

    private getFileText(): Promise<string> {
        if (this.file.size > FileEditor.MAX_FILE_SIZE) {
            this._unsupported = true;
            return Promise.reject<string>("File too large");
        }

        return this._svc.getFileContent(this.file)
            .then(r => r.text())
            .catch(e => { this._unsupported = true });
    }

    private codeEditorLoaded(lang: any) {
        if (lang) {
            this.getFileText().then(txt => {
                this._text.next(txt);
            });
        }
        else {
            this._unsupported = true;
        }
    }
}



//
// ToolBar
// 
@Component({
    selector: 'toolbar',
    template: `
        <div>
            <button title="Save (Ctrl+S)" class="save" (click)="onsave.next($event)" *ngIf="save !== null" [attr.disabled]="save === false || null"></button>
            <button title="Replace with Unmodified" class="undo color-active" (click)="onreload.next($event)" *ngIf="reload !== null" [attr.disabled]="reload === false || null"></button>
            <button title="Compare with Unmodified" class="compare" (click)="oncompare.next($event)" *ngIf="compare !== null" [attr.disabled]="compare === false || null"></button>
            <button title="Exit Compare Mode" class="uncompare active" (click)="onuncompare.next($event)" *ngIf="uncompare !== null" [attr.disabled]="uncompare === false || null"></button>
            <button title="Download" class="download" (click)="ondownload.next($event)" *ngIf="download !== null" [attr.disabled]="download === false || null"></button>
        </div>
        <div class="clear"></div>
    `,
    styles: [`
        button {
            border: none;
            float: right;
        }

        button.uncompare::before,
        button.compare::before {
            content: "\\f070";
        }

        button.undo::before {
            content: "\\f063";
        }
    `]
})
export class ToolbarComponent {
    @Input() save: boolean = null;
    @Input() reload: boolean = null;
    @Input() compare: boolean = null;
    @Input() uncompare: boolean = null;
    @Input() download: boolean = null;

    @Output() onsave: EventEmitter<any> = new EventEmitter<any>();
    @Output() onreload: EventEmitter<any> = new EventEmitter<any>();
    @Output() oncompare: EventEmitter<any> = new EventEmitter<any>();
    @Output() onuncompare: EventEmitter<any> = new EventEmitter<any>();
    @Output() ondownload: EventEmitter<any> = new EventEmitter<any>();
}


@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        Loading,
        Navigation
    ],
    exports: [
        FileEditor
    ],
    declarations: [
        FileEditor,
        ToolbarComponent,
        CodeEditorComponent
    ]
})
export class Module { }