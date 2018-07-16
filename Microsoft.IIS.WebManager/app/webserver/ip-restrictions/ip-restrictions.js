"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IpRestrictions = /** @class */ (function () {
    function IpRestrictions() {
        this.enabled = false;
    }
    return IpRestrictions;
}());
exports.IpRestrictions = IpRestrictions;
exports.DenyAction = {
    Forbidden: "Forbidden",
    Abort: "Abort",
    Unauthorized: "Unauthorized",
    NotFound: "NotFound"
};
var RestrictionRule = /** @class */ (function () {
    function RestrictionRule() {
    }
    return RestrictionRule;
}());
exports.RestrictionRule = RestrictionRule;
//# sourceMappingURL=ip-restrictions.js.map