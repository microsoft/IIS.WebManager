
import { NgModule, Component, ViewChild, Output, Input, EventEmitter, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';

import {WindowService} from '../main/window.service';
import {ComponentLoader} from '../common/component-loader';

import {ApiFile} from './file';

declare var monaco: any;


enum CompareMode {
    None = 0,
    Inline = 1,
    Split = 2
}


@Component({
    selector: 'code-editor',
    template: `
        <div #editor class="editor"></div>
    `,
    styles: [`
        .editor {
            margin:0;
            padding: 0;
            display: block;
            overflow: hidden;
        }
    `]
})
export class CodeEditorComponent implements AfterViewInit, OnDestroy {
    @Input() public file: ApiFile;
    @Input() public content: Observable<string>;
    @Output() public load: EventEmitter<any> = new EventEmitter<any>(null);
    @Output() public change: EventEmitter<any> = new EventEmitter<any>(null);

    private static FileExtAliases: any = {
        master: "aspx",
        asax: "xml",
        xsc: "xml",
        asmx: "xml",
        ashx: "xml",
        svc: "xml",
        browser: "xml",
        xss: "xml",
        xsl: "xml",
        xslt: "xml",
        xsd: "xml",
        log: "txt",
        map: "json",
        targets: "xml",
        sln: "txt",
        pl: "txt",
        perl: "txt",
        reg: "txt",
        vbs: "vb",
        asp: "vb",
        resx: "xml",
        inf: "ini",
        csv: "txt"
    }

    @ViewChild('editor') private _editorElement: ElementRef;

    private _editor: any;
    private _subs = [];
    private _monaco: any;
    private _originalText: string;
    private _lang: any;
    private _diff: CompareMode = CompareMode.None;

    constructor(private _window: WindowService) {
    }

    ngAfterViewInit() {
        //
        // VS Monaco Editor
        this.setupCodeEditor().catch(e => {
        });
    }

    ngOnDestroy() {
        this.dispose();
        this._subs.forEach(s => s.unsubscribe());
    }

    public get text(): string {
        return this._editor ? this._editor.getValue() : null;
    }

    public get compareMode(): boolean {
        return this._diff !== CompareMode.None;
    }

    public compare(on: boolean) {
        if (on && !this.compareMode) {
            this.createDiffEditor(this.text);
            return;
        }

        if (!on && this.compareMode) {
            this.createEditor(this.text);
            return;
        }
    }

    private setupCodeEditor(): Promise<any> {
        this._subs.push(this._window.resize.subscribe(e => {
            this.updateLayout();
        }));

        //
        // Initialize Monaco
        return this.loadMonaco().then(monaco => {
            this._monaco = monaco;
            this._lang = this.mapLanguage(this._monaco.languages.getLanguages());

            this.load.emit(this._lang);

            //
            // Load file content
            this.content.subscribe(txt => {
                this._originalText = txt;

                if (txt != null) {
                    if (!this.compareMode) {
                        this.createEditor(this._originalText);
                    }
                    else {
                        this.createDiffEditor(this._originalText);
                    }
                }
            });
        });
    }

    private loadMonaco(): Promise<any> {
        //
        var loader = (resolve) => {
            (<any>window).require.config({ paths: { 'vs': 'node_modules/monaco-editor/min/vs' } });
            (<any>window).require(['vs/editor/editor.main'], m => {
                resolve(monaco);
            });
        };

        return new Promise((resolve, reject) => {
            //
            // Inject AMD loader if necessary
            if (!(<any>window).require) {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = 'node_modules/monaco-editor/min/vs/loader.js';

                this._subs.push(Observable.fromEvent(script, 'load').subscribe(() => {
                    loader(resolve);
                }));

                document.body.appendChild(script);
            }
            else {
                loader(resolve);
            }
        });
    }

    private mapLanguage(languages: Array<any>): string {
        let ext = this.file.extension;

        //
        // Map by file extension
        let lang = this.getLangByFileExt(languages, CodeEditorComponent.FileExtAliases[ext]) || this.getLangByFileExt(languages, ext);

        return lang ? lang.id : null;
    }

    private getLangByFileExt(languages: Array<any>, ext: string): any {
        if (!ext) {
            return null;
        }

        return languages.find(l => {
            if ((<Array<any>>l.extensions).some((ex: string) => ex.substring(1).toLocaleLowerCase() == ext)) {
                return l;
            }
        });
    }

    private dispose() {
        if (this._editor) {
            this._editor.dispose();
            this._editor = null;
        }

        let el = this._editorElement ? this._editorElement.nativeElement : null;
        if (el) {
            el.innerHTML = '';
        }
    }

    private createEditor(content: string) {
        let options: any = {
            automaticLayout: true,
            language: this._lang
        }

        let setModel: boolean;

        if (!this._editor || this.compareMode) {
            this.dispose();
            this._editor = this._monaco.editor.create(this._editorElement.nativeElement, options);
            setModel = true;
        }

        let model = this._editor.getModel();

        if (!model) {
            model = this._monaco.editor.createModel(content, this._lang);
            setModel = true;
        }
        else {
            if (model.getValue() != content) {
                model.setValue(content);
            }
        }

        if (setModel) {
            this._editor.onDidChangeModelContent(c => this.change.emit(c));
        }

        this._diff = CompareMode.None;
    }

    private createDiffEditor(content: string) {
        let mode: CompareMode = this.calcCompareMode();

        let options: any = {
            automaticLayout: true,
            language: this._lang,
            renderSideBySide: (mode == CompareMode.Split)
        }

        if (!this._editor || mode != this._diff) {
            this.dispose();
            this._editor = this._monaco.editor.createDiffEditor(this._editorElement.nativeElement, options);
        }

        let setModel: boolean;
        let model = this._editor.getModel() || {};

        //
        // Original
        if (!model.original) {
            model.original = this._monaco.editor.createModel(this._originalText, this._lang);
            setModel = true;
        }

        if (model.original.getValue() != this._originalText) {
            model.original.setValue(this._originalText);
        }

        //
        // Modified
        if (!model.modified) {
            model.modified = this._monaco.editor.createModel(content, this._lang);
            setModel = true;
        }

        if (model.modified.getValue() != content) {
            model.modified.setValue(content);
        }

        // Set Model
        if (setModel) {
            this._editor.setModel(model);
            this._editor.onDidChangeModelContent(c => this.change.emit(c));
        }

        this._diff = mode;
    }

    private updateLayout() {
        //
        // Set Height
        // Monaco calcualtes/sets position dynamically, so the container have to do it as well :(
        let el = this._editorElement ? this._editorElement.nativeElement : null;
        if (el) {
            var rect = el.getBoundingClientRect();
            el.style.height = (window.innerHeight - rect.top - 15) + 'px';
        }

        //
        // Update DiffEditor Layout
        if (this.compareMode && this.calcCompareMode() != this._diff) {
            this.createDiffEditor(this.text);
        }
    }

    private calcCompareMode(): CompareMode {
        return window.innerWidth > 768 ? CompareMode.Split : CompareMode.Inline;
    }
}
