import { Injectable, Inject } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { HttpClient } from '../../common/httpclient';
import { DefaultDocument, File } from './default-documents';
import { ApiErrorType } from '../../error/api-error';
import { Runtime } from 'runtime/runtime';

@Injectable()
export class DefaultDocumentsService {
    private _defaultDoc: BehaviorSubject<DefaultDocument> = new BehaviorSubject<DefaultDocument>(null);
    private _files: BehaviorSubject<File[]> = new BehaviorSubject<File[]>(null);
    private _webserverScope: boolean;

    public error: any;
    public _status: Status = Status.Unknown;
    public defaultDocument: Observable<DefaultDocument> = this._defaultDoc.asObservable();

    constructor(
        private _http: HttpClient,
        @Inject("Runtime") private runtime: Runtime
    ){
        this._webserverScope = this.runtime.IsWebServerScope();
    }

    public get status(): Status {
        return this._status;
    }

    public get webserverScope(): boolean {
        return this._webserverScope;
    }


    public init(id: string): Promise<DefaultDocument> {
        this.reset();
        return this.load(id);
    }

    public update(data: DefaultDocument): Promise<DefaultDocument> {
        return this._http.patch(this._defaultDoc.getValue()._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(obj => {
                return DiffUtil.set(this._defaultDoc.getValue(), obj);
            });
    }

    public revert(): Promise<DefaultDocument> {
        return this._http.delete(this._defaultDoc.getValue()._links.self.href.replace("/api", ""))
            .then(_ => {
                let id = this._defaultDoc.getValue().id;
                this._defaultDoc.getValue().id = undefined;

                return this.load(id).then(_ => {
                    //
                    // Update files
                    if (this._files.getValue()) {
                        this.getFiles();
                    }

                    return this._defaultDoc.getValue();
                })
            });
    }

    public install(): Promise<any> {
        this._status = Status.Starting;
        return this._http.post("/webserver/default-documents/", "")
            .then(doc => {
                this._status = Status.Started;
                this._defaultDoc.next(doc);
            })
            .catch(e => {
                this.error = e;
                throw e;
            });
    }

    public uninstall(): Promise<any> {
        this._status = Status.Stopping;
        let id = this._defaultDoc.getValue().id;
        this._defaultDoc.next(null);
        return this._http.delete("/webserver/default-documents/" + id)
            .then(() => {
                this._status = Status.Stopped;
            })
            .catch(e => {
                this.error = e;
                throw e;
            });
    }


    //
    // Files
    // 
    get files(): Observable<File[]> {
        if (!this._files.getValue()) {
            this.getFiles();
        }

        return this._files.asObservable();
    }

    addFile(file: File): Promise<File> {
        file.default_document = <DefaultDocument>{ id: this._defaultDoc.getValue().id };

        return this._http.post(this._defaultDoc.getValue()._links.files.href.replace("/api", ""), JSON.stringify(file))
            .then(f => {
                DiffUtil.set(file, this.fileFromJson(f));

                let files = this._files.getValue() || [];

                files.splice(0, 0, file);
                this._files.next(files);

                this._defaultDoc.getValue().metadata.is_local = true;
                return file;
            });
    }

    updateFile(file: File, data: File) {
        return this._http.patch(file._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(f => {
                this._defaultDoc.getValue().metadata.is_local = true;
                return DiffUtil.set(file, this.fileFromJson(f));
            });
    }

    deleteFile(file: File): Promise<any> {
        return this._http.delete(file._links.self.href.replace("/api", ""))
            .then(_ => {
                let files = this._files.getValue() || [];

                let i = files.indexOf(file);
                if (i >= 0) {
                    files.splice(i, 1);
                }

                file.id = file._links = undefined;

                this._defaultDoc.getValue().metadata.is_local = true;

                this._files.next(files);
            });
    }

    private fileFromJson(obj: File): File {
        obj.default_document = this._defaultDoc.getValue();
        return obj;
    }

    private load(id: string): Promise<DefaultDocument> {
        return this._http.get("/webserver/default-documents/" + id)
            .then(obj => {
                this._status = Status.Started;
                this._defaultDoc.next(obj);
                return obj;
            })
            .catch(e => {
                this.error = e;

                if (e.type && e.type == ApiErrorType.FeatureNotInstalled) {
                    this._status = Status.Stopped;
                }

                throw e;
            });
    }

    private getFiles(): Promise<File[]> {
        return this._http.get(this._defaultDoc.getValue()._links.files.href.replace("/api", ""))
            .then(obj => {
                this._files.next(obj.files.map(f => this.fileFromJson(f)));

                return this._files.getValue();
            });
    }

    private reset() {
        this.error = null;
        this._defaultDoc.next(null);
        this._files.next(null);
    }
}
