import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { FileNavService } from './file-nav.service';
import { FilesService } from './files.service';
import { INavigation } from './inavigation';
import { Drop } from './navigation.component';

Injectable()
export class NavigationHelper implements INavigation {
    private _current: Observable<string>;

    constructor(@Inject("FilesService") private _svc: FilesService,
                @Inject(FileNavService) private _navSvc: FileNavService) {

        this._current = this._navSvc.current.filter(dir => !!dir).map(dir => '/' + this._navSvc.toAlias(dir.physical_path));
    }

    public get path(): Observable<string> {
        return this._current;
    }

    public onPathChanged(path: string) {
        if (path.startsWith('/')) {
            path = path.substr(1);
        }

        this._navSvc.load(path);
    }

    public drop(drop: Drop): void {
        this._navSvc.fromAlias(drop.destination)
            .then(path => {
                this._svc.drop(drop.event, path);
            });
    }
}
