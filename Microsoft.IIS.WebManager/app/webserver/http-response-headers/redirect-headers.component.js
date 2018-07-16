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
var http_response_headers_1 = require("./http-response-headers");
var RedirectHeadersComponent = /** @class */ (function () {
    function RedirectHeadersComponent() {
        this.add = new core_1.EventEmitter();
        this.delete = new core_1.EventEmitter();
        this.save = new core_1.EventEmitter();
    }
    RedirectHeadersComponent.prototype.ngOnInit = function () {
        this._editing = -1;
    };
    RedirectHeadersComponent.prototype.create = function () {
        if (this.headers.length > 0 && !(this.headers[0].id))
            return;
        this.discard();
        var newHeader = new http_response_headers_1.RedirectHeader();
        newHeader.name = "";
        newHeader.value = "";
        newHeader.http_response_headers = this.model;
        this.headers.unshift(newHeader);
        this.originalHeaders.unshift(newHeader);
        this._editing = 0;
    };
    RedirectHeadersComponent.prototype.edit = function (index) {
        if (this.discard()) {
            this._editing = index;
        }
        else {
            this._editing = index - 1;
        }
    };
    RedirectHeadersComponent.prototype.discard = function () {
        if (this._editing != -1) {
            if (this.headers[this._editing].id) {
                this.setHeader(this._editing, this.originalHeaders[this._editing]);
                this._editing = -1;
                return true;
            }
            else {
                this.onDelete(this._editing);
                return false;
            }
        }
        return true;
    };
    RedirectHeadersComponent.prototype.onFinishEditing = function (index) {
        if (this.headers[index].name && this.headers[index].value) {
            if (this.headers[index] && this.headers[index].id) {
                this.save.emit(index);
                this._editing = -1;
            }
            else {
                this.add.emit(index);
                this._editing = -1;
            }
        }
        else {
            return;
        }
    };
    RedirectHeadersComponent.prototype.onDelete = function (index) {
        if (this.headers[index].id)
            this.delete.emit(this.headers[index]);
        this.headers.splice(index, 1);
        this.originalHeaders.splice(index, 1);
        if (this._editing == index) {
            this._editing = -1;
        }
        else if (this._editing > index) {
            this._editing -= 1;
        }
    };
    RedirectHeadersComponent.prototype.setHeader = function (index, header) {
        this.headers[index] = header;
        this.originalHeaders[index] = JSON.parse(JSON.stringify(header));
    };
    RedirectHeadersComponent.prototype.isValid = function (header) {
        return header.name && header.value;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", http_response_headers_1.HttpResponseHeaders)
    ], RedirectHeadersComponent.prototype, "model", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], RedirectHeadersComponent.prototype, "headers", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], RedirectHeadersComponent.prototype, "originalHeaders", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], RedirectHeadersComponent.prototype, "locked", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], RedirectHeadersComponent.prototype, "add", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], RedirectHeadersComponent.prototype, "delete", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], RedirectHeadersComponent.prototype, "save", void 0);
    RedirectHeadersComponent = __decorate([
        core_1.Component({
            selector: 'redirect-headers',
            template: "\n        <button class=\"create\" [disabled]=\"locked\" (click)=\"create()\" [class.inactive]=\"_editing != -1\"><i class=\"fa fa-plus color-active\"></i><span>Add</span></button>\n        <div class=\"container-fluid\">\n            <div class=\"row hidden-xs border-active grid-list-header\" [hidden]=\"headers.length == 0\">\n                <label class=\"col-sm-4 col-lg-5\">Name</label>\n                <label class=\"col-sm-6 col-lg-5\">Value</label>\n            </div>\n        </div>\n        <ul class=\"grid-list container-fluid\">\n            <li *ngFor=\"let header of headers; let i = index;\">\n                <div class=\"row grid-item\" [class.background-editing]=\"_editing == i\">\n                    <div class=\"actions\">\n                        <button class=\"no-border\" [disabled]=\"locked || !isValid(header) || null\" title=\"Ok\" *ngIf=\"_editing == i\" (click)=\"onFinishEditing(i)\">\n                            <i class=\"fa fa-check color-active\"></i>\n                        </button>\n                        <button class=\"no-border\" title=\"Cancel\" *ngIf=\"_editing == i\" (click)=\"discard()\">\n                            <i class=\"fa fa-times red\"></i>\n                        </button>\n                        <button class=\"no-border\" title=\"Edit\" [class.inactive]=\"_editing != -1\" *ngIf=\"_editing != i\" (click)=\"edit(i)\">\n                            <i class=\"fa fa-pencil color-active\"></i>\n                        </button>\n                        <button class=\"no-border\" *ngIf=\"header.id\" [disabled]=\"locked || _editing == i\" title=\"Delete\"  [class.inactive]=\"_editing !== -1 && _editing !== i\" (click)=\"onDelete(i)\">\n                            <i class=\"fa fa-trash-o red\"></i>\n                        </button>\n                    </div>\n                    <fieldset class=\"col-xs-12 col-sm-4 col-lg-5\">\n                        <label class=\"visible-xs\">Name</label>\n                        <label *ngIf=\"_editing == i\" class=\"hidden-xs\">Name</label>\n                        <span *ngIf=\"_editing != i\">{{header.name}}</span>\n                        <input *ngIf=\"_editing == i\" [disabled]=\"locked\" class=\"form-control\" type=\"text\" [(ngModel)]=\"header.name\" throttle required />\n                        <div *ngIf=\"_editing !== i\">\n                            <br class=\"visible-xs\" />\n                        </div>\n                    </fieldset>\n                    <fieldset class=\"col-xs-12 col-sm-6 col-lg-5\">\n                        <label class=\"visible-xs\">Value</label>\n                        <label *ngIf=\"_editing == i\" class=\"hidden-xs\">Value</label>\n                        <span *ngIf=\"_editing != i\">{{header.value}}</span>\n                        <input *ngIf=\"_editing == i\" [disabled]=\"locked\" class=\"form-control\" type=\"text\" [(ngModel)]=\"header.value\" throttle required />\n                    </fieldset>\n                </div>\n            </li>\n        </ul>\n    ",
            styles: ["\n        .grid-item:not(.background-editing) fieldset {\n            padding-top: 5px;\n            padding-bottom: 0;\n        }\n    "]
        })
    ], RedirectHeadersComponent);
    return RedirectHeadersComponent;
}());
exports.RedirectHeadersComponent = RedirectHeadersComponent;
//# sourceMappingURL=redirect-headers.component.js.map