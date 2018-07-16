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
var logging_1 = require("./logging");
var LogFieldsComponent = /** @class */ (function () {
    function LogFieldsComponent() {
        this.modelChange = new core_1.EventEmitter();
    }
    LogFieldsComponent.prototype.onModelChanged = function () {
        this.modelChange.emit(this.model);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", logging_1.LogFelds)
    ], LogFieldsComponent.prototype, "model", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], LogFieldsComponent.prototype, "modelChange", void 0);
    LogFieldsComponent = __decorate([
        core_1.Component({
            selector: 'logfields',
            template: "\n        <div class=\"row flags\">\n            <div class=\"col-lg-2 col-md-4\">\n                <checkbox2 [(model)]=\"model.date\" (modelChanged)=\"onModelChanged()\">Date</checkbox2>\n                <checkbox2 [(model)]=\"model.time\" (modelChanged)=\"onModelChanged()\">Time</checkbox2>\n                <checkbox2 [(model)]=\"model.time_taken\" (modelChanged)=\"onModelChanged()\">Execution Time</checkbox2>\n            </div>\n            <div class=\"col-lg-2 col-md-4\">\n                <checkbox2 [(model)]=\"model.method\" (modelChanged)=\"onModelChanged()\">HTTP Method</checkbox2>\n                <checkbox2 [(model)]=\"model.http_status\" (modelChanged)=\"onModelChanged()\">HTTP Status</checkbox2>\n                <checkbox2 [(model)]=\"model.http_sub_status\" (modelChanged)=\"onModelChanged()\">HTTP Substatus</checkbox2>\n                <checkbox2 [(model)]=\"model.win_32_status\" (modelChanged)=\"onModelChanged()\">Win32 Status</checkbox2>\n                <checkbox2 [(model)]=\"model.uri_stem\" (modelChanged)=\"onModelChanged()\">URI Stem</checkbox2>\n                <checkbox2 [(model)]=\"model.uri_query\" (modelChanged)=\"onModelChanged()\">URI Query</checkbox2>\n                <checkbox2 [(model)]=\"model.referer\" (modelChanged)=\"onModelChanged()\">Referer</checkbox2>\n                <checkbox2 [(model)]=\"model.cookie\" (modelChanged)=\"onModelChanged()\">Cookies</checkbox2>\n                <checkbox2 [(model)]=\"model.protocol_version\" (modelChanged)=\"onModelChanged()\">Protocol Version</checkbox2>\n                <checkbox2 [(model)]=\"model.bytes_sent\" (modelChanged)=\"onModelChanged()\">Bytes Sent</checkbox2>\n                <checkbox2 [(model)]=\"model.bytes_recv\" (modelChanged)=\"onModelChanged()\">Bytes Received</checkbox2>\n            </div>\n            <div class=\"col-lg-2 col-md-4\">\n                <checkbox2 [(model)]=\"model.client_ip\" (modelChanged)=\"onModelChanged()\">Client IP Address</checkbox2>\n                <checkbox2 [(model)]=\"model.username\" (modelChanged)=\"onModelChanged()\">User Name</checkbox2>\n                <checkbox2 [(model)]=\"model.user_agent\" (modelChanged)=\"onModelChanged()\">User Agent</checkbox2>\n                <checkbox2 [(model)]=\"model.server_ip\" (modelChanged)=\"onModelChanged()\">Server IP Address</checkbox2>\n                <checkbox2 [(model)]=\"model.server_port\" (modelChanged)=\"onModelChanged()\">Server Port</checkbox2>\n                <checkbox2 [(model)]=\"model.host\" (modelChanged)=\"onModelChanged()\">Host Name</checkbox2>\n                <checkbox2 [(model)]=\"model.site_name\" (modelChanged)=\"onModelChanged()\">Site Name</checkbox2>\n                <checkbox2 [(model)]=\"model.computer_name\" (modelChanged)=\"onModelChanged()\">Server Name</checkbox2>\n            </div>\n        </div>\n    ",
            styles: ["\n    "]
        })
    ], LogFieldsComponent);
    return LogFieldsComponent;
}());
exports.LogFieldsComponent = LogFieldsComponent;
var CustomFieldsComponent = /** @class */ (function () {
    function CustomFieldsComponent() {
        this.modelChange = new core_1.EventEmitter();
    }
    CustomFieldsComponent.prototype.ngOnInit = function () {
        this.reset();
    };
    CustomFieldsComponent.prototype.onModelChanged = function () {
        var _this = this;
        this.fields = this.fields.filter(function (f) {
            return _this.isValidCustomField(f);
        });
        this.model = this.fields;
        this.modelChange.emit(this.model);
        this.reset();
    };
    CustomFieldsComponent.prototype.onChanged = function (index) {
        var field = this.fields[index];
        var logAsSpecified = !!field.field_name;
        if (field.source_name && !logAsSpecified) {
            field.field_name = field.source_name;
        }
        if (this.isValidCustomField(field)) {
            this.onModelChanged();
        }
    };
    CustomFieldsComponent.prototype.add = function () {
        if (this._editing >= 0) {
            this.discardChanges(this._editing);
        }
        var field = new logging_1.CustomLogField();
        field.field_name = field.source_name = null;
        field.isNew = true;
        this.fields.splice(0, 0, field);
        this._editing = 0;
    };
    CustomFieldsComponent.prototype.delete = function (index) {
        var field = this.fields[index];
        this.fields.splice(index, 1);
        this.originalFields.splice(index, 1);
        this._editing = -1;
        if (this.isValidCustomField(field)) {
            this.onModelChanged();
        }
    };
    CustomFieldsComponent.prototype.edit = function (index) {
        var editField = this.fields[index];
        if (editField) {
            this.discardChanges(index);
        }
        this._editing = index;
    };
    CustomFieldsComponent.prototype.save = function (index) {
        var field = this.fields[index];
        if (!this.isValidCustomField(field)) {
            return;
        }
        if (this.originalFields.length < this.fields.length) {
            // Add newly created field
            var copy = JSON.parse(JSON.stringify(field));
            this.originalFields.splice(copy, 0, field);
        }
        this._editing = -1;
        field.isNew = false;
        this.onModelChanged();
    };
    CustomFieldsComponent.prototype.discardChanges = function (index) {
        if (this.originalFields.length < this.fields.length) {
            this.fields.splice(index, 1);
        }
        else {
            this.fields[index] = JSON.parse(JSON.stringify(this.originalFields[index]));
        }
        this._editing = -1;
    };
    CustomFieldsComponent.prototype.sourceTypeName = function (sourceType) {
        switch (sourceType) {
            case logging_1.CustomLogFieldSourceType.RequestHeader:
                return "Request Header";
            case logging_1.CustomLogFieldSourceType.ResponseHeader:
                return "Response Header";
            case logging_1.CustomLogFieldSourceType.ServerVariable:
                return "Server Variable";
            default:
                return "Unknown";
        }
    };
    CustomFieldsComponent.prototype.reset = function () {
        this.fields = this.model.slice(0);
        this.originalFields = this.model.slice(0);
        this._editing = -1;
    };
    CustomFieldsComponent.prototype.isValidCustomField = function (field) {
        return !!field.source_type && !!field.source_name && !!field.field_name;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], CustomFieldsComponent.prototype, "model", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], CustomFieldsComponent.prototype, "modelChange", void 0);
    CustomFieldsComponent = __decorate([
        core_1.Component({
            selector: 'customfields',
            template: "\n    <button class=\"create\" [class.inactive]=\"_editing != -1\" (click)=\"add()\"><i class=\"fa fa-plus color-active\"></i>Add Custom Field</button>\n    \n\n    <div class=\"row hidden-xs border-active grid-list-header\" [hidden]=\"fields.length == 0\">\n        <label class=\"col-sm-3 col-lg-2\">Read From</label>\n        <label class=\"col-sm-3 col-lg-4\">Field Name</label>\n        <label class=\"col-sm-6\">Log As</label>\n    </div>\n    <ul class=\"grid-list\">\n        <li *ngFor=\"let field of fields; let i = index;\" class=\"row border-color grid-item\" [class.background-editing]=\"i === _editing\">\n            <div class=\"actions\">\n                <button class=\"no-border no-editing\" title=\"Edit\" [class.inactive]=\"_editing != -1\" (click)=\"edit(i)\" >\n                    <i class=\"fa fa-pencil color-active\"></i>\n                </button>\n                <button [disabled]=\"!isValidCustomField(field)\" class=\"no-border editing\" title=\"Ok\" (click)=\"save(i)\">\n                    <i class=\"fa fa-check color-active\"></i>\n                </button>\n                <button class=\"no-border editing\" title=\"Cancel\" (click)=\"discardChanges(i)\">\n                    <i class=\"fa fa-times red\"></i>\n                </button>\n                <button class=\"no-border\" title=\"Delete\" *ngIf=\"!field.isNew\" [class.inactive]=\"_editing !== -1 && _editing !== i\" (click)=\"delete(i)\">\n                    <i class=\"fa fa-trash-o red\"></i>\n                </button>\n            </div>\n            <div class=\"col-xs-8 col-sm-3 col-lg-2\">\n                <fieldset>\n                    <label class=\"visible-xs\">Read From</label>\n                    <label *ngIf=\"i === _editing\" class=\"hidden-xs\">Read From</label>\n                    <span *ngIf=\"i !== _editing\">{{sourceTypeName(field.source_type)}}</span>\n                    <select *ngIf=\"i === _editing\" [(ngModel)]=\"field.source_type\" class=\"form-control\">\n                        <option value=\"request_header\">Request Header</option>\n                        <option value=\"response_header\">Response Header</option>\n                        <option value=\"server_variable\">Server Variable</option>\n                    </select>\n                </fieldset>\n                <div *ngIf=\"i !== _editing\">\n                    <br class=\"visible-xs\" />\n                </div>\n            </div>\n            <div class=\"col-xs-12 col-sm-3 col-lg-4\">\n                <fieldset>\n                    <label class=\"visible-xs\">Field Name</label>\n                    <label *ngIf=\"i === _editing\" class=\"hidden-xs\">Field Name</label>\n                    <span *ngIf=\"i !== _editing\">{{field.source_name}}</span>\n                    <input *ngIf=\"i === _editing\" [(ngModel)]=\"field.source_name\" throttle class=\"form-control\" type=\"text\" required/>\n                </fieldset>\n                <div *ngIf=\"i !== _editing\">\n                    <br class=\"visible-xs\" />\n                </div>\n            </div>\n            <div class=\"col-xs-12 col-sm-3 col-md-4\">\n                <fieldset>\n                    <label class=\"visible-xs\">Log As</label>\n                    <label *ngIf=\"i === _editing\" class=\"hidden-xs\">Log As</label>\n                    <span *ngIf=\"i !== _editing\">{{field.field_name}}</span>\n                    <input *ngIf=\"i === _editing\" required [(ngModel)]=\"field.field_name\" throttle class=\"form-control\" type=\"text\" required/>\n                </fieldset>\n                <div *ngIf=\"i !== _editing\">\n                    <br class=\"visible-xs\" />\n                </div>\n            </div>\n        </li>\n    </ul>\n   ",
            styles: ["\n        .grid-item:not(.background-editing) fieldset {\n            padding-top: 5px;\n            padding-bottom: 0;\n        }\n    "]
        })
    ], CustomFieldsComponent);
    return CustomFieldsComponent;
}());
exports.CustomFieldsComponent = CustomFieldsComponent;
//# sourceMappingURL=logfields.component.js.map