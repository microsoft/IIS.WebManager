import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { ResponseCompression } from './compression';
import { HttpClient } from '../../common/http-client';
import { ApiError, ApiErrorType } from '../../error/api-error';
import { ActivatedRoute } from '@angular/router';
import { IsWebServerScope } from 'runtime/runtime';

@Injectable()
export class CompressionService {
    public error: ApiError;

    private static URL = "/webserver/http-response-compression/";
    private _status: Status = Status.Unknown;
    private _webserverScope: boolean;
    private _compression: BehaviorSubject<ResponseCompression> = new BehaviorSubject<ResponseCompression>(null);

    constructor(
        private _route: ActivatedRoute,
        private _http: HttpClient,
    ){
        this._webserverScope = IsWebServerScope(this._route);
    }

    public get status(): Status {
        return this._status;
    }

    public get webserverScope(): boolean {
        return this._webserverScope;
    }

    public get compression(): Observable<ResponseCompression> {
        return this._compression.asObservable();
    }

    public initialize(id: string) {
        return this._http.get(CompressionService.URL + id)
            .then(compression => {
                this._status = Status.Started;
                this._compression.next(compression);
            })
            .catch(e => {
                this.error = e;

                if (e.type && e.type == ApiErrorType.FeatureNotInstalled) {
                    this._status = Status.Stopped;
                }

                throw e;
            })
    }

    update(data: any) {
        let id = this._compression.getValue().id;
        return this._http.patch(CompressionService.URL + id, JSON.stringify(data))
            .then(feature => {
                let comp = this._compression.getValue();
                DiffUtil.set(comp, feature);
                this._compression.next(comp);
            });
    }

    revert(): Promise<any> {
        let id = this._compression.getValue().id;
        return this._http.delete(CompressionService.URL + id)
            .then(() => this.initialize(id));
    }

    public install(): Promise<any> {
        this._status = Status.Starting;
        return this._http.post(CompressionService.URL, "")
            .then(doc => {
                this._status = Status.Started;
                this._compression.next(doc);
            })
            .catch(e => {
                this.error = e;
                throw e;
            });
    }

    public uninstall(): Promise<any> {
        this._status = Status.Stopping;
        let id = this._compression.getValue().id;
        this._compression.next(null);
        return this._http.delete(CompressionService.URL + id)
            .then(() => {
                this._status = Status.Stopped;
            })
            .catch(e => {
                this.error = e;
                throw e;
            });
    }
}
