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
var notification_service_1 = require("../notification/notification.service");
var primitives_1 = require("../common/primitives");
var files_service_1 = require("../files/files.service");
var file_nav_service_1 = require("../files/file-nav.service");
var file_1 = require("./file");
var FileComponent = /** @class */ (function () {
    function FileComponent(_svc, _nav, _notificationService) {
        this._svc = _svc;
        this._nav = _nav;
        this._notificationService = _notificationService;
        this.modelChanged = new core_1.EventEmitter();
        this._date = null;
        this._location = null;
        this._editing = false;
    }
    Object.defineProperty(FileComponent.prototype, "isRoot", {
        get: function () {
            return this.model.isLocation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FileComponent.prototype, "href", {
        get: function () {
            return window.location.pathname + "#" + this.model.physical_path;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FileComponent.prototype, "displayDate", {
        get: function () {
            if (!this._date) {
                this._date = primitives_1.Humanizer.date(this.model.last_modified);
            }
            return this._date;
        },
        enumerable: true,
        configurable: true
    });
    FileComponent.prototype.rename = function (name) {
        if (name) {
            this._svc.rename(this.model, name);
            this.modelChanged.emit(this.model);
        }
        this._editing = false;
    };
    FileComponent.prototype.onRename = function (e) {
        e.preventDefault();
        this._editing = true;
    };
    FileComponent.prototype.onEdit = function (e) {
        var _this = this;
        e.preventDefault();
        this._svc.getLocation(this.model.id)
            .then(function (loc) {
            _this._location = loc;
            _this._editing = true;
        });
    };
    FileComponent.prototype.onBlur = function (event) {
        if (event && event.target && event.target.value === this.model.name) {
            //
            // No change. Force cancel
            this.cancel();
        }
    };
    FileComponent.prototype.onCancel = function (e) {
        e.preventDefault();
        this.cancel();
    };
    FileComponent.prototype.onDelete = function (e) {
        var _this = this;
        e.preventDefault();
        var title = this.model.isLocation ? "Remove Root Folder" : "Delete File";
        var msg = this.model.isLocation ? "Are you sure you want to remove the root folder '" + this.model.name + "'?" :
            "Are you sure you want to delete '" + this.model.name + "'?";
        this._notificationService.confirm(title, msg)
            .then(function (confirmed) {
            if (confirmed) {
                if (!_this.model.isLocation) {
                    _this._svc.delete([_this.model]);
                }
                else {
                    _this._svc.deleteLocations([_this.model]);
                }
            }
        });
    };
    FileComponent.prototype.onDownload = function (e) {
        e.preventDefault();
        this._svc.download(this.model);
    };
    FileComponent.prototype.prevent = function (e) {
        e.preventDefault();
    };
    FileComponent.prototype.cancel = function () {
        this._editing = false;
        this._location = null;
    };
    FileComponent.prototype.onClickName = function (e) {
        e.preventDefault();
        this._nav.load(this.model.physical_path);
    };
    FileComponent.prototype.getSize = function () {
        return this.model.size ? primitives_1.Humanizer.number(Math.ceil(this.model.size / 1024)) + ' KB' : null;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", file_1.ApiFile)
    ], FileComponent.prototype, "model", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], FileComponent.prototype, "modelChanged", void 0);
    FileComponent = __decorate([
        core_1.Component({
            selector: 'file',
            template: "\n        <div *ngIf=\"model\" class=\"grid-item row\" [class.background-editing]=\"_editing && !_location\" [class.background-selected]=\"_editing && _location\" (keyup.f2)=\"onRename($event)\" tabindex=\"-1\">\n            <div class=\"col-xs-9 col-sm-5 col-lg-4 fi\" [ngClass]=\"[model.type, model.extension, (isRoot ? 'location' : '')]\">\n                <div *ngIf=\"!_editing || _location\">\n                    <a class=\"color-normal hover-color-active\" [href]=\"href\" nofocus (click)=\"onClickName($event)\"><i></i>{{model.alias || model.name}}</a>\n                </div>\n                <div *ngIf=\"_editing && !_location\">\n                    <i></i>\n                    <input class=\"form-control inline-block\" type=\"text\" \n                           [ngModel]=\"model.name\"\n                           (ngModelChange)=\"rename($event)\"\n                           (blur)=\"onBlur($event)\"\n                           (keyup.enter)=\"_editing=false\"\n                           (keyup.esc)=\"onCancel($event)\"\n                           (keyup.delete)=\"$event.stopImmediatePropagation()\"\n                           (dblclick)=\"prevent($event)\"\n                           required throttle autofocus/>\n                </div>\n            </div>\n            <div class=\"col-sm-3 col-md-2 hidden-xs valign support\">\n                <span *ngIf=\"model.last_modified\">{{displayDate}}</span>\n            </div>     \n            <div class=\"col-md-2 visible-lg visible-md valign support\">\n                {{this.model.description}}\n            </div>\n            <div class=\"col-md-1 visible-lg visible-md valign text-right support\">\n                <span *ngIf=\"model.size\">{{getSize()}}</span>\n            </div>\n            <div class=\"actions\">\n                <div class=\"action-selector\">\n                    <button title=\"More\" (click)=\"selector.toggle()\" (dblclick)=\"prevent($event)\" [class.background-active]=\"(selector && selector.opened) || false\">\n                        <i class=\"fa fa-ellipsis-h\"></i>\n                    </button>\n                    <selector #selector [right]=\"true\">\n                        <ul>\n                            <li><button *ngIf=\"!isRoot\" #menuButton class=\"edit\" title=\"Rename\" (click)=\"onRename($event)\">Rename</button></li>\n                            <li><button *ngIf=\"isRoot\" #menuButton class=\"edit\" title=\"Edit\" (click)=\"onEdit($event)\">Edit</button></li>\n                            <li><button class=\"download\" #menuButton title=\"Download\" *ngIf=\"model.type=='file'\" (click)=\"onDownload($event)\">Download</button></li>\n                            <li><button *ngIf=\"!isRoot\" #menuButton class=\"delete\" title=\"Delete\" (click)=\"onDelete($event)\">Delete</button></li>\n                            <li><button *ngIf=\"isRoot\" #menuButton class=\"delete\" title=\"Delete\" (click)=\"onDelete($event)\">Remove</button></li>\n                        </ul>\n                    </selector>\n                </div>\n            </div>\n        </div>\n        <selector #editSelector [opened]=\"true\" *ngIf=\"_location && _editing\" class=\"container-fluid\" (hide)=\"cancel()\">\n            <edit-location *ngIf=\"_location && _editing\" [model]=\"_location\" (cancel)=\"cancel()\" (dblclick)=\"prevent($event)\" (keyup.delete)=\"prevent($event)\"></edit-location>\n        </selector>\n    ",
            styles: ["\n        a {\n            display: inline;\n            background: transparent;\n        }\n\n        [class*=\"col-\"] {\n            overflow: hidden;\n            text-overflow: ellipsis;\n            white-space: nowrap;\n        }\n\n        .support {\n            font-size: 85%;\n        }\n\n        .form-control {\n            width: 90%;\n        }\n\n        .row {\n            margin: 0px;\n        }\n    "],
            styleUrls: [
                'app/files/file-icons.css'
            ]
        }),
        __param(0, core_1.Inject("FilesService")),
        __metadata("design:paramtypes", [files_service_1.FilesService,
            file_nav_service_1.FileNavService,
            notification_service_1.NotificationService])
    ], FileComponent);
    return FileComponent;
}());
exports.FileComponent = FileComponent;
//# sourceMappingURL=file-list-item.js.map