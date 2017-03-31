import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { HttpClient } from '../../common/httpclient';
import { ApiError, ApiErrorType } from '../../error/api-error';
import { StaticContent, ClientCache, MimeMap } from './static-content';

@Injectable()
export class StaticContentService {
    public error: ApiError;

    private static URL = "/webserver/static-content/";
    private _webserverScope: boolean;
    private _status: Status = Status.Unknown;
    private _mimeMaps: BehaviorSubject<Array<MimeMap>> = new BehaviorSubject<Array<MimeMap>>([]);
    private _staticContent: BehaviorSubject<StaticContent> = new BehaviorSubject<StaticContent>(null);

    constructor(private _http: HttpClient, route: ActivatedRoute) {
        this._webserverScope = route.snapshot.parent.url[0].path.toLocaleLowerCase() == 'webserver';
    }

    public get status(): Status {
        return this._status;
    }

    public get webserverScope(): boolean {
        return this._webserverScope;
    }

    public get mimeMaps(): Observable<Array<MimeMap>> {
        return this._mimeMaps.asObservable();
    }

    public get staticContent(): Observable<StaticContent> {
        return this._staticContent.asObservable();
    }

    public initialize(id: string) {
        this.load(id).then(() => this.loadMaps());
    }

    //
    // Static Content

    public update(data: StaticContent) {
        let id = this._staticContent.getValue().id;
        return this._http.patch(this._staticContent.getValue()._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(feature => {
                let staticContent = this._staticContent.getValue();
                DiffUtil.set(staticContent, feature);
                this._staticContent.next(staticContent);
            });
    }

    public revert() {
        let id = this._staticContent.getValue().id;
        return this._http.delete(StaticContentService.URL + id)
            .then(() => this.initialize(id));
    }

    private load(id: string): Promise<StaticContent> {
        return this._http.get(StaticContentService.URL + id)
            .then(feature => {
                this._status = Status.Started;
                this._staticContent.next(feature);
                return feature;
            })
            .catch(e => {
                this.error = e;

                if (e.type && e.type == ApiErrorType.FeatureNotInstalled) {
                    this._status = Status.Stopped;
                }

                throw e;
            });
    }

    public install(): Promise<any> {
        this._status = Status.Starting;
        return this._http.post(StaticContentService.URL, "")
            .then(doc => {
                this._status = Status.Started;
                this._staticContent.next(doc);
            })
            .catch(e => {
                this.error = e;
                throw e;
            });
    }

    public uninstall(): Promise<any> {
        this._status = Status.Stopping;
        let id = this._staticContent.getValue().id;
        this._staticContent.next(null);
        return this._http.delete(StaticContentService.URL + id)
            .then(() => {
                this._status = Status.Stopped;
            })
            .catch(e => {
                this.error = e;
                throw e;
            });
    }

    //
    // Mime Maps

    public addMap(map: MimeMap) {
        map.static_content = this._staticContent.getValue();

        return this._http.post(this._staticContent.getValue()._links.mime_maps.href.replace("/api", ""), JSON.stringify(map))
            .then(map => {
                this._mimeMaps.getValue().unshift(map);
                this._mimeMaps.next(this._mimeMaps.getValue());
            });
    }

    public updateMap(map: MimeMap, data: any): Promise<MimeMap> {
        return this._http.patch(map._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(m => {
                DiffUtil.set(map, m);
                return map;
            });
    }

    public deleteMap(map: MimeMap): Promise<any> {
        return this._http.delete(map._links.self.href.replace("/api", ""))
            .then(() => {
                let maps = this._mimeMaps.getValue().filter(m => m !== map);
                this._mimeMaps.next(maps);
            });;
    }

    private loadMaps(): Promise<Array<MimeMap>> {
        return this._http.get(this._staticContent.getValue()._links.mime_maps.href.replace("/api", "") + "&fields=*")
            .then(obj => {
                let maps = obj.mime_maps
                this._mimeMaps.next(maps);
                return maps;
            });
    }

    //
    //
}
