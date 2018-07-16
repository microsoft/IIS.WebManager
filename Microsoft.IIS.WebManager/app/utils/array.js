"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ArrayUtil = /** @class */ (function () {
    function ArrayUtil() {
    }
    ArrayUtil.findIndex = function (arr, pred) {
        for (var i = 0; i < arr.length; i++) {
            if (pred(arr[i])) {
                return i;
            }
        }
        return -1;
    };
    ArrayUtil.find = function (arr, pred) {
        var res = ArrayUtil.findIndex(arr, pred);
        return res === -1 ? undefined : arr[res];
    };
    return ArrayUtil;
}());
exports.ArrayUtil = ArrayUtil;
//# sourceMappingURL=array.js.map