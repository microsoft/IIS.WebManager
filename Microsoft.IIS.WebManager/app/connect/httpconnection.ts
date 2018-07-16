
import {Http, Headers, Response, Request, RequestOptions, RequestOptionsArgs, RequestMethod} from '@angular/http';
import {ApiConnection} from './api-connection';
import {Observable} from 'rxjs/Observable';


export class HttpConnection {
    constructor(private _http: Http) {
        //
        // Support withCredentials
        //
        // TODO: Use official Angular2 CORS support when merged (https://github.com/angular/angular/issues/4231).
        let _build = (<any>_http)._backend._browserXHR.build;
        (<any>_http)._backend._browserXHR.build = () => {
            let _xhr = _build();

            _xhr.withCredentials = true;

            return _xhr;
        };
    }

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
