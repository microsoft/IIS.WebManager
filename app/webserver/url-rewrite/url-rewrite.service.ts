import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { NotificationService } from '../../notification/notification.service';
import { ApiError, ApiErrorType } from '../../error/api-error';
import { HttpClient } from '../../common/httpclient';
import { UrlRewrite, InboundSection, InboundRule, Action, Condition, ActionType, MatchType, ConditionMatchConstraints, RedirectType } from './url-rewrite';

@Injectable()
export class UrlRewriteService {
    public error: ApiError;
    public inboundError: ApiError;

    private static URL = "/webserver/url-rewrite/";
    private _urlRewrite: BehaviorSubject<UrlRewrite> = new BehaviorSubject<UrlRewrite>(null);
    private _inboundSettings: BehaviorSubject<InboundSection> = new BehaviorSubject<InboundSection>(null);
    private _inboundRules: BehaviorSubject<Array<InboundRule>> = new BehaviorSubject<Array<InboundRule>>([]);

    constructor(private _http: HttpClient, private _notificationService: NotificationService) {
        this.setupMock();
    }

    public get urlRewrite(): Observable<UrlRewrite> {
        return this._urlRewrite.asObservable();
    }

    public get inboundSettings(): Observable<InboundSection> {
        return this._inboundSettings.asObservable();
    }

    public get inboundRules(): Observable<Array<InboundRule>> {
        return this._inboundRules.asObservable();
    }

    public revert() {
        throw "Not implemented";
    }

    public initialize(id: string) {
        this.load(id).then(feature => {

            //
            // Inbound rules
            this.loadInboundSettings().then(set => this.loadInboundRules());

            //
            // Outbound rules

            //
            // Rewrite Maps

            //
            // Providers

            //
            // Allowed server variables
        });
    }

    private get(id: string) {

    }

    private load(id: string): Promise<UrlRewrite> {
        return this._http.get(UrlRewriteService.URL + id)
            .then(feature => {
                this._urlRewrite.next(feature);
                return feature;
            })
            .catch(e => {
                this.error = e;

                if (e.type && e.type == ApiErrorType.FeatureNotInstalled) {
                    // Not installed
                }

                throw e;
            });
    }

    //
    // Inbound
    private loadInboundSettings(): Promise<InboundSection> {

        let feature = this._urlRewrite.getValue();
        let inboundLink: string = feature._links.inbound.href;

        return this._http.get(inboundLink.replace('/api', ''))
            .then(settings => {
                this._inboundSettings.next(settings);
                return settings;
            })
            .catch(e => {
                this.inboundError = e;
                throw e;
            });;
    }

    private loadInboundRules(): Promise<Array<InboundRule>> {

        let settings = this._inboundSettings.getValue();
        let rulesLink: string = settings._links.rules.href;

        return this._http.get(rulesLink.replace('/api', '') + "&fields=*")
            .then(rulesObj => {
                let rules = rulesObj.rules;

                this._inboundRules.next(rules);
                this.setupMock();
                return rules;
            });
    }

    public saveInbound(settings: InboundSection): Promise<InboundSection> {
        return this._http.patch(settings._links.self.href.replace('/api', ''), JSON.stringify(settings))
            .then((s: InboundSection) => {
                Object.assign(settings, s);
                this.loadInboundRules();
                return settings;
            });
    }

    public addInboundRule(rule: InboundRule): Promise<InboundRule> {

        let settings = this._inboundSettings.getValue();
        let rulesLink: string = settings._links.rules.href;
        rule.url_rewrite = this._urlRewrite.getValue();

        return this._http.post(rulesLink.replace('/api', ''), JSON.stringify(rule))
            .then((newRule: InboundRule) => {
                let rules = this._inboundRules.getValue();
                rules.push(newRule);
                this._inboundRules.next(rules);
                return newRule;
            })
            .catch((e: ApiError) => {

                //
                // Caused by adding unallowed server variables
                if (e.type == ApiErrorType.SectionLocked && e.name == "system.webServer/rewrite/allowedServerVariables") {
                    this._notificationService.warn("The specified server variables could not be added");
                }

                throw e;
            });
    }

    public saveInboundRule(rule: InboundRule): Promise<InboundRule> {
        return this._http.patch(rule._links.self.href.replace('/api', ''), JSON.stringify(rule))
            .then((r: InboundRule) => {
                Object.assign(rule, r);
                return rule;
            })
            .catch((e: ApiError) => {

                //
                // Caused by adding unallowed server variables
                if (e.type == ApiErrorType.SectionLocked && e.name == "system.webServer/rewrite/allowedServerVariables") {
                    this._notificationService.warn("The specified server variables could not be added");
                }

                throw e;
            });
    }

    public deleteInboundRule(rule: InboundRule): void {
        this._http.delete(rule._links.self.href.replace('/api', ''))
            .then(() => {
                let rules = this._inboundRules.getValue();
                rules = rules.filter(r => r != rule);
                this._inboundRules.next(rules);
            });
    }

    public copyInboundRule(rule: InboundRule): Promise<InboundRule> {
        let copy: InboundRule = JSON.parse(JSON.stringify(rule));

        let i = 2;
        copy.name = rule.name + " - Copy";
        while (this._inboundRules.getValue().find(r => r.name.toLocaleLowerCase() == copy.name.toLocaleLowerCase()) != null) {
            copy.name = rule.name + " - Copy (" + (i++) + ")";
        }

        return this.addInboundRule(copy);
    }

    private setupMock() {

        //
        // Mock Inbound Rule
        let rule = new InboundRule();
        rule.action = new Action();
        rule.name = "Upgrade to https";
        rule.pattern = "(.*)";
        rule.condition_match_constraints = ConditionMatchConstraints.MatchAll;
        rule.stop_processing = true;

        //
        // condition
        rule.conditions = [];
        let condition = new Condition();
        condition.input = "{HTTPS}";
        condition.pattern = "off";
        condition.negate = false;
        condition.ignore_case = true;
        condition.match_type = MatchType.Pattern;
        rule.conditions.push(condition);

        //
        // action
        rule.action.url = "https://{HTTP_HOST}/{R:1}";
        rule.action.type = ActionType.Redirect;
        rule.action.redirect_type = RedirectType.Permanent;
        rule.action.append_query_string = true;

        this._inboundRules.getValue().push(rule);
        this._inboundRules.next(this._inboundRules.getValue());
    }
}
