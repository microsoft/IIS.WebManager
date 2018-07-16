"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/fromEvent");
var window_service_1 = require("../main/window.service");
var file_1 = require("./file");
var CompareMode;
(function (CompareMode) {
    CompareMode[CompareMode["None"] = 0] = "None";
    CompareMode[CompareMode["Inline"] = 1] = "Inline";
    CompareMode[CompareMode["Split"] = 2] = "Split";
})(CompareMode || (CompareMode = {}));
var CodeEditorComponent = /** @class */ (function () {
    function CodeEditorComponent(_window) {
        this._window = _window;
        this.load = new core_1.EventEmitter(null);
        this.change = new core_1.EventEmitter(null);
        this._subs = [];
        this._diff = CompareMode.None;
    }
    CodeEditorComponent_1 = CodeEditorComponent;
    CodeEditorComponent.prototype.ngAfterViewInit = function () {
        //
        // VS Monaco Editor
        this.setupCodeEditor().catch(function (e) {
        });
    };
    CodeEditorComponent.prototype.ngOnDestroy = function () {
        this.dispose();
        this._subs.forEach(function (s) { return s.unsubscribe(); });
    };
    Object.defineProperty(CodeEditorComponent.prototype, "text", {
        get: function () {
            return this._editor ? this._editor.getValue() : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CodeEditorComponent.prototype, "compareMode", {
        get: function () {
            return this._diff !== CompareMode.None;
        },
        enumerable: true,
        configurable: true
    });
    CodeEditorComponent.prototype.compare = function (on) {
        if (on && !this.compareMode) {
            this.createDiffEditor(this.text);
            return;
        }
        if (!on && this.compareMode) {
            this.createEditor(this.text);
            return;
        }
    };
    CodeEditorComponent.prototype.setupCodeEditor = function () {
        var _this = this;
        this._subs.push(this._window.resize.subscribe(function (e) {
            _this.updateLayout();
        }));
        //
        // Initialize Monaco
        return this.loadMonaco().then(function (monaco) {
            _this._monaco = monaco;
            _this._lang = _this.mapLanguage(_this._monaco.languages.getLanguages());
            _this.load.emit(_this._lang);
            //
            // Load file content
            _this.content.subscribe(function (txt) {
                _this._originalText = txt;
                if (txt != null) {
                    if (!_this.compareMode) {
                        _this.createEditor(_this._originalText);
                    }
                    else {
                        _this.createDiffEditor(_this._originalText);
                    }
                }
            });
        });
    };
    CodeEditorComponent.prototype.loadMonaco = function () {
        var _this = this;
        //
        var loader = function (resolve) {
            window.require.config({ paths: { 'vs': 'node_modules/monaco-editor/min/vs' } });
            window.require(['vs/editor/editor.main'], function (m) {
                resolve(monaco);
            });
        };
        return new Promise(function (resolve, reject) {
            //
            // Inject AMD loader if necessary
            if (!window.require) {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = 'node_modules/monaco-editor/min/vs/loader.js';
                _this._subs.push(Observable_1.Observable.fromEvent(script, 'load').subscribe(function () {
                    loader(resolve);
                }));
                document.body.appendChild(script);
            }
            else {
                loader(resolve);
            }
        });
    };
    CodeEditorComponent.prototype.mapLanguage = function (languages) {
        var ext = this.file.extension;
        //
        // Map by file extension
        var lang = this.getLangByFileExt(languages, CodeEditorComponent_1.FileExtAliases[ext]) || this.getLangByFileExt(languages, ext);
        return lang ? lang.id : null;
    };
    CodeEditorComponent.prototype.getLangByFileExt = function (languages, ext) {
        if (!ext) {
            return null;
        }
        return languages.find(function (l) {
            if (l.extensions.some(function (ex) { return ex.substring(1).toLocaleLowerCase() == ext; })) {
                return l;
            }
        });
    };
    CodeEditorComponent.prototype.dispose = function () {
        if (this._editor) {
            this._editor.dispose();
            this._editor = null;
        }
        var el = this._editorElement ? this._editorElement.nativeElement : null;
        if (el) {
            el.innerHTML = '';
        }
    };
    CodeEditorComponent.prototype.createEditor = function (content) {
        var _this = this;
        var options = {
            automaticLayout: true,
            language: this._lang
        };
        var setModel;
        if (!this._editor || this.compareMode) {
            this.dispose();
            this._editor = this._monaco.editor.create(this._editorElement.nativeElement, options);
            setModel = true;
        }
        var model = this._editor.getModel();
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
            this._editor.onDidChangeModelContent(function (c) { return _this.change.emit(c); });
        }
        this._diff = CompareMode.None;
    };
    CodeEditorComponent.prototype.createDiffEditor = function (content) {
        var _this = this;
        var mode = this.calcCompareMode();
        var options = {
            automaticLayout: true,
            language: this._lang,
            renderSideBySide: (mode == CompareMode.Split)
        };
        if (!this._editor || mode != this._diff) {
            this.dispose();
            this._editor = this._monaco.editor.createDiffEditor(this._editorElement.nativeElement, options);
        }
        var setModel;
        var model = this._editor.getModel() || {};
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
            this._editor.onDidChangeModelContent(function (c) { return _this.change.emit(c); });
        }
        this._diff = mode;
    };
    CodeEditorComponent.prototype.updateLayout = function () {
        //
        // Set Height
        // Monaco calcualtes/sets position dynamically, so the container have to do it as well :(
        var el = this._editorElement ? this._editorElement.nativeElement : null;
        if (el) {
            var rect = el.getBoundingClientRect();
            el.style.height = (window.innerHeight - rect.top - 15) + 'px';
        }
        //
        // Update DiffEditor Layout
        if (this.compareMode && this.calcCompareMode() != this._diff) {
            this.createDiffEditor(this.text);
        }
    };
    CodeEditorComponent.prototype.calcCompareMode = function () {
        return window.innerWidth > 768 ? CompareMode.Split : CompareMode.Inline;
    };
    CodeEditorComponent.FileExtAliases = {
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
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", file_1.ApiFile)
    ], CodeEditorComponent.prototype, "file", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Observable_1.Observable)
    ], CodeEditorComponent.prototype, "content", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], CodeEditorComponent.prototype, "load", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], CodeEditorComponent.prototype, "change", void 0);
    __decorate([
        core_1.ViewChild('editor'),
        __metadata("design:type", core_1.ElementRef)
    ], CodeEditorComponent.prototype, "_editorElement", void 0);
    CodeEditorComponent = CodeEditorComponent_1 = __decorate([
        core_1.Component({
            selector: 'code-editor',
            template: "\n        <div #editor class=\"editor\"></div>\n    ",
            styles: ["\n        .editor {\n            margin:0;\n            padding: 0;\n            display: block;\n            overflow: hidden;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [window_service_1.WindowService])
    ], CodeEditorComponent);
    return CodeEditorComponent;
    var CodeEditorComponent_1;
}());
exports.CodeEditorComponent = CodeEditorComponent;
//# sourceMappingURL=code-editor.component.js.map