import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UrlRewriteService } from '../service/url-rewrite.service';
import { AllowedServerVariablesSection } from '../url-rewrite';

@Component({
    selector: 'server-variables',
    template: `
        <error [error]="service.serverVariablesError"></error>
        <div *ngIf="!service.serverVariablesError && _settings">
            <override-mode class="pull-right"
                [metadata]="_settings.metadata"
                [scope]="_settings.scope"
                (revert)="onRevert()" 
                (modelChanged)="onModelChanged()"></override-mode>
                <div class="row">
                    <fieldset [disabled]="_settings.metadata.is_locked || null" class="clear col-xs-12 col-sm-10 col-md-8 col-lg-6">
                        <string-list useAddButton="true" #fileExtensions="stringList" [(model)]="_settings.entries" (modelChanged)="onModelChanged()"></string-list>
                    </fieldset>
                </div>
        </div>
    `
})
export class ServerVariablesComponent implements OnDestroy {
    private _settings: AllowedServerVariablesSection;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _service: UrlRewriteService) {
        this._subscriptions.push(this._service.serverVariablesSettings.subscribe(settings => this._settings = settings));
    }

    public ngOnDestroy(): void {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    get service() {
        return this._service;
    }

    private onModelChanged(): void {
        this._service.saveServerVariables(this._settings);
    }

    private onRevert(): void {
        this._service.revertServerVariables();
    }
}