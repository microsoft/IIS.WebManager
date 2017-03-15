declare var $: any;

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

    public static offset(eRef: ElementRef) {
        return $(eRef.nativeElement).offset();
    }

    public static scrollTo(eRef: ElementRef) {
        if (!$.fn.goTo) {
            $.fn.goTo = ComponentUtil.goTo;
        }

        $(eRef.nativeElement).goTo();
    }

    // Jquery extension
    private static goTo() {
        var HEADER_HEIGHT = 55;

        var scrollTo = 0;
        var elementHeight = 0;
        var mainContainerHeight = $("#mainContainer").height();

        // Prevent shadow dom from not returning proper height
        if (!$(this).outerHeight() && $(this).children().first()) {
            elementHeight = $(this).children().first().outerHeight();
        }
        else {
            elementHeight = $(this).outerHeight();
        }


        // Don't scroll if whole element is already in view
        if ($(this).offset().top >= HEADER_HEIGHT && $(this).offset().top + elementHeight < mainContainerHeight) {
            return;
        }

        if (elementHeight < mainContainerHeight && $(this).offset().top >= HEADER_HEIGHT) {
            var diff = mainContainerHeight - elementHeight;
            scrollTo = $(this).offset().top - diff;
        }
        else {
            scrollTo = $(this).offset().top;
        }

        $('#mainContainer').animate({
            scrollTop: scrollTo + $('#mainContainer').scrollTop() - HEADER_HEIGHT + 'px'
        }, 'fast');
        return this; // for chaining...
    }
}