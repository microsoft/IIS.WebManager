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
var selector_1 = require("../../common/selector");
var primitives_1 = require("../../common/primitives");
var httpclient_1 = require("../../common/httpclient");
var file_1 = require("../../files/file");
var logging_service_1 = require("./logging.service");
var files_service_1 = require("../../files/files.service");
var LogFileComponent = /** @class */ (function () {
    function LogFileComponent(_svc, _fileService, _http) {
        this._svc = _svc;
        this._fileService = _fileService;
        this._http = _http;
    }
    Object.defineProperty(LogFileComponent.prototype, "url", {
        get: function () {
            return window.location.pathname + "#" + this.model.name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LogFileComponent.prototype, "displayDate", {
        get: function () {
            return primitives_1.Humanizer.date(this.model.last_modified);
        },
        enumerable: true,
        configurable: true
    });
    LogFileComponent.prototype.onDownload = function (e) {
        e.preventDefault();
        this.selector.close();
        this._fileService.download(this.model);
    };
    LogFileComponent.prototype.onClickName = function (e) {
        e.preventDefault();
    };
    LogFileComponent.prototype.onDelete = function () {
        this._svc.delete([this.model]);
    };
    LogFileComponent.prototype.getSize = function () {
        return this.model.size ? primitives_1.Humanizer.number(Math.ceil(this.model.size / 1024)) + ' KB' : null;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", file_1.ApiFile)
    ], LogFileComponent.prototype, "model", void 0);
    __decorate([
        core_1.ViewChild(selector_1.Selector),
        __metadata("design:type", selector_1.Selector)
    ], LogFileComponent.prototype, "selector", void 0);
    LogFileComponent = __decorate([
        core_1.Component({
            selector: 'log-file',
            template: "\n        <div *ngIf=\"model\" class=\"grid-item row\" tabindex=\"-1\">\n            <div class=\"col-xs-9 col-sm-5 col-lg-4 valign\" [ngClass]=\"[model.type, model.extension]\">\n                    <a class=\"color-normal hover-color-active\" [href]=\"url\" (click)=\"onClickName($event)\"><i></i>{{model.name}}</a>\n            </div>\n            <div class=\"col-sm-3 col-md-2 hidden-xs valign support\">\n                <span *ngIf=\"model.last_modified\">{{displayDate}}</span>\n            </div>     \n            <div class=\"col-md-2 visible-lg visible-md valign support\">\n                {{this.model.description}}\n            </div>\n            <div class=\"col-md-1 visible-lg visible-md valign text-right support\">\n                <span *ngIf=\"model.size\">{{getSize()}}</span>\n            </div>\n            <div class=\"actions\">\n                <div class=\"selector-wrapper\">\n                    <button title=\"More\" (click)=\"selector.toggle()\" (dblclick)=\"prevent($event)\" [class.background-active]=\"selector && selector.opened\">\n                        <i class=\"fa fa-ellipsis-h\"></i>\n                    </button>\n                    <selector #selector [right]=\"true\">\n                        <ul>\n                            <li><button title=\"Download\" class=\"download\" *ngIf=\"model.type=='file'\" (click)=\"onDownload($event)\">Download</button></li>\n                            <li><button class=\"delete\" (click)=\"onDelete($event)\">Delete</button></li>\n                        </ul>\n                    </selector>\n                </div>\n            </div>\n        </div>\n    ",
            styles: ["\n        a {\n            display: inline;\n            background: transparent;\n        }\n\n        [class*=\"col-\"] {\n            overflow: hidden;\n            text-overflow: ellipsis;\n            white-space: nowrap;\n        }\n\n        .form-control {\n            width: 90%;\n        }\n\n        .row {\n            margin: 0px;\n        }\n\n        .selector-wrapper {\n            position: relative;\n        }\n\n        selector {\n            position:absolute;\n            right:0;\n            top: 32px;\n        }\n\n        selector button {\n            min-width: 125px;\n            width: 100%;\n        }"
            ],
            styleUrls: [
                'app/files/file-icons.css'
            ]
        }),
        __param(1, core_1.Inject("FilesService")),
        __metadata("design:paramtypes", [logging_service_1.LoggingService,
            files_service_1.FilesService,
            httpclient_1.HttpClient])
    ], LogFileComponent);
    return LogFileComponent;
}());
exports.LogFileComponent = LogFileComponent;
//# sourceMappingURL=log-file.component.js.map