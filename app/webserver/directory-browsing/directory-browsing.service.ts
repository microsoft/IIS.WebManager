import {Injectable} from '@angular/core';
import {Response} from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

import {HttpClient} from '../../common/httpclient';

@Injectable()
export class DirectoryBrowsingService {
    private static URL: string = "/webserver/directory-browsing/"

    constructor(private _http: HttpClient) {
    }

    get(id: string): Promise<any> {

        return this._http.get(DirectoryBrowsingService.URL + id)
            .then(feature => {
                return feature;
            });
    }

    update(id: string, data: any) {
        return this._http.patch(DirectoryBrowsingService.URL + id, JSON.stringify(data))
            .then(feature => {
                return feature;
            });
    }

    revert(id: string) {
        return this._http.delete(DirectoryBrowsingService.URL + id);
    }

    private onError(error: Response) {
        console.error(error);
    }

}