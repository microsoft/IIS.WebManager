import { environment } from "environments/environment";
import { WebSitesModuleName, AppPoolsModuleName } from "main/settings";

export const HomeModuleName = "Home";
export const BreadcrumbsRoot = environment.WAC ? [] : [<Breadcrumb>{ Label: HomeModuleName, RouterLink: ["/"] }];
export const WebServerCrumb = <Breadcrumb>{ Label: environment.WAC ? "IIS" : "Web Server", RouterLink: ["/webserver/general"]};
export const WebSitesCrumb = <Breadcrumb>{ Label: WebSitesModuleName, RouterLink: ["/webserver/web-site"]};
export const AppPoolsCrumb = <Breadcrumb>{ Label: AppPoolsModuleName, RouterLink: ["/webserver/application-pools"]};

export class Breadcrumb {
    public Label: string
    public RouterLink: string[]
}
