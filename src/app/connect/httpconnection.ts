
import {Headers, Response, Request, RequestOptions, RequestOptionsArgs, RequestMethod} from '@angular/http';
import {ApiConnection} from './api-connection';
import {Observable} from 'rxjs';
import { HttpFacade } from 'common/http-facade';
import { Inject, Injectable } from '@angular/core';

@Injectable()
export class HttpConnection {
    constructor(@Inject("Http") private _http: HttpFacade) {}

    public get(conn: ApiConnection, path: string): Observable<Response> {

        if (path.indexOf("/") != 0) {
            path = '/' + path;
        }

        let opts: RequestOptionsArgs = {
            method: RequestMethod.Get,
            url: conn.url + path,
            headers: new Headers(),
            search: undefined,
            body: undefined
        };

        opts.headers.set("Accept", "application/hal+json");
        opts.headers.set('Access-Token', 'Bearer ' + conn.accessToken);

        return this._http.request(new Request(new RequestOptions(opts)));
    }

    public options(conn: ApiConnection, path: string): Observable<Response> {

        if (path.indexOf("/") != 0) {
            path = '/' + path;
        }

        let opts: RequestOptionsArgs = {
            method: RequestMethod.Options,
            url: conn.url + path,
            headers: new Headers(),
            search: undefined,
            body: undefined
        };

        return this._http.request(new Request(new RequestOptions(opts)));
    }

    public raw(conn: ApiConnection, path?: string): Observable<Response> {

        if (path && path.indexOf("/") != 0) {
            path = '/' + path;
        }

        let opts: RequestOptionsArgs = {
            method: RequestMethod.Get,
            url: conn.url + path,
            headers: new Headers(),
            search: undefined,
            body: undefined
        };

        return this._http.request(new Request(new RequestOptions(opts)));
    }
}
