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
var url_rewrite_1 = require("../url-rewrite");
var MappingComponent = /** @class */ (function () {
    function MappingComponent() {
        this.deleteEvent = new core_1.EventEmitter();
    }
    MappingComponent.prototype.ngOnChanges = function (changes) {
        if (changes["mapping"]) {
            this._original = JSON.parse(JSON.stringify(changes["mapping"].currentValue));
        }
    };
    MappingComponent.prototype.edit = function () {
        this._editing = true;
    };
    MappingComponent.prototype.onSave = function () {
        this._editing = false;
        this._original = JSON.parse(JSON.stringify(this.mapping));
    };
    MappingComponent.prototype.onCancel = function () {
        this._editing = false;
        this.mapping = JSON.parse(JSON.stringify(this._original));
    };
    MappingComponent.prototype.delete = function () {
        this.deleteEvent.next();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", url_rewrite_1.RewriteMapping)
    ], MappingComponent.prototype, "mapping", void 0);
    __decorate([
        core_1.Output('delete'),
        __metadata("design:type", core_1.EventEmitter)
    ], MappingComponent.prototype, "deleteEvent", void 0);
    MappingComponent = __decorate([
        core_1.Component({
            selector: 'rewrite-mapping',
            template: "\n        <div *ngIf=\"mapping && !_editing\" class=\"grid-item row\" [class.background-selected]=\"_editing\" (dblclick)=\"edit()\">\n            <div class=\"col-xs-6 col-sm-4 valign\">\n                {{mapping.name}}\n            </div>\n            <div class=\"col-xs-6 col-sm-4 valign\">\n                {{mapping.value}}\n            </div>\n            <div class=\"actions\">\n                <div class=\"action-selector\">\n                    <button title=\"More\" (click)=\"selector.toggle()\" (dblclick)=\"$event.preventDefault()\" [class.background-active]=\"(selector && selector.opened) || false\">\n                        <i class=\"fa fa-ellipsis-h\"></i>\n                    </button>\n                    <selector #selector [right]=\"true\">\n                        <ul>\n                            <li><button #menuButton class=\"edit\" title=\"Edit\" (click)=\"edit()\">Edit</button></li>\n                            <li><button #menuButton class=\"delete\" title=\"Delete\" (click)=\"delete()\">Delete</button></li>\n                        </ul>\n                    </selector>\n                </div>\n            </div>\n        </div>\n        <rewrite-mapping-edit\n            *ngIf=\"_editing\"\n            [mapping]=\"mapping\"\n            (save)=\"onSave()\"\n            (cancel)=\"onCancel()\"></rewrite-mapping-edit>\n    "
        })
    ], MappingComponent);
    return MappingComponent;
}());
exports.MappingComponent = MappingComponent;
var MappingEditComponent = /** @class */ (function () {
    function MappingEditComponent() {
        this.cancel = new core_1.EventEmitter();
        this.save = new core_1.EventEmitter();
    }
    MappingEditComponent.prototype.isValid = function () {
        return !!this.mapping.name && !!this.mapping.value;
    };
    MappingEditComponent.prototype.onDiscard = function () {
        this.cancel.emit();
    };
    MappingEditComponent.prototype.onOk = function () {
        this.save.emit(this.mapping);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", url_rewrite_1.RewriteMapping)
    ], MappingEditComponent.prototype, "mapping", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], MappingEditComponent.prototype, "cancel", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], MappingEditComponent.prototype, "save", void 0);
    MappingEditComponent = __decorate([
        core_1.Component({
            selector: 'rewrite-mapping-edit',
            template: "\n        <div *ngIf=\"mapping\" class=\"grid-item row background-editing\">\n            <div class=\"actions\">\n                <button class=\"no-border ok\" [disabled]=\"!isValid()\" title=\"Ok\" (click)=\"onOk()\"></button>\n                <button class=\"no-border cancel\" title=\"Cancel\" (click)=\"onDiscard()\"></button>\n            </div>\n            <fieldset>\n                <label>Name</label>\n                <input type=\"text\" required class=\"form-control name\" [(ngModel)]=\"mapping.name\" />\n            </fieldset>\n            <fieldset>\n                <label>Value</label>\n                <input type=\"text\" required class=\"form-control name\" [(ngModel)]=\"mapping.value\" />\n            </fieldset>\n        </div>\n    ",
            styles: ["\n        fieldset {\n            padding-left: 15px;\n            padding-right: 15px;\n        }\n    "]
        })
    ], MappingEditComponent);
    return MappingEditComponent;
}());
exports.MappingEditComponent = MappingEditComponent;
//# sourceMappingURL=mapping.component.js.map