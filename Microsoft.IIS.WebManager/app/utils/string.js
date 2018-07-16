"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StringUtil = /** @class */ (function () {
    function StringUtil() {
    }
    StringUtil.trimRight = function (from, targets) {
        var found = true;
        while (found) {
            found = false;
            for (var _i = 0, targets_1 = targets; _i < targets_1.length; _i++) {
                var target = targets_1[_i];
                if (from.endsWith(target)) {
                    from = from.substr(0, from.length - target.length);
                    found = true;
                    continue;
                }
            }
        }
        return from;
    };
    return StringUtil;
}());
exports.StringUtil = StringUtil;
//# sourceMappingURL=string.js.map