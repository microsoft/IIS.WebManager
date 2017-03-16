
import {Component, Input, Inject} from '@angular/core';
import {Router} from '@angular/router';

import {WebApp} from './webapp'
import {WebAppsService} from './webapps.service'


@Component({
    selector: 'webapp-header',
    styles: [`
        .navigator {
            float: left;
        }

        .feature-title:before {
            content: "\\f121";
        }
    `],
    template: `
        <div>
            <div class="feature-header">
                <div class="subject">
                    <h1 class="feature-title" [title]="model.website.name + model.path">
                        <span>{{model.path}}</span>
                    </h1>
                </div>
            </div>
            <div>
                <div class="navigator">
                    <navigator *ngIf="model.website.bindings" [model]="model.website.bindings" [path]="model.path" [left]="true" [small]="true"></navigator>
                </div>
                <button class="no-border" title="Delete" (click)="onDelete()">
                    <i class="fa fa-trash-o red"></i><span class="hidden-xs">Delete</span>
                </button>
            </div>
        </div>
    `
})
export class WebAppHeaderComponent {
    @Input() model: WebApp;

    constructor(@Inject("WebAppsService") private _service: WebAppsService,
                private _router: Router) {
    }

    onDelete() {
        if (confirm("Are you sure you would like to delete '" + this.model.path + "'?")) {
            this._service.delete(this.model)
                .then(() => {
                    this._router.navigate(['/WebServer/WebSites/WebSite', { id: this.model.website.id }]);
                });
        }
    }
}
