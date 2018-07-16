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
require("rxjs/add/operator/buffer");
require("rxjs/add/operator/take");
var IntervalObservable_1 = require("rxjs/observable/IntervalObservable");
var notification_service_1 = require("../../notification/notification.service");
var sort_pipe_1 = require("../../common/sort.pipe");
var virtual_list_component_1 = require("../../common/virtual-list.component");
var webfiles_service_1 = require("./webfiles.service");
var webfile_1 = require("./webfile");
var WebFileListComponent = /** @class */ (function () {
    function WebFileListComponent(_svc, _notificationService) {
        this._svc = _svc;
        this._notificationService = _notificationService;
        this._newDir = null;
        this._orderBy = new sort_pipe_1.OrderBy();
        this._sortPipe = new sort_pipe_1.SortPipe();
        this._filter = "";
        this._subscriptions = [];
        this._range = new virtual_list_component_1.Range(0, 0);
        this._selected = [];
        this._items = [];
        this._view = [];
    }
    Object.defineProperty(WebFileListComponent.prototype, "creating", {
        get: function () {
            return !!this._newDir;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebFileListComponent.prototype, "selected", {
        get: function () {
            return this._selected;
        },
        enumerable: true,
        configurable: true
    });
    WebFileListComponent.prototype.ngOnInit = function () {
        var _this = this;
        // 
        // Current change
        this._subscriptions.push(this._svc.current.subscribe(function (f) {
            _this._current = f;
            _this._filter = "";
            _this.clearSelection();
            _this._items = [];
        }));
        // 
        // Files change
        this._subscriptions.push(this._svc.files.subscribe(function (files) {
            if (_this._items.length == 0) {
                _this._items = files;
            }
        }));
        this._subscriptions.push(this._svc.files.buffer(IntervalObservable_1.IntervalObservable.create(300)).filter(function (v) { return v.length > 0; }).subscribe(function (_) {
            _this.clearSelection();
            _this._filter = "";
            _this.filter();
        }));
    };
    WebFileListComponent.prototype.ngOnDestroy = function () {
        for (var _i = 0, _a = this._subscriptions; _i < _a.length; _i++) {
            var sub = _a[_i];
            sub.unsubscribe();
        }
    };
    WebFileListComponent.prototype.refresh = function () {
        this._svc.load(this._current.path);
    };
    WebFileListComponent.prototype.createDirectory = function () {
        this.clearSelection();
        var name = "New Folder";
        var index = 0;
        while (this._items.length > 0 && this._items.find(function (item) { return item.name.toLocaleLowerCase() == name.toLocaleLowerCase(); }) != null) {
            index++;
            name = "New Folder (" + index + ")";
        }
        var dir = new webfile_1.WebFile();
        dir.name = name;
        dir.parent = this._current;
        dir.type = webfile_1.WebFileType.Directory;
        this._active = null;
        this._newDir = dir;
    };
    WebFileListComponent.prototype.createFile = function () {
        this.clearSelection();
        var name = "new.html";
        var index = 0;
        while (this._items.length > 0 && this._items.find(function (item) { return item.name.toLocaleLowerCase() == name.toLocaleLowerCase(); }) != null) {
            index++;
            name = "new (" + index + ").html";
        }
        var file = new webfile_1.WebFile();
        file.name = name;
        file.parent = this._current;
        file.type = webfile_1.WebFileType.File;
        this._active = null;
        this._newDir = file;
    };
    WebFileListComponent.prototype.deleteFiles = function (files) {
        var _this = this;
        if (files && files.length < 1) {
            return;
        }
        var msg = files.length == 1 ? "Are you sure you want to delete '" + files[0].name + "'?" :
            "Are you sure you want to delete " + files.length + " items?";
        this._notificationService.confirm("Delete File", msg)
            .then(function (confirmed) {
            if (confirmed) {
                _this._svc.delete(files);
            }
            _this.clearSelection();
        });
    };
    WebFileListComponent.prototype.onBlur = function (e) {
        var target = e.relatedTarget;
        if (target && target.attributes && target.attributes.nofocus) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }
        this.clearSelection();
    };
    WebFileListComponent.prototype.selectAll = function (event) {
        event.preventDefault();
        this._selected = this._items.slice(0);
    };
    WebFileListComponent.prototype.onBrowseChild = function (file, e) {
        if (e && e.defaultPrevented) {
            return;
        }
        this.clearSelection();
        this._svc.load(file.path);
    };
    WebFileListComponent.prototype.onRangeChange = function (range) {
        virtual_list_component_1.Range.fillView(this._view, this._items, range);
        this._range = range;
    };
    WebFileListComponent.prototype.sort = function (field) {
        this._orderBy.sort(field, false);
        this.doSort();
    };
    WebFileListComponent.prototype.doSort = function () {
        // Sort
        var stringCompare = this._orderBy.Field == "name" || this._orderBy.Field == "description";
        this._items = this._sortPipe.transform(this._items, this._orderBy.Field, this._orderBy.Asc, function (x, y, f1, f2) {
            if (f1.type != f2.type) {
                if (f1.type == webfile_1.WebFileType.File)
                    return 1;
                if (f2.type == webfile_1.WebFileType.File)
                    return -1;
            }
            if (stringCompare) {
                return x.localeCompare(y);
            }
            return (x < y ? -1 : x > y);
        });
        this.onRangeChange(this._range);
    };
    WebFileListComponent.prototype.onSaveNewDir = function () {
        var _this = this;
        if (!this._newDir) {
            return;
        }
        var existing = this._items.find(function (f) { return f.name == _this._newDir.name; });
        if (!existing) {
            this._svc.create(this._newDir);
        }
        this._newDir = null;
    };
    WebFileListComponent.prototype.clearSelection = function (file) {
        if (file === void 0) { file = null; }
        if (file) {
            var index = this._selected.findIndex(function (f) { return f === file; });
            if (index != -1) {
                this._selected.splice(index, 1);
            }
        }
        else {
            this._selected.splice(0);
        }
        this._newDir = null;
    };
    WebFileListComponent.prototype.filter = function () {
        var _this = this;
        this._svc.files.take(1).subscribe(function (files) {
            if (_this._filter) {
                var filter = ("*" + _this._filter + "*").replace("**", "*").replace("?", "");
                var rule_1 = new RegExp("^" + filter.split("*").join(".*") + "$", "i");
                _this._items = files.filter(function (f) { return rule_1.test(f.name); });
            }
            else {
                _this._items = files;
            }
            _this.doSort();
        });
    };
    WebFileListComponent.prototype.dragOver = function (e) {
        e.stopPropagation();
        e.preventDefault();
        if (e.dataTransfer.effectAllowed.toLowerCase() == "copymove") {
            e.dataTransfer.dropEffect = e.ctrlKey ? "copy" : "move";
        }
        else if (e.dataTransfer.effectAllowed == "all") {
            e.dataTransfer.dropEffect = "copy";
        }
    };
    WebFileListComponent.prototype.drag = function (f, e) {
        if (!this._selected.find(function (s) { return s === f; })) {
            this._selected.push(f);
        }
        this._svc.drag(e, this._selected.map(function (f) { return f.file_info; }));
        var dt = e.dataTransfer;
        if (dt.setDragImage) {
            if (this._selected.length > 1) {
                dt.setDragImage(this._dragInfo.nativeElement, -20, -10);
            }
            if (this._selected.length == 1) {
                dt.setDragImage(e.target, -20, -10);
            }
        }
    };
    WebFileListComponent.prototype.drop = function (e, dest) {
        e.stopImmediatePropagation();
        e.preventDefault();
        dest = webfile_1.WebFile.isDir(dest) && !this._svc.getDraggedFiles(e).some(function (f) { return f.id == dest.file_info.id; }) ? dest : this._current;
        this._svc.drop(e, dest);
        this.clearSelection();
    };
    WebFileListComponent.prototype.dragEnd = function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        // Refresh
        // Need when d&d is performed between windows
        if (e.dataTransfer.dropEffect == "move" && this.selected.length > 0) {
            this.refresh();
        }
        this.clearSelection();
    };
    WebFileListComponent.prototype.onDragItemEnter = function (f, e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        var active = webfile_1.WebFile.isDir(f) ? f : null;
        //
        // Entered the already active item, meaning a leave will be triggered
        if (active == this._active) {
            this._ignoreDragLeave = true;
        }
        this._active = active;
    };
    WebFileListComponent.prototype.onDragItemLeave = function (f, e) {
        if (this._ignoreDragLeave) {
            this._ignoreDragLeave = false;
            return;
        }
        if (this._active == f) {
            this._active = null;
        }
    };
    WebFileListComponent.prototype.copy = function (e) {
        this._svc.clipboardCopy(e, this._selected);
    };
    WebFileListComponent.prototype.paste = function (e) {
        if (e.clipboardData) {
            this._svc.clipboardPaste(e, this._current);
        }
    };
    __decorate([
        core_1.ViewChild('dragInfo'),
        __metadata("design:type", core_1.ElementRef)
    ], WebFileListComponent.prototype, "_dragInfo", void 0);
    WebFileListComponent = __decorate([
        core_1.Component({
            selector: 'webfile-list',
            template: "\n        <div #dragInfo class=\"drag-info background-active\">\n            {{_selected.length}}\n        </div>\n        <div *ngIf=\"_current\" class=\"col-xs-8 col-sm-4 col-md-2 actions filter hidden-xs\">\n            <input type=\"search\" class=\"form-control\" [class.border-active]=\"_filter\" [(ngModel)]=\"_filter\" (ngModelChange)=\"filter($event)\" [throttle]=\"300\" />\n        </div>\n        <div *ngIf=\"_current\" tabindex=\"-1\" class=\"wrapper\" \n            [selectable]=\"_items\"\n            [selected]=\"_selected\"\n\n            (blur)=\"onBlur($event)\"\n            (keyup.delete)=\"deleteFiles(_selected)\"\n\n            (drop)=\"drop($event)\"\n            (dragover)=\"dragOver($event)\"\n            (dragend)=\"dragEnd($event)\"\n            (mouseup)=\"_active=null\"\n\n            (copy)=\"copy($event)\"\n            (cut)=\"copy($event)\"\n            (paste)=\"paste($event)\">\n            <input class=\"out\" type=\"text\"/>\n            <div #header class=\"container-fluid hidden-xs\">\n                <div class=\"border-active grid-list-header row\">\n                    <label class=\"col-xs-8 col-sm-5 col-lg-4 hidden-xs\" [ngClass]=\"_orderBy.css('name')\" (click)=\"sort('name')\">Name</label>\n                    <label class=\"col-sm-3 col-md-2 hidden-xs\" [ngClass]=\"_orderBy.css('file_info.last_modified')\" (click)=\"sort('file_info.last_modified')\">Last Modified</label>\n                    <label class=\"col-md-2 visible-lg visible-md\" [ngClass]=\"_orderBy.css('description')\" (click)=\"sort('description')\">Type</label>\n                    <label class=\"col-md-1 visible-lg visible-md text-right\" [ngClass]=\"_orderBy.css('file_info.size')\" (click)=\"sort('file_info.size')\">Size</label>\n                </div>\n            </div>\n            <div class=\"grid-list container-fluid\" *ngIf=\"_newDir\">\n                <new-file [model]=\"_newDir\" (cancel)=\"_newDir=null\" (save)=\"onSaveNewDir()\"></new-file>\n            </div>\n            <virtual-list class=\"container-fluid grid-list\"\n                        *ngIf=\"_items\"\n                        [count]=\"_items.length\"\n                        (rangeChange)=\"onRangeChange($event)\">\n                <li class=\"hover-editing\" tabindex=\"-1\" \n                    *ngFor=\"let child of _view\"\n                    #marker=\"itemMarker\"\n                    [class.background-selected]=\"_active == child || marker.isSelected\"\n                    (dblclick)=\"onBrowseChild(child, $event)\"\n                    dragable=\"true\"\n                    (dragstart)=\"drag(child, $event)\"\n                    (dragenter)=\"onDragItemEnter(child, $event)\"\n                    (dragleave)=\"onDragItemLeave(child, $event)\"\n                    (drop)=\"drop($event, child)\">\n                    <file [model]=\"child\" (modelChanged)=\"doSort()\"></file>\n                </li>\n            </virtual-list>\n        </div>\n    ",
            styles: ["\n        .container-fluid,\n        .row {\n            margin: 0;\n            padding: 0;\n        }\n\n        .grid-list-header label {\n            padding-top: 5px;\n        }\n\n        .wrapper {\n            min-height: 55vh;\n        }\n\n        .out {\n            position: absolute; \n            left: -1000px;\n        }\n\n        .drag-info {\n            position: absolute;\n            transform: translateX(-500px);\n            padding: 0 5px;\n            font-size: 120%;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [webfiles_service_1.WebFilesService,
            notification_service_1.NotificationService])
    ], WebFileListComponent);
    return WebFileListComponent;
}());
exports.WebFileListComponent = WebFileListComponent;
//# sourceMappingURL=webfile-list.js.map