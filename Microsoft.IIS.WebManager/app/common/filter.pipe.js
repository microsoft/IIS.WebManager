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
var FilterPipe = /** @class */ (function () {
    function FilterPipe() {
    }
    FilterPipe_1 = FilterPipe;
    FilterPipe.prototype.transform = function (arr, field, value, cb) {
        if (cb === void 0) { cb = null; }
        if (arr.length == 0 || !field) {
            return arr;
        }
        var fields = field.split('.');
        var stringFilter = (typeof FilterPipe_1.value(arr[0], fields) === 'string');
        return arr.filter(function (i) {
            var x = FilterPipe_1.value(i, fields);
            if (cb) {
                return cb(x, i);
            }
            else {
                if (stringFilter) {
                    return x.indexOf(value) >= 0;
                }
                else {
                    return x == value;
                }
            }
        });
    };
    FilterPipe.value = function (obj, fields) {
        for (var i = 0; i < fields.length; ++i) {
            if (obj == null || obj === undefined) {
                obj = "";
                break;
            }
            obj = obj[fields[i]];
        }
        return obj;
    };
    FilterPipe = FilterPipe_1 = __decorate([
        core_1.Pipe({
            name: "filter"
        })
    ], FilterPipe);
    return FilterPipe;
    var FilterPipe_1;
}());
exports.FilterPipe = FilterPipe;
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
                FilterPipe
            ],
            declarations: [
                FilterPipe
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=filter.pipe.js.map