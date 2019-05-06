import { IsWAC } from "environments/environment";
import { WebSitesModuleName, AppPoolsModuleName } from "main/settings";
import { SectionHelper } from "common/section.helper";

const WebSiteRoute = `/webserver/${SectionHelper.normalize(WebSitesModuleName)}`;
const AppPoolRoute = `/webserver/${SectionHelper.normalize(AppPoolsModuleName)}`;

export const HomeModuleName = "Home";
export const BreadcrumbsRoot = IsWAC ? [<Breadcrumb>{ label: "IIS Web Server" }] : [<Breadcrumb>{ label: HomeModuleName, routerLink: ["/"] }];
export const WebSitesCrumb = <Breadcrumb>{ label: WebSitesModuleName, routerLink: [WebSiteRoute]};
export const AppPoolsCrumb = <Breadcrumb>{ label: AppPoolsModuleName, routerLink: [AppPoolRoute]};

export class Breadcrumb {
    public label: string;
    public routerLink: string[];
}

export function resolveWebsiteRoute(id: string) {
    return `${WebSiteRoute}/${id}`;
}

export function resolveAppPoolRoute(id: string) {
    return `${AppPoolRoute}/${id}`;
}

export function resolveWebAppRoute(id: string) {
    return `/webserver/webapps/${id}`;
}
