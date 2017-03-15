import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { IDisposable } from '../common/IDisposable';
import { LocationHash } from '../common/location-hash';

import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

@Injectable()
export class Navigator implements IDisposable {
    private _hashWatcher: LocationHash;
    private _path: BehaviorSubject<string>;

    constructor(private _route: ActivatedRoute,
                private _location: Location,
                private _useHash: boolean) {

        this._path = new BehaviorSubject<string>("");

        if (_useHash) {
            this._hashWatcher = new LocationHash(_route, _location);
        }
    }

    public get path(): Observable<string> {
        return this._hashWatcher ? this._hashWatcher.hash : this._path.asObservable();
    }

    public dispose() {
        if (this._hashWatcher) {
            this._hashWatcher.dispose();
            this._hashWatcher = null;
        }
    }

    public getPath(): string {
        return this._hashWatcher ? this._hashWatcher.getHash : this._path.getValue();
    }

    public setPath(path: string): void {
        if (this._hashWatcher) {
            this._hashWatcher.setHash(path);
        }
        else {
            this._path.next(path);
        }
    }
}