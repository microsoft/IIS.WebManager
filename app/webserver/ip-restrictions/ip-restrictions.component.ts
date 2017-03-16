import {Component, OnInit} from '@angular/core';

import {IpRestrictionsService} from './ip-restrictions.service';
import {Logger} from '../../common/logger';
import {NotificationService} from '../../notification/notification.service';

import {DiffUtil} from '../../utils/diff';
import {IpRestrictions, RestrictionRule} from './ip-restrictions';

@Component({
    template: `
        <loading *ngIf="!(ipRestrictions || _error)"></loading>
        <error [error]="_error"></error>
        <div *ngIf="ipRestrictions" [attr.disabled]="_locked || null">
            <override-mode class="pull-right" [metadata]="ipRestrictions.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
            <fieldset>
                <switch class="block" [(model)]="enabled" (modelChanged)="onEnabledChanged()">{{enabled ? "On" : "Off"}}</switch>
            </fieldset>
            <div [hidden]="!enabled">
                <fieldset>
                    <label>Denied Response Type</label>
                    <select class="form-control path" [(ngModel)]="ipRestrictions.deny_action" (modelChanged)="onModelChanged()">
                        <option value="Abort">Abort Connection</option>
                        <option value="Unauthorized">HTTP 401 Unauthorized</option>
                        <option value="Forbidden">HTTP 403 Forbidden</option>
                        <option value="NotFound">HTTP 404 Not Found</option>
                    </select>
                </fieldset>
                <section>
                    <div class="collapse-heading" data-toggle="collapse" data-target="#restrictionRules">
                        <h2>IP Addresses</h2>
                    </div>
                    <div id="restrictionRules" class="collapse in">
                        <ip-addresses [model]="ipRestrictions" 
                                      [rules]="restrictionRules" 
                                      [originalRules]="originalRules"
                                      (modelChange)="onModelChanged()"
                                      (addRule)="addRule($event)"
                                      (deleteRule)="deleteRule($event)"
                                      (changeRule)="saveRuleChanges($event)"></ip-addresses>
                    </div>
                </section>
                <section>
                    <div class="collapse-heading collapsed" data-toggle="collapse" data-target="#dynamicRestrictionSettings">
                        <h2>Dynamic Restrictions</h2>
                    </div>
                    <div id="dynamicRestrictionSettings" class="collapse">
                        <dynamic-restrictions [model]="ipRestrictions" (modelChange)="onModelChanged()"></dynamic-restrictions>
                    </div>
                </section>
            </div>            
        </div>
    `,
    styles: [`
        select.path{
            max-width: 400px;
            width: 100%;
        }        

    `]
})
export class IpRestrictionsComponent implements OnInit {

    id: string;
    ipRestrictions: IpRestrictions;
    restrictionRules: Array<RestrictionRule>;
    originalRules: Array<RestrictionRule>;
    enabled: boolean;
    
    private _original: IpRestrictions;
    private _error: any;
    private _locked: boolean;

    constructor(private _service: IpRestrictionsService,
        private _logger: Logger,
        private _notificationService: NotificationService) {
    }

    ngOnInit() {
        this.initialize();
    }

    onEnabledChanged() {
        if (!this.enabled) {
            if (this.restrictionRules && this.restrictionRules.length > 0) {
                if (!confirm("CAUTION: All restriction rules will be permanently deleted when IP restriction is turned off.")) {
                    this.enabled = true; // Restore 
                    return;
                }
                while (this.restrictionRules.length > 0) {
                    this.restrictionRules.pop();
                }
            }
            this.ipRestrictions.enabled = false;
            this.onModelChanged();
        }
    }

    onModelChanged() {

        if (this.ipRestrictions) {

            var changes = DiffUtil.diff(this._original, this.ipRestrictions);

            if (Object.keys(changes).length > 0) {

                this._service.patchFeature(this.ipRestrictions, changes)
                    .then(feature => {
                        this._notificationService.clearWarnings();
                        this.setFeature(feature);
                    });
            }
            else {
                this._notificationService.clearWarnings();
            }
        }
    }

    onRevert() {
        this._service.revert(this.ipRestrictions.id)
            .then(_ => {
                this.initialize();
            })
            .catch(e => {
                this._error = e;
            });
    }

    saveRuleChanges(index) {

        if (this.restrictionRules && this.restrictionRules[index] && this.restrictionRules[index].id) {

            var restrictionChanges = DiffUtil.diff(this.originalRules[index], this.restrictionRules[index]);

            if (Object.keys(restrictionChanges).length > 0) {

                this._service.patchRule(this.restrictionRules[index], restrictionChanges)
                    .then(rule => {
                        this.setRule(index, rule);
                    });

            }
            else {
                this._notificationService.clearWarnings();
            }
        }
    }


    deleteRule(rule: RestrictionRule) {
        this._service.deleteRule(rule);
    }

    addRule(index) {
        this._service.addRule(this.ipRestrictions, this.restrictionRules[index])
            .then(restriction => {
                this.setRule(index, restriction);
            })
            .catch(e => {
                this.initialize();
            });
    }

    private initialize() {
        this._service.get(this.id)
            .then(s => {
                this.setFeature(s.feature);
                this.restrictionRules = s.rules;
                this.originalRules = JSON.parse(JSON.stringify(s.rules));
                this.enabled = s.feature.enabled;
            })
            .catch(e => {
                this._error = e;
            });
    }

    private setFeature(feature) {
        this.ipRestrictions = feature;
        this._original = JSON.parse(JSON.stringify(feature));

        if (this.ipRestrictions.enabled == null) {
            this.ipRestrictions.enabled = false;
        }

        this._locked = this.ipRestrictions.metadata.is_locked ? true : null;
    }

    private setRule(index, rule) {
        this.restrictionRules[index] = rule;
        this.originalRules[index] = JSON.parse(JSON.stringify(rule));
    }

    private resetFeature() {
        this.ipRestrictions.deny_action = "Forbidden";
        this.ipRestrictions.enable_proxy_mode = false;
        this.ipRestrictions.enable_reverse_dns = false;
        this.ipRestrictions.allow_unlisted = true;

        this.ipRestrictions.deny_by_concurrent_requests.enabled = false;
        this.ipRestrictions.deny_by_request_rate.enabled = false;
        this.ipRestrictions.logging_only_mode = false;

        this.onModelChanged();
    }

}
