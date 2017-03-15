import {Injectable} from '@angular/core';
import {Response} from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

import {HttpClient} from '../../common/httpclient';
import {ResponseCompression} from './compression'


@Injectable()
export class CompressionService {
    constructor(private _http: HttpClient) {
    }

    get(id: string): Promise<ResponseCompression> {
        return this._http.get("/webserver/http-response-compression/" + id);
    }

    update(compression: ResponseCompression, data: any): Promise<ResponseCompression> {
        return this._http.patch("/webserver/http-response-compression/" + compression.id, JSON.stringify(data));
    }

    revert(id: string): Promise<any> {
        return this._http.delete("/webserver/http-response-compression/" + id);
    }
}