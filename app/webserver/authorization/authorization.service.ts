import {Injectable} from '@angular/core';
import {Response} from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import {HttpClient} from '../../common/httpclient';
import {Authorization, AuthRule} from './authorization'

@Injectable()
export class AuthorizationService {
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

    updateFeature(feature: any, data: any) {

        return this._http.patch(feature._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(feature => {
                return feature;
            });
    }

    revertFeature(feature: any): Promise<any> {
        return this._http.delete(feature._links.self.href.replace("/api", ""));
    }

    updateRule(rule: any, data: any) {

        return this._http.patch(rule._links.self.href.replace("/api", ""), JSON.stringify(data))
            .then(rule => {
                return rule;
            });
    }
    
    addRule(feature: any, rule: any) {
        rule.authorization = feature;
        return this._http.post(feature._links.rules.href.replace("/api", ""), JSON.stringify(rule))
    }

    removeRule(rule: any): Promise<any> {
        return this._http.delete(rule._links.self.href.replace("/api", ""))
    }

    private getFeature(id: string): Promise<Authorization> {

        return this._http.get("/webserver/authorization/" + id)
            .then(feature => {
                return feature;
            });
    }

    private getRules(feature: any): Promise<Array<AuthRule>> {

        return this._http.get(feature._links.rules.href.replace("/api", ""))
            .then(rulesArr => {
                return rulesArr.rules;
            });
    }
}