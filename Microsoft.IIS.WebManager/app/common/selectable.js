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
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var SelectableService = /** @class */ (function () {
    function SelectableService() {
        this._multiSelect = false;
    }
    SelectableService.prototype.initialize = function (selected, selectable) {
        this._selected = selected;
        this._selectable = selectable;
    };
    SelectableService.prototype.select = function (target, multi, cascade) {
        var _this = this;
        if (multi === void 0) { multi = false; }
        if (!multi && !cascade) {
            this.clearSelection();
        }
        if (cascade) {
            var start = this._selectable.findIndex(function (f) { return f === (_this._selected.length > 0 ? _this._selected[0] : null); });
            this.clearSelection();
            this._selected.push(this._selectable[start]);
            if (start != -1) {
                var currentIndex = this._selectable.findIndex(function (t) { return t === target; });
                var min = Math.min(start, currentIndex);
                var max = Math.max(start, currentIndex);
                for (var i = min; i <= max && i < this._selectable.length; i++) {
                    this.select(this._selectable[i], true, false);
                }
            }
        }
        if (!this._selected.find(function (f) { return f === target; })) {
            this._selected.push(target);
        }
    };
    SelectableService.prototype.clearSelection = function (target) {
        if (target === void 0) { target = null; }
        if (target) {
            var index = this._selected.findIndex(function (f) { return f === target; });
            if (index != -1) {
                this._selected.splice(index, 1);
            }
        }
        else {
            this._selected.splice(0);
        }
        this._active = null;
    };
    SelectableService.prototype.isSelected = function (target) {
        return this._selected.findIndex(function (t) { return t === target; }) != -1;
    };
    SelectableService.prototype.selectAll = function (event) {
        var _this = this;
        event.preventDefault();
        this._selected.splice(0, this._selected.length);
        this._selectable.forEach(function (item) { return _this._selected.push(item); });
    };
    SelectableService = __decorate([
        core_1.Injectable()
    ], SelectableService);
    return SelectableService;
}());
var ItemMarker = /** @class */ (function () {
    function ItemMarker(_svc) {
        this._svc = _svc;
        this._isAttached = null;
    }
    ItemMarker.prototype.setModel = function (model) {
        this._model = model;
    };
    Object.defineProperty(ItemMarker.prototype, "isAttached", {
        get: function () {
            return this._isAttached;
        },
        set: function (value) {
            this._isAttached = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ItemMarker.prototype, "isSelected", {
        get: function () {
            if (!this._svc) {
                return false;
            }
            return this._svc.isSelected(this._model);
        },
        enumerable: true,
        configurable: true
    });
    ItemMarker = __decorate([
        core_1.Directive({
            selector: 'li',
            exportAs: 'itemMarker'
        }),
        __param(0, core_1.Optional()),
        __metadata("design:paramtypes", [SelectableService])
    ], ItemMarker);
    return ItemMarker;
}());
exports.ItemMarker = ItemMarker;
var SelectableListItem = /** @class */ (function () {
    function SelectableListItem(_host, _renderer, _listItem, _svc) {
        var _this = this;
        this._host = _host;
        this._renderer = _renderer;
        this._listItem = _listItem;
        this._svc = _svc;
        if (this._svc) {
            this._tearDown = this._renderer.listen(this._host.nativeElement, 'click', function (evt) { return _this.onSelect(evt); });
        }
    }
    SelectableListItem.prototype.ngOnInit = function () {
        if (this._listItem && !this._listItem.isAttached) {
            //
            // Prevent binding to children [model] directives after initial binding
            this._isAttached = true;
            this._listItem.isAttached = true;
            this.setModel(this.model);
        }
    };
    SelectableListItem.prototype.ngOnChanges = function (changes) {
        if (changes["model"]) {
            this.setModel(changes["model"].currentValue);
        }
    };
    SelectableListItem.prototype.ngOnDestroy = function () {
        this._listItem = null;
        if (this._tearDown) {
            this._tearDown();
        }
    };
    SelectableListItem.prototype.setModel = function (model) {
        if (this._listItem && this._isAttached) {
            this._listItem.setModel(model);
        }
    };
    SelectableListItem.prototype.onSelect = function (e) {
        if (e.defaultPrevented || !this._svc) {
            return;
        }
        if (e.ctrlKey && this._svc.isSelected(this.model)) {
            this._svc.clearSelection(this.model);
        }
        else {
            this._svc.select(this.model, e.ctrlKey, e.shiftKey);
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], SelectableListItem.prototype, "model", void 0);
    SelectableListItem = __decorate([
        core_1.Directive({
            selector: '[model]'
        }),
        __param(2, core_1.Optional()),
        __param(3, core_1.Optional()),
        __metadata("design:paramtypes", [core_1.ElementRef,
            core_1.Renderer,
            ItemMarker,
            SelectableService])
    ], SelectableListItem);
    return SelectableListItem;
}());
exports.SelectableListItem = SelectableListItem;
var Selectable = /** @class */ (function () {
    function Selectable(_svc, _eRef, _renderer, _changeDetectorRef) {
        this._svc = _svc;
        this._eRef = _eRef;
        this._renderer = _renderer;
        this._changeDetectorRef = _changeDetectorRef;
    }
    Selectable.prototype.ngOnInit = function () {
        this._svc.initialize(this.selected, this.selectable);
    };
    Selectable.prototype.ngOnChanges = function (changes) {
        if (changes["selected"] || changes["selectable"]) {
            var selected = changes["selected"] ? changes["selected"].currentValue : this.selected;
            var selectable = changes["selectable"] ? changes["selectable"].currentValue : this.selectable;
            this._svc.initialize(selected, selectable);
        }
    };
    Selectable.prototype.select = function (target, multi, cascade) {
        if (multi === void 0) { multi = false; }
        this._svc.select(target, multi, cascade);
    };
    Selectable.prototype.selectAll = function (event) {
        //
        // Prevent selecting all when prevent is requested
        // Or when the user is trying to select all text in an input
        if (event.defaultPrevented || event.target.tagName == "INPUT") {
            return;
        }
        this._svc.selectAll(event);
        this._changeDetectorRef.markForCheck();
    };
    Selectable.prototype.onBlur = function (evt) {
        this._svc.clearSelection();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], Selectable.prototype, "selected", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], Selectable.prototype, "selectable", void 0);
    Selectable = __decorate([
        core_1.Directive({
            selector: '[selectable]',
            host: {
                '(keydown.shift)': "_multiSelect=true",
                '(keyup.shift)': "_multiSelect=false",
                '(keydown.control.a)': "selectAll($event)",
                '(keydown.esc)': "onBlur($event)",
                '[attr.tabindex]': "-1",
                '[class.noselect]': "_multiSelect",
                '(blur)': 'onBlur($event)'
            },
            providers: [
                SelectableService
            ]
        }),
        __metadata("design:paramtypes", [SelectableService,
            core_1.ElementRef,
            core_1.Renderer,
            core_1.ChangeDetectorRef])
    ], Selectable);
    return Selectable;
}());
exports.Selectable = Selectable;
var Module = /** @class */ (function () {
    function Module() {
    }
    Module = __decorate([
        core_1.NgModule({
            imports: [
                forms_1.FormsModule,
                common_1.CommonModule
            ],
            exports: [
                Selectable,
                SelectableListItem,
                ItemMarker
            ],
            declarations: [
                Selectable,
                SelectableListItem,
                ItemMarker
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=selectable.js.map