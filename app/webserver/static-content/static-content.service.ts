import {Injectable} from '@angular/core';
import {Response} from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';


import {HttpClient} from '../../common/httpclient';
import {StaticContent, ClientCache, MimeMap} from './static-content';



@Injectable()
export class StaticContentService {
    constructor(private _http: HttpClient) {
    }

    get(id: string): Promise<any> {
        return this.getFeature(id).then(feature => {
            return this.getMaps(feature).then(maps => {
                return {
                    feature: feature,
                    mimeMaps: maps
                };
            });
        });

    }

    updateMap(map: MimeMap, data: MimeMap) {
        return this._http.patch(map._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(map => {
                return map;
            });
    }

    updateFeature(feature: StaticContent, data: StaticContent) {
        return this._http.patch(feature._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(feature => {
                return feature;
            });
    }

    addMap(feature: StaticContent, map: MimeMap) {
        return this._http.post(feature._links.mime_maps.href.replace("/api", ""), JSON.stringify(map))
            .then(map => {
                return map;
            });
    }

    deleteMap(map: MimeMap): Promise<any> {
        return this._http.delete(map._links.self.href.replace("/api", ""));
    }

    revert(id: string) {
        return this._http.delete("/webserver/static-content/" + id);
    }

    private getFeature(id: string): Promise<StaticContent> {
        return this._http.get("/webserver/static-content/" + id)
            .then(feature => {
                return feature;
            });
    }

    private getMaps(feature: StaticContent): Promise<Array<MimeMap>> {
        return this._http.get(feature._links.mime_maps.href.replace("/api", "") + "&fields=*")
            .then(mapsArr => {
                return mapsArr.mime_maps;
            });
    }

    private onError(error: Response) {
        console.error(error);
    }

}
