import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { OptionsService } from './options.service';

@Component({
    styles: [`
        .sidebar .home::before {content: "\\f015";}

        :host >>> .sidebar > vtabs .items:before {
            content: "";
        }

        :host >>> .sidebar > vtabs .items {
            top: 115px;
        }

        :host >>> .sidebar.nav > vtabs .content {
            top: 15px;
        }
    `],
    template: `
        <div>
            <div class="sidebar" [class.nav]="_options.active">
                <ul class="items">
                    <li class="home"><a [routerLink]="['/']">Home</a></li>
                </ul>
                <vtabs [markLocation]="true" (activate)="_options.refresh()">
                    <item [name]="'Web Sites'" [ico]="'fa fa-globe'">
                        <dynamic [name]="'WebSiteListComponent'" [module]="'app/webserver/websites/websites.module#WebSitesModule'"></dynamic>
                    </item>
                    <item [name]="'Web Server'" [ico]="'fa fa-server'" [routerLink]="['/webserver']"></item>
                    <item [name]="'Files'" [ico]="'fa fa-files-o'">
                        <dynamic [name]="'FilesComponent'" [module]="'app/files/files.module#FilesModule'"></dynamic>
                    </item>
                </vtabs>
            </div>
        </div>
    `
})
export class HomeComponent {
    constructor(private _options: OptionsService,
        private _route: ActivatedRoute) {
    }
}
