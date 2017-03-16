
import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';


import {IDisposable} from '../common/idisposable';
import {WindowService} from './window.service';


@Injectable()
export class OptionsService implements IDisposable {
    private static BREAK_POINT: number = 768; //px

    private _activate: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    private _subs = [];

    constructor(private _window: WindowService) {
        //
        // Resize Window
        this._subs.push(_window.resize.subscribe(e => this.refresh()));
    }

    public dispose() {
        this._subs.forEach(s => s.unsubscribe());
    }

    public get activate(): Observable<boolean> {
        return this._activate.asObservable();
    }

    public get active(): boolean {
        return this._activate.getValue();
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
        this.set(window.innerWidth >= OptionsService.BREAK_POINT);
    }


    private set(value: boolean, refreshWindow: boolean = true) {
        if (this.active == value) {
            return;
        }

        this._activate.next(value);
    }
}
