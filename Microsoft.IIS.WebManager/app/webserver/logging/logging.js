"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logging = /** @class */ (function () {
    function Logging() {
    }
    return Logging;
}());
exports.Logging = Logging;
exports.Encoding = {
    UTF8: "utf-8",
    ANSI: "ansi"
};
exports.LogFileFormat = {
    W3C: "w3c",
    IIS: "iis",
    NCSA: "ncsa",
    Custom: "custom",
    Binary: "binary"
};
var LogTarget = /** @class */ (function () {
    function LogTarget() {
    }
    return LogTarget;
}());
exports.LogTarget = LogTarget;
var LogFelds = /** @class */ (function () {
    function LogFelds() {
    }
    return LogFelds;
}());
exports.LogFelds = LogFelds;
var CustomLogField = /** @class */ (function () {
    function CustomLogField() {
        this.source_type = exports.CustomLogFieldSourceType.RequestHeader;
    }
    return CustomLogField;
}());
exports.CustomLogField = CustomLogField;
exports.CustomLogFieldSourceType = {
    RequestHeader: "request_header",
    ResponseHeader: "response_header",
    ServerVariable: "server_variable"
};
exports.LogPeriod = {
    Hourly: "hourly",
    Daily: "daily",
    Weekly: "weekly",
    Monthly: "monthly"
};
//# sourceMappingURL=logging.js.map