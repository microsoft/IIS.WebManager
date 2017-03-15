import {Injectable} from '@angular/core';
import {Response} from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';


import {HttpClient} from '../../common/httpclient';
import {IpRestrictions, RestrictionRule} from './ip-restrictions';



@Injectable()
export class IpRestrictionsService {

    private static IP_RESTRICTIONS_URL = "/webserver/ip-restrictions/";

    constructor(private _http: HttpClient) {
    }

    get(id: string): Promise<any> {
        return this.getFeature(id).then(feature => {
            return this.getRules(feature).then(rules => {
                return {
                    feature: feature,
                    rules: rules
                };
            });
        });

    }

    patchRule(rule: RestrictionRule, data: RestrictionRule) {
        return this._http.patch(rule._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(rule => {
                return rule;
            });
    }

    patchFeature(feature: IpRestrictions, data: IpRestrictions) {
        return this._http.patch(feature._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(feature => {
                return feature;
            });
    }

    addRule(feature: IpRestrictions, rule: RestrictionRule) {
        return this._http.post(feature._links.entries.href.replace("/api", ""), JSON.stringify(rule))
            .then(rule => {
                return rule;
            });
    }

    deleteRule(rule: RestrictionRule): Promise<any> {
        return this._http.delete(rule._links.self.href.replace("/api", ""));
    }

    revert(id: string) {
        return this._http.delete(IpRestrictionsService.IP_RESTRICTIONS_URL + id);
    }

    private getFeature(id: string): Promise<IpRestrictions> {
        return this._http.get(IpRestrictionsService.IP_RESTRICTIONS_URL + id)
            .then(feature => {
                return feature;
            });
    }

    private getRules(feature: IpRestrictions): Promise<Array<RestrictionRule>> {
        return this._http.get(feature._links.entries.href.replace("/api", "") + "&fields=*")
            .then(rulesArr => {
                return rulesArr.entries;
            });
    }

    private onError(error: Response) {
        console.error(error);
    }

}