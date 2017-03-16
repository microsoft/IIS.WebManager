
import {Injectable} from '@angular/core';
import {Response} from '@angular/http';

import {DiffUtil} from '../../utils/diff';

import {DefaultDocuments, File} from './default-documents';

// 
// Don't import rxjs/Rx. Loading is too slow!
// Import only needed operators
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

import {HttpClient} from '../../common/httpclient';


@Injectable()
export class DefaultDocumentsService {
    private _defaultDoc: DefaultDocuments;
    private _files: BehaviorSubject<File[]> = new BehaviorSubject<File[]>(null);

    constructor(private _http: HttpClient) {
    }


    get(id: string): Promise<DefaultDocuments> {
        if (this._defaultDoc && this._defaultDoc.id === id) {
            return Promise.resolve(this._defaultDoc);
        }

        return this.load(id);
    }

    update(data: DefaultDocuments): Promise<DefaultDocuments> {
        return this._http.patch(this._defaultDoc._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(obj => {
                return DiffUtil.set(this._defaultDoc, obj);
            });
    }

    revert(): Promise<DefaultDocuments> {
        return this._http.delete(this._defaultDoc._links.self.href.replace("/api", ""))
            .then(_ => {
                let id = this._defaultDoc.id;
                this._defaultDoc.id = undefined;

                return this.get(id).then(_ => {
                    //
                    // Update files
                    if (this._files.getValue()) {
                        this.getFiles();
                    }

                    return this._defaultDoc;
                })
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
        file.default_document = <DefaultDocuments>{ id: this._defaultDoc.id };

        return this._http.post(this._defaultDoc._links.files.href.replace("/api", ""), JSON.stringify(file))
            .then(f => {
                DiffUtil.set(file, this.fileFromJson(f));

                let files = this._files.getValue() || [];

                files.splice(0, 0, file);
                this._files.next(files);

                this._defaultDoc.metadata.is_local = true;
                return file;
            });
    }

    updateFile(file: File, data: File) {
        return this._http.patch(file._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(f => {
                this._defaultDoc.metadata.is_local = true;
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

                this._defaultDoc.metadata.is_local = true;

                this._files.next(files);
            });
    }

    private fileFromJson(obj: File): File {
        obj.default_document = this._defaultDoc;
        return obj;
    }

    private load(id: string): Promise<DefaultDocuments> {
        return this._http.get("/webserver/default-documents/" + id)
            .then(obj => {
                if (!this._defaultDoc) {
                    this._defaultDoc = obj;
                }
                else {
                    DiffUtil.set(this._defaultDoc, obj);
                }

                return this._defaultDoc;
            });
    }

    private getFiles(): Promise<File[]> {
        return this._http.get(this._defaultDoc._links.files.href.replace("/api", ""))
            .then(obj => {
                this._files.next(obj.files.map(f => this.fileFromJson(f)));

                return this._files.getValue();
            });
    }
}
