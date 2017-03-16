import { Injectable, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/startwith';
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

import { NotificationService } from '../notification/notification.service';
import { IDisposable } from '../common/idisposable';
import { StringUtil } from '../utils/string';

import { ApiFile, ApiFileType, ChangeType } from './file';
import { Navigator } from './navigator';
import { FilesService } from './files.service';

const Root: ApiFile = ApiFile.fromObj({
    physical_path: "",
    type: ApiFileType.Directory
});

@Injectable()
export class FileNavService implements IDisposable {
    private _nav: Navigator;
    private _roots: Array<ApiFile> = null;
    private _subscriptions: Array<Subscription> = [];
    private _current: BehaviorSubject<ApiFile> = new BehaviorSubject<ApiFile>(null);
    private _files: BehaviorSubject<Array<ApiFile>> = new BehaviorSubject<Array<ApiFile>>([]);

    constructor(@Inject("FilesService") private _svc: FilesService,
                private _notificationService: NotificationService,
                private _location: Location,
                private _route: ActivatedRoute) {
        //
        // File system changes
        this._subscriptions.push(_svc.change.subscribe(e => {
            let dir = this._current.getValue();
            if (!dir || !ApiFile.equal(e.target.parent, dir)) {
                return;
            }
            let files = this._files.getValue();

            // Create
            if (e.type == ChangeType.Created) {
                this._svc.getByPhysicalPath(e.target.physical_path).then(f => {
                    files.unshift(f);
                    this._files.next(files);
                });
                return;
            }

            // Delete
            if (e.type == ChangeType.Deleted) {
                let i = files.findIndex(f => f.id == e.target.id);
                if (i >= 0) {
                    files.splice(i, 1);
                    this._files.next(files);
                };
                return;
            }

            // Update
            if (e.type == ChangeType.Updated) {
                let file = files.find(f => f.id == e.target.id);
                if (file) {
                    this._svc.getByPhysicalPath(e.target.physical_path).then(f => Object.assign(file, f));
                }
                return;
            }
        }));
    }

    public get current(): Observable<ApiFile> {
        return this._current.asObservable();
    }

    public get files(): Observable<ApiFile[]> {
        return this._files.asObservable();
    }

    public dispose() {
        for (let sub of this._subscriptions) {
            sub.unsubscribe();
        }

        if (this._nav != null) {
            this._nav.dispose();
            this._nav = null;
        }
    }

    public init(useHash: boolean) {
        //
        // Navigation
        this._nav = new Navigator(this._route, this._location, useHash);

        this._subscriptions.push(this._nav.path.startWith(null).pairwise().subscribe((pair: [string, string]) => {
            let previous = pair[0];
            let hash = pair[1];

            this.loadDir(hash);
        }));
    }

    public load(path: string) {
        let cur = this._current.getValue();

        path = this.toAlias(this.startFromVolume(path));

        if (this._nav.getPath() || (cur && this.normalize(cur.physical_path) != this.normalize(path))) {
            this._nav.setPath(path);
        }
        else {
            this.loadDir(path);
        }
    }

    public toAlias(path: string): string {
        if (!path) {
            return path;
        }

        //
        // Given current navigation context, get aliased path for the provided physical path

        path = path.replace(/\\/g, '/');
        let cur = !this._roots ? null : this._roots.find(r => this.normalize(path).startsWith(this.normalize(r.physical_path)));

        if (cur) {
            let suffix = path.substr(cur.physical_path.length, path.length - cur.physical_path.length);
            let start = (cur.alias || cur.name).replace(/\\/g, '/');

            if (!suffix.startsWith('/') && !start.endsWith('/')) {
                suffix = '/' + suffix;
            }

            path = start + suffix;
        }
        else {
            // Handle obtaining alias from the virtual root directory
            let root = this._files.getValue().find(f => this.normalize(f.physical_path) == this.normalize(path));

            if (root) {
                path = root.alias || root.name;
            }
        }

        return path;
    }

    public fromAlias(path: string): Promise<string> {
        let roots = this._roots ? Promise.resolve(this._roots) : this._svc.getRoots().then(roots => this._roots = roots);
        return roots
            .then(res => {

                //
                // Don't de-alias UNC paths "//"
                if (!path.startsWith('//')) {
                    let parts = path.split('/').filter(p => !!p);
                    let start = parts[0];
                    let suffix = '/' + parts.splice(1, parts.length - 1).join('/');
                    let root = res.find(r => r.alias && r.alias.toLocaleLowerCase() == start.toLocaleLowerCase());
                    //
                    // Fall back to root folder name
                    if (!root) {
                        root = res.find(r => StringUtil.trimRight(r.name, ['/', '\\']).toLocaleLowerCase() == start.toLocaleLowerCase());
                    }
                    path = !root ? path : root.physical_path + suffix;
                }

                return path;
            })
    }

    private loadDir(path: string): Promise<ApiFile> {
        this._notificationService.clearWarnings();

        if (!path || path.endsWith(":")) {
            path = (path || "") + "/";
        }

        // Get dir
        return (path == "/" ? Promise.resolve(Root) : this.get(path))
            .then(dir => {
                this._current.next(ApiFile.fromObj(dir));

                if (dir.type == ApiFileType.Directory) {
                    this.loadFiles();
                }

                return this._current.getValue();
            })
            .catch(e => {
                this._current.next(null);

                // Clear files
                this._files.getValue().splice(0);
                this._files.next(this._files.getValue());

                this.handleError(e, path);
                throw e;
            });
    }

    private loadFiles() {
        let dir = this._current.getValue();
        let files = this._files.getValue();

        (!dir.physical_path ? this._svc.getRoots() : this._svc.getChildren(dir))
            .then(fs => {
                files.splice(0); // Clear

                fs.forEach((f: ApiFile) => files.push(f));

                this._files.next(files);
            });
    }

    private get(path: string): Promise<ApiFile> {
        return this.fromAlias(path)
            .then(p => {
                return this._svc.getByPhysicalPath(p)
                    .then(res => {
                        return ApiFile.fromObj(res);
                    });
            })
    }

    private normalize(path: string): string {
        return !path ? "" : path.toLocaleLowerCase().replace(/\\/g, '/');
    }

    private startFromVolume(path: string) {
        let parts = path.replace(/\\/g, '/').split('/');

        for (let i = parts.length - 1; i >= 0; i--) {
            if (parts[i].indexOf(':') != -1) {
                parts.splice(0, i);
                break;
            }
        }

        return parts.join('/');
    }

    private handleError(e, path: string = null) {
        this._svc.handleError(e, path);
    }
}
