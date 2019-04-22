import { ComponentReference, GLOBAL_MODULES, CONTEXT_MODULES, CertificatesModuleName } from "main/settings";
import { Component, Input, OnInit, AfterViewInit, forwardRef, ViewChild } from "@angular/core";
import { OptionsService } from "main/options.service";
import { UrlUtil } from "utils/url";
import { LoggerFactory, Logger, LogLevel } from "diagnostics/logger";
import { VTabsComponent } from "./vtabs.component";

const HomeCategory = "Home";

class Feature extends ComponentReference {
    data: any;
}

export interface FeatureContext {
    links: any
}

export class StaticModuleReference {
    name: string
    initialize: Promise<boolean>
}

@Component({
    selector: 'feature-vtabs',
    template: `
<div class="sidebar crumb" [class.nav]="IsActive">
    <vtabs [markLocation]="true" (activate)="Refresh()" [defaultTab]="default" [categories]="['${HomeCategory}', subcategory]">
        <item [name]="'Web Server'" [ico]="'fa fa-server'" [routerLink]="['/webserver/general']" [category]="'${HomeCategory}'"></item>
        <item *ngFor="let module of contexts" [name]="module.name" [ico]="module.ico" [category]="'${HomeCategory}'">
            <dynamic [name]="module.component_name" [module]="module" [data]="module.data"></dynamic>
        </item>
        <item [name]="generalTabName" [ico]="generalTabIcon" [category]="subcategory">
            <ng-content select=".general-tab"></ng-content>
        </item>
        <item *ngFor="let module of features" [name]="module.name" [ico]="module.ico" [category]="subcategory">
            <dynamic [name]="module.component_name" [module]="module" [data]="module.data"></dynamic>
        </item>
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
    @Input() model: FeatureContext;
    @Input() resource: string;
    @Input() subcategory: string;
    @Input() include: StaticModuleReference[] = [];
    contexts: ComponentReference[] = CONTEXT_MODULES;
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
        const apiNames = Object.keys(this.model.links);
        const featureSet: Feature[] = [];
        for (const feature of GLOBAL_MODULES) {
            const apiName = feature.api_name;
            if (this.include.find(ref => ref.name == feature.name) ) {
                featureSet.push(<Feature>{...feature});
            } else if (apiNames.includes(apiName)) {
                if (this.model.links[apiName].href) {
                    const matches = UrlUtil.getUrlMatch(this.model.links[apiName].href, feature.api_path);
                    if (matches) {
                        const m = <Feature>{ ...feature };
                        m.data = matches;
                        m.data[this.resource] = this.model;
                        featureSet.push(m);
                    }
                }
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
