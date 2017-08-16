import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { NotificationService } from '../../../notification/notification.service';
import { Status } from '../../../common/status';
import { ApiError, ApiErrorType } from '../../../error/api-error';
import { HttpClient } from '../../../common/httpclient';
import {
    UrlRewrite,
    GlobalSection,
    InboundSection,
    InboundRule,
    OutboundSection,
    OutboundRule,
    Action,
    Condition,
    ActionType,
    MatchType,
    ConditionMatchConstraints,
    RedirectType,
    AllowedServerVariablesSection,
    RewriteMapsSection,
    RewriteMap,
    Provider,
    ProvidersSection
} from '../url-rewrite';

import { GlobalService } from './global.service';
import { InboundService } from './inbound.service';

@Injectable()
export class UrlRewriteService {
    public error: ApiError;
    public outboundError: ApiError;
    public rewriteMapsError: ApiError;
    public providersError: ApiError;
    public serverVariablesError: ApiError;

    private static URL = "/webserver/url-rewrite/";
    private _webserverScope: boolean;
    private _status: Status = Status.Unknown;
    private _urlRewrite: BehaviorSubject<UrlRewrite> = new BehaviorSubject<UrlRewrite>(null);
    private _outboundSettings: BehaviorSubject<OutboundSection> = new BehaviorSubject<OutboundSection>(null);
    private _outboundRules: BehaviorSubject<Array<OutboundRule>> = new BehaviorSubject<Array<OutboundRule>>([]);
    private _rewriteMapSettings: BehaviorSubject<RewriteMapsSection> = new BehaviorSubject<RewriteMapsSection>(null);
    private _rewriteMaps: BehaviorSubject<Array<RewriteMap>> = new BehaviorSubject<Array<RewriteMap>>([]);
    private _providersSettings: BehaviorSubject<ProvidersSection> = new BehaviorSubject<ProvidersSection>(null);
    private _providers: BehaviorSubject<Array<Provider>> = new BehaviorSubject<Array<Provider>>([]);
    private _serverVariablesSettings: BehaviorSubject<AllowedServerVariablesSection> = new BehaviorSubject<AllowedServerVariablesSection>(null);
    private _inboundService: InboundService;
    private _globalService: GlobalService;

    constructor(private _http: HttpClient, private _notificationService: NotificationService, route: ActivatedRoute) {
        this._webserverScope = route.snapshot.parent.url[0].path.toLocaleLowerCase() == 'webserver';

        this._inboundService = new InboundService(this._http, this._notificationService);
        this._globalService = new GlobalService(this._http, this._notificationService);
    }

    public get inboundError(): ApiError {
        return this.inboundService.error;
    }

    public get globalError(): ApiError {
        return this.globalService.error;
    }

    public get status(): Status {
        return this._status;
    }

    public get webserverScope(): boolean {
        return this._webserverScope;
    }

    public get urlRewrite(): Observable<UrlRewrite> {
        return this._urlRewrite.asObservable();
    }

    public get inboundSettings(): Observable<InboundSection> {
        return this.webserverScope ?
            this.globalService.settings :
            this._inboundService.settings;
    }

    public get inboundRules(): Observable<Array<InboundRule>> {
        return this.webserverScope ?
            this.globalService.rules :
            this._inboundService.rules;
    }

    public get outboundSettings(): Observable<OutboundSection> {
        return this._outboundSettings.asObservable();
    }

    public get outboundRules(): Observable<Array<OutboundRule>> {
        return this._outboundRules.asObservable();
    }

    public get rewriteMapSettings(): Observable<RewriteMapsSection> {
        return this._rewriteMapSettings.asObservable();
    }

    public get rewriteMaps(): Observable<Array<RewriteMap>> {
        return this._rewriteMaps.asObservable();
    }

    public get providersSettings(): Observable<ProvidersSection> {
        return this._providersSettings.asObservable();
    }

    public get providers(): Observable<Array<Provider>> {
        return this._providers.asObservable();
    }

    public get serverVariablesSettings(): Observable<AllowedServerVariablesSection> {
        return this._serverVariablesSettings.asObservable();
    }

    public get inboundService(): InboundService {
        return this._inboundService;
    }

    public get globalService(): GlobalService {
        return this._globalService;
    }

    public revertInbound(): void {
        this.webserverScope ?
            this.globalService.revert() :
            this._inboundService.revert();
    }

    public revertOutbound(): void {
        this._http.delete(this._outboundSettings.getValue()._links.self.href.replace("/api", ""))
            .then(_ => {
                this.loadOutboundSettings().then(set => this.loadOutboundRules());
            });
    }

    public revertServerVariables(): void {
        this._http.delete(this._serverVariablesSettings.getValue()._links.self.href.replace("/api", ""))
            .then(_ => {
                this.loadServerVariableSettings();
            });
    }

    public revertRewriteMaps(): void {
        this._http.delete(this._rewriteMapSettings.getValue()._links.self.href.replace("/api", ""))
            .then(_ => {
                this.loadRewriteMapSection().then(set => this.loadRewriteMaps());
            });
    }

    public revertProviders(): void {
        this._http.delete(this._providersSettings.getValue()._links.self.href.replace("/api", ""))
            .then(_ => {
                this.loadProvidersSettings().then(set => this.loadProviders());
            });
    }

    public install(): Promise<any> {
        this._status = Status.Starting;
        return this._http.post(UrlRewriteService.URL, "")
            .then((feature: UrlRewrite) => {
                this._status = Status.Started;
                this.initialize(feature.id);
            })
            .catch(e => {
                this.error = e;
                throw e;
            });
    }

    public uninstall(): Promise<any> {
        this._status = Status.Stopping;
        let id = this._urlRewrite.getValue().id;
        this._urlRewrite.next(null);
        return this._http.delete(UrlRewriteService.URL + id)
            .then(() => {
                this._status = Status.Stopped;
            })
            .catch(e => {
                this.error = e;
                throw e;
            });
    }

    public initialize(id: string) {
        this.load(id).then(feature => {

            //
            // Inbound rules
            if (!feature.scope) {
                //
                // Global rules exposed at webserver
                this.globalService.initialize(feature);
            }
            else {
                this.inboundService.initialize(feature);
            }

            //
            // Outbound rules
            this.loadOutboundSettings().then(set => this.loadOutboundRules());

            //
            // Rewrite Maps
            this.loadRewriteMapSection().then(set => this.loadRewriteMaps());

            //
            // Providers
            this.loadProvidersSettings().then(set => this.loadProviders());

            //
            // Allowed server variables
            this.loadServerVariableSettings();
        });
    }

    private load(id: string): Promise<UrlRewrite> {
        return this._http.get(UrlRewriteService.URL + id)
            .then(feature => {
                this._status = Status.Started;
                this._urlRewrite.next(feature);
                return feature;
            })
            .catch(e => {
                this.error = e;

                if (e.type && e.type == ApiErrorType.FeatureNotInstalled) {
                    this._status = Status.Stopped;
                    return;
                }

                throw e;
            });
    }

    //
    // Inbound
    public saveInbound(settings: InboundSection): Promise<InboundSection> {
        return this.webserverScope ?
            this.globalService.saveSettings(settings) :
            this.inboundService.saveSettings(settings);
    }

    public addInboundRule(rule: InboundRule): Promise<InboundRule> {
        return this.webserverScope ?
            this.globalService.addRule(rule) :
            this.inboundService.addRule(rule);
    }

    public saveInboundRule(rule: InboundRule): Promise<InboundRule> {
        return this.webserverScope ?
            this.globalService.saveRule(rule) :
            this.inboundService.saveRule(rule);
    }

    public deleteInboundRule(rule: InboundRule): void {
        this.webserverScope ?
            this.globalService.deleteRule(rule) :
            this.inboundService.deleteRule(rule);
    }

    public copyInboundRule(rule: InboundRule): Promise<InboundRule> {
        return this.webserverScope ?
            this.globalService.copyRule(rule) :
            this.inboundService.copyRule(rule);
    }

    public moveInboundUp(rule: InboundRule) {
        this.webserverScope ?
            this.globalService.moveUp(rule) :
            this.inboundService.moveUp(rule);
    }

    public moveInboundDown(rule: InboundRule) {
        this.webserverScope ?
            this.globalService.moveDown(rule) :
            this.inboundService.moveDown(rule);
    }

    //
    // Outbound
    private loadOutboundSettings(): Promise<OutboundSection> {

        let feature = this._urlRewrite.getValue();
        let outboundLink: string = feature._links.outbound.href;

        return this._http.get(outboundLink.replace('/api', ''))
            .then((settings: OutboundSection) => {
                this._outboundSettings.next(settings);
                return settings;
            })
            .catch(e => {
                this.outboundError = e;
                throw e;
            });
    }

    private loadOutboundRules(): Promise<Array<OutboundRule>> {

        let settings = this._outboundSettings.getValue();
        let rulesLink: string = settings._links.rules.href;

        return this._http.get(rulesLink.replace('/api', '') + "&fields=*")
            .then(rulesObj => {
                let rules = rulesObj.rules;

                this._outboundRules.next(rules);
                return rules;
            });
    }

    public saveOutbound(settings: OutboundSection): Promise<OutboundSection> {
        return this._http.patch(settings._links.self.href.replace('/api', ''), JSON.stringify(settings))
            .then((s: OutboundSection) => {
                Object.assign(settings, s);
                this.loadOutboundRules();
                return settings;
            });
    }

    public addOutboundRule(rule: OutboundRule): Promise<OutboundRule> {

        let settings = this._outboundSettings.getValue();
        let rulesLink: string = settings._links.rules.href;
        rule.url_rewrite = this._urlRewrite.getValue();

        return this._http.post(rulesLink.replace('/api', ''), JSON.stringify(rule))
            .then((newRule: OutboundRule) => {
                let rules = this._outboundRules.getValue();
                rules.push(newRule);
                this._outboundRules.next(rules);
                return newRule;
            });
    }

    public saveOutboundRule(rule: OutboundRule): Promise<OutboundRule> {
        return this._http.patch(rule._links.self.href.replace('/api', ''), JSON.stringify(rule))
            .then((r: OutboundRule) => {
                Object.assign(rule, r);
                return rule;
            });
    }

    public deleteOutboundRule(rule: OutboundRule): void {
        this._http.delete(rule._links.self.href.replace('/api', ''))
            .then(() => {
                let rules = this._outboundRules.getValue();
                rules = rules.filter(r => r.id != rule.id);
                this._outboundRules.next(rules);
            });
    }

    public copyOutboundRule(rule: OutboundRule): Promise<OutboundRule> {
        let copy: OutboundRule = JSON.parse(JSON.stringify(rule));

        let i = 2;
        copy.name = rule.name + " - Copy";
        copy.priority = null;
        while (this._outboundRules.getValue().find(r => r.name.toLocaleLowerCase() == copy.name.toLocaleLowerCase()) != null) {
            copy.name = rule.name + " - Copy (" + (i++) + ")";
        }

        return this.addOutboundRule(copy);
    }

    public moveOutboundUp(rule: OutboundRule) {
        if (rule.priority == 0) {
            return;
        }

        let oldPriority = rule.priority;
        rule.priority = oldPriority - 1;

        this.saveOutboundRule(rule).then(r => {
            let rules = this._outboundRules.getValue();

            //
            // Move the rule in the client view of rules list
            rules.splice(oldPriority, 1);

            //
            // Update the index of the rule which got pushed down
            rules[rule.priority].priority++;
            rules.splice(rule.priority, 0, rule);
            this._outboundRules.next(rules);
        });
    }

    public moveOutboundDown(rule: OutboundRule) {
        let oldPriority = rule.priority;

        if (oldPriority + 1 == this._outboundRules.getValue().length) {
            return;
        }

        rule.priority = oldPriority + 1;

        this.saveOutboundRule(rule).then(r => {
            let rules = this._outboundRules.getValue();
            rules.splice(oldPriority, 1);
            rules[oldPriority].priority--;
            rules.splice(rule.priority, 0, rule);
            this._outboundRules.next(rules);
        });
    }

    //
    // Rewrite Maps
    private loadRewriteMapSection(): Promise<RewriteMapsSection> {

        let feature = this._urlRewrite.getValue();
        let rewriteMapLink: string = feature._links.rewrite_maps.href;

        return this._http.get(rewriteMapLink.replace('/api', ''))
            .then(settings => {
                this._rewriteMapSettings.next(settings);
                return settings;
            })
            .catch(e => {
                this.rewriteMapsError = e;
                throw e;
            });
    }

    private loadRewriteMaps(): Promise<Array<RewriteMap>> {

        let settings = this._rewriteMapSettings.getValue();
        let mapsLink: string = settings._links.entries.href;

        return this._http.get(mapsLink.replace('/api', '') + "&fields=*")
            .then(mapsObj => {
                let entries = mapsObj.entries;

                this._rewriteMaps.next(entries);
                return entries;
            });
    }

    public saveRewriteMapSettings(settings: RewriteMapsSection): Promise<RewriteMapsSection> {
        return this._http.patch(settings._links.self.href.replace('/api', ''), JSON.stringify(settings))
            .then((s: RewriteMapsSection) => {
                Object.assign(settings, s);
                this.loadRewriteMaps();
                return settings;
            });
    }

    public addRewriteMap(map: RewriteMap): Promise<RewriteMap> {

        let settings = this._rewriteMapSettings.getValue();
        let mapsLink: string = settings._links.entries.href;
        map.url_rewrite = this._urlRewrite.getValue();

        return this._http.post(mapsLink.replace('/api', ''), JSON.stringify(map))
            .then((newRule: RewriteMap) => {
                let maps = this._rewriteMaps.getValue();
                maps.push(newRule);
                this._rewriteMaps.next(maps);
                return newRule;
            });
    }

    public saveRewriteMap(map: RewriteMap): Promise<RewriteMap> {
        return this._http.patch(map._links.self.href.replace('/api', ''), JSON.stringify(map))
            .then((r: RewriteMap) => {
                Object.assign(map, r);
                return map;
            });
    }

    public deleteRewriteMap(map: RewriteMap): void {
        this._http.delete(map._links.self.href.replace('/api', ''))
            .then(() => {
                let maps = this._rewriteMaps.getValue();
                maps = maps.filter(r => r.id != map.id);
                this._rewriteMaps.next(maps);
            });
    }

    public copyRewriteMap(map: RewriteMap): Promise<RewriteMap> {
        let copy: RewriteMap = JSON.parse(JSON.stringify(map));

        let i = 2;
        copy.name = map.name + " - Copy";
        while (this._rewriteMaps.getValue().find(r => r.name.toLocaleLowerCase() == copy.name.toLocaleLowerCase()) != null) {
            copy.name = map.name + " - Copy (" + (i++) + ")";
        }

        return this.addRewriteMap(copy);
    }

    //
    // Providers
    private loadProvidersSettings(): Promise<ProvidersSection> {

        let feature = this._urlRewrite.getValue();
        let providersLink: string = feature._links.providers.href;

        return this._http.get(providersLink.replace('/api', ''))
            .then(settings => {
                this._providersSettings.next(settings);
                return settings;
            })
            .catch(e => {
                this.providersError = e;
                throw e;
            });
    }

    private loadProviders(): Promise<Array<Provider>> {

        let settings = this._providersSettings.getValue();
        let providersLink: string = settings._links.entries.href;

        return this._http.get(providersLink.replace('/api', '') + "&fields=*")
            .then(providersObj => {
                let providers = providersObj.entries;

                this._providers.next(providers);
                return providers;
            });
    }

    public saveProviders(settings: ProvidersSection): Promise<ProvidersSection> {
        return this._http.patch(settings._links.self.href.replace('/api', ''), JSON.stringify(settings))
            .then((s: ProvidersSection) => {
                Object.assign(settings, s);
                this.loadProviders();
                return settings;
            });
    }

    public addProvider(provider: Provider): Promise<Provider> {

        let settings = this._providersSettings.getValue();
        let providersLink: string = settings._links.entries.href;
        provider.url_rewrite = this._urlRewrite.getValue();

        return this._http.post(providersLink.replace('/api', ''), JSON.stringify(provider))
            .then((newProvider: Provider) => {
                let providers = this._providers.getValue();
                providers.push(newProvider);
                this._providers.next(providers);
                return newProvider;
            });
    }

    public saveProvider(provider: Provider): Promise<Provider> {
        return this._http.patch(provider._links.self.href.replace('/api', ''), JSON.stringify(provider))
            .then((r: Provider) => {
                Object.assign(provider, r);
                return provider;
            });
    }

    public deleteProvider(provider: Provider): void {
        this._http.delete(provider._links.self.href.replace('/api', ''))
            .then(() => {
                let providers = this._providers.getValue();
                providers = providers.filter(r => r.id != provider.id);
                this._providers.next(providers);
            });
    }

    public copyProvider(provider: Provider): Promise<Provider> {
        let copy: Provider = JSON.parse(JSON.stringify(provider));

        let i = 2;
        copy.name = provider.name + " - Copy";
        while (this._providers.getValue().find(r => r.name.toLocaleLowerCase() == copy.name.toLocaleLowerCase()) != null) {
            copy.name = provider.name + " - Copy (" + (i++) + ")";
        }

        return this.addProvider(copy);
    }

    //
    // Server Variables
    private loadServerVariableSettings(): Promise<AllowedServerVariablesSection> {

        let feature = this._urlRewrite.getValue();
        let serverVariablesLink: string = feature._links.allowed_server_variables.href;

        return this._http.get(serverVariablesLink.replace('/api', ''))
            .then(settings => {
                this._serverVariablesSettings.next(settings);
                return settings;
            })
            .catch(e => {
                this.serverVariablesError = e;
                throw e;
            });
    }

    public saveServerVariables(settings: AllowedServerVariablesSection): Promise<AllowedServerVariablesSection> {
        return this._http.patch(settings._links.self.href.replace('/api', ''), JSON.stringify(settings))
            .then((s: AllowedServerVariablesSection) => {
                Object.assign(settings, s);
                return settings;
            });
    }
}

