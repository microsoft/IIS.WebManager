import { Injectable } from '@angular/core';
import { RequestMethod, RequestOptionsArgs, Response } from '@angular/http';
import { Subject, Observable, Subscription, BehaviorSubject } from "rxjs";
import { HttpClient } from '../common/http-client';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/notification';
import { Progress } from './progress';
import { IDisposable } from '../common/idisposable';
import { ApiFile, ApiFileType, FileChangeEvent, MimeTypes } from './file';
import { Location } from './location';
import { ParallelExecutor } from './parallel-executor';
import { ComponentReference, UploadComponentName } from '../main/settings';

declare var unescape: any;

const UploadComponentReference: ComponentReference = { name: UploadComponentName, ico: null, component_name: UploadComponentName, api_name: null, api_path: null };

@Injectable()
export class FilesService implements IDisposable {
    private _uploadSignal: NodeJS.Timer = null;
    private _fields = "name,id,alias,type,physical_path,size,created,last_modified,mime_type,e_tag,parent";
    private _subscriptions: Array<Subscription> = [];
    private _creator: ParallelExecutor = new ParallelExecutor(10);
    private _uploader: ParallelExecutor = new ParallelExecutor(50);
    private _change: Subject<FileChangeEvent> = new Subject<FileChangeEvent>();
    private _progress: BehaviorSubject<Array<Progress>> = new BehaviorSubject<Array<Progress>>([]);

    constructor(private _http: HttpClient,
                private _notificationService: NotificationService) {

        this._subscriptions.push(this.progress.subscribe(progresses => {
            this.signalUploadDisplay(progresses.length == 0);
        }))
    }

    public dispose() {
        for (let sub of this._subscriptions) {
            sub.unsubscribe();
        }
    }

    public get change(): Observable<FileChangeEvent> {
        return this._change.asObservable();
    }

    public get progress(): Observable<Array<Progress>> {
        return this._progress.asObservable();
    }

    public get(id: string): Promise<ApiFile> {
        return this._http.get("/files?id=" + id)
            .then(file => {
                return ApiFile.fromObj(file);
            });
    }

    public getByPhysicalPath(path: string): Promise<ApiFile> {
        return this._http.get("/files?physical_path=" + path, null, false)
            .then(res => {
                return ApiFile.fromObj(res)
            })
            .catch(e => {
                this.handleError(e, path);
                throw e;
            });
    }

    public getChildren(dir: ApiFile): Promise<Array<ApiFile>> {
        return this._http.get("/files?parent.id=" + dir.id + "&fields=" + this._fields, null, false)
            .then(res => {
                return (<Array<any>>res.files).map(f => ApiFile.fromObj(f));
            })
            .catch(e => {
                this.handleError(e, dir.physical_path);
                throw e;
            });
    }

    public getRoots(): Promise<Array<ApiFile>> {
        return this._http.get("/files?fields=" + this._fields + ",claims")
            .then(res => {
                return (<Array<any>>res.files).map(f => {

                    let apiFile = ApiFile.fromObj(f);

                    apiFile.isLocation = true;

                    return apiFile;
                });
            })
            .catch(e => {
                this.handleError(e, "/");
                throw e;
            });
    }

    public getLocation(id: string): Promise<Location> {
        return this._http.get("/files/locations/" + id)
            .catch(e => {
                this.handleError(e, "/");
                throw e;
            });
    }

    public createLocation(location: Location): void {
        this.createLocationInternal(location);
    }

    public deleteLocations(locations: Array<ApiFile>): void {
        this.deleteLocationsInternal(locations);
    }

    public updateLocation(location: Location, data: any) {
        return this.updateLocationInternal(location, data);
    }

    public create(file: ApiFile, parent: ApiFile): void {
        this.createInternal(file, parent);
    }

    public update(file: ApiFile, data: any): Promise<ApiFile> {
        return this.updateInternal(file, data);
    }

    public delete(files: Array<ApiFile>): void {
        this.deleteInternal(files);
    }

    public upload(parent: ApiFile, files: Array<File>): void {
        this.uploadInternal(parent, files);
    }

    public uploadItems(items: Array<any>, to: ApiFile): void {
        this.uploadItemsInternal(items, to);
    }

    public getFileContent(file: ApiFile): Promise<Response> {
        let url = "/files/content?id=" + file.id;

        let opts: RequestOptionsArgs = this._http.getOptions(RequestMethod.Get, url, null);

        return this._http.request(url, opts);
    }

    public setFileContent(file: ApiFile, content: ArrayBuffer | SharedArrayBuffer | string): Promise<any> {
        if (typeof (content) === 'string') {
            content = FilesService.str2utf8(<string>content);
        }

        let url = "/files/content?id=" + file.id;
        let opts: RequestOptionsArgs = this._http.getOptions(RequestMethod.Put, url, null);

        //
        // Content type workaround for https://github.com/angular/angular/issues/13973
        opts.headers.append("Content-Type", "application/octet-binary");

        let totalBytes = (<ArrayBuffer>content).byteLength;
        if (totalBytes > 0) {
            opts.headers.append('Content-Range', 'bytes 0-' + (totalBytes - 1) + '/' + totalBytes);
        }

        // Set Content
        opts.body = content;

        return this._http.request(url, opts, false)
            .then(r => {
                //
                // Refresh metadata
                this.get(file.id).then(f => {
                    Object.assign(file, f);
                    this._change.next(FileChangeEvent.updated(file));
                });

                return r;
            })
            .catch(e => {
                this.handleError(e, file.physical_path);
                throw e;
            });
    }

    public download(file: ApiFile): void {
        this.downloadInternal(file);
    }

    public move(sources: Array<ApiFile>, destination: ApiFile, name: string = null): void {
        this.copyMove(false, sources, destination, name);
    }

    public copy(sources: Array<ApiFile>, destination: ApiFile, name: string = null): void {
        this.copyMove(true, sources, destination, name);
    }

    public rename(file: ApiFile, name: string) {
        if (name && file.name.toLocaleLowerCase() != name.toLocaleLowerCase()) {
            this._notificationService.clearWarnings();

            let oldName = file.name;
            file.name = name;

            this.update(file, { name: name }).catch(e => {
                file.name = oldName;
                throw e;
            });
        }
    }

    public generateDownloadLink(file: ApiFile, ttl: number = 0): Promise<string> {
        let dlUrl = "/files/downloads";

        let dl = <any>{
            file: file
        };

        if (ttl) {
            dl.ttl = ttl;
        }

        let opts: RequestOptionsArgs = this._http.getOptions(RequestMethod.Post, dlUrl, null);
        opts.headers.append("Content-Type", "application/json");

        opts.body = JSON.stringify(dl);

        return this._http.request(dlUrl, opts)
            .then(response => {
                return this._http.endpoint().url + response.headers.get("location");
            });
    }

    public drag(e: DragEvent, files: Array<ApiFile>) {
        if (files && files.length > 0) {
            let dt = e.dataTransfer;
            e.dataTransfer.effectAllowed = "copyMove";

            let json = JSON.stringify(files);

            try {
                dt.setData(MimeTypes.ApiFiles, json);
            }
            catch (e) {
                // IE does not recognize custom mime types
                // If setData causes an error, e.dataTransfer is null
                dt.setData("Text", json);
            }
        }
    }

    public drop(e: DragEvent, destination: ApiFile | string) {
        let apiFiles = this.getDraggedFiles(e);
        let items = e.dataTransfer.items;
        let files = e.dataTransfer.files;
        let copy = (e.dataTransfer.effectAllowed == "all") || ((e.dataTransfer.effectAllowed.toLowerCase() == "copymove") && e.ctrlKey);


        let promise = (destination instanceof ApiFile) ? Promise.resolve(destination) : this.getByPhysicalPath(destination);

        promise.then(file => {
            //
            // Copy/Move File(s)
            if (apiFiles.length > 0) {
                copy ? this.copy(apiFiles, file) : this.move(apiFiles, file);
                return;
            }

            //
            // Upload items
            if (items && items.length > 0) {
                this.uploadItems(<any>items, file);
                return;
            }

            //
            // Upload local File(s)
            if (files && files.length > 0) {
                this.upload(file, <any>files);
                return;
            }
        });
    }

    public getDraggedFiles(e: DragEvent): Array<ApiFile> {
        //
        // Get all data in advance, because dataTransfer is only availabe during drop event
        // Otherwise the async operations will not have access to these
        let apiFilesData = null;
        try {
            apiFilesData = e.dataTransfer.getData(MimeTypes.ApiFiles);
        }
        catch (e) {
            // IE does not support custom mime types       
            apiFilesData = e.dataTransfer.getData("Text");
        }

        return apiFilesData ? JSON.parse(apiFilesData).map(f => ApiFile.fromObj(f)) : [];
    }

    public clipboardCopy(e: ClipboardEvent, files: Array<ApiFile>) {
        e.clipboardData.clearData();

        if (files && files.length > 0) {
            e.preventDefault();

            e.clipboardData.setData(MimeTypes.ClipboardOperation, e.type.toLowerCase());
            e.clipboardData.setData(MimeTypes.ApiFiles, JSON.stringify(files));
        }
    }

    public clipboardPaste(e: ClipboardEvent, destination: ApiFile) {
        let op = e.clipboardData.getData(MimeTypes.ClipboardOperation);
        if (!op) {
            return;
        }

        let data = e.clipboardData.getData(MimeTypes.ApiFiles);
        let files = data ? <ApiFile[]>JSON.parse(data).map(f => ApiFile.fromObj(f)) : [];

        if (files && files.length > 0) {
            e.preventDefault();

            if (op == "copy") {
                this.copy(files, destination);
            }
            else if (op == "cut") {
                e.clipboardData.clearData();
                this.move(files, destination);
            }
        }
    }

    public handleError(e, path: string=null) {
        if (e.status) {
            if (e.status === 403 && e.title && e.title.toLowerCase() == 'forbidden') {
                // This is called on webserver file system page
                // TODO: unify 403 handling
                e.message = `IIS has no access to ${path}. if the path exists, use "New File System Mapping" button to map the path to IIS file system.\n\n`;
            }
            else if ((e.status === 404 || e.status == 400) && e.name && (e.name.toLowerCase() == 'path' || e.name.toLowerCase() == 'physical_path')) {
                e.message = "Path not found\n\n" + (path || "");
            }
            else if (e.status == 409) {
                e.message = "Already exists\n\n" + (path || "");
            }
            else if (e.status == 403 && e.title && e.title.toLowerCase() == 'object is locked') {
                e.message = "File in use\n\n" + (path || "");
            }

            this._notificationService.apiError(e);
        }

        this._progress.next(this._progress.getValue());
    }


    //
    //
    //
    private createLocationInternal(location: Location): Promise<ApiFile> {
        return this._http.post("/files/locations", JSON.stringify(location))
            .then(location => {

                return this.get(location.id)
                    .then(f => {

                        let file = ApiFile.fromObj(f);

                        file.isLocation = true;

                        this._change.next(FileChangeEvent.created(file));

                        return file;
                    });
            })
            .catch(e => {

                if (e && e.status == 400 && e.name == "parent") {
                    //
                    // Location API not installed. Api is trying to create a directory is being created

                    e.message = "Ability to create root folders is not available. Please install the latest version."

                    this._notificationService.apiError(e);
                }
                else {

                    this.handleError(e);
                }

                throw e;
            });
    }

    private deleteLocationsInternal(locations: Array<ApiFile>, index: number = 0): Promise<any> {

        if (index == 0) {
            locations = locations.filter(() => true);
        }


        if (index > locations.length - 1) {
            return;
        }


        return this._http.delete("/files/locations/" + locations[index].id)
            .then(() => {

                this._change.next(FileChangeEvent.deleted(locations[index]));

                index++;

                return this.deleteLocationsInternal(locations, index);
            })
            .catch(e => {
                this.handleError(e);
                throw e;
            });
    }

    private updateLocationInternal(location: Location, data: any): Promise<any> {

        return this.get(location.id)
            .then(existingDir => {

                existingDir.isLocation = true;

                return this._http.patch("/files/locations?id=" + location.id, JSON.stringify(data))
                    .then(l => {

                        Object.assign(location, l);

                        return this.get(location.id)
                            .then(d => {

                                this._change.next(FileChangeEvent.deleted(existingDir));

                                let newDir = ApiFile.fromObj(d);

                                newDir.isLocation = true;

                                this._change.next(FileChangeEvent.created(newDir));

                                return location;
                            });

                    });

            })
            .catch(e => {

                this.handleError(e, location.path);

                throw e;

            });;

    }

    //
    //
    //
    private createInternal(file: ApiFile, parent: ApiFile): Promise<ApiFile> {
        return this._creator.execute(() => {
            file.parent = parent;

            return this._http.post("/files", JSON.stringify(file))
                .then(f => {
                    Object.assign(file, ApiFile.fromObj(f));
                    this._change.next(FileChangeEvent.created(file));
                    return f;
                })
                .catch(e => {
                    this.handleError(e);
                    throw e;
                });
        });
    }

    private updateInternal(file: ApiFile, data: any): Promise<any> {
        return this._http.patch("/files?id=" + file.id, JSON.stringify(data))
            .then(f => {
                Object.assign(file, ApiFile.fromObj(f));
                this._change.next(FileChangeEvent.updated(file));
                return file;
            })
            .catch(e => {
                this.handleError(e, file.physical_path);
                throw e;
            });
    }

    private deleteInternal(files: Array<ApiFile>): Promise<any> {

        let root = files.find(file => !file.parent);

        if (root) {
            let message = "Root folders cannot be deleted: '" + root.name + "'";

            this._notificationService.warn(message);

            return Promise.reject(message);
        }

        let promises = [];

        for (let file of files) {
            promises.push(this._http.delete("/files?id=" + file.id)
                .then(_ => {
                    this._change.next(FileChangeEvent.deleted(file));
                }));
        }

        return Promise.all(promises)
            .catch(e => {
                this.handleError(e);
                throw e;
            });
    }

    private uploadInternal(parent: ApiFile, files: Array<File>): Promise<Array<any>> {
        let promises = [];
        let forAll = null;
        let overwrite = null;
        this.showUploads(true);

        for (let content of files) {
            let apiFile = new ApiFile();
            apiFile.name = content.name;
            apiFile.type = ApiFileType.File;

            promises.push(this.createSetContent(apiFile, parent, content).catch(e => {
                if (e.status != 409) {
                    throw e;
                }

                if (overwrite === null) {
                    overwrite = confirm(content.name + " already exists. Would you like to overwrite existing files?");
                }

                let path = parent.physical_path + '\\' + content.name;
                if (overwrite) {
                    this._notificationService.clearWarnings();
                    return this.getByPhysicalPath(path)
                        .then(existing => {
                            return this.setContent(existing, content)
                                .then(() => this.updateMetadata(existing, content));
                        });
                }
                else {
                    this.handleError(e, path);
                    throw e;
                }
            }));
        }

        return Promise.all(promises);
    }

    private downloadInternal(file: ApiFile): void {
        this.generateDownloadLink(file)
            .then(location => {
                if (location) {
                    window.location.href = location;
                }
            });
    }

    private uploadItemsInternal(items: Array<any>, to: ApiFile): Promise<any> {
        let dirPromise: Promise<any> = null;
        let files: Array<File> = [];
        let filePromises: Array<Promise<any>> = [];
        let dirPromises = [];

        for (let i = 0; i < items.length; ++i) {
            let item: any = items[i];

            if (item.webkitGetAsEntry) {
                item = item.webkitGetAsEntry();
            }

            if (!item) {
                continue;
            }

            let entry: FileSystemEntry = item;

            if (entry.isDirectory) {
                dirPromises.push(this.uploadFileSystemDirectoryEntry(<FileSystemDirectoryEntry>entry, to));
            }

            if (entry.isFile && (<FileSystemFileEntry>entry).file) {
                filePromises.push(new Promise((resolve, reject) => {
                    (<FileSystemFileEntry>entry).file(f => {
                        files.push(f);
                        resolve(f);
                    }, e => reject(e));
                }));
            }
        }

        let filesPromise = Promise.all(filePromises)
            .then(res => this.upload(to, files));

        return Promise.all(dirPromises.concat(filesPromise));
    }

    private uploadFileSystemDirectoryEntry(fsDirectory: FileSystemDirectoryEntry, to: ApiFile): Promise<any> {
        let dir = new ApiFile();
        dir.type = ApiFileType.Directory;
        dir.name = fsDirectory.name;

        return this.createInternal(dir, to)
            .catch(e => {
                if (e.status != 409) {
                    throw e;
                }
                this._notificationService.clearWarnings();
                return this.getByPhysicalPath(to.physical_path + '\\' + dir.name);
            })
            .then(newDir => {
                return this.getChildItems(fsDirectory)
                    .then(entries => {
                        return this.uploadItemsInternal(entries, newDir)
                            .then(uploadItems => {
                                return this.getFileSystemEntryMetadata(fsDirectory)
                                    .then(metadata => {
                                        // Update LastModified
                                        return this.update(newDir, { last_modified: metadata.modificationTime });
                                    });
                            });
                    })
                    .catch(e => {
                        this.handleError(e);
                        if (newDir) {
                            this._notificationService.warn("An error occured while uploading " + dir.physical_path);
                        }
                        throw e;
                    });
            });
    }

    private getFileSystemEntryMetadata(fsDirectory: FileSystemDirectoryEntry): Promise<Metadata> {
        return new Promise((resolve, reject) => {
            fsDirectory.getMetadata(metadata => resolve(metadata), error => reject(error));
        });
    }

    private getChildItems(fsDirectory: FileSystemDirectoryEntry, reader?: FileSystemDirectoryReader): Promise<Array<FileSystemEntry>> {
        let r = reader ? reader : fsDirectory.createReader();
        return new Promise<Array<any>>((resolve, reject) => {
            r.readEntries(entries => {
                let children = [];
                for (let entry of entries) {
                    children.push(entry);
                }
                if (entries.length > 0) {
                    this.getChildItems(fsDirectory, r)
                        .then(c => resolve(children.concat(c)));
                }
                else {
                    resolve(children);
                }
            }, e => {
                reject(e);
            });
        });
    }

    private noConflictUpload(parent: ApiFile, files: Array<File>): Promise<Array<any>> {
        if (files.length == 0) {
            return Promise.resolve([]);
        }

        this.showUploads(true);
        let promises = [];

        for (let content of files) {
            let apiFile = new ApiFile();
            apiFile.name = content.name;
            apiFile.type = ApiFileType.File;

            let progress = this.addProgress(content.size);

            promises.push(this.createSetContent(apiFile, parent, content, progress).catch(e => {

                if (e.status == 409) {
                    // Conflict
                }


                this.removeProgress(progress);
                this.handleError(e, parent.physical_path + '\\' + content.name);
                throw e;
            }));
        }

        return Promise.all(promises);
    }

    private copyMove(copy: boolean, sources: Array<ApiFile>, destination: ApiFile, name: string = null): Promise<Array<ApiFile>> {
        let forAll = null;
        let promises = [];

        this.getChildren(destination)
            .then(children => {
                for (let source of sources) {
                    let n = name ? name : source.name;
                    let existing = children.find(c => c.name === n);

                    if (existing) {
                        promises.push(this.get(source.id)
                            .then(s => {
                                if (s.parent.id == destination.id) {
                                    return copy ? this.performCopy(s, destination, this.getUniqueName(children, n, " - Copy")) : Promise.resolve(s);
                                }
                                else if ((forAll || confirm('The destination already has a file named "' + n + '". Do you want to overwrite it?'))) {
                                    if (sources.length > 1 && forAll === null) {
                                        forAll = confirm("Do this for all conflicts?");
                                    }

                                    return copy ? this.performCopy(s, destination, n) : this.performMove(s, destination, n);
                                }
                            }));
                    }
                    else {
                        promises.push(copy ? this.performCopy(source, destination, n) : this.performMove(source, destination, n));
                    }
                }
            });

        return Promise.all(promises);
    }


    
    private performMove(source: ApiFile, destination: ApiFile, name?: string): Promise<ApiFile> {
        let move = {
            file: source,
            parent: destination,
            name: name ? name : null
        };

        return this._http.post('files/move', JSON.stringify(move), null, false)
            .then(progress => {
                return this.monitorProgress(progress)
                    .then(_ => {
                        return this._http.get("/files?id=" + progress.file.id, null, false)
                            .then(f => {
                                this._change.next(FileChangeEvent.deleted(source));
                                this._change.next(FileChangeEvent.created(ApiFile.fromObj(f)));
                                return f;
                            })
                            .catch(e => {
                                if (e.status == 404) {
                                    this._notificationService.warn('Moving "' + move.file.name + '" failed.');
                                    return;
                                }
                                throw e;
                            });
                    })
            })
            .catch(e => {
                this.handleError(e, source.physical_path);
                throw e;
            });
    }

    private performCopy(source: ApiFile, destination: ApiFile, name?: string): Promise<ApiFile> {
        let copy = {
            file: source,
            parent: destination,
            name: name ? name : null
        };

        if (source.id == destination.id) {
            return Promise.reject<ApiFile>("Invalid destination.");
        }

        return this._http.post('files/copy', JSON.stringify(copy), null, false)
            .then(progress => {
                return this.monitorProgress(progress)
                    .then(_ => {
                        return this._http.get("/files?id=" + progress.file.id, null, false)
                            .then(f => {
                                this._change.next(FileChangeEvent.created(ApiFile.fromObj(f)));
                                return f;
                            })
                            .catch(e => {
                                if (e.status == 404) {
                                    this._notificationService.warn('Copying "' + copy.file.name.toLowerCase() + '" failed.');
                                    return;
                                }
                                throw e;
                            });
                    })
            })
            .catch(e => {
                this.handleError(e, source.physical_path);
                throw e;
            });
    }

    private monitorProgress(p, progress?: Progress): Promise<any> {

        this.showUploads(true);

        if (!progress) {
            progress = this.addProgress(p.total_size);
        }

        progress.completed = p.current_size;
        this._progress.next(this._progress.getValue());

        return this._http.get(p._links.self.href.replace('/api', ''), null, false)
            .then(p2 => this.monitorProgress(p2, progress))
            .catch(e => {
                this.removeProgress(progress);

                if (e.status == 404) {
                    return Promise.resolve(null);
                }
                throw e;
            });
    }

    private getUniqueName(files: Array<ApiFile>, targetName: string, addendum: string): string {
        let name = targetName;

        let extensionIndex = targetName.lastIndexOf('.');
        let preExtension = extensionIndex == -1 ? targetName : targetName.substring(0, extensionIndex);
        let extension = extensionIndex == -1 ? "" : targetName.substring(extensionIndex);

        if (files.find(c => c.name === name)) {
            for (let i = 0; i <= files.length; i++) {
                name = preExtension + (i == 0 ? addendum : (addendum + ' (' + i + ')')) + extension;
                if (!files.find(c2 => c2.name === name)) {
                    break;
                }
            }
        }
        return name;
    }

    private setContent(file: ApiFile, fileInfo: File, progress?: Progress): Promise<any> {
        return this._uploader.execute(() => this._setContent(file, fileInfo, progress));
    }

    private _setContent(file: ApiFile, fileInfo: File, progress?: Progress): Promise<any> {
        if (fileInfo.size == 0) {

            if (progress) {
                this._progress.next(this._progress.getValue().filter(p => p !== progress));
            }

            return Promise.resolve(file);
        }

        const chunkSize = 1024 * 1024 * 2; // In bytes;

        let initialLength = fileInfo.size < chunkSize ? fileInfo.size : chunkSize;
        let url = "/files/content?id=" + file.id;

        return this.read(fileInfo, 0, initialLength)
            .then(content => {
                return this.setContentChunked(fileInfo, url, 0, initialLength, content, chunkSize, fileInfo.size, progress);
            })
            .catch(e => {
                this.handleError(e);
                throw e;
            });;
    }

    private createSetContent(file: ApiFile, parent: ApiFile, content: File, progress?: Progress): Promise<ApiFile> {
        return this.createInternal(file, parent)
            .then(f => {
                return this.setContent(f, content, progress)
                    .then(res => {
                        //
                        // Update LastModified
                        return this.updateMetadata(f, content);
                    })
                    .catch(e => {
                        this.delete([f]);
                        return Promise.reject("Upload failed.");
                    });
            });
    }

    private updateMetadata(file: ApiFile, metaData: File): Promise<ApiFile> {
        return this.updateInternal(file, { last_modified: metaData.lastModified })
            .then(fileInfo => {
                return ApiFile.fromObj(fileInfo);
            });
    }

    private setContentChunked(fileInfo: File, url: string, start: number, length: number, content: ArrayBuffer, chunkSize: number, totalSize: number, progress?: Progress): Promise<any> {

        if (!progress) {
            progress = this.addProgress(totalSize);
        }

        let opts: RequestOptionsArgs = this._http.getOptions(RequestMethod.Put, url, null);

        //
        // Content type workaround for https://github.com/angular/angular/issues/13973
        opts.headers.append("Content-Type", "application/octet-binary");
        opts.headers.append('Content-Range', 'bytes ' + start + '-' + (start + length - 1) + '/' + totalSize);

        opts.body = content;
        
        return this._http.request(url, opts, false)
            .then(suc => {
                this._progress.getValue().find(p => p === progress).completed = start + length;
                this._progress.next(this._progress.getValue());

                start = start + length;

                if (start >= totalSize) {
                    this._progress.next(this._progress.getValue().filter(p => p !== progress));
                    return suc;
                }
                else {
                    let l = totalSize - start < chunkSize ? totalSize - start : chunkSize;

                    return this.read(fileInfo, start, l)
                        .then(d => {
                            return this.setContentChunked(fileInfo, url, start, l, d, chunkSize, totalSize, progress);
                        });
                }
            })
            .catch(e => {
                this._progress.next(this._progress.getValue().filter(p => p !== progress));
                throw e;
            });
    }

    private read(file: File, start: number, length: number): Promise<ArrayBuffer> {
        let reader: FileReader = new FileReader();

        let slice = file.slice(start, start + length);

        return new Promise<ArrayBuffer>((resolve, reject) => {
            reader.onload = e => {
                resolve((<any>e).target.result);
            }
            reader.onerror = e => {
                reject(e);
            };
            reader.readAsArrayBuffer(slice);
        });
    }

    private showUploads(show: boolean) {
        if (show) {
            if (!this._notificationService.getNotifications().find(n => n.componentName == UploadComponentName)) {
                this._notificationService.notify({
                    type: NotificationType.Information,
                    componentName: UploadComponentReference.component_name,
                    module: UploadComponentReference,
                    data: null,
                    highPriority: true
                });
                this._notificationService.show();
            }
        }
        else {
            let uploadNotification = this._notificationService.getNotifications().find(n => n.componentName == UploadComponentName);
            if (uploadNotification) {
                this._notificationService.remove(uploadNotification);
            }            
        }
    }

    private signalUploadDisplay(hide: boolean) {
        if (hide) {
            if (this._uploadSignal == null) {
                this._uploadSignal = setTimeout(() => {
                    this.showUploads(false);
                    this._uploadSignal = null
                }, 500);
            }
        }
        else {
            if (this._uploadSignal != null) {
                clearTimeout(this._uploadSignal);
                this._uploadSignal = null;
            }
        }
    }

    private addProgress(outOf: number): Progress {
        let p = new Progress();
        p.completed = 0;
        p.outOf = outOf;

        this._progress.getValue().push(p);
        this._progress.next(this._progress.getValue());
        return p;
    }

    private removeProgress(progress: Progress) {
        this._progress.next(this._progress.getValue().filter(p => p !== progress));
    }

    private static str2utf8(s: string): ArrayBuffer | SharedArrayBuffer {
        if (s == null) {
            return null;
        }

        //
        // Convert jscript string (UTF-16) to UTF-8
        s = unescape(encodeURIComponent(s));

        // Buffer
        let buff = new Uint8Array(s.length + 3 /*3 bytes for UTF-8 BOM*/); 

        // Write UTF-8 BOM
        buff[0] = 0xEF;
        buff[1] = 0xBB;
        buff[2] = 0xBF;

        // Write string
        for (var i = 0; i < s.length; ++i) {
            buff[i+3] = s.charCodeAt(i);
        }

        return buff.buffer;
    }
}
