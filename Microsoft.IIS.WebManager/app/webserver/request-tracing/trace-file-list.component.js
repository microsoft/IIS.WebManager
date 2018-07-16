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
var request_tracing_service_1 = require("./request-tracing.service");
var TraceFileListComponent = /** @class */ (function () {
    function TraceFileListComponent(_service) {
        var _this = this;
        this._service = _service;
        this._orderBy = new sort_pipe_1.OrderBy();
        this._sortPipe = new sort_pipe_1.SortPipe();
        this._subscriptions = [];
        this._range = new virtual_list_component_1.Range(0, 0);
        this._view = [];
        this._selected = [];
        this._subscriptions.push(this._service.traces.subscribe(function (t) {
            _this._traces = t;
            _this.doSort();
        }));
        this._subscriptions.push(this._service.traceError.subscribe(function (e) {
            _this._error = e;
        }));
    }
    TraceFileListComponent.prototype.ngOnInit = function () {
        this._orderBy.sortDesc('date');
        this.onRefresh();
    };
    TraceFileListComponent.prototype.ngOnDestroy = function () {
        for (var _i = 0, _a = this._subscriptions; _i < _a.length; _i++) {
            var sub = _a[_i];
            sub.unsubscribe();
        }
    };
    TraceFileListComponent.prototype.onRefresh = function () {
        this._traces = [];
        this._service.loadTraces();
    };
    TraceFileListComponent.prototype.onDelete = function () {
        var msg = this._selected.length == 1 ? "Are you sure you want to delete '" + this._selected[0].file_info.name + "'?" :
            "Are you sure you want to delete " + this._selected.length + " items?";
        if (confirm(msg)) {
            this._service.delete(this._selected);
        }
    };
    TraceFileListComponent.prototype.sort = function (field) {
        this._orderBy.sort(field, false);
        this.doSort();
    };
    TraceFileListComponent.prototype.doSort = function () {
        this._traces = this._sortPipe.transform(this._traces, this._orderBy.Field, this._orderBy.Asc);
        this.onRangeChange(this._range);
    };
    TraceFileListComponent.prototype.onRangeChange = function (range) {
        this._view.splice(0);
        var end = range.start + range.length < this._traces.length ? range.start + range.length : this._traces.length;
        for (var i = range.start; i < end; i++) {
            this._view.push(this._traces[i]);
        }
        this._range = range;
    };
    TraceFileListComponent = __decorate([
        core_1.Component({
            selector: 'trace-files',
            template: "\n        <toolbar\n            [refresh]=\"true\"\n            [delete]=\"_selected.length > 0\"\n            (onRefresh)=\"onRefresh()\"\n            (onDelete)=\"onDelete()\"></toolbar>\n        <div tabindex=\"-1\" class=\"wrapper\"\n                        [selectable]=\"_traces\"\n                        [selected]=\"_selected\"\n                        (keyup.delete)=\"onDelete()\">\n            <input class=\"out\" type=\"text\"/>\n            <div #header class=\"container-fluid\">\n                <div class=\"hidden-xs border-active grid-list-header row\">\n                    <label class=\"col-xs-8 col-sm-3 col-lg-2\" [ngClass]=\"_orderBy.css('file_info.name')\" (click)=\"sort('file_info.name')\">Name</label>\n                    <label class=\"col-sm-4 col-lg-3 hidden-xs\" [ngClass]=\"_orderBy.css('url')\" (click)=\"sort('url')\">Url</label>\n                    <label class=\"col-md-1 visible-lg text-right\" [ngClass]=\"_orderBy.css('method')\" (click)=\"sort('method')\">Method</label>\n                    <label class=\"col-md-1 visible-lg visible-md text-right\" [ngClass]=\"_orderBy.css('status_code')\" (click)=\"sort('status_code')\">Status</label>\n                    <label class=\"col-md-1 visible-lg visible-md text-right\" [ngClass]=\"_orderBy.css('time_taken')\" (click)=\"sort('time_taken')\">Duration</label>\n                    <label class=\"col-sm-3 col-md-2 hidden-xs\" [ngClass]=\"_orderBy.css('date')\" (click)=\"sort('date')\">Date</label>\n                </div>\n            </div>\n            <div *ngIf=\"_error && _error.message\">\n                <warning [warning]=\"_error.message\"></warning>\n            </div>\n            <virtual-list class=\"container-fluid grid-list\"\n                        *ngIf=\"!!_traces\"\n                        [count]=\"_traces.length\"\n                        (rangeChange)=\"onRangeChange($event)\">\n                <li class=\"hover-editing\" \n                    tabindex=\"-1\" \n                    *ngFor=\"let child of _view\">\n                    <trace-file [model]=\"child\"></trace-file>\n                </li>\n            </virtual-list>\n        </div>\n    ",
            styles: ["\n        .container-fluid,\n        .row {\n            margin: 0;\n            padding: 0;\n        }\n\n        navigation {\n            margin-bottom: 10px;\n        }\n\n        .wrapper {\n            min-height: 50vh;\n        }\n\n        .out {\n            position: absolute; \n            left: -1000px;\n        }\n\n        .drag-info {\n            position: absolute;\n            transform: translateX(-500px);\n            padding: 0 5px;\n            font-size: 120%;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [request_tracing_service_1.RequestTracingService])
    ], TraceFileListComponent);
    return TraceFileListComponent;
}());
exports.TraceFileListComponent = TraceFileListComponent;
//# sourceMappingURL=trace-file-list.component.js.map