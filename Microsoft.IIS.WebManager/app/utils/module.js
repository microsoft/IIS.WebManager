"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var url_1 = require("./url");
var ModuleUtil = /** @class */ (function () {
    function ModuleUtil() {
    }
    ModuleUtil.initModules = function (modules, resource, resourceName) {
        if (resource) {
            var links = Object.keys(resource._links);
            for (var _i = 0, GLOBAL_MODULES_1 = GLOBAL_MODULES; _i < GLOBAL_MODULES_1.length; _i++) {
                var module = GLOBAL_MODULES_1[_i];
                for (var _a = 0, links_1 = links; _a < links_1.length; _a++) {
                    var link = links_1[_a];
                    if (module.api_name == link && resource._links[link].href) {
                        var matches = url_1.UrlUtil.getUrlMatch(resource._links[link].href, module.api_path);
                        if (matches) {
                            // Create copy of module
                            var m = JSON.parse(JSON.stringify(module));
                            m.data = matches;
                            m.data[resourceName] = resource;
                            modules.push(m);
                        }
                    }
                }
            }
        }
        return modules;
    };
    ModuleUtil.addModule = function (modules, moduleName) {
        var targetIndex = GLOBAL_MODULES.findIndex(function (m) { return m.name.toLocaleLowerCase() == moduleName.toLocaleLowerCase(); });
        if (targetIndex == -1) {
            return;
        }
        var nextModules = GLOBAL_MODULES.filter(function (module, i) { return i > targetIndex; });
        var nextIndex = modules.findIndex(function (m) { return !!nextModules.find(function (nm) { return nm.name.toLocaleLowerCase() == m.name.toLocaleLowerCase(); }); });
        var insertionIndex = nextIndex == -1 ? 0 : nextIndex;
        modules.splice(insertionIndex, 0, GLOBAL_MODULES[targetIndex]);
    };
    return ModuleUtil;
}());
exports.ModuleUtil = ModuleUtil;
//# sourceMappingURL=module.js.map