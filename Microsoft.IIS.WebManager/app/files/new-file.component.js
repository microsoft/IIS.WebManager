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
var file_1 = require("./file");
var NewFileComponent = /** @class */ (function () {
    function NewFileComponent() {
        this.cancel = new core_1.EventEmitter();
        this.save = new core_1.EventEmitter();
    }
    NewFileComponent.prototype.onOk = function () {
        if (this.model.name) {
            this.save.next();
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", file_1.ApiFile)
    ], NewFileComponent.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", file_1.ApiFile)
    ], NewFileComponent.prototype, "parent", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], NewFileComponent.prototype, "type", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], NewFileComponent.prototype, "cancel", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], NewFileComponent.prototype, "save", void 0);
    NewFileComponent = __decorate([
        core_1.Component({
            selector: 'new-file',
            template: "\n        <div class=\"grid-item row background-editing\">\n            <div class=\"col-xs-8 col-sm-5 col-md-5 col-lg-4 col-left fi\" [ngClass]=\"type || (model && model.type)\">\n                <i class=\"pull-left\"></i>\n                <span class=\"fill\"><input [(ngModel)]=\"model.name\" class=\"form-control\" type=\"text\" (keyup.enter)=\"onOk()\" (blur)=\"onOk()\" (keyup.esc)=\"cancel.next()\" autofocus></span>\n            </div>\n        </div>\n    ",
            styles: ["\n        .col-left {\n            padding-right: 40px;\n        }\n\n        .row {\n            margin: 0px;\n        }\n    "],
            styleUrls: [
                'app/files/file-icons.css'
            ]
        })
    ], NewFileComponent);
    return NewFileComponent;
}());
exports.NewFileComponent = NewFileComponent;
//# sourceMappingURL=new-file.component.js.map