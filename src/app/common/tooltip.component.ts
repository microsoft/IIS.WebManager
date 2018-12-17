import { NgModule, Component, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';
import { WindowService } from '../main/window.service';

@Component({
    selector: 'tooltip',
    template: `
        <div role="tooltip" tabindex="0" class="help-container"
            (mouseover)="onMouseOver()"
            (mouseleave)="onMouseLeave()">
            <i class="fa fa-question-circle-o" [attr.aria-hidden]="_visible ? 'false' : 'true'"></i>
            <div #helpContent class="help-content border-color shadow" 
                [style.visibility]="_visible ? 'visible' : 'hidden'"
                [style.height]="_heightStyle"
                [style.width]="_widthStyle"
                [style.left]="_leftStyle"
                [style.bottom]="_bottomStyle">
                <ng-content></ng-content>
            </div>
        </div>
    `,
    styles: [`
        .help-container {
            position: relative;
            display: inline-block;
        }

        .help-content {
            position: absolute;
            background: #f7f7f7;
            border-style: solid;
            border-width: 1px;
            bottom: 16px;
            left: 12px;
            min-width: 250px;
            padding: 5px 10px;
            margin: 0;
            display: inline-block;
            z-index: 1;
        }

        .help-container:focus .help-content,
        .help-container:hover .help-content {
            visibility: visible !important;
        }
    `]
})
export class TooltipComponent implements OnDestroy, AfterViewInit {

    private _defaultHeight: number = null;
    private _defaultWidth: number = null;
    private _height: number = this._defaultHeight;
    private _width: number = this._defaultWidth;
    private _left: number = 12;
    private _bottom: number = 16;
    private _padding: 20;

    private _timer = null;
    private _hideDelay: number = 150; //ms
    private _subscriptions: Array<Subscription> = [];

    private _visible: boolean = false;
    private _heightStyle: string = "initial";
    private _widthStyle: string = "initial";
    private _leftStyle: string = this._left + 'px';
    private _bottomStyle: string = this._bottom + 'px';

    @ViewChild('helpContent')
    private _helpContent: ElementRef;

    constructor(private _svc: WindowService) {
    }

    public ngAfterViewInit() {
        this._subscriptions.push(this._svc.resize.subscribe(resize => {
            this.calculateDimensions();
            this.calculatePosition();
        }));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private onMouseOver() {
        if (this._timer) {
            window.clearTimeout(this._timer);
        }

        this._visible = true;
    }

    private onMouseLeave() {
        this._timer = window.setTimeout(() => {
            this._visible = false;
        }, this._hideDelay);
    }

    private calculateDimensions() {
        if (this._defaultHeight === null) {
            this.initializeDefaults();
        }

        let width = Math.min(this._defaultWidth, window.innerWidth - this._padding);
        let height = Math.min(this._defaultHeight, this.windowHeight - this._padding);

        this._height = height;
        this._width = width;
        this._heightStyle = this._height + 'px';
        this._widthStyle = this._width + 'px';
    }

    private calculatePosition() {
        let rect: ClientRect = this._helpContent.nativeElement.getBoundingClientRect();
        let elem: HTMLElement = this._helpContent.nativeElement;

        let right = rect.left + this._width;


        let leftDiff = right - window.innerWidth + (this._padding / 2);

        if (leftDiff > 0) {
            this._left -= leftDiff;
            this._leftStyle = this._left + 'px';
        }
    }

    private get windowHeight(): number {
        return window.innerHeight - 50;
    }

    private initializeDefaults(): void {
        this._defaultWidth = Math.max(this._helpContent.nativeElement.offsetWidth, 250);
        this._defaultHeight = this._helpContent.nativeElement.offsetHeight
    }
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        TooltipComponent
    ],
    declarations: [
        TooltipComponent
    ]
})
export class Module { }
