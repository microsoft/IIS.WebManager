import { HttpFacade } from "./http-facade";
import { Injectable } from "@angular/core";
import { Http, Request, Response } from "@angular/http"
import { Observable } from "rxjs/Observable";

@Injectable()
export class HttpImpl implements HttpFacade {
    // TODO: how http is constructed
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

    public request(req: Request): Observable<Response> {
        return this._http.request(req)
    }

    public options(req: string): Observable<Response> {
        return this._http.options(req)
    }
}
