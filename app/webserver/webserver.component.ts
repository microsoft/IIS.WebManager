import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ModuleUtil } from '../utils/Module';
import { OptionsService } from '../main/options.service';

import { HttpClient } from '../common/httpclient';
import { WebServer } from './webserver';
import { WebServerService } from './webserver.service';



@Component({
    template: `    
        <div *ngIf="webServer">
            <loading *ngIf="!webServer"></loading>
            <webserver-header [model]="webServer" [class.sidebar-nav-content]="_options.active"></webserver-header>
            <div class="sidebar crumb" [class.nav]="_options.active">
                <ul class="items">
                    <li class="home"><a [routerLink]="['/']">Home</a></li>
                    <li class="webserver color-active">Web Server</li>
                    <hr />
                </ul>
                <vtabs *ngIf="webServer" [markLocation]="true" (activate)="_options.refresh()">
                    <item [name]="'General'" [ico]="'fa fa-wrench'">
                        <webserver-general [model]="webServer"></webserver-general>
                    </item>
                    <item *ngFor="let module of modules" [name]="module.name" [ico]="module.ico">
                        <dynamic [name]="module.component_name" [module]="module.module" [data]="module.data"></dynamic>
                    </item>
                </vtabs>
            </div>
        </div>
    `,
    styles: [`
        .sidebar .home::before {content: "\\f015";}
        .sidebar .webserver::before {content: "\\f233";}

        :host >>> .sidebar > vtabs .vtabs > .items {
            top: 143px;
        }

        :host >>> .sidebar.nav > vtabs .vtabs > .content {
            top: 130px;
        }
    `]
})
export class WebServerComponent {
    webServer: WebServer;
    modules: Array<any> = [];

    constructor( @Inject('WebServerService') private _service: WebServerService,
        private _http: HttpClient,
        private _options: OptionsService,
        private _route: ActivatedRoute) {
    }

    ngOnInit() {
        this._service.server.then(ws => {
            this.webServer = ws;
            ModuleUtil.initModules(this.modules, this.webServer, "webserver");
            ModuleUtil.addModule(this.modules, "Certificates");

            this._http.head('/certificates/', null, false)
                .catch(res => {
                    this.modules = this.modules.filter(m => m.name.toLocaleLowerCase() !== 'certificates')
                });
        });
    }
}
