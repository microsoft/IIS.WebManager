import { Component, OnDestroy, ViewChild } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { Selector } from '../../../common/selector';
import { UrlRewriteService } from '../service/url-rewrite.service';
import { ProvidersSection, Provider, ProviderSetting } from '../url-rewrite';

@Component({
    selector: 'providers',
    template: `
        <error [error]="_service.providersError"></error>
        <div *ngIf="!_service.providersError && _settings">
            <override-mode class="pull-right"
                [metadata]="_settings.metadata"
                [scope]="_settings.scope"
                (revert)="onRevert()" 
                (modelChanged)="onModelChanged()"></override-mode>
            <div>
                <button [class.background-active]="newProvider.opened" (click)="toggleNew()">Create Provider <i class="fa fa-caret-down"></i></button>
                <selector #newProvider class="container-fluid create">
                    <provider-edit [provider]="_newProvider" (save)="saveNew()" (cancel)="closeNew()"></provider-edit>
                </selector>
            </div>

            <div>
                <div class="container-fluid">
                    <div class="row hidden-xs border-active grid-list-header">
                        <label class="col-xs-8 col-sm-5">Name</label>
                        <label class="col-sm-5">Type</label>
                    </div>
                </div>

                <ul class="grid-list container-fluid">
                    <li *ngFor="let provider of _providers">
                        <provider [provider]="provider"></provider>
                    </li>
                </ul>
            </div>
        </div>
    `
})
export class ProvidersComponent implements OnDestroy {
    private _settings: ProvidersSection;
    private _newProvider: Provider;
    private _providers: Array<Provider> = [];
    private _subscriptions: Array<Subscription> = [];
    @ViewChild(Selector) private _newSelector: Selector;

    constructor(private _service: UrlRewriteService) {
        this._subscriptions.push(this._service.providersSettings.subscribe(settings => this._settings = settings));
        this._subscriptions.push(this._service.providers.subscribe(r => {
            this._providers = r;
            this.initializeNewProvider();
        }));
        this.initializeNewProvider();
    }

    public ngOnDestroy(): void {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private initializeNewProvider() {
        this._newProvider = new Provider();
        let name = "New Provider";
        this._newProvider.name = name;
        this._newProvider.type = "";
        this._newProvider.settings = new Array<ProviderSetting>();

        let i = 1;
        while (this._providers.find(r => r.name.toLocaleLowerCase() == this._newProvider.name.toLocaleLowerCase())) {
            this._newProvider.name = name + " " + i++;
        }
    }

    private saveNew() {
        this._service.addProvider(this._newProvider)
            .then(() => this.closeNew());
    }

    private toggleNew() {
        this._newSelector.toggle();
    }

    private closeNew() {
        this.initializeNewProvider();
        this._newSelector.close();
    }

    private onModelChanged() {
        this._service.saveProviders(this._settings);
    }

    private onRevert() {
        this._service.revert();
    }
}