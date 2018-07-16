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
var sort_pipe_1 = require("../../common/sort.pipe");
var virtual_list_component_1 = require("../../common/virtual-list.component");
var logging_service_1 = require("./logging.service");
var LogFilesComponent = /** @class */ (function () {
    function LogFilesComponent(_service) {
        var _this = this;
        this._service = _service;
        this._orderBy = new sort_pipe_1.OrderBy();
        this._sortPipe = new sort_pipe_1.SortPipe();
        this._subscriptions = [];
        this._range = new virtual_list_component_1.Range(0, 0);
        this._view = [];
        this._selected = [];
        this._subscriptions.push(this._service.logs.subscribe(function (t) {
            _this._logs = t;
            _this.doSort();
        }));
    }
    LogFilesComponent.prototype.ngOnInit = function () {
        this._orderBy.sortDesc('last_modified');
        this.onRefresh();
    };
    LogFilesComponent.prototype.ngOnDestroy = function () {
        for (var _i = 0, _a = this._subscriptions; _i < _a.length; _i++) {
            var sub = _a[_i];
            sub.unsubscribe();
        }
    };
    LogFilesComponent.prototype.onRefresh = function () {
        this._logs = [];
        this._service.loadLogs();
    };
    LogFilesComponent.prototype.onDelete = function () {
        var msg = this._selected.length == 1 ? "Are you sure you want to delete '" + this._selected[0].name + "'?" :
            "Are you sure you want to delete " + this._selected.length + " items?";
        if (confirm(msg)) {
            this._service.delete(this._selected);
        }
    };
    LogFilesComponent.prototype.sort = function (field) {
        this._orderBy.sort(field, false);
        this.doSort();
    };
    LogFilesComponent.prototype.doSort = function () {
        this._logs = this._sortPipe.transform(this._logs, this._orderBy.Field, this._orderBy.Asc);
        this.onRangeChange(this._range);
    };
    LogFilesComponent.prototype.onRangeChange = function (range) {
        this._view.splice(0);
        var end = range.start + range.length < this._logs.length ? range.start + range.length : this._logs.length;
        for (var i = range.start; i < end; i++) {
            this._view.push(this._logs[i]);
        }
        this._range = range;
    };
    LogFilesComponent = __decorate([
        core_1.Component({
            selector: 'log-files',
            template: "\n        <toolbar\n            [refresh]=\"true\"\n            [delete]=\"_selected.length > 0\"\n            (onRefresh)=\"onRefresh()\"\n            (onDelete)=\"onDelete()\"></toolbar>\n        <div tabindex=\"-1\" class=\"wrapper\"\n                        [selectable]=\"_logs\"\n                        [selected]=\"_selected\"\n                        (keyup.delete)=\"onDelete()\">\n            <input class=\"out\" type=\"text\"/>\n            <div class=\"container-fluid\">\n                <div class=\"hidden-xs border-active grid-list-header row\">\n                    <label class=\"col-xs-8 col-sm-5 col-lg-4 hidden-xs\" [ngClass]=\"_orderBy.css('name')\" (click)=\"sort('name')\">Name</label>\n                    <label class=\"col-sm-3 col-md-2 hidden-xs\" [ngClass]=\"_orderBy.css('last_modified')\" (click)=\"sort('last_modified')\">Last Modified</label>\n                    <label class=\"col-md-2 visible-lg visible-md\" [ngClass]=\"_orderBy.css('description')\" (click)=\"sort('description')\">Type</label>\n                    <label class=\"col-md-1 visible-lg visible-md text-right\" [ngClass]=\"_orderBy.css('size')\" (click)=\"sort('size')\">Size</label>\n                </div>\n            </div>\n            <virtual-list class=\"container-fluid grid-list\"\n                        *ngIf=\"!!_logs\"\n                        [count]=\"_logs.length\"\n                        (rangeChange)=\"onRangeChange($event)\">\n                <li class=\"hover-editing\" \n                    tabindex=\"-1\" \n                    *ngFor=\"let child of _view\">\n                    <log-file [model]=\"child\"></log-file>\n                </li>\n            </virtual-list>\n        </div>\n    ",
            styles: ["\n        .container-fluid,\n        .row {\n            margin: 0;\n            padding: 0;\n        }\n\n        .wrapper {\n            min-height: 50vh;\n        }\n\n        .out {\n            position: absolute; \n            left: -1000px;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [logging_service_1.LoggingService])
    ], LogFilesComponent);
    return LogFilesComponent;
}());
exports.LogFilesComponent = LogFilesComponent;
//# sourceMappingURL=log-files.component.js.map