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
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var window_service_1 = require("../main/window.service");
var component_1 = require("../utils/component");
var Range = /** @class */ (function () {
    function Range(start, length) {
        this.start = start;
        this.length = length;
    }
    Range.fillView = function (view, from, range) {
        view.splice(0);
        var end = range.start + range.length < from.length ? range.start + range.length : from.length;
        for (var i = range.start; i < end; i++) {
            view.push(from[i]);
        }
    };
    return Range;
}());
exports.Range = Range;
var VirtualListItem = /** @class */ (function () {
    function VirtualListItem(host) {
        this.host = host;
    }
    VirtualListItem = __decorate([
        core_1.Directive({
            selector: 'li'
        }),
        __metadata("design:paramtypes", [core_1.ElementRef])
    ], VirtualListItem);
    return VirtualListItem;
}());
exports.VirtualListItem = VirtualListItem;
var VirtualListComponent = /** @class */ (function () {
    function VirtualListComponent(_svc, _changeDetector) {
        this._svc = _svc;
        this._changeDetector = _changeDetector;
        this.count = -1;
        this.rangeChange = new core_1.EventEmitter();
        this._filtered = new core_1.EventEmitter();
        this._subscriptions = [];
        this._navHeight = 50;
        this._bufferSize = 20;
        this._unknownMax = 50;
        this._heightKnown = false;
        this._dirty = false;
        this._prevStart = -1;
        this._prevLength = -1;
        this._listSize = 0;
        this._scrollTop = 0;
        this._preHeight = 0;
        this._postHeight = 0;
        this._totalHeight = 0;
        this._elementHeight = 1;
        this._screenHeight = window.innerHeight - this._navHeight;
        this.filtered = [];
    }
    Object.defineProperty(VirtualListComponent.prototype, "elementRef", {
        get: function () {
            return this._container;
        },
        enumerable: true,
        configurable: true
    });
    VirtualListComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._subscriptions.push(this._svc.scroll.subscribe(function (e) {
            _this.onChangeHandler();
        }));
        this._subscriptions.push(this._svc.resize.subscribe(function (e) {
            _this.onChangeHandler();
        }));
        this._filtered.subscribe(function (arr) {
            _this.filtered = arr;
        });
    };
    VirtualListComponent.prototype.ngOnChanges = function (changes) {
        this._dirty = true;
        this.onChangeHandler();
    };
    VirtualListComponent.prototype.ngAfterContentInit = function () {
        var _this = this;
        if (this._listItems.length > 0 && !this._heightKnown && this._listItems.first.host.nativeElement.offsetHeight) {
            this.setElementHeight(this._listItems.first.host.nativeElement.offsetHeight);
        }
        if (!this._heightKnown) {
            var sub_1 = this._listItems.changes.subscribe(function (v) {
                if (v.length > 0 && !_this._heightKnown && v.first.host.nativeElement.offsetHeight) {
                    _this.setElementHeight(v.first.host.nativeElement.offsetHeight);
                    sub_1.unsubscribe();
                }
            });
            // Fallback to unsubscribe even if list is never populated
            this._subscriptions.push(sub_1);
        }
    };
    VirtualListComponent.prototype.onChangeHandler = function () {
        if (this.list || this.count != -1) {
            this._screenHeight = window.innerHeight - this._navHeight;
            this._totalHeight = this.count * this._elementHeight;
            this._listSize = this._screenHeight + this._bufferSize * this._elementHeight;
            this._scrollTop = this.scrollTop;
            this._preHeight = this.preHeight;
            this._postHeight = this.postHeight;
            var startIndex_1 = Math.floor(this._preHeight / this._elementHeight);
            var length_1 = Math.floor(this._listSize / this._elementHeight);
            if (!this._heightKnown) {
                length_1 = Math.min(length_1, this._unknownMax);
            }
            this._changeDetector.markForCheck();
            if (this._prevStart != startIndex_1 || this._prevLength != length_1 || this._dirty) {
                this._dirty = false;
                this._prevLength = length_1;
                this._prevStart = startIndex_1;
                this.rangeChange.next(new Range(startIndex_1, length_1));
                if (this.list) {
                    this._filtered.next(this.list.filter(function (f, i) {
                        return i >= startIndex_1 && i < startIndex_1 + length_1;
                    }));
                }
            }
        }
    };
    Object.defineProperty(VirtualListComponent.prototype, "scrollTop", {
        get: function () {
            if (!this._container) {
                return 0;
            }
            var containerTop = component_1.ComponentUtil.offset(this._container.nativeElement).top;
            //
            // 0 if container is hidden from view
            if (this._container.nativeElement.offsetHeight == 0 && containerTop == 0) {
                return 0;
            }
            var top = containerTop - this._navHeight;
            return top > 0 ? 0 : -top;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualListComponent.prototype, "preHeight", {
        get: function () {
            if (this._scrollTop == 0) {
                return 0;
            }
            var val = Math.floor(this._scrollTop / this._elementHeight) * this._elementHeight + this._screenHeight / 2 - (this._listSize / 2);
            return val < 0 ? 0 : val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualListComponent.prototype, "postHeight", {
        get: function () {
            var val = this._totalHeight - this._scrollTop - this._listSize;
            return val < 0 ? 0 : val;
        },
        enumerable: true,
        configurable: true
    });
    VirtualListComponent.prototype.setElementHeight = function (height) {
        this._elementHeight = height;
        this._heightKnown = true;
        this.onChangeHandler();
    };
    VirtualListComponent.prototype.ngOnDestroy = function () {
        for (var _i = 0, _a = this._subscriptions; _i < _a.length; _i++) {
            var sub = _a[_i];
            sub.unsubscribe();
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number)
    ], VirtualListComponent.prototype, "count", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], VirtualListComponent.prototype, "list", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], VirtualListComponent.prototype, "rangeChange", void 0);
    __decorate([
        core_1.Output('filtered'),
        __metadata("design:type", core_1.EventEmitter)
    ], VirtualListComponent.prototype, "_filtered", void 0);
    __decorate([
        core_1.ViewChild("container"),
        __metadata("design:type", core_1.ElementRef)
    ], VirtualListComponent.prototype, "_container", void 0);
    __decorate([
        core_1.ContentChildren(VirtualListItem),
        __metadata("design:type", core_1.QueryList)
    ], VirtualListComponent.prototype, "_listItems", void 0);
    VirtualListComponent = __decorate([
        core_1.Component({
            selector: 'virtual-list',
            template: "\n        <ul #container>\n            <li [style.height]=\"preHeight + 'px'\"></li>\n            <ng-content></ng-content>\n            <li [style.height]=\"postHeight + 'px'\"></li>\n        </ul>\n    ",
            changeDetection: core_1.ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [window_service_1.WindowService,
            core_1.ChangeDetectorRef])
    ], VirtualListComponent);
    return VirtualListComponent;
}());
exports.VirtualListComponent = VirtualListComponent;
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
                VirtualListComponent,
                VirtualListItem
            ],
            declarations: [
                VirtualListComponent,
                VirtualListItem
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=virtual-list.component.js.map