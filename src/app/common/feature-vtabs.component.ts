import { ComponentReference, GLOBAL_MODULES, CertificatesModuleName, WebServerModuleName, AppPoolsModuleName, WebSitesModuleName, FileSystemModuleName, WebServerModuleIcon } from "main/settings";
import { Component, Input, OnInit, AfterViewInit, forwardRef, ViewChild } from "@angular/core";
import { OptionsService } from "main/options.service";
import { UrlUtil } from "utils/url";
import { LoggerFactory, Logger, LogLevel } from "diagnostics/logger";
import { VTabsComponent } from "./vtabs.component";
import { SectionHelper } from "./section.helper";

export const HomeCategory = "Home";
export class RouteReference {
    constructor(public name: string, public ico: string, public routerLink: string[]) {}
}

export const CONTEXT_MODULES = [
    new RouteReference(WebServerModuleName, WebServerModuleIcon, [`/webserver/${SectionHelper.normalize(WebServerModuleName)}+general`]),
    new RouteReference(WebSitesModuleName, "fa fa-globe", [`/webserver/${SectionHelper.normalize(WebSitesModuleName)}`]),
    new RouteReference(AppPoolsModuleName, "fa fa-cogs", [`/webserver/${SectionHelper.normalize(AppPoolsModuleName)}`]),
    new RouteReference(FileSystemModuleName, "fa fa-files-o", [`/webserver/${SectionHelper.normalize(FileSystemModuleName)}`]),
];

export class Feature extends ComponentReference {
    data: any;
}

export interface FeatureContext {
    _links: any
}

export class GlobalModuleReference {
    name: string
    initialize: Promise<boolean>
}

@Component({
    selector: 'feature-vtabs',
    template: `
<div class="sidebar crumb" [class.nav]="IsActive">
    <vtabs [markLocation]="true" (activate)="Refresh()" [defaultTab]="default" [categories]="['${HomeCategory}', subcategory]">
        <item [name]="generalTabName" [ico]="generalTabIcon" [category]="generalTabCategory || subcategory">
            <ng-content select=".general-tab"></ng-content>
        </item>
        <item *ngFor="let module of features" [name]="module.name" [ico]="module.ico" [category]="subcategory">
            <dynamic [name]="module.component_name" [module]="module" [data]="module.data"></dynamic>
        </item>
        <ng-container *ngFor="let module of contexts">
            <item [name]="module.name" [ico]="module.ico" [category]="'${HomeCategory}'" [routerLink]="module.routerLink">
                <ng-container *ngIf="!(module.routerLink)">
                    <dynamic [name]="module.component_name" [module]="module" [data]="module.data"></dynamic>
                </ng-container>
            </item>
        </ng-container>
    </vtabs>
</div>
`,
    styles: [`
    :host >>> .sidebar > vtabs .vtabs > .items {
        top: 35px;
    }
    :host >>> .sidebar > vtabs .vtabs > .content {
        top: 96px;
    }
`],
}) export class FeatureVTabsComponent implements OnInit, AfterViewInit {
    @Input() default: string;
    @Input() generalTabName: string = "General";
    @Input() generalTabIcon: string = "fa fa-wrench";
    @Input() generalTabCategory: string;
    @Input() model: FeatureContext;
    @Input() resource: string;
    @Input() subcategory: string;
    @Input() include: GlobalModuleReference[] = [];
    @Input() promote: string[] = [];
    @Input() contexts: any[] = [];
    features: Feature[];

    @ViewChild(forwardRef(() => VTabsComponent)) vtabs: VTabsComponent;
    private _logger: Logger;

    constructor(
        private options: OptionsService,
        private factory: LoggerFactory,
    ){
        this._logger = factory.Create(this);
    }

    get IsActive() {
        return this.options.active;
    }

    Refresh() {
        this.options.refresh();
    }

    ngOnInit(): void {
        const apiNames = Object.keys(this.model._links);
        const featureSet: Feature[] = [];
        let promoted = new Map<string, Feature>();
        for (const feature of GLOBAL_MODULES) {
            const apiName = feature.api_name;
            let candidate: Feature;
            if (this.include.find(ref => ref.name == feature.name) ) {
                candidate = <Feature>{ ...feature };
            } else if (apiNames.includes(apiName)) {
                if (this.model._links[apiName].href) {
                    const matches = UrlUtil.getUrlMatch(this.model._links[apiName].href, feature.api_path);
                    if (matches) {
                        candidate = <Feature>{ ...feature };
                        candidate.data = matches;
                        candidate.data[this.resource] = this.model;
                    }
                }
            }
            if (candidate) {
                if (this.promote && this.promote.includes(candidate.name)) {
                    promoted[candidate.name] = candidate;
                } else {
                    featureSet.push(candidate);
                }
            }
        }
        for (let context of CONTEXT_MODULES) {
            if (this.promote.includes(context.name)) {
                let candidate = promoted[context.name];
                if (candidate) {
                    this.contexts.push(candidate);
                } else {
                    this._logger.log(LogLevel.DEBUG, `Tab ${context.name} will not be added because it is missing in included modules`);
                }
            } else {
                this.contexts.push(context);
            }
        }
        this.features = featureSet;
    }

    ngAfterViewInit(): void {
        for (const feature of this.include) {
            if (feature.initialize) {
                feature.initialize.then(success => {
                    if (!success) {
                        this._logger.log(LogLevel.WARN, `Tab ${feature.name} cannot be loaded`);
                        this.vtabs.hide(CertificatesModuleName);
                    }
                })
            }
        }
    }
}
