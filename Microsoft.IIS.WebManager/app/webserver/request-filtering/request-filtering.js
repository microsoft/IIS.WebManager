"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RequestFiltering = /** @class */ (function () {
    function RequestFiltering() {
    }
    return RequestFiltering;
}());
exports.RequestFiltering = RequestFiltering;
var FilteringRule = /** @class */ (function () {
    function FilteringRule() {
    }
    return FilteringRule;
}());
exports.FilteringRule = FilteringRule;
var FileExtension = /** @class */ (function () {
    function FileExtension() {
    }
    return FileExtension;
}());
exports.FileExtension = FileExtension;
exports.RequestFilteringChildType = {
    RULES: "rules",
    HEADER_LIMITS: "headerLimits",
    FILE_EXTENSIONS: "fileExtensions",
    HIDDEN_SEGMENTS: "hiddenSegments",
    QUERY_STRINGS: "queryStrings",
    URLS: "urls"
};
var RequestFilteringSettings = /** @class */ (function () {
    function RequestFilteringSettings() {
    }
    return RequestFilteringSettings;
}());
exports.RequestFilteringSettings = RequestFilteringSettings;
//# sourceMappingURL=request-filtering.js.map