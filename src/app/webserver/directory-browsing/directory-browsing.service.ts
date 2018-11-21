import { Injectable, Inject } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { HttpClient } from '../../common/httpclient';
import { ApiError, ApiErrorType } from '../../error/api-error';
import { Runtime } from 'runtime/runtime';

@Injectable()
export class DirectoryBrowsingService {
    public error: ApiError;

    private _webserverScope: boolean;
    private _status: Status = Status.Unknown;
    private static URL: string = "/webserver/directory-browsing/"
    private _directoryBrowsing: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(
        private _http: HttpClient,
        @Inject("Runtime") private runtime: Runtime,
    ){
            this._webserverScope = this.runtime.IsWebServerScope();
    }

    public get status(): Status {
        return this._status;
    }

    public get webserverScope(): boolean {
        return this._webserverScope;
    }

    public get directoryBrowsing(): Observable<any> {
        return this._directoryBrowsing.asObservable();
    }

    public init(id: string) {
        return this._http.get(DirectoryBrowsingService.URL + id)
            .then(feature => {
                this._status = Status.Started;
                this._directoryBrowsing.next(feature);
            })
            .catch(e => {
                this.error = e;

                if (e.type && e.type == ApiErrorType.FeatureNotInstalled) {
                    this._status = Status.Stopped;
                }
            });
    }

    public update(data: any) {
        let id = this._directoryBrowsing.getValue().id;
        return this._http.patch(DirectoryBrowsingService.URL + id, JSON.stringify(data))
            .then(feature => {
                let d = this._directoryBrowsing.getValue();
                DiffUtil.set(d, feature);
                this._directoryBrowsing.next(d);
            });
    }

    public revert() {
        let id = this._directoryBrowsing.getValue().id;
        return this._http.delete(DirectoryBrowsingService.URL + id)
            .then(() => this.init(id));
    }

    public install(): Promise<any> {
        this._status = Status.Starting;
        return this._http.post(DirectoryBrowsingService.URL, "")
            .then(doc => {
                this._status = Status.Started;
                this._directoryBrowsing.next(doc);
            })
            .catch(e => {
                this.error = e;
                throw e;
            });
    }

    public uninstall(): Promise<any> {
        this._status = Status.Stopping;
        let id = this._directoryBrowsing.getValue().id;
        this._directoryBrowsing.next(null);
        return this._http.delete(DirectoryBrowsingService.URL + id)
            .then(() => {
                this._status = Status.Stopped;
            })
            .catch(e => {
                this.error = e;
                throw e;
            });
    }
}
