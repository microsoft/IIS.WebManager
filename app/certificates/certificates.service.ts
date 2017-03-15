/// <reference path="../../node_modules/@angular/core/src/core.d.ts" />
/// <reference path="../../node_modules/@angular/http/src/http.d.ts" />

import {Injectable} from '@angular/core';
import {Response} from '@angular/http';

// 
// Don't import rxjs/Rx. Loading is too slow!
// Import only needed operators
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';


import {HttpClient} from '../common/httpclient';

import {Certificate} from './certificate'


@Injectable()
export class CertificatesService {
    constructor(private _http: HttpClient) {
    }

    getAll(): Promise<Array<Certificate>> {
        return this._http.get("/certificates")
            .then(res => {
                return res.certificates
            });
    }

    get(id: string): Promise<Certificate> {
        return this._http.get("/certificates/" + id);
    }


    private onError(error: Response) {
        console.error(error);
    }
}