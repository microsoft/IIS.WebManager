import { IsWAC } from "environments/environment";
import { WebSitesModuleName, AppPoolsModuleName } from "main/settings";
import { SectionHelper } from "common/section.helper";

const WebSiteModuleRoute = `/webserver/${SectionHelper.normalize(WebSitesModuleName)}`;
const AppPoolModuleRoute = `/webserver/${SectionHelper.normalize(AppPoolsModuleName)}`;

export const HomeModuleName = "Home";
export const BreadcrumbsRoot = IsWAC ? [<Breadcrumb>{ label: "IIS Web Server" }] : [<Breadcrumb>{ label: HomeModuleName, routerLink: ["/"] }];
export const WebSitesCrumb = <Breadcrumb>{ label: WebSitesModuleName, routerLink: [WebSiteModuleRoute]};
export const AppPoolsCrumb = <Breadcrumb>{ label: AppPoolsModuleName, routerLink: [AppPoolModuleRoute]};

export class Breadcrumb {
    public label: string;
    public routerLink: string[];
}
