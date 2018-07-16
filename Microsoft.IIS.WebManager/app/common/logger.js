"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.prototype.information = function (message) {
        console.log(message);
    };
    Logger.prototype.debug = function (message) {
        console.log(message);
    };
    Logger.prototype.trace = function (message) {
        console.log(message);
    };
    Logger.prototype.error = function (message) {
        console.error(message);
    };
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map