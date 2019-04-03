import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { IDisposable } from '../common/IDisposable';
import { UrlUtil } from '../utils/url';

import { Observable, Subscription, BehaviorSubject } from "rxjs";
import { filter } from 'rxjs/operators';

export class LocationHash implements IDisposable {
    private _serviceRoot: string;
    private _hash: BehaviorSubject<string>;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _route: ActivatedRoute,
                private _location: Location) {

        this._hash = new BehaviorSubject<string>(this._route.snapshot.fragment);
        this._serviceRoot = this._location.path(false);

        this._subscriptions.push((<Subscription>this._location.subscribe(e => {
            if (e.type == 'hashchange') {
                this._hash.next(this.trimStart('#', window.location.hash));
            }
        })));
    }

    public get hash(): Observable<string> {
        return this._hash.asObservable().pipe(
            filter(h => this._location.path(false) == this._serviceRoot)
        );
    }

    public dispose() {
        for (let sub of this._subscriptions) {
            sub.unsubscribe();
        }
    }

    public get getHash(): string {
        return UrlUtil.getFragment(this._location.path(true));
    }

    public setHash(hash: string) {
        let fullHash = '#' + hash;

        let current = this.trimStart('#', window.location.hash);
        if (!current || current != hash) {
            this._location.go(this._location.path(false) + fullHash);
            this._hash.next(hash);
        }
        else {
            this._location.replaceState(this._location.path(false) + fullHash);
            this._hash.next(hash);
        }
    }

    private trimStart(val: string, from: string): string {
        return from.startsWith(val) ? from.substr(val.length) : from;
    }
}
