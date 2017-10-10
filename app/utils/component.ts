import {ElementRef, ComponentRef} from '@angular/core';

export class ComponentUtil {
    public static isClickInsideComponent(evt, elementRef) {
        var current = evt.target;
        var host = elementRef.nativeElement;

        do {
            if (current === host) {
                return true;
            }
            current = current.parentNode;
        } while (current);
        return false;
    }

    public static scrollTo(eRef: ElementRef) {
        ComponentUtil.goTo(eRef.nativeElement);
    }

    public static offset(element: HTMLElement) {
        let rect = element.getBoundingClientRect();

        return {
            top: rect.top + document.body.scrollTop,
            left: rect.left + document.body.scrollLeft
        };
    }

    private static goTo(element: HTMLElement) {
        var HEADER_HEIGHT = 55;
        let mainContainer = document.getElementById('mainContainer');

        var scrollTo = 0;
        var elementHeight = 0;
        var mainContainerHeight = mainContainer.offsetHeight;

        // Prevent shadow dom from not returning proper height
        if (!element.offsetHeight && element.children.length > 0) {
            elementHeight = (<HTMLElement>(element.children[0])).offsetHeight;
        }
        else {
            elementHeight = element.offsetHeight;
        }


        // Don't scroll if whole element is already in view
        let thisOffset = ComponentUtil.offset(element);
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
    }
}