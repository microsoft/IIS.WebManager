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
var url_rewrite_service_1 = require("../service/url-rewrite.service");
var url_rewrite_1 = require("../url-rewrite");
var RewriteMapEditComponent = /** @class */ (function () {
    function RewriteMapEditComponent(_svc) {
        this._svc = _svc;
        this.cancel = new core_1.EventEmitter();
        this.save = new core_1.EventEmitter();
    }
    RewriteMapEditComponent.prototype.isValid = function () {
        return !!this.map.name &&
            !this.map.mappings.find(function (map) { return !map.name || !map.value; });
    };
    RewriteMapEditComponent.prototype.add = function () {
        var mapping = new url_rewrite_1.RewriteMapping();
        mapping.name = "New mapping";
        var i = 1;
        while (this.map.mappings.find(function (m) { return m.name.toLocaleLowerCase() == mapping.name.toLocaleLowerCase(); })) {
            mapping.name = "New Mapping " + (i++);
        }
        this._newMapping = mapping;
    };
    RewriteMapEditComponent.prototype.onDelete = function (index) {
        this.map.mappings.splice(index, 1);
    };
    RewriteMapEditComponent.prototype.onDiscard = function () {
        this.cancel.emit();
    };
    RewriteMapEditComponent.prototype.onOk = function () {
        this.save.emit(this.map);
    };
    RewriteMapEditComponent.prototype.saveNew = function (mapping) {
        this.map.mappings.push(mapping);
        this._newMapping = null;
    };
    RewriteMapEditComponent.prototype.discardNew = function () {
        this._newMapping = null;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", url_rewrite_1.RewriteMap)
    ], RewriteMapEditComponent.prototype, "map", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], RewriteMapEditComponent.prototype, "cancel", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], RewriteMapEditComponent.prototype, "save", void 0);
    RewriteMapEditComponent = __decorate([
        core_1.Component({
            selector: 'rewrite-map-edit',
            template: "\n        <div *ngIf=\"map\">\n            <fieldset>\n                <label>Name</label>\n                <input type=\"text\" required class=\"form-control name\" [(ngModel)]=\"map.name\" />\n            </fieldset>\n            <fieldset>\n                <label>Default Value</label>\n                <input type=\"text\" class=\"form-control name\" [(ngModel)]=\"map.default_value\" />\n            </fieldset>\n            <fieldset>\n                <label>Ignore Case</label>\n                <switch [(model)]=\"map.ignore_case\">{{map.ignore_case ? \"Yes\" : \"No\"}}</switch>\n            </fieldset>\n            \n            <button (click)=\"add()\" class=\"create\"><span>Add Mapping</span></button>\n            <div class=\"container-fluid\">\n                <div class=\"row hidden-xs border-active grid-list-header\">\n                    <label class=\"col-xs-6 col-sm-4\">Name</label>\n                    <label class=\"col-xs-6 col-sm-4\">Value</label>\n                </div>\n            </div>\n\n            <ul class=\"grid-list container-fluid\">\n                <li *ngIf=\"_newMapping\">\n                    <rewrite-mapping-edit [mapping]=\"_newMapping\" (save)=\"saveNew($event)\" (cancel)=\"discardNew()\"></rewrite-mapping-edit>\n                </li>\n                <li *ngFor=\"let mapping of map.mappings\">\n                    <rewrite-mapping [mapping]=\"mapping\" (delete)=\"onDelete(i)\"></rewrite-mapping>\n                </li>\n            </ul>\n\n            <p class=\"pull-right\">\n                <button [disabled]=\"!isValid()\" (click)=\"onOk()\" class=\"ok\">OK</button>\n                <button (click)=\"onDiscard()\" class=\"cancel\">Cancel</button>\n            </p>\n        </div>\n    ",
            styles: ["\n        p {\n            margin: 20px 0;\n        }\n\n        .create {\n            margin-top: 30px;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [url_rewrite_service_1.UrlRewriteService])
    ], RewriteMapEditComponent);
    return RewriteMapEditComponent;
}());
exports.RewriteMapEditComponent = RewriteMapEditComponent;
//# sourceMappingURL=rewrite-map-edit.js.map