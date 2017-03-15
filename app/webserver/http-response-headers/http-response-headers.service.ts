import {Injectable} from '@angular/core';
import {Response} from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';


import {HttpClient} from '../../common/httpclient';
import {HttpResponseHeaders, CustomHeader, RedirectHeader} from './http-response-headers';



@Injectable()
export class HttpResponseHeadersService {
    private static URL = "/webserver/http-response-headers/";

    constructor(private _http: HttpClient) {
    }

    get(id: string): Promise<any> {
        
        let settings: any = {
            anonymous: null,
            basic: null,
            digest: null,
            windows: null
        };

        return this.getFeature(id).then(feature => {
            return this.getCustomHeaders(feature).then(customHeaders => {
                return this.getRedirectHeaders(feature).then(redirectHeaders => {
                    return {
                        feature: feature,
                        customHeaders: customHeaders,
                        redirectHeaders: redirectHeaders
                    };
                });             
            });
        });
    }

    revert(id: any): Promise<any> {
        return this._http.delete(HttpResponseHeadersService.URL + id);
    }

    // Both header types share the same patch function, no type restriction
    patchHeader(header: any, data: any) {
        return this._http.patch(header._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(header => {
                return header;
            });
    }

    patchFeature(feature: HttpResponseHeaders, data: HttpResponseHeaders) {
        return this._http.patch(feature._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(feature => {
                return feature;
            });
    }

    addCustomHeader(feature: HttpResponseHeaders, header: CustomHeader) {
        return this._http.post(feature._links.custom_headers.href.replace("/api", ""), JSON.stringify(header))
            .then(header => {
                return header;
            });
    }

    addRedirectHeader(feature: HttpResponseHeaders, header: RedirectHeader) {
        return this._http.post(feature._links.redirect_headers.href.replace("/api", ""), JSON.stringify(header))
            .then(header => {
                return header;
            });
    }

    // Both header types share the same delete function, no type restriction
    deleteHeader(header: any): Promise<any> {
        return this._http.delete(header._links.self.href.replace("/api", ""));
    }

    private getFeature(id: string): Promise<HttpResponseHeaders> {
        return this._http.get(HttpResponseHeadersService.URL + id)
            .then(feature => {
                return feature;
            });
    }

    private getCustomHeaders(feature: HttpResponseHeaders): Promise<Array<CustomHeader>> {
        return this._http.get(feature._links.custom_headers.href.replace("/api", ""))
            .then(headers => {
                return headers.custom_headers;
            });
    }

    private getRedirectHeaders(feature: HttpResponseHeaders): Promise<Array<RedirectHeader>> {
        return this._http.get(feature._links.redirect_headers.href.replace("/api", ""))
            .then(headers => {
                return headers.redirect_headers;
            });
    }

    private onError(error: Response) {
        console.error(error);
    }

}