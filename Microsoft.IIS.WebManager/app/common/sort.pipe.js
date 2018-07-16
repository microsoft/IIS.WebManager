"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var SortPipe = /** @class */ (function () {
    function SortPipe() {
    }
    SortPipe_1 = SortPipe;
    SortPipe.prototype.transform = function (arr, field, asc, comparer, inPlace) {
        if (comparer === void 0) { comparer = null; }
        if (inPlace === void 0) { inPlace = false; }
        if (arr.length == 0 || !field) {
            return arr;
        }
        var fields = field.split('.');
        var stringSort = (typeof SortPipe_1.value(arr[0], fields) === 'string');
        if (!inPlace) {
            arr = arr.slice(); // Copy
        }
        arr.sort(function (l, r) {
            var res;
            var x = SortPipe_1.value(l, fields);
            var y = SortPipe_1.value(r, fields);
            if (comparer) {
                res = comparer(x, y, l, r);
            }
            else {
                if (stringSort) {
                    res = x.localeCompare(y);
                }
                else {
                    x = x === undefined ? null : x;
                    y = y === undefined ? null : y;
                    res = (x < y ? -1 : x > y);
                }
            }
            return asc ? res : -res;
        });
        return arr;
    };
    SortPipe.value = function (obj, fields) {
        for (var i = 0; i < fields.length; ++i) {
            if (obj == null || obj === undefined) {
                obj = "";
                break;
            }
            obj = obj[fields[i]];
        }
        return obj;
    };
    SortPipe = SortPipe_1 = __decorate([
        core_1.Pipe({
            name: "orderby"
        })
    ], SortPipe);
    return SortPipe;
    var SortPipe_1;
}());
exports.SortPipe = SortPipe;
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
                SortPipe
            ],
            declarations: [
                SortPipe
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
var OrderBy = /** @class */ (function () {
    function OrderBy() {
    }
    Object.defineProperty(OrderBy.prototype, "Field", {
        get: function () {
            return this._orderBy;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OrderBy.prototype, "Asc", {
        get: function () {
            return this._orderByAsc;
        },
        enumerable: true,
        configurable: true
    });
    OrderBy.prototype.sort = function (field, allowNoSort) {
        if (allowNoSort === void 0) { allowNoSort = true; }
        if (field !== this._orderBy) {
            this._orderByAsc = true;
            this._orderBy = field;
        }
        else {
            if (!this._orderByAsc && allowNoSort) {
                this._orderBy = undefined;
                return;
            }
            this._orderByAsc = !this._orderByAsc;
        }
    };
    OrderBy.prototype.sortAsc = function (field) {
        this._orderBy = field;
        this._orderByAsc = true;
    };
    OrderBy.prototype.sortDesc = function (field) {
        this._orderBy = field;
        this._orderByAsc = false;
    };
    OrderBy.prototype.css = function (field) {
        if (this._orderBy === field) {
            return {
                "orderby": true,
                "desc": !this._orderByAsc
            };
        }
        return {};
    };
    return OrderBy;
}());
exports.OrderBy = OrderBy;
//# sourceMappingURL=sort.pipe.js.map