"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var file_1 = require("../../files/file");
var RequestTracing = /** @class */ (function () {
    function RequestTracing() {
    }
    return RequestTracing;
}());
exports.RequestTracing = RequestTracing;
var Provider = /** @class */ (function () {
    function Provider() {
    }
    return Provider;
}());
exports.Provider = Provider;
var RequestTracingRule = /** @class */ (function () {
    function RequestTracingRule() {
    }
    return RequestTracingRule;
}());
exports.RequestTracingRule = RequestTracingRule;
var CustomAction = /** @class */ (function () {
    function CustomAction() {
    }
    return CustomAction;
}());
exports.CustomAction = CustomAction;
var Trace = /** @class */ (function () {
    function Trace() {
    }
    return Trace;
}());
exports.Trace = Trace;
var TraceLog = /** @class */ (function () {
    function TraceLog() {
    }
    TraceLog.FromApiFile = function (fileInfo) {
        var l = new TraceLog();
        l.file_info = fileInfo;
        return l;
    };
    TraceLog.FromObj = function (obj) {
        if (!obj) {
            return null;
        }
        var log = new TraceLog();
        Object.assign(log, obj);
        log.date = obj.date ? new Date(obj.date) : null;
        log.file_info = file_1.ApiFile.fromObj(log.file_info);
        return log;
    };
    return TraceLog;
}());
exports.TraceLog = TraceLog;
exports.EventSeverity = {
    Ignore: "ignore",
    CriticalError: "criticalerror",
    Error: "error",
    Warning: "warning"
};
exports.Verbosity = {
    General: "general",
    CriticalError: "criticalerror",
    Error: "error",
    Warning: "warning",
    Information: "information",
    Verbose: "verbose"
};
//# sourceMappingURL=request-tracing.js.map