import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { ApiError, ApiErrorType } from '../../error/api-error';
import { HttpClient } from '../../common/http-client';
import {
    RequestFiltering,
    FilteringRule,
    FileExtension
} from './request-filtering';
import { ActivatedRoute } from '@angular/router';
import { IsWebServerScope } from 'runtime/runtime';

@Injectable()
export class RequestFilteringService {
    public error: ApiError;

    private static URL = "/webserver/http-request-filtering/";
    private _webserverScope: boolean;
    private _status: Status = Status.Unknown;
    private _requestFiltering: BehaviorSubject<RequestFiltering> = new BehaviorSubject<RequestFiltering>(null);
    private _filteringRules: BehaviorSubject<Array<FilteringRule>> = new BehaviorSubject<Array<FilteringRule>>([]);
    private _fileExtensions: BehaviorSubject<Array<FileExtension>> = new BehaviorSubject<Array<FileExtension>>([]);

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

    public get requestFiltering(): Observable<RequestFiltering> {
        return this._requestFiltering.asObservable();
    }

    public get filteringRules(): Observable<Array<FilteringRule>> {
        return this._filteringRules.asObservable();
    }

    public get fileExtensions(): Observable<Array<FileExtension>> {
        return this._fileExtensions.asObservable();
    }

    public initialize(id: string) {
        this.load(id);
    }

    public update(data: any): Promise<RequestFiltering> {
        let id = this._requestFiltering.getValue().id;
        return this._http.patch(RequestFilteringService.URL + id, JSON.stringify(data))
            .then(obj => {
                let requestFiltering = this._requestFiltering.getValue();
                for (var k in obj) requestFiltering[k] = obj[k];
                this._requestFiltering.next(requestFiltering);
                return requestFiltering;
            });
    }

    public revert() {
        let id = this._requestFiltering.getValue().id;
        return this._http.delete(RequestFilteringService.URL + id)
            .then(() => {
                this.load(id);
            });
    }

    public install(): Promise<any> {
        this._status = Status.Starting;
        return this._http.post(RequestFilteringService.URL, "")
            .then(feature => {
                this._status = Status.Started;
                this._requestFiltering.next(feature);
            })
            .catch(e => {
                this.error = e;
                throw e;
            });
    }

    public uninstall(): Promise<any> {
        this._status = Status.Stopping;
        let id = this._requestFiltering.getValue().id;
        this._requestFiltering.next(null);
        return this._http.delete(RequestFilteringService.URL + id)
            .then(() => {
                this._status = Status.Stopped;
            })
            .catch(e => {
                this.error = e;
                throw e;
            });
    }

    //
    // Filtering Rules

    public addFilteringRule(rule: FilteringRule) {
        rule.request_filtering = this._requestFiltering.getValue();

        return this._http.post(RequestFilteringService.URL + "rules", JSON.stringify(rule))
            .then(rule => {
                this._filteringRules.getValue().unshift(rule);
                this._filteringRules.next(this._filteringRules.getValue());
            });
    }

    public updateFilteringRule(rule: FilteringRule, data: any): Promise<FilteringRule> {
        return this._http.patch(rule._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(r => {
                DiffUtil.set(rule, r);
                return rule;
            });
    }

    public deleteFilteringRule(rule: FilteringRule) {
        return this._http.delete(rule._links.self.href.replace("/api", ""))
            .then(() => {
                let rules = this._filteringRules.getValue().filter(r => r !== rule);
                this._filteringRules.next(rules);
            });
    }

    private loadFilteringRules() {
        this._http.get(this._requestFiltering.getValue()._links.rules.href.replace("/api", "") + "&fields=*")
            .then(result => {
                this._filteringRules.next(result.rules);
            });
    }

    //
    // File Extensions

    public addFileExtension(extension: FileExtension) {
        extension.request_filtering = this._requestFiltering.getValue();

        return this._http.post(RequestFilteringService.URL + "file-extensions", JSON.stringify(extension))
            .then(extension => {
                this._fileExtensions.getValue().unshift(extension);
                this._fileExtensions.next(this._fileExtensions.getValue());
            });
    }

    public updateFileExtension(extension: FileExtension, data: any): Promise<FileExtension> {
        return this._http.patch(extension._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(e => {
                DiffUtil.set(extension, e);
                return extension;
            });
    }

    public deleteFileExtension(extension: FileExtension) {
        return this._http.delete(extension._links.self.href.replace("/api", ""))
            .then(() => {
                let extensions = this._fileExtensions.getValue().filter(e => e !== extension);
                this._fileExtensions.next(extensions);
            });
    }

    private loadFileExtensions() {
        this._http.get(this._requestFiltering.getValue()._links.file_extensions.href.replace("/api", "") + "&fields=*")
            .then(result => {
                this._fileExtensions.next(result.file_extensions);
            });
    }

    //
    //

    private load(id: string) {
        return this._http.get(RequestFilteringService.URL + id)
            .then(feature => {
                this._status = Status.Started;
                this._requestFiltering.next(feature);
                this.loadFileExtensions();
                this.loadFilteringRules();
            })
            .catch(e => {
                this.error = e;

                if (e.type && e.type == ApiErrorType.FeatureNotInstalled) {
                    this._status = Status.Stopped;
                }
            });
    }
}
