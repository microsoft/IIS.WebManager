"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ComponentLoader = /** @class */ (function () {
    function ComponentLoader() {
    }
    ComponentLoader.LoadAsync = function (name, path) {
        return System.import(path)
            .then(function (m) {
            return m[name];
        });
    };
    return ComponentLoader;
}());
exports.ComponentLoader = ComponentLoader;
//# sourceMappingURL=component-loader.js.map