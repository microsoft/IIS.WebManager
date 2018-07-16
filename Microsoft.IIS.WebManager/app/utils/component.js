"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ComponentUtil = /** @class */ (function () {
    function ComponentUtil() {
    }
    ComponentUtil.isClickInsideComponent = function (evt, elementRef) {
        var current = evt.target;
        var host = elementRef.nativeElement;
        do {
            if (current === host) {
                return true;
            }
            current = current.parentNode;
        } while (current);
        return false;
    };
    ComponentUtil.scrollTo = function (eRef) {
        ComponentUtil.goTo(eRef.nativeElement);
    };
    ComponentUtil.offset = function (element) {
        var rect = element.getBoundingClientRect();
        return {
            top: rect.top + document.body.scrollTop,
            left: rect.left + document.body.scrollLeft
        };
    };
    ComponentUtil.goTo = function (element) {
        var HEADER_HEIGHT = 35;
        var mainContainer = document.getElementById('mainContainer');
        var scrollTo = 0;
        var elementHeight = 0;
        var mainContainerHeight = mainContainer.offsetHeight;
        // Prevent shadow dom from not returning proper height
        if (!element.offsetHeight && element.children.length > 0) {
            elementHeight = (element.children[0]).offsetHeight;
        }
        else {
            elementHeight = element.offsetHeight;
        }
        // Don't scroll if whole element is already in view
        var thisOffset = ComponentUtil.offset(element);
        if (thisOffset.top >= HEADER_HEIGHT && thisOffset.top + elementHeight < mainContainerHeight) {
            return;
        }
        if (elementHeight < mainContainerHeight && thisOffset.top >= HEADER_HEIGHT) {
            var diff = mainContainerHeight - elementHeight;
            scrollTo = thisOffset.top - diff;
        }
        else {
            scrollTo = thisOffset.top;
        }
        mainContainer.scrollTop = scrollTo + mainContainer.scrollTop - HEADER_HEIGHT;
    };
    return ComponentUtil;
}());
exports.ComponentUtil = ComponentUtil;
//# sourceMappingURL=component.js.map