import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { WebFilesService } from './webfiles.service';
import { INavigation } from '../../files/inavigation';
import { Drop } from '../../files/navigation.component';
import { filter, map } from 'rxjs/operators'

Injectable()
export class NavigationHelper implements INavigation {
    private _current: Observable<string>;

    constructor(@Inject(WebFilesService) private _svc: WebFilesService) {
        this._current = this._svc.current.pipe(
            filter(dir => !!dir),
            map(dir => dir.path)
        );
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
