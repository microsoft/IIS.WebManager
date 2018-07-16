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
var ToolbarComponent = /** @class */ (function () {
    function ToolbarComponent() {
        this.newLocation = null;
        this.newFile = null;
        this.newFolder = null;
        this.upload = null;
        this.delete = null;
        this.onNewLocation = new core_1.EventEmitter();
        this.onRefresh = new core_1.EventEmitter();
        this.onNewFile = new core_1.EventEmitter();
        this.onNewFolder = new core_1.EventEmitter();
        this.onUpload = new core_1.EventEmitter();
        this.onDelete = new core_1.EventEmitter();
    }
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ToolbarComponent.prototype, "newLocation", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ToolbarComponent.prototype, "refresh", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ToolbarComponent.prototype, "newFile", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ToolbarComponent.prototype, "newFolder", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ToolbarComponent.prototype, "upload", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ToolbarComponent.prototype, "delete", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ToolbarComponent.prototype, "onNewLocation", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ToolbarComponent.prototype, "onRefresh", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ToolbarComponent.prototype, "onNewFile", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ToolbarComponent.prototype, "onNewFolder", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ToolbarComponent.prototype, "onUpload", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ToolbarComponent.prototype, "onDelete", void 0);
    ToolbarComponent = __decorate([
        core_1.Component({
            selector: 'toolbar',
            template: "\n        <div>\n            <button class=\"delete\" title=\"Delete\" (click)=\"onDelete.next($event)\" *ngIf=\"delete !== null\" [attr.disabled]=\"delete === false || null\"></button>\n            <button title=\"Upload\" (click)=\"onUpload.next()\" *ngIf=\"upload !== null\" [attr.disabled]=\"upload === false || null\"><i class=\"fa fa-upload\"></i></button>\n            <button class=\"fi text-center directory\" title=\"New Folder\" (click)=\"onNewFolder.next()\" *ngIf=\"newFolder !== null\" [attr.disabled]=\"newFolder === false || null\"><i></i></button>\n            <button class=\"fi text-center directory location\" title=\"New Root\" (click)=\"onNewLocation.next()\" *ngIf=\"newLocation !== null\" [attr.disabled]=\"newLocation === false || null\"><i class=\"color-normal\"></i></button>\n            <button title=\"New File\" (click)=\"onNewFile.next()\" *ngIf=\"newFile !== null\" [attr.disabled]=\"newFile === false || null\"><i class=\"fa fa-file-o\"></i></button>\n            <button class=\"refresh\" title=\"Refresh\" (click)=\"onRefresh.next()\" *ngIf=\"refresh !== null\" [attr.disabled]=\"refresh === false || null\"></button>\n        </div>\n        <div class=\"clear\"></div>\n    ",
            styles: ["\n        button span {\n            font-size: 85%;\n        }\n\n        button {\n            border: none;\n            float: right;\n        }\n    "],
            styleUrls: [
                'app/files/file-icons.css'
            ]
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
                common_1.CommonModule
            ],
            exports: [
                ToolbarComponent
            ],
            declarations: [
                ToolbarComponent
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=toolbar.component.js.map