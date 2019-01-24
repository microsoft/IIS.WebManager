import { Injectable } from '@angular/core';
import { IDisposable } from '../common/idisposable';
import { WindowService } from './window.service';

@Injectable()
export class OptionsService implements IDisposable {
    private static BREAK_POINT: number = 768; //px

    //
    // By default: not active on small, active on large
    private _active: Array<boolean> = [false, true];
    private _subs = [];

    constructor(private _window: WindowService) {
        //
        // Resize Window
        this._subs.push(_window.resize.subscribe(e => this.refresh()));
    }

    public dispose() {
        this._subs.forEach(s => s.unsubscribe());
    }

    public get active(): boolean {
        return this._active[this.activeIndex];
    }

    public show() {
        this.set(true);
    }

    public hide() {
        this.set(false);
    }

    public toggle(): void {
        this.active ? this.hide() : this.show();
    }

    public refresh() {
        if (window.innerWidth < OptionsService.BREAK_POINT) {
            this.set(false);
        }

        this.set(this.active);
    }

    private set(value: boolean, refreshWindow: boolean = true) {
        if (this.active == value) {
            return;
        }

        this._active[this.activeIndex] = value;
    }

    private get activeIndex(): number {
        if (window.innerWidth < OptionsService.BREAK_POINT) {
            return 0;
        }
        else {
            return 1;
        }
    }
}
