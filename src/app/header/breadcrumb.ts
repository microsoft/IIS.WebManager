import { IsWAC } from "environments/environment";
import { WebSitesModuleName, AppPoolsModuleName } from "main/settings";

export const HomeModuleName = "Home";
export const BreadcrumbsRoot = IsWAC ? [] : [<Breadcrumb>{ Label: HomeModuleName, RouterLink: ["/"] }];
export const WebServerCrumb = <Breadcrumb>{ Label: IsWAC ? "IIS" : "Web Server", RouterLink: ["/webserver/web-server"]};
export const WebSitesCrumb = <Breadcrumb>{ Label: WebSitesModuleName, RouterLink: ["/webserver/web-site"]};
export const AppPoolsCrumb = <Breadcrumb>{ Label: AppPoolsModuleName, RouterLink: ["/webserver/application-pools"]};

export class Breadcrumb {
    public Label: string
    public RouterLink: string[]
}
