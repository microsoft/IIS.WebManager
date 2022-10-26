import {
    GLOBAL_MODULES,
    AppPoolsModuleName,
    ComponentReference,
    CertificatesModuleName,
    WebServerModuleIcon,
    WebServerModuleName,
    WebSitesModuleName,
} from "main/settings";
import { Component, Input, OnInit, AfterViewInit, forwardRef, ViewChild, OnDestroy } from "@angular/core";
import { OptionsService } from "main/options.service";
import { UrlUtil } from "utils/url";
import { LoggerFactory, Logger, LogLevel } from "diagnostics/logger";
import { VTabsComponent, Item } from "./vtabs.component";
import { IsWAC } from "environments/environment";
import { Breadcrumb, WebServerGeneralRoute, AppPoolListRoute, WebSiteListRoute } from "header/breadcrumb";
import { Subscription } from "rxjs";
import { TitlesService } from "header/titles.service";

export const HomeCategory = "Home";
export class RouteReference {
    constructor(public name: string, public ico: string, public routerLink: string[]) {}
}

export const CONTEXT_MODULES = [
    new RouteReference(WebServerModuleName, WebServerModuleIcon, WebServerGeneralRoute ),
    new RouteReference(WebSitesModuleName, "sme-icon sme-icon-globe", WebSiteListRoute ),
    new RouteReference(AppPoolsModuleName, "sme-icon sme-icon-processing", AppPoolListRoute ),
];

export class Feature extends ComponentReference {
    data: any;
}

export interface FeatureContext {
    _links: any;
}

export interface BreadcrumbsResolver {
    resolve(model: FeatureContext): Breadcrumb[]
}

export class GlobalModuleReference {
    name: string
    initialize: Promise<boolean>
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This class is a generalization of the webserver/website/app pool/web app pages
// Depending on the "Context" (webserver/website/app pool/web app), different "Features" (certificate/URL rewrite/etc) are selected to be displayed
// Downstream classes can also choose to include modules with "includeModules" force a module to be included or set modules to be promoted to context
// section by listing the module names in "promoteToContext"
@Component({
    selector: 'feature-vtabs',
    // NOTE: when [routerLink] is used, Angular automatically set tabindex="0". In order to avoid that behavior, we decided to add tabindex="-1".
    template: `
<div class="sidebar crumb" [class.nav]="isActive">
    <vtabs [header]="header" [markLocation]="true" (activate)="refresh()" [defaultTab]="default" [categories]="['${HomeCategory}', subcategory]">
        <item [name]="generalTabName" [ico]="generalTabIcon" [category]="generalTabCategory || subcategory">
            <ng-content select=".general-tab"></ng-content>
        </item>
        <item *ngFor="let module of features" [name]="module.name" [ico]="module.ico" [category]="subcategory">
            <dynamic [name]="module.component_name" [module]="module" [data]="module.data"></dynamic>
        </item>
        <item *ngFor="let module of contexts" [name]="module.name" [ico]="module.ico" [category]="'${HomeCategory}'" [routerLink]="module.routerLink" tabindex="-1">
            <dynamic *ngIf="!(module.routerLink)" [name]="module.component_name" [module]="module" [data]="module.data"></dynamic>
        </item>
    </vtabs>
</div>
`,
}) export class FeatureVTabsComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() default: string;
    @Input() generalTabName: string = "General";
    @Input() generalTabIcon: string = "sme-icon sme-icon-developerTools";
    @Input() generalTabCategory: string;
    @Input() model: FeatureContext;
    @Input() resource: string;
    @Input() subcategory: string;
    @Input() includeModules: GlobalModuleReference[] = [];
    @Input() promoteToContext: string[] = [];
    @Input() breadcrumbsResolver: BreadcrumbsResolver;

    contexts: any[] = [];
    features: Feature[];

    @ViewChild(forwardRef(() => VTabsComponent)) vtabs: VTabsComponent;
    private logger: Logger;
    private breadcrumbsUpdate: Subscription;

    constructor(
        private titles: TitlesService,
        private options: OptionsService,
        factory: LoggerFactory,
    ){
        this.logger = factory.Create(this);
    }

    get header() {
        return IsWAC ? "IIS" : null;
    }

    get isActive() {
        return this.options.active;
    }

    refresh() {
        this.options.refresh();
    }

    ngOnInit(): void {
        const apiNames = Object.keys(this.model._links);
        const featureSet: Feature[] = [];
        let promoted = new Map<string, Feature>();
        for (const feature of GLOBAL_MODULES) {
            const apiName = feature.api_name;
            let candidate: Feature;
            // If we have specified the module to be included, select the module as candidate
            if (this.includeModules.find(ref => ref.name == feature.name) ) {
                candidate = <Feature>{ ...feature };
            // If model's link specifies the module's API, produce the parameter matches
            // and if it is successful, select it as candidate
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
            // candidate should go to feature category unless it was specified as context
            if (candidate) {
                if (this.promoteToContext && this.promoteToContext.includes(candidate.name)) {
                    promoted[candidate.name] = candidate;
                } else {
                    featureSet.push(candidate);
                }
            }
        }
        // Populate "contexts" category tabs
        // CONTEXT_MODULES are placeholder tabs, candidates promoted previously take precedence to be chosen
        for (let context of CONTEXT_MODULES) {
            if (this.promoteToContext.includes(context.name)) {
                let candidate = promoted[context.name];
                if (candidate) {
                    // push the promoted candidate
                    this.contexts.push(candidate);
                } else {
                    this.logger.log(LogLevel.DEBUG, `Tab ${context.name} will not be added because it is missing in included modules`);
                }
            } else {
                // push the placeholder
                this.contexts.push(context);
            }
        }
        this.features = featureSet;
    }

    ngAfterViewInit(): void {
        for (const feature of this.includeModules) {
            if (feature.initialize) {
                feature.initialize.then(success => {
                    if (!success) {
                        this.logger.log(LogLevel.WARN, `Tab ${feature.name} cannot be loaded`);
                        this.vtabs.hide(CertificatesModuleName);
                    }
                })
            }
        }
        this.breadcrumbsUpdate = this.vtabs.onSelectItem.subscribe(
            (item: Item) => {
                let crumbsRoot = this.breadcrumbsResolver.resolve(this.model);
                var lastCrumb = crumbsRoot[crumbsRoot.length - 1];
                crumbsRoot[crumbsRoot.length - 1] = <Breadcrumb> { label: lastCrumb.label, tabName: this.generalTabName};
                this.titles.loadCrumbs(crumbsRoot.concat(<Breadcrumb>{ label: item.name }));
                this.titles.heading = item;
            },
        );
    }

    ngOnDestroy(): void {
        if (this.breadcrumbsUpdate) {
            this.breadcrumbsUpdate.unsubscribe();
        }
    }
}
