
import {NgModule, OnInit, ElementRef, HostListener, Directive} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';


@Directive({
    selector: 'input[autosize]'
})
export class AutoSize implements OnInit {
    constructor(private _elem: ElementRef) {
    }

    @HostListener('input', ['$event.target'])
    onChange(input) {
        this.resize();
    }

    ngOnInit() {
        this.resize();
    }

    private resize() {
        let elem = this._elem.nativeElement;
        let style = window.getComputedStyle(elem);
        let width = AutoSize.getTextWidth(elem.value, style.font);

        let pl = parseInt(style.paddingLeft);
        let pr = parseInt(style.paddingRight);
        let bl = parseInt(style.borderLeftWidth);
        let br = parseInt(style.borderRightWidth);

        let w = (width + pl + pr + bl + br) + 'px';
        elem.style.width = w;
    }

    private static getTextWidth(text, font) {
        // 
        // Use HTNML5 canvas
        var canvas = window['__canvas'] || (window['__canvas'] = document.createElement("canvas"));

        var context = canvas.getContext("2d");
        context.font = font;

        var metrics = context.measureText(text + ' ');

        return parseInt(metrics.width);
    }
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        AutoSize
    ],
    declarations: [
        AutoSize
    ]
})
export class Module { }
