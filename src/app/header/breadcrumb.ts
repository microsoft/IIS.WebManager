import { IsWAC } from "environments/environment";
import { WebSitesModuleName, AppPoolsModuleName, WebServerRoute, WebServerModuleName } from "main/settings";
import { SectionHelper } from "common/section.helper";

export const WebServerGeneralRoute = [ `/${WebServerRoute}/${SectionHelper.normalize(WebServerModuleName)}+general` ];
export const WebSiteListRoute = [ `/${WebServerRoute}/${SectionHelper.normalize(WebSitesModuleName)}` ];
export const AppPoolListRoute = [ `/${WebServerRoute}/${SectionHelper.normalize(AppPoolsModuleName)}` ];

export const HomeModuleName = "Home";
export const WebServerBreadcrumbLabel = "IIS Web Server";
export const WebSitesCrumb = <Breadcrumb>{ label: WebSitesModuleName, routerLink: WebSiteListRoute };
export const AppPoolsCrumb = <Breadcrumb>{ label: AppPoolsModuleName, routerLink: AppPoolListRoute };

export function GetBreadcrumbsRoot(): Breadcrumb[] {
    if (IsWAC) {
        return [<Breadcrumb>{ label: WebServerBreadcrumbLabel, routerLink: WebServerGeneralRoute }];
    } else {
        return [<Breadcrumb>{ label: HomeModuleName, routerLink: ["/"] }];
    }
}

export interface Navigator {
    navigate(): void;
}

export class Breadcrumb {
    constructor(
        public label: string,
        public routerLink: string[],
        public tabName: string,
    ) {}
}
