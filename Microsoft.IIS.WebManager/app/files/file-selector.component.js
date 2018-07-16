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
var selector_1 = require("../common/selector");
var file_1 = require("./file");
var files_component_1 = require("./files.component");
var FileSelectorComponent = /** @class */ (function () {
    function FileSelectorComponent() {
        this.types = [];
        this.defaultPath = null;
        this.multi = false;
        this.selected = new core_1.EventEmitter();
        this._explorerOptions = new file_1.ExplorerOptions(false);
        this._explorerOptions.EnableRefresh = this._explorerOptions.EnableNewFolder = true;
    }
    FileSelectorComponent.prototype.ngOnInit = function () {
        if (this.types.find(function (t) { return t.toLocaleLowerCase() == 'file'; })) {
            this._explorerOptions.EnableNewFile = true;
        }
    };
    FileSelectorComponent.prototype.toggle = function () {
        this._selector.toggle();
    };
    FileSelectorComponent.prototype.cancel = function () {
        this._selector.close();
    };
    FileSelectorComponent.prototype.accept = function () {
        this.selected.next(this._fileList.selected);
        this._selector.close();
    };
    FileSelectorComponent.prototype.isOpen = function () {
        return this._selector.isOpen();
    };
    FileSelectorComponent.prototype.canAccept = function () {
        return this._fileList &&
            (this._fileList.selected.length == 1 ||
                this.multi && this._fileList.selected.length > 0);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], FileSelectorComponent.prototype, "types", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], FileSelectorComponent.prototype, "defaultPath", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], FileSelectorComponent.prototype, "multi", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], FileSelectorComponent.prototype, "selected", void 0);
    __decorate([
        core_1.ViewChild(selector_1.Selector),
        __metadata("design:type", selector_1.Selector)
    ], FileSelectorComponent.prototype, "_selector", void 0);
    __decorate([
        core_1.ViewChild(files_component_1.FilesComponent),
        __metadata("design:type", files_component_1.FilesComponent)
    ], FileSelectorComponent.prototype, "_fileList", void 0);
    FileSelectorComponent = __decorate([
        core_1.Component({
            selector: 'server-file-selector',
            template: "\n        <selector class=\"container-fluid\" #selector>\n            <div class=\"fixed\">\n                <file-viewer\n                    *ngIf=\"selector.opened\"\n                    [types]=\"types\" \n                    [options]=\"_explorerOptions\"\n                    [useHash]=\"false\"\n                    [defaultPath]=\"defaultPath\"></file-viewer>\n            </div>\n            <p class=\"pull-right\">\n                <button class=\"ok\" [attr.disabled]=\"!canAccept() || null\" (click)=\"accept()\">OK</button>\n                <button class=\"cancel\" (click)=\"cancel()\">Cancel</button>\n            </p>\n        </selector>\n    ",
            styles: ["\n        .fixed {\n            max-height: 50vh;\n            overflow-x: hidden;\n            margin-right: -15px;\n            margin-left: -15px;\n            margin-top: -20px;\n            padding-right: 15px;\n            padding-left: 15px;\n            padding-top: 10px;\n        }\n\n        button {\n            min-width: 85px;\n        }\n\n        selector {\n            display: block;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [])
    ], FileSelectorComponent);
    return FileSelectorComponent;
}());
exports.FileSelectorComponent = FileSelectorComponent;
//# sourceMappingURL=file-selector.component.js.map