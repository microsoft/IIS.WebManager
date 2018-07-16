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
var files_service_1 = require("./files.service");
var location_1 = require("./location");
var LocationEditComponent = /** @class */ (function () {
    function LocationEditComponent(_svc) {
        this._svc = _svc;
        this.cancel = new core_1.EventEmitter();
        this.save = new core_1.EventEmitter();
    }
    LocationEditComponent.prototype.ngOnInit = function () {
        this._read = !!(this.model.claims && this.model.claims.find(function (c) { return c == "read"; }));
        this._write = !!(this.model.claims && this.model.claims.find(function (c) { return c == "write"; }));
    };
    LocationEditComponent.prototype.onOk = function () {
        if (this.model.alias) {
            this.model.claims = [];
            if (this._read) {
                this.model.claims.push("read");
            }
            if (this._write) {
                this.model.claims.push("write");
            }
            if (this.model.id) {
                this._svc.updateLocation(this.model, this.model);
            }
            this.save.next();
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", location_1.Location)
    ], LocationEditComponent.prototype, "model", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], LocationEditComponent.prototype, "cancel", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], LocationEditComponent.prototype, "save", void 0);
    LocationEditComponent = __decorate([
        core_1.Component({
            selector: 'edit-location',
            template: "\n        <div>\n            <fieldset class=\"name\">\n                <label>Alias</label>\n                <input [(ngModel)]=\"model.alias\" class=\"form-control\" type=\"text\" autofocus>\n            </fieldset>\n            <fieldset class=\"path\">\n                <label>Physical Path</label>\n                <input [(ngModel)]=\"model.path\" class=\"form-control\" type=\"text\">\n            </fieldset>\n            <fieldset>\n                <label>Permissions</label>\n                <div class=\"flags\">\n                    <checkbox2 [(model)]=\"_read\">Read</checkbox2>\n                    <checkbox2 [(model)]=\"_write\">Write</checkbox2>\n                </div>\n            </fieldset>\n            <p class=\"pull-right\">\n                <button class=\"ok\" (click)=\"onOk()\">{{model.id ? 'OK' : 'Create'}}</button>\n                <button class=\"cancel\" (click)=\"cancel.next()\">Cancel</button>\n            </p>\n        </div>\n    "
        }),
        __param(0, core_1.Inject("FilesService")),
        __metadata("design:paramtypes", [files_service_1.FilesService])
    ], LocationEditComponent);
    return LocationEditComponent;
}());
exports.LocationEditComponent = LocationEditComponent;
//# sourceMappingURL=edit-location.component.js.map