import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { WebFilesService } from './webfiles.service';
import { INavigation } from '../../files/inavigation';
import { Drop } from '../../files/navigation.component';

Injectable()
export class NavigationHelper implements INavigation {
    private _current: Observable<string>;

    constructor(@Inject(WebFilesService) private _svc: WebFilesService) {
        this._current = this._svc.current.filter(dir => !!dir).map(dir => dir.path);
    }

    public get path(): Observable<string> {
        return this._current;
    }

    public onPathChanged(path: string) {
        this._svc.load(path);
    }

    public drop(drop: Drop): void {
        this._svc.drop(drop.event, drop.destination);
    }
}