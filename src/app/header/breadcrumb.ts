import { IsWAC } from "environments/environment";
import { WebSitesModuleName, AppPoolsModuleName } from "main/settings";

export const HomeModuleName = "Home";
export const BreadcrumbsRoot = IsWAC ? [] : [<Breadcrumb>{ label: HomeModuleName, routerLink: ["/"] }];
export const WebServerCrumb = <Breadcrumb>{ label: "IIS Web Server", routerLink: ["/webserver/general"]};
export const WebSitesCrumb = <Breadcrumb>{ label: WebSitesModuleName, routerLink: ["/webserver/web-site"]};
export const AppPoolsCrumb = <Breadcrumb>{ label: AppPoolsModuleName, routerLink: ["/webserver/application-pools"]};

export class Breadcrumb {
    public label: string;
    public routerLink: string[];
}
