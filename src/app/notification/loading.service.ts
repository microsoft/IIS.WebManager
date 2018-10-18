import {Injectable} from '@angular/core';
import {Router, NavigationStart, NavigationEnd} from '@angular/router';

import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';


@Injectable()
export class LoadingService {
    private _activate: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private _navStart: boolean;
    private _subs = [];
    private _counter: number = 0;

    constructor(router: Router) {
        this._subs.push(router.events.subscribe(e => {
            if (e instanceof NavigationStart && !this._navStart) {
                this._navStart = true;
                this.begin();
            }
            else if (e instanceof NavigationEnd) {
                this._navStart = false;
                this.end();
            }
        }));
    }

    public destroy() {
        this._subs.forEach(s => s.unsubscribe());
    }

    public get active(): Observable<boolean> {
        return this._activate.asObservable();
    }

    public begin() {
        ++this._counter;
        if (!this._activate.getValue()) {
            this._activate.next(true);
        }
    }

    public end() {
        if (--this._counter <= 0) {
            this._counter = 0;
            this._activate.next(false);
        }
    }
}
