"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Int16 = /** @class */ (function () {
    function Int16() {
    }
    Object.defineProperty(Int16, "Max", {
        get: function () { return 32767; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Int16, "Min", {
        get: function () { return -32768; },
        enumerable: true,
        configurable: true
    });
    return Int16;
}());
exports.Int16 = Int16;
var Int32 = /** @class */ (function () {
    function Int32() {
    }
    Object.defineProperty(Int32, "Max", {
        get: function () { return 2147483647; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Int32, "Min", {
        get: function () { return -2147483648; },
        enumerable: true,
        configurable: true
    });
    return Int32;
}());
exports.Int32 = Int32;
var UInt32 = /** @class */ (function () {
    function UInt32() {
    }
    Object.defineProperty(UInt32, "Max", {
        get: function () { return 4294967295; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UInt32, "Min", {
        get: function () { return 0; },
        enumerable: true,
        configurable: true
    });
    return UInt32;
}());
exports.UInt32 = UInt32;
var Int64 = /** @class */ (function () {
    function Int64() {
    }
    Object.defineProperty(Int64, "Max", {
        get: function () { return 9223372036854775807; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Int64, "Min", {
        get: function () { return -9223372036854775808; },
        enumerable: true,
        configurable: true
    });
    return Int64;
}());
exports.Int64 = Int64;
var TimeSpan = /** @class */ (function () {
    function TimeSpan() {
    }
    Object.defineProperty(TimeSpan, "MaxDays", {
        get: function () { return 300; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeSpan, "MaxHours", {
        get: function () { return TimeSpan.MaxDays * 24; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeSpan, "MaxMinutes", {
        get: function () { return TimeSpan.MaxHours * 60; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeSpan, "MaxSeconds", {
        get: function () { return TimeSpan.MaxMinutes * 60; },
        enumerable: true,
        configurable: true
    });
    return TimeSpan;
}());
exports.TimeSpan = TimeSpan;
exports.DateTimeUnit = {
    Years: "years",
    Months: "months",
    Weeks: "weeks",
    Days: "days",
    Hours: "hours",
    Minutes: "minutes",
    Seconds: "seconds"
};
var DateTime = /** @class */ (function () {
    function DateTime() {
    }
    Object.defineProperty(DateTime, "UtcNow", {
        get: function () {
            var now = new Date();
            return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getHours(), now.getMinutes(), now.getSeconds());
        },
        enumerable: true,
        configurable: true
    });
    DateTime.diff = function (from, to, unit) {
        return Math.floor((to - from) / DateTime._milisecondsPer[unit]);
    };
    DateTime._milisecondsPer = {
        weeks: 7 * 24 * 60 * 60 * 1000,
        days: 24 * 60 * 60 * 1000,
        hours: 60 * 60 * 1000,
        minutes: 60 * 1000,
        seconds: 1000
    };
    return DateTime;
}());
exports.DateTime = DateTime;
var Humanizer = /** @class */ (function () {
    function Humanizer() {
    }
    Humanizer.number = function (val) {
        var groupSize = 3;
        var nStr = '' + val;
        var mod = nStr.length % groupSize;
        //
        // Pad with leading spaces to make length a multiple of groupSize
        for (var i = 0; mod > 0 && i < groupSize - (mod); i++) {
            nStr = ' ' + nStr;
        }
        var groups = [];
        for (var i = 0; i < nStr.length; i += groupSize) {
            groups.push(nStr.substr(i, groupSize));
        }
        return groups.join(",").trim();
    };
    Humanizer.memory = function (val) {
        var units = ['B', 'KB', 'MB', 'GB'];
        var i = 0;
        while (val > 1024) {
            val /= 1024;
            i++;
        }
        return Math.floor(val) + ' ' + units[i];
    };
    Humanizer.date = function (date) {
        return date ? Humanizer._dateFormatter.format(date) : "";
    };
    Humanizer._dateFormatter = new Intl.DateTimeFormat([], {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    });
    return Humanizer;
}());
exports.Humanizer = Humanizer;
exports.ALL = [
    Int16,
    Int32,
    UInt32,
    Int64,
    TimeSpan,
    DateTime,
    exports.DateTimeUnit
];
//# sourceMappingURL=primitives.js.map