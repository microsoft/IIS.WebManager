import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { NotificationService } from '../../../notification/notification.service';
import { Status } from '../../../common/status';
import { ApiError } from '../../../error/api-error';
import { HttpClient } from '../../../common/httpclient';
import {
    UrlRewrite,
    GlobalSection,
    InboundRule,
} from '../url-rewrite';

export class GlobalService {
    public error: ApiError;

    private static URL = "/webserver/url-rewrite/";
    private _urlRewrite: UrlRewrite;
    private _settings: BehaviorSubject<GlobalSection> = new BehaviorSubject<GlobalSection>(null);
    private _rules: BehaviorSubject<Array<InboundRule>> = new BehaviorSubject<Array<InboundRule>>([]);

    constructor(private _http: HttpClient, private _notificationService: NotificationService) {
    }

    public get settings(): Observable<GlobalSection> {
        return this._settings.asObservable();
    }

    public get rules(): Observable<Array<InboundRule>> {
        return this._rules.asObservable();
    }

    public revert(): void {
        this._http.delete(this._settings.getValue()._links.self.href.replace("/api", ""))
            .then(_ => {
                this.loadSettings().then(set => this.loadRules());
            });
    }

    public initialize(urlRewrite: UrlRewrite) {
        this._urlRewrite = urlRewrite;
        this.loadSettings()
            .then(settings => this.loadRules());
    }

    private loadSettings(): Promise<GlobalSection> {

        let feature = this._urlRewrite;
        let globalLink: string = feature._links.global.href;

        return this._http.get(globalLink.replace('/api', ''))
            .then(settings => {
                this._settings.next(settings);
                return settings;
            })
            .catch(e => {
                this.error = e;
                throw e;
            });
    }

    private loadRules(): Promise<Array<InboundRule>> {

        let settings = this._settings.getValue();
        let rulesLink: string = settings._links.rules.href;

        return this._http.get(rulesLink.replace('/api', '') + "&fields=*")
            .then(rulesObj => {
                let rules = rulesObj.rules;

                this._rules.next(rules);
                return rules;
            });
    }

    public saveSettings(settings: GlobalSection): Promise<GlobalSection> {
        return this._http.patch(settings._links.self.href.replace('/api', ''), JSON.stringify(settings))
            .then((s: GlobalSection) => {
                Object.assign(settings, s);
                this.loadRules();
                return settings;
            });
    }

    public addRule(rule: InboundRule): Promise<InboundRule> {

        let settings = this._settings.getValue();
        let rulesLink: string = settings._links.rules.href;
        rule.url_rewrite = this._urlRewrite;

        return this._http.post(rulesLink.replace('/api', ''), JSON.stringify(rule))
            .then((newRule: InboundRule) => {
                let rules = this._rules.getValue();
                rules.push(newRule);
                this._rules.next(rules);
                return newRule;
            });
    }

    public saveRule(rule: InboundRule): Promise<InboundRule> {
        return this._http.patch(rule._links.self.href.replace('/api', ''), JSON.stringify(rule))
            .then((r: InboundRule) => {
                Object.assign(rule, r);
                return rule;
            });
    }

    public deleteRule(rule: InboundRule): void {
        this._http.delete(rule._links.self.href.replace('/api', ''))
            .then(() => {
                let rules = this._rules.getValue();
                rules.forEach((r, i) => { if (i > rule.priority) r.priority--; });
                rules = rules.filter(r => r != rule);
                this._rules.next(rules);
            });
    }

    public copyRule(rule: InboundRule): Promise<InboundRule> {
        let copy: InboundRule = JSON.parse(JSON.stringify(rule));

        let i = 2;
        copy.name = rule.name + " - Copy";
        copy.priority = null;
        while (this._rules.getValue().find(r => r.name.toLocaleLowerCase() == copy.name.toLocaleLowerCase()) != null) {
            copy.name = rule.name + " - Copy (" + (i++) + ")";
        }

        return this.addRule(copy);
    }

    public moveUp(rule: InboundRule) {
        if (rule.priority == 0) {
            return;
        }

        let oldPriority = rule.priority;
        rule.priority = oldPriority - 1;

        this.saveRule(rule).then(r => {
            let rules = this._rules.getValue();
            rules.splice(oldPriority, 1);
            rules[rule.priority].priority++;
            rules.splice(rule.priority, 0, rule);
            this._rules.next(rules);
        });
    }

    public moveDown(rule: InboundRule) {
        let oldPriority = rule.priority;

        if (oldPriority + 1 == this._rules.getValue().length) {
            return;
        }

        rule.priority = oldPriority + 1;

        this.saveRule(rule).then(r => {
            let rules = this._rules.getValue();
            rules.splice(oldPriority, 1);
            rules[oldPriority].priority--;
            rules.splice(rule.priority, 0, rule);
            this._rules.next(rules);
        });
    }
}