
import {Inject, Injectable} from '@angular/core';
import {Headers, Request, RequestOptions, RequestOptionsArgs, RequestMethod, Response} from '@angular/http';

import {NotificationService} from '../notification/notification.service';
import {ApiConnection} from '../connect/api-connection'
import {ApiError, ApiErrorType} from '../error/api-error';
import {ConnectService} from '../connect/connect.service';
import {Runtime} from '../runtime/runtime';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { HttpFacade } from './http-facade';
import { Observable } from 'rxjs';

@Injectable()
export class HttpClient {
    private _headers: Headers= new Headers();
    private _conn: ApiConnection;
    private _transientObserver: Observable<ApiConnection>

    constructor(@Inject("Http") private _http: HttpFacade,
                private _notificationService: NotificationService,
                private _connectSvc: ConnectService,
                @Inject("Runtime") private runtime: Runtime)
    {
        this._connectSvc.active.subscribe(c => {
            if (c) {
                this._conn = c
                this._transientObserver = null
            }})
    }

    private get headers(): Headers {
        let headers = new Headers();

        for (var key of this._headers.keys()) {
            headers.append(key, this._headers.get(key));
        }
        return headers
    }

    public setHeader(key: string, value: string) {
        this._headers.set(key, value);
    }

    public get(url: string, options?: RequestOptionsArgs, warn: boolean = true): Promise<any> {
        let ops: RequestOptionsArgs = this.getOptions(RequestMethod.Get, url, options);
        return this.request(url, ops, warn)
            .then(res => res.status !== 204 ? res.json() : null);
    }

    public head(url: string, options?: RequestOptionsArgs, warn: boolean = true): Promise<any> {
        let ops: RequestOptionsArgs = this.getOptions(RequestMethod.Head, url, options);
        return this.request(url, ops, warn);
    }

    public post(url: string, body: string, options?: RequestOptionsArgs, warn: boolean = true): Promise<any> {
        options = this.setJsonContentType(options);
        let ops: RequestOptionsArgs = this.getOptions(RequestMethod.Post, url, options, body);
        return this.request(url, ops, warn)
            .then(res => res.status !== 204 ? res.json() : null);
    }

    public patch(url: string, body: string, options?: RequestOptionsArgs, warn: boolean = true): Promise<any> {
        options = this.setJsonContentType(options);
        let ops: RequestOptionsArgs = this.getOptions(RequestMethod.Patch, url, options, body);
        return this.request(url, ops, warn)
            .then(res => res.status !== 204 ? res.json() : null);
    }

    public delete(url: string, options?: RequestOptionsArgs, warn: boolean = true): Promise<any> {
        let ops: RequestOptionsArgs = this.getOptions(RequestMethod.Delete, url, options);
        return this.request(url, ops, warn);
    }

    public options(url: string): Promise<any> {
        let ops: RequestOptionsArgs = this.getOptions(RequestMethod.Options, url, null);
        return this.request(url, ops);
    }

    public endpoint(): ApiConnection {
        return this._conn;
    }

    private setJsonContentType(options?: RequestOptionsArgs) {
        if (!options) {
            options = {};
        }

        if (!options.headers) {
            options.headers = new Headers();
        }

        options.headers.set("Content-Type", "application/json");

        return options;
    }

    private performRequest(conn: ApiConnection, url: string, options?: RequestOptionsArgs, warn?: boolean): Observable<Response> {
        let reqOpt = new RequestOptions(options);

        if (url.toString().indexOf("/") != 0) {
            url = '/' + url;
        }

        reqOpt.url = conn.url + '/api' + url;
        let req = new Request(reqOpt);
        //
        // Set Access-Token
        req.headers.set('Access-Token', 'Bearer ' + conn.accessToken);
        return this._http.request(req)
            .catch((e, c) => {
                // Status code 0 possible causes:
                // Untrusted certificate
                // Windows auth, prevents CORS headers from being accessed
                // Service not responding
                if (e instanceof Response) {
                    if (e.status == 0) {
                        return this._http.request(req)
                            .catch((err, _) => {
                                // Check to see if connected
                                return this._http.options(this._conn.url)
                                    .catch((e, c2) => {
                                        this._connectSvc.reconnect();
                                        this.handleHttpError(err);
                                        return c2
                                    })
                                })
                    }
                    this.handleHttpError(e, warn);
                    return c;
                }
                let apiError = <ApiError>({
                    title: "unknown error",
                    detail: JSON.stringify(e),
                })
                console.log(`unknown error: ${JSON.stringify(apiError)}`)
                this._notificationService.apiError(apiError)
                return c
            })
    }

    public async request(url: string, options?: RequestOptionsArgs, warn?: boolean): Promise<Response> {
        return this.performRequestOnConnection(url, options, warn).toPromise()
    }

    private performRequestOnConnection(url: string, options?: RequestOptionsArgs, warn?: boolean): Observable<Response> {
        if (this._conn) {
            return this.performRequest(this._conn, url, options, warn)
        } else {
            if (!this._transientObserver) {
                this._transientObserver = this.runtime.ConnectToIISHost().catch(
                    (e, caught) => {
                        console.log(`encountered exception while connecting to host: ${JSON.stringify(e)}`)
                        this._transientObserver = null
                        return caught
                    }).shareReplay()
            }
            return this._transientObserver.mergeMap(c => this.performRequest(c, url, options, warn))
        }
    }

    private handleHttpError(err, warn?: boolean) {
        if (err.status == 403 && err.headers.get("WWW-Authenticate") === "Bearer") {
            this._connectSvc.reconnect();
            throw "not connected"
        }
        let apiError = this.apiErrorFromHttp(err);
        if (apiError && warn) {
            this._notificationService.apiError(apiError);
        }
        throw apiError;
    }

    public getOptions(method: RequestMethod, url: string, options: RequestOptionsArgs, body?: string): RequestOptionsArgs {
        let aBody = body ? body : options && options.body ? options.body : undefined

        let opts: RequestOptionsArgs = {
            method: method,
            url: url,
            headers: options && options.headers ? options.headers : this.headers,
            search: options && options.search ? options.search : undefined,
            body: aBody
        };        
        opts.headers.set("Accept", "application/hal+json");

        return opts;
    }

    private apiErrorFromHttp(httpError): ApiError {
        let msg = "";
        let apiError: ApiError = null;
        if ((httpError)._body) {
            try {
                apiError = JSON.parse(httpError._body);
            }
            catch (parseError) {
            }
        }
        if (apiError == null) {
            apiError = new ApiError();
            apiError.status = httpError.status;
        }
        if (httpError.status === 400) {
            if (apiError && apiError.title == "Invalid parameter") {
                var parameterName = this.parseParameterName(apiError.name);
                msg = "An invalid value was given for " + parameterName + ".";
                if (apiError.detail) {
                    msg += "\n" + apiError.detail;
                }
            }
        }
        if (httpError.status == 403) {
            // TODO: Invalid token
            if (apiError && apiError.title == "Object is locked") {
                apiError.type = ApiErrorType.SectionLocked;
                msg = "The feature's settings could not be loaded. This happens when the feature is locked at the current configuration level and the feature's settings have been modified. To fix this, manually remove any local changes to the feature or unlock the feature at the parent level.";
            }

            if (apiError && apiError.title == "Forbidden" && apiError.name) {
                if (apiError[apiError.name]) {
                    msg = "Forbidden: '" + apiError[apiError.name] + "'";
                }
                else {
                    msg = "Forbidden: '" + apiError.name + "'";
                }

                if (apiError.detail) {
                    msg += "\n" + apiError.detail;
                }
            }
        }
        if (httpError.status == 404) {
            if (apiError && apiError.detail === "IIS feature not installed") {
                apiError.type = ApiErrorType.FeatureNotInstalled;
                msg = apiError.detail + "\n" + apiError.name;
            }
            else {
                msg = "The resource could not be found";
                apiError.type = ApiErrorType.NotFound;
            }
        }
        if (httpError.status == 500) {
            // TODO: Invalid token
            if (apiError.detail == "Dism Error") {
                msg = "An error occured enabling " + apiError.feature;
                if (apiError.exit_code == 'B7') {
                    msg += "\nThe specified image is currently being serviced by another DISM operation"
                }
                msg += "\nError code: " + apiError.exit_code;
            }

            else {
                msg = apiError.detail || "";
            }
        }
        apiError.message = msg;
        return apiError;
    }

    private parseParameterName(pName: string) {
        if (!pName) {
            return "";
        }
        while (pName.indexOf(".") != -1) {
            pName = pName.substr(pName.indexOf(".") + 1);
        }
        var parts = pName.split('_');
        for (var i = 0; i < parts.length; i++) {
            parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
        }
        return parts.join(" ");
    }
}
