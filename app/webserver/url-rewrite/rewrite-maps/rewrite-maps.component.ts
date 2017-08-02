import { Component, OnDestroy, ViewChild, Input } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { Selector } from '../../../common/selector';
import { UrlRewriteService } from '../url-rewrite.service';
import { RewriteMapsSection, RewriteMap, RewriteMapping } from '../url-rewrite';

@Component({
    selector: 'rewrite-maps',
    template: `
        <error [error]="_service.rewriteMapsError"></error>
        <div *ngIf="!_service.rewriteMapsError && _settings">
            <override-mode class="pull-right"
                [metadata]="_settings.metadata"
                [scope]="_settings.scope"
                (revert)="onRevert()" 
                (modelChanged)="onModelChanged()"></override-mode>
            <div>
                <button [class.background-active]="newMap.opened" (click)="newMap.toggle()">Create Rewrite Map <i class="fa fa-caret-down"></i></button>
                <selector #newMap class="container-fluid create">
                    <rewrite-map-edit [map]="_newRewriteMap" (save)="saveNew($event)" (cancel)="closeNew()"></rewrite-map-edit>
                </selector>
            </div>

            <div>
                <div class="container-fluid">
                    <div class="row hidden-xs border-active grid-list-header">
                        <label class="col-xs-6">Name</label>
                        <label class="col-xs-2">Count</label>
                    </div>
                </div>

                <ul class="grid-list container-fluid">
                    <li *ngFor="let map of _rewriteMaps">
                        <rewrite-map [map]="map"></rewrite-map>
                    </li>
                </ul>
            </div>
        </div>
    `
})
export class RewriteMapsComponent implements OnDestroy {
    private _settings: RewriteMapsSection;
    private _newRewriteMap: RewriteMap;
    private _rewriteMaps: Array<RewriteMap> = [];
    private _subscriptions: Array<Subscription> = [];
    @ViewChild(Selector) private _newRewriteMapSelector: Selector;

    constructor(private _service: UrlRewriteService) {
        this._subscriptions.push(this._service.rewriteMapSettings.subscribe(settings => this._settings = settings));
        this._subscriptions.push(this._service.rewriteMaps.subscribe(r => {
            this._rewriteMaps = r;
            this.initializeNewRewriteMap();
        }));
        this.initializeNewRewriteMap();
    }

    public ngOnDestroy(): void {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private initializeNewRewriteMap() {
        this._newRewriteMap = new RewriteMap();
        let name = "New Rewrite Map";
        this._newRewriteMap.name = name;
        this._newRewriteMap.default_value = "";
        this._newRewriteMap.ignore_case = true;

        let i = 1;
        while (this._rewriteMaps.find(r => r.name.toLocaleLowerCase() == this._newRewriteMap.name.toLocaleLowerCase())) {
            this._newRewriteMap.name = name + " " + i++;
        }

        this._newRewriteMap.mappings = new Array<RewriteMapping>();
    }

    private saveNew() {
        this._service.addRewriteMap(this._newRewriteMap)
            .then(() => this.closeNew());
    }

    private discardNew() {
        this._newRewriteMap = null;
    }

    private closeNew() {
        this.initializeNewRewriteMap();
        this._newRewriteMapSelector.close();
    }

    private onModelChanged() {
        this._service.saveRewriteMapSettings(this._settings);
    }

    private onRevert() {
        this._service.revert();
    }
}