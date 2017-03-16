import {Injectable} from '@angular/core';
import {Response} from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

import {HttpClient} from '../../common/httpclient';
import {ApiError} from '../../error/api-error';
import {DiffUtil} from '../../utils/diff';
import {RequestFilteringSettings, RequestFilteringChildType} from './request-filtering';

@Injectable()
export class RequestFilteringService {
    constructor(private _http: HttpClient) {
    }

    get(id: string): Promise<RequestFilteringSettings> {

        return this._http.get("/webserver/http-request-filtering/" + id)
            .then(feature => {

                let settings: RequestFilteringSettings = {
                    feature: feature,
                    fileExtensions: null,
                    fileExtensionsError: null,
                    headerLimits: null,
                    headerLimitsError: null,
                    hiddenSegments: null,
                    hiddenSegmentsError: null,
                    queryStrings: null,
                    queryStringsError: null,
                    rules: null,
                    rulesError: null,
                    urls: null,
                    urlsError: null
                };

                var promises = [];

                promises.push(this.getRequestFiltering(feature._links.file_extensions.href.replace("/api", "") + "&fields=*")
                    .then(result => {
                        settings.fileExtensions = result.file_extensions;
                        return settings.fileExtensions;
                    })
                    .catch(e => {
                        settings.fileExtensionsError = this.getError(e, "File Extensions");
                        return settings.fileExtensionsError;
                    })
                );

                promises.push(this.getRequestFiltering(feature._links.header_limits.href.replace("/api", "") + "&fields=*")
                    .then(result => {
                        settings.headerLimits = result.header_limits;
                        return settings.headerLimits;
                    })
                    .catch(e => {
                        settings.headerLimitsError = this.getError(e, "Header Limits");
                        return settings.headerLimitsError;
                    })
                );

                promises.push(this.getRequestFiltering(feature._links.hidden_segments.href.replace("/api", "") + "&fields=*")
                    .then(result => {
                        settings.hiddenSegments = result.hidden_segments;
                        return settings.hiddenSegments;
                    })
                    .catch(e => {
                        settings.hiddenSegmentsError = this.getError(e, "Hidden Segments");
                        return settings.hiddenSegmentsError;
                    })
                );

                promises.push(this.getRequestFiltering(feature._links.query_strings.href.replace("/api", "") + "&fields=*")
                    .then(result => {
                        settings.queryStrings = result.query_strings;
                        return settings.queryStrings;
                    })
                    .catch(e => {
                        settings.queryStringsError = this.getError(e, "Query Strings");
                        return settings.queryStringsError;
                    })
                );

                promises.push(this.getRequestFiltering(feature._links.rules.href.replace("/api", "") + "&fields=*")
                    .then(result => {
                        settings.rules = result.rules;
                        return settings.rules;
                    })
                    .catch(e => {
                        settings.rulesError = this.getError(e, "Rules");
                        return settings.rulesError;
                    })
                );

                promises.push(this.getRequestFiltering(feature._links.urls.href.replace("/api", "") + "&fields=*")
                    .then(result => {
                        settings.urls = result.urls;
                        return settings.urls;
                    })
                    .catch(e => {
                        settings.urlsError = this.getError(e, "Urls");
                        return settings.urlsError;
                    })
                );

                return Promise.all(promises)
                    .then(proms => {
                        return settings;
                    });
            });
    }

    update(id: string, data: any): Promise<any> {

        return this._http.patch("/webserver/http-request-filtering/" + id, JSON.stringify(data));
    }

    revert(id: string) {
        return this._http.delete("/webserver/http-request-filtering/" + id);
    }

    updateChild(child: any, data: any): Promise<any> {

        return this._http.patch(child._links.self.href.replace("/api", ""), JSON.stringify(data));
    }

    addChild(feature: any, childType: RequestFilteringChildType, data: any): Promise<any> {
        data.request_filtering = {
            id: feature.id
        };

        let childLink = this.linkNameFromChildType(childType);

        return this._http.post(feature._links[childLink].href.replace("/api", ""), JSON.stringify(data));
    }

    deleteChild(child: any): Promise<any> {

        return this._http.delete(child._links.self.href.replace("/api", ""));
    }

    private getRequestFiltering(url): Promise<any> {

        return this._http.get(url);
    }

    private getError(e, reqFiltType): ApiError {
        e.message = e.message || "There was an error retrieving the " + reqFiltType + " settings.";
        return e;
    }

    private linkNameFromChildType(childType: RequestFilteringChildType): string {
        switch (childType) {
            case RequestFilteringChildType.FILE_EXTENSIONS:
                return "file_extensions";
            case RequestFilteringChildType.URLS:
                return "urls";
            case RequestFilteringChildType.RULES:
                return "rules";
            case RequestFilteringChildType.HEADER_LIMITS:
                return "header_limits";
            case RequestFilteringChildType.QUERY_STRINGS:
                return "query_strings";
            case RequestFilteringChildType.HIDDEN_SEGMENTS:
                return "hidden_segments";
            default:
                return "";
        }
    }

}
