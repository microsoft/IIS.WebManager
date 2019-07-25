import { Injectable, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription, BehaviorSubject, Observable} from 'rxjs';
import { startWith, pairwise } from 'rxjs/operators';
import { HttpClient } from '../../common/http-client';
import { IDisposable } from '../../common/IDisposable';
import { NotificationService } from '../../notification/notification.service';
import { FilesService } from '../../files/files.service';
import { ApiFile, ApiFileType, ChangeType } from '../../files/file';
import { WebFile, WebFileType } from './webfile';
import { WebSite } from '../websites/site';
import { LocationHash } from '../../common/location-hash';

@Injectable()
export class WebFilesService implements IDisposable {
    private _fileInfoFields: string = "file_info.name,file_info.alias,file_info.type,file_info.physical_path,file_info.size,created,file_info.last_modified,file_info.mime_type,file_info.e_tag,file_info.parent";
    private _website: WebSite;
    private _hashWatcher: LocationHash;
    private _current: BehaviorSubject<WebFile> = new BehaviorSubject<WebFile>(null);
    private _files: BehaviorSubject<WebFile[]> = new BehaviorSubject<WebFile[]>([]);
    private _subscriptions: Array<Subscription> = [];


    constructor(private _http: HttpClient,
                @Inject("FilesService") private _svc: FilesService,
                private _notificationService: NotificationService,
                location: Location,
                route: ActivatedRoute) {

        this._hashWatcher = new LocationHash(route, location);

        //
        // File system changes
        this._subscriptions.push(_svc.change.subscribe(e => {
            let dir = this._current.getValue();
            if (!dir || (e.target.parent.id != dir.file_info.id)) {
                return;
            }

            let files = this._files.getValue();

            // Create
            if (e.type == ChangeType.Created) {
                this.getFile(dir.path + "/" + e.target.name).then(f => {
                    files.unshift(f);
                    this._files.next(files);
                });
                return;
            }

            // Delete
            if (e.type == ChangeType.Deleted) {
                let i = files.findIndex(f => f.file_info.id == e.target.id);
                if (i >= 0) {
                    files.splice(i, 1);
                    this._files.next(files);
                };
                return;
            }

            // Update
            if (e.type == ChangeType.Updated) {
                let file = files.find(f => f.file_info.id == e.target.id);
                if (file) {
                    this.getFile(dir.path + "/" + e.target.name).then(f => Object.assign(file, f));
                }
                return;
            }
        }));
    }

    public dispose() {
        this._subscriptions.forEach(s => s.unsubscribe());

        if (this._hashWatcher != null) {
            this._hashWatcher.dispose();
            this._hashWatcher = null;
        }
    }

    public init(site: WebSite) {
        if (!(site && site.id)) {
            throw Error("Invalid WebSite");
        }

        this._website = site;

        //
        // Hash Navigation
        this._subscriptions.push(this._hashWatcher.hash.pipe(
            startWith(null),
            pairwise()
        ).subscribe((pair: [string, string]) => {
            let previous = pair[0];
            let hash = pair[1];

            this.loadDir(hash || '/').catch(
                e => {
                    this._notificationService.warn(e.message);
                }
            );
        }));
    }

    public get current(): Observable<WebFile> {
        return this._current.asObservable();
    }

    public get files(): Observable<WebFile[]> {
        return this._files.asObservable();
    }

    public load(path: string) {
        let cur = this._current.getValue();
        if (this._hashWatcher.getHash || (cur && cur.path != path)) {
            this._hashWatcher.setHash(path);
        }
        else {
            this.loadDir(path || '/').catch(
                e => {
                    this._notificationService.warn(e.message);
                }
            )
        }
    }

    public create(file: WebFile) {
        file.file_info.type = this.isDir(file) ? ApiFileType.Directory : ApiFileType.File;
        file.file_info.name = file.name;

        this._svc.create(file.file_info, file.parent.file_info);
    }

    public delete(files: Array<WebFile>) {
        // file_info can be null if the child physical path is forbidden
        let filtered = this.removeChildrenWithoutInfo(files);

        return this._svc.delete(filtered.map(f => f.file_info));
    }

    public rename(file: WebFile, name: string) {
        if (!file.file_info) {
            this._notificationService.warn("'" + file.path + "' could not be renamed");
        }

        if (name) {
            this._notificationService.clearWarnings();

            let oldName = file.name;
            file.name = name;

            this._svc.update(file.file_info, { name: name }).catch(e=> {
                file.name = oldName;
                throw e;
            });
        }
    }

    public upload(files: Array<File>, destination: WebFile) {
        this._svc.upload(destination.file_info, files);
    }

    public copy(sources: Array<WebFile>, to: WebFile, name?: string) {
        let filtered = this.removeChildrenWithoutInfo(sources);

        this._svc.copy(sources.map(s => (s.file_info || <any>s)), to.file_info, name);
    }

    public move(sources: Array<WebFile>, to: WebFile, name?: string) {
        let filtered = this.removeChildrenWithoutInfo(sources);

        this._svc.move(filtered.map(s => (s.file_info || <any>s)), to.file_info, name);
    }

    public drag(e: DragEvent, files: Array<ApiFile>) {
        this._svc.drag(e, files);
    }

    public drop(e: DragEvent, destination: WebFile | string) {
        let apiFiles = this._svc.getDraggedFiles(e);
        let items = e.dataTransfer.items;
        let files = e.dataTransfer.files;
        let copy = (e.dataTransfer.effectAllowed == "all") || ((e.dataTransfer.effectAllowed.toLowerCase() == "copymove") && e.ctrlKey);

        let promise = (destination instanceof WebFile) ? Promise.resolve(destination) : this.getFile(destination);

        promise.then(dir => {
            //
            // Copy/Move File(s)
            if (apiFiles.length > 0) {
                apiFiles = apiFiles.filter(f => f);
                copy ? this._svc.copy(apiFiles, dir.file_info) : this._svc.move(apiFiles, dir.file_info);
                return;
            }

            //
            // Upload items
            if (items && items.length > 0) {
                this._svc.uploadItems(<any>items, dir.file_info);
                return;
            }

            //
            // Upload local File(s)
            if (files && files.length > 0) {
                this.upload(<any>files, dir);
                return;
            }
        });
    }

    public getDraggedFiles(e: DragEvent): Array<ApiFile> {
        return this._svc.getDraggedFiles(e);
    }

    public clipboardPaste(e: ClipboardEvent, destination: WebFile) {
        this._svc.clipboardPaste(e, destination.file_info);
    }

    public clipboardCopy(e: ClipboardEvent, files: Array<WebFile>) {
        files = files.filter(f => f.file_info);
        this._svc.clipboardCopy(e, files.map(f => f.file_info));
    }

    private async loadDir(path: string): Promise<WebFile> {
        try {
            if (!this._website) {
                Promise.reject("WebSite is not specified");
            }
            this._notificationService.clearWarnings();
            const fileObj = await this.getFile(path);
            this._current.next(WebFile.fromObj(fileObj));
            if (this.isDir(fileObj)) {
                await this.loadFiles();
            }
            return this._current.getValue();
        } catch (e) {
            this._current.next(null);
            // Clear files
            this._files.getValue().splice(0);
            this._files.next(this._files.getValue());
            this._svc.handleError(e, path);
            throw e;
        }
    }

    private loadFiles(): Promise<any> {
        let dir = this._current.getValue();
        let files = this._files.getValue();

        const promise = this._http.get("/webserver/files?parent.id=" + dir.id + "&fields=name,type,path," + this._fileInfoFields)
            .then(res => {
                res = (<Array<WebFile>>(res.files)).map(f => WebFile.fromObj(f));

                files.splice(0); // Clear

                res.forEach((f: WebFile) => files.push(f));

                this._files.next(files);
            });
        return this.handleAccessDeniedError(dir.path, promise);
    }

    private getFile(path: string): Promise<WebFile> {
        // ultimately called from web-file component
        path = path.replace("//", "/");

        const promise = this._http
            .get("/webserver/files?website.id=" + this._website.id + "&path=" + encodeURIComponent(path) + "&fields=name,type,path," + this._fileInfoFields, null, false)
            .then(f => WebFile.fromObj(f));
        return this.handleAccessDeniedError(path, promise);
    }

    private handleAccessDeniedError(path: string, promise: Promise<any>): Promise<any> {
        return promise.catch(e => {
            // TODO: unify 403 handling
            // This is called from website file page, therefore 403 should really never happen adding this to be safe
            if (e.status === 403 && e.title && e.title.toLowerCase() == 'forbidden') {
                if (path) {
                    const fullPath = (this._website.physical_path + path).replace('/', '\\');
                    e.message = `Access denied on path: ${fullPath}. Please go to [Web Server]/[File System] to verify IIS File System Mapping to ensure sufficient access for this operation.`;
                } else {
                    e.message = `Access denied. Please go to [Web Server]/[File System] to verify IIS File System Mapping to ensure sufficient access for this operation.`;
                }
                throw e;
            } else if (!e.message) {
                // special case where some empty error was thrown. This happens somehow during testing.
                throw new Error(`Cannot access path ${path}`);
            } else {
                throw e;
            }
        })
    }

    private isDir(file: WebFile) {
        return file.type == WebFileType.Directory || file.type == WebFileType.Vdir || file.type == WebFileType.Application;
    }

    private removeChildrenWithoutInfo(files: Array<WebFile>): Array<WebFile> {
        let removed = "";
        let filtered = files.filter(f => {
            if (!f.file_info) {
                removed += !!removed ? ", " : "";
                removed += "'" + f.path + "'";
            }

            return f.file_info
        });

        if (removed) {
            let warning = "Forbidden: " + removed;
            this._notificationService.warn(warning);
        }

        return filtered;
    }
}
