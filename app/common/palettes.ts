
import {NgModule, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'palettes',
    template: `
<div style="background-color:#8b4298;" class="border-antiactive" (click)="changePalette('purple')"></div>
<div style="background-color:#0093fe;" class="border-antiactive" (click)="changePalette('blue')"></div>
<div style="background-color:black;" class="border-antiactive" (click)="changePalette('black')"></div>
    `,
    styles: [`
div {
    width: 15px;
    height: 15px;
    display: inline-block;
    vertical-align: middle;
    margin-top: 19px;
    margin-right: 5px;
    border-style: solid;
    border-width: 1px;
    cursor: pointer;
    border-color: white;
}
    `],
})
export class Palettes implements OnInit {

    ngOnInit() {

        let activePalette = localStorage.getItem("palette");

        if (activePalette) {
            this.changePalette(activePalette);
        }
    }

    changePalette(palette: string) {

        let paletteLink = "";

        switch (palette) {

            case "blue":
                paletteLink = "/themes/themes.blue.css";
                break;
            case "purple":
                paletteLink = "/themes/themes.purple.css";
                break;
            case "black":
                paletteLink = "/themes/themes.black.css";
                break;
            default:
                return;
        }

        localStorage.setItem("palette", palette);

        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = paletteLink;
        link.media = 'all';
        head.appendChild(link);
    }
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        Palettes
    ],
    declarations: [
        Palettes
    ]
})
export class Module { }
