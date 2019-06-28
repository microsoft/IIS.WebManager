import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Selector } from '../../../common/selector';
import { UrlRewriteService } from '../service/url-rewrite.service';
import { RewriteMapsSection, RewriteMap, RewriteMapping } from '../url-rewrite';

@Component({
    selector: 'rewrite-maps',
    template: `
        <error [error]="service.rewriteMapsError"></error>
        <div *ngIf="!service.rewriteMapsError && _settings">
            <override-mode class="pull-right"
                [metadata]="_settings.metadata"
                [scope]="_settings.scope"
                (revert)="onRevert()" 
                (modelChanged)="onModelChanged()"></override-mode>
            <div>
                <button [class.background-active]="newMap.opened" (click)="newMap.toggle()">Create Rewrite Map <i aria-hidden="true" class="fa fa-caret-down"></i></button>
                <selector aria-hidden="true" #newMap class="container-fluid create" (hide)="initializeNewRewriteMap()">
                    <rewrite-map-edit [map]="_newRewriteMap" (save)="saveNew()" (cancel)="newMap.close()"></rewrite-map-edit>
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

    get service() {
        return this._service;
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
            .then(() => this._newRewriteMapSelector.close());
    }

    private onModelChanged() {
        this._service.saveRewriteMapSettings(this._settings);
    }

    private onRevert() {
        this._service.revertRewriteMaps();
    }
}