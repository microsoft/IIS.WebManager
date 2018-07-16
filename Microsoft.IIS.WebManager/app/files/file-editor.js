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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var file_1 = require("./file");
var files_service_1 = require("./files.service");
var loading_component_1 = require("../notification/loading.component");
var navigation_component_1 = require("./navigation.component");
var code_editor_component_1 = require("./code-editor.component");
var FileEditor = /** @class */ (function () {
    function FileEditor(_svc) {
        this._svc = _svc;
        this._text = new BehaviorSubject_1.BehaviorSubject(null);
    }
    FileEditor_1 = FileEditor;
    Object.defineProperty(FileEditor.prototype, "text", {
        get: function () {
            return this._text.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    FileEditor.prototype.save = function (e) {
        var _this = this;
        e.preventDefault();
        if (this._dirty) {
            var content_1 = this._codeEditor.text;
            this._svc.setFileContent(this.file, content_1).then(function () {
                _this._text.next(content_1);
                _this._dirty = false;
            });
        }
    };
    FileEditor.prototype.reload = function () {
        var _this = this;
        this._text.next(null);
        this._dirty = false;
        this.getFileText().then(function (txt) {
            _this._text.next(txt);
            _this._dirty = false;
        });
    };
    FileEditor.prototype.compare = function (on) {
        this._codeEditor.compare(on);
    };
    Object.defineProperty(FileEditor.prototype, "comparer", {
        get: function () {
            return this._codeEditor.compareMode;
        },
        enumerable: true,
        configurable: true
    });
    FileEditor.prototype.download = function (e) {
        this._svc.download(this.file);
    };
    FileEditor.prototype.onchange = function (e) {
        this._dirty = true;
    };
    FileEditor.prototype.openAsText = function (e) {
        var _this = this;
        e.preventDefault();
        this._unsupported = false;
        this._text.next(null);
        this.getFileText().then(function (txt) { return _this._text.next(txt); });
    };
    FileEditor.prototype.getFileText = function () {
        var _this = this;
        if (this.file.size > FileEditor_1.MAX_FILE_SIZE) {
            this._unsupported = true;
            return Promise.reject("File too large");
        }
        return this._svc.getFileContent(this.file)
            .then(function (r) { return r.text(); })
            .catch(function (e) { _this._unsupported = true; });
    };
    FileEditor.prototype.codeEditorLoaded = function (lang) {
        var _this = this;
        if (lang) {
            this.getFileText().then(function (txt) {
                _this._text.next(txt);
            });
        }
        else {
            this._unsupported = true;
        }
    };
    FileEditor.MAX_FILE_SIZE = (1024 * 1024) * 10; // bytes (10MB)
    __decorate([
        core_1.Input(),
        __metadata("design:type", file_1.ApiFile)
    ], FileEditor.prototype, "file", void 0);
    __decorate([
        core_1.ViewChild(code_editor_component_1.CodeEditorComponent),
        __metadata("design:type", code_editor_component_1.CodeEditorComponent)
    ], FileEditor.prototype, "_codeEditor", void 0);
    FileEditor = FileEditor_1 = __decorate([
        core_1.Component({
            selector: 'file-editor',
            template: "\n        <loading *ngIf=\"!(_text.getValue() != null || _unsupported)\"></loading>\n        <toolbar *ngIf=\"!_unsupported\" \n            [save]=\"!!_dirty\"\n            [reload]=\"true\"\n            [compare]=\"!comparer || null\"\n            [uncompare]=\"comparer || null\"\n            [download]=\"true\"\n            (onsave)=\"save($event)\"\n            (onreload)=\"reload()\"\n            (oncompare)=\"compare(true)\"\n            (onuncompare)=\"compare(false)\"\n            (ondownload)=\"download()\">\n        </toolbar>\n        <navigation></navigation>\n        <div *ngIf=\"_unsupported\" class=\"unsupported\">\n            <p>\n              Preview is currently not avaialble.<br>\n              Try <a href=\"\" (click)=\"openAsText($event)\">Open As Text</a>\n            </p>\n            <button class=\"active\" (click)=\"download($event)\">Download</button>\n        </div>\n        <code-editor #codeEditor (keydown.control.s)=\"save($event)\" \n                    [file]=\"file\" \n                    [content]=\"text\" \n                    (load)=\"codeEditorLoaded($event)\"\n                    (change)=\"onchange($event)\">\n        </code-editor>\n    ",
            styles: ["\n        navigation {\n            padding-bottom: 25px;\n            display: block;\n        }\n\n        .unsupported {\n            margin-top: 50px;\n            text-align: center;\n        }\n\n        .unsupported button {\n            margin-top: 20px;\n        }\n    "]
        }),
        __param(0, core_1.Inject("FilesService")),
        __metadata("design:paramtypes", [files_service_1.FilesService])
    ], FileEditor);
    return FileEditor;
    var FileEditor_1;
}());
exports.FileEditor = FileEditor;
//
// ToolBar
// 
var ToolbarComponent = /** @class */ (function () {
    function ToolbarComponent() {
        this.save = null;
        this.reload = null;
        this.compare = null;
        this.uncompare = null;
        this.download = null;
        this.onsave = new core_1.EventEmitter();
        this.onreload = new core_1.EventEmitter();
        this.oncompare = new core_1.EventEmitter();
        this.onuncompare = new core_1.EventEmitter();
        this.ondownload = new core_1.EventEmitter();
    }
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ToolbarComponent.prototype, "save", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ToolbarComponent.prototype, "reload", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ToolbarComponent.prototype, "compare", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ToolbarComponent.prototype, "uncompare", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ToolbarComponent.prototype, "download", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ToolbarComponent.prototype, "onsave", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ToolbarComponent.prototype, "onreload", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ToolbarComponent.prototype, "oncompare", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ToolbarComponent.prototype, "onuncompare", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ToolbarComponent.prototype, "ondownload", void 0);
    ToolbarComponent = __decorate([
        core_1.Component({
            selector: 'toolbar',
            template: "\n        <div>\n            <button title=\"Save (Ctrl+S)\" class=\"save\" (click)=\"onsave.next($event)\" *ngIf=\"save !== null\" [attr.disabled]=\"save === false || null\"></button>\n            <button title=\"Replace with Unmodified\" class=\"undo color-active\" (click)=\"onreload.next($event)\" *ngIf=\"reload !== null\" [attr.disabled]=\"reload === false || null\"></button>\n            <button title=\"Compare with Unmodified\" class=\"compare\" (click)=\"oncompare.next($event)\" *ngIf=\"compare !== null\" [attr.disabled]=\"compare === false || null\"></button>\n            <button title=\"Exit Compare Mode\" class=\"uncompare active\" (click)=\"onuncompare.next($event)\" *ngIf=\"uncompare !== null\" [attr.disabled]=\"uncompare === false || null\"></button>\n            <button title=\"Download\" class=\"download\" (click)=\"ondownload.next($event)\" *ngIf=\"download !== null\" [attr.disabled]=\"download === false || null\"></button>\n        </div>\n        <div class=\"clear\"></div>\n    ",
            styles: ["\n        button {\n            border: none;\n            float: right;\n        }\n\n        button.uncompare::before,\n        button.compare::before {\n            content: \"\\f070\";\n        }\n\n        button.undo::before {\n            content: \"\\f063\";\n        }\n    "]
        })
    ], ToolbarComponent);
    return ToolbarComponent;
}());
exports.ToolbarComponent = ToolbarComponent;
var Module = /** @class */ (function () {
    function Module() {
    }
    Module = __decorate([
        core_1.NgModule({
            imports: [
                forms_1.FormsModule,
                common_1.CommonModule,
                loading_component_1.Module,
                navigation_component_1.Module
            ],
            exports: [
                FileEditor
            ],
            declarations: [
                FileEditor,
                ToolbarComponent,
                code_editor_component_1.CodeEditorComponent
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=file-editor.js.map