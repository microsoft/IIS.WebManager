import { Observable, BehaviorSubject } from 'rxjs';
import { NotificationService } from '../../../notification/notification.service';
import { ApiError, ApiErrorType } from '../../../error/api-error';
import { HttpClient } from '../../../common/httpclient';
import {
    UrlRewrite,
    InboundSection,
    InboundRule,
} from '../url-rewrite';

export class InboundService {
    public error: ApiError;

    private _urlRewrite: UrlRewrite;
    private _settings: BehaviorSubject<InboundSection> = new BehaviorSubject<InboundSection>(null);
    private _rules: BehaviorSubject<Array<InboundRule>> = new BehaviorSubject<Array<InboundRule>>([]);

    constructor(private _http: HttpClient, private _notificationService: NotificationService) {
    }

    public get settings(): Observable<InboundSection> {
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

    private loadSettings(): Promise<InboundSection> {

        let feature = this._urlRewrite;
        let inboundLink: string = feature._links.inbound.href;

        return this._http.get(inboundLink.replace('/api', ''))
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

    public saveSettings(settings: InboundSection): Promise<InboundSection> {
        return this._http.patch(settings._links.self.href.replace('/api', ''), JSON.stringify(settings))
            .then((s: InboundSection) => {
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

    public saveRule(rule: InboundRule): Promise<InboundRule> {
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

    public deleteRule(rule: InboundRule): void {
        this._http.delete(rule._links.self.href.replace('/api', ''))
            .then(() => {
                let rules = this._rules.getValue();
                rules.forEach((r, i) => { if (i > rule.priority) r.priority--; });
                rules = rules.filter(r => r.id != rule.id);
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

            //
            // Move the rule in the client view of rules list
            rules.splice(oldPriority, 1);

            //
            // Update the index of the rule which got pushed down
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