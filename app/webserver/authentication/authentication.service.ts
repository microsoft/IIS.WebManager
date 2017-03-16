import {Injectable} from '@angular/core';
import {Response} from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

import {HttpClient} from '../../common/httpclient';
import {DiffUtil} from '../../utils/diff';

@Injectable()
export class AuthenticationService {
    constructor(private _http: HttpClient) {
    }

    get(id: string): Promise<any> {

        return this._http.get("/webserver/authentication/" + id)
            .then(feature => {

                var settings: any = {
                    anonymous: null,
                    basic: null,
                    digest: null,
                    windows: null
                };

                var promises = [];

                promises.push(this.getAuthentication(feature._links.anonymous.href.replace("/api", ""))
                    .then(anonymous => {
                        settings.anonymous = anonymous;
                        return anonymous;
                    })
                    .catch(e => {
                        settings.anonymousError = this.getError(e, "anonymous");
                        return settings.anonymousError;
                    })
                );

                promises.push(this.getAuthentication(feature._links.basic.href.replace("/api", ""))
                    .then(basic => {
                        settings.basic = basic;
                        return basic;
                    })
                    .catch(e => {
                        settings.basicError = this.getError(e, "basic");
                        return settings.basicError;
                    })
                );

                promises.push(this.getAuthentication(feature._links.digest.href.replace("/api", ""))
                    .then(digest => {
                        settings.digest = digest;
                        return digest;
                    })
                    .catch(e => {
                        settings.digestError = this.getError(e, "digest");
                        return settings.digestError;
                    })
                );

                promises.push(this.getAuthentication(feature._links.windows.href.replace("/api", ""))
                    .then(windows => {
                        settings.windows = windows;
                        return windows;
                    })
                    .catch(e => {
                        settings.windowsError = this.getError(e, "windows");
                        return settings.windowsError;
                    })
                );

                return Promise.all(promises)
                    .then(proms => {
                        return settings;
                    });

            });
    }

    // All 4 authentication sub-modules share the same patch function, no type restriction
    patchFeature(feature: any, data: any) {        

        return this._http.patch(feature._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(feature => {
                return feature;
            });
    }

    public revert(feature: any) {
        return this._http.delete(feature._links.self.href.replace("/api", ""))
            .then(_ => {
                return this.getAuthentication(feature._links.self.href.replace("/api", ""))
            });
    }

    // All 4 authentication sub-modules share the same get function, no type restriction
    private getAuthentication(url): Promise<any> {

        return this._http.get(url)
            .then(feature => {
                return feature;
            });
    }

    private onError(error: Response) {
        console.error(error);
    }

    private getError(e, authType) {
        e.message = e.message || "There was an error retrieving the " + authType + " authentication settings.";
        return e;
    }

}
