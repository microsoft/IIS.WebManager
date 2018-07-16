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
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var FileSelector = /** @class */ (function () {
    function FileSelector() {
        this.selected = new core_1.EventEmitter();
    }
    FileSelector.prototype.onFileChange = function (evt) {
        var files = evt.target.files;
        this._selected = files;
        if (files.length > 0) {
            this.selected.next(files);
        }
    };
    FileSelector.prototype.open = function () {
        this.fileInput.nativeElement.click();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], FileSelector.prototype, "multiple", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], FileSelector.prototype, "selected", void 0);
    __decorate([
        core_1.ViewChild('fileInput'),
        __metadata("design:type", core_1.ElementRef)
    ], FileSelector.prototype, "fileInput", void 0);
    FileSelector = __decorate([
        core_1.Component({
            selector: 'file-selector',
            template: "\n        <div class=\"file-upload\">\n            <input #fileInput type=\"file\" [attr.multiple]=\"multiple || null\" (change)=\"onFileChange($event)\"/>\n        </div>\n    ",
            styles: ["\n        .file-upload {\n            display: inline-block;\n        }\n\n        .file-upload input {\n            display: none;\n        }\n    "]
        })
    ], FileSelector);
    return FileSelector;
}());
exports.FileSelector = FileSelector;
var Module = /** @class */ (function () {
    function Module() {
    }
    Module = __decorate([
        core_1.NgModule({
            imports: [
                forms_1.FormsModule,
                common_1.CommonModule
            ],
            exports: [
                FileSelector
            ],
            declarations: [
                FileSelector
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=file-selector.js.map