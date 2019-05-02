export var SETTINGS : { [key:string]: string} = {
    "version": "3.0.0",
    "api_version": "2.2.1",
    "api_setup_version": "2.2.1",
    "api_download_url": "https://go.microsoft.com/fwlink/?linkid=2080134",
    "iis_admin_api_service_name": "Microsoft IIS Administration",
    "ga_track": "UA-XXXXXXXX-X",
}

export const WebSiteListComponentName = "WebSiteListComponent"
export const AppPoolComponentName = "AppPoolListComponent"
export const WebFilesComponentName = "WebFilesComponent"
export const WebAppListComponentName = "WebAppListComponent"
export const VdirListComponentName = "VdirListComponent"
export const AuthenticationComponentName = "AuthenticationComponent"
export const AuthorizationComponentName = "AuthorizationComponent"
export const CertificatesComponentName = "CertificatesComponent"
export const CentralCertificateComponentName = "CentralCertificateComponent"
export const DefaultDocumentsComponentName = "DefaultDocumentsComponent"
export const DirectoryBrowsingComponentName = "DirectoryBrowsingComponent"
export const IpRestrictionsComponentName = "IpRestrictionsComponent"
export const LoggingComponentName = "LoggingComponent"
export const MimeMapsComponentName = "MimeMapsComponent"
export const MonitoringComponentName = "MonitoringComponent"
export const ModulesComponentName = "ModulesComponent"
export const CompressionComponentName = "CompressionComponent"
export const RequestFilteringComponentName = "RequestFilteringComponent"
export const HttpResponseHeadersComponentName = "HttpResponseHeadersComponent"
export const RequestTracingComponentName = "RequestTracingComponent"
export const StaticContentComponentName = "StaticContentComponent"
export const UrlRewriteComponentName = "UrlRewriteComponent"
export const FilesComponentName = "FilesComponent"
export const UploadComponentName = "UploadComponent"
export const WarningComponentName = "WarningComponent"
export const AppModuleName = "AppModule"

export const WebServerModuleName = "Web Server"
export const WebServerModuleIcon = "fa fa-server"
export const WebSitesModuleName = "Web Sites"
export const WebAppsModuleName = "Web Applications"
export const AppPoolsModuleName = "Application Pools"
export const FileSystemModuleName = "File System"
export const WebFilesModuleName = "Files"
export const CertificatesModuleName = "Certificates"

export const WebSitesApiName= "websites";
export const AppPoolsApiName = "app_pools";
export const FilesApiName = "files";

export class ComponentReference {
    constructor(public name: string, public ico: string, public component_name: string, public api_name: string, public api_path: string) {}
}

export const GLOBAL_MODULES: ComponentReference[] = [
    new ComponentReference(WebSitesModuleName, "fa fa-globe", WebSiteListComponentName, WebSitesApiName, "/api/webserver/websites?application_pool.id={appPoolId}"),
    new ComponentReference(AppPoolsModuleName, "fa fa-cogs", AppPoolComponentName, "app_pools", "/api/webserver/application-pools"),
    new ComponentReference(WebAppsModuleName, "fa fa-code", WebAppListComponentName, "webapps", "/api/webserver/webapps?website.id={websiteid}&application_pool.id={apppoolid}"),
    new ComponentReference("Virtual Directories", "fa fa-folder-o", VdirListComponentName, "vdirs", "/api/webserver/virtual-directories?website.id={siteId}&webapp.id={appId}"),
    new ComponentReference("Authentication", "fa fa-sign-in", AuthenticationComponentName, "authentication", "/api/webserver/authentication/{id}"),
    new ComponentReference("Authorization", "fa fa-user-o", AuthorizationComponentName, "authorization", "/api/webserver/authorization/{id}"),
    new ComponentReference(CertificatesModuleName, "fa fa-lock", CertificatesComponentName, "certificates", "/api/certificates"),
    new ComponentReference("Central Certificate Store", "fa fa-certificate", CentralCertificateComponentName, "central_certificates", "/api/webserver/centralized-certificates/{id}"),
    new ComponentReference("Default Documents", "fa fa-file-text-o", DefaultDocumentsComponentName, "default_document", "/api/webserver/default-documents/{id}"),
    new ComponentReference("Directory Browsing", "fa fa-folder-open-o", DirectoryBrowsingComponentName, "directory_browsing", "/api/webserver/directory-browsing/{id}"),
    new ComponentReference(WebFilesModuleName, "fa fa-files-o", WebFilesComponentName, FilesApiName, "/api/webserver/files/{id}"),
    new ComponentReference("IP Restrictions", "fa fa-ban", IpRestrictionsComponentName, "ip_restrictions", "/api/webserver/ip-restrictions/{id}"),
    new ComponentReference("Logging","fa fa-pencil", LoggingComponentName, "logging","/api/webserver/logging/{id}"),
    new ComponentReference("Mime Maps", "fa fa-arrows-h", MimeMapsComponentName, "static_content", "/api/webserver/static-content/{id}"),
    new ComponentReference("Monitoring", "fa fa-medkit", MonitoringComponentName, "monitoring", "/api/webserver/monitoring/{id}"),
    new ComponentReference("Modules", "fa fa-th", ModulesComponentName, "modules", "/api/webserver/http-modules/{id}"),
    new ComponentReference("Response Compression", "fa fa-compress", CompressionComponentName, "response_compression", "/api/webserver/http-response-compression/{id}"),
    new ComponentReference("Request Filtering", "fa fa-filter", RequestFilteringComponentName, "request_filtering", "/api/webserver/http-request-filtering/{id}"),
    new ComponentReference("Response Headers", "fa fa-arrow-down", HttpResponseHeadersComponentName, "response_headers", "/api/webserver/http-response-headers/{id}"),
    new ComponentReference("Request Tracing", "fa fa-flag-o", RequestTracingComponentName, "request_tracing", "/api/webserver/http-request-tracing/{id}"),
    new ComponentReference("Static Content", "fa fa-file-o", StaticContentComponentName, "static_content", "/api/webserver/static-content/{id}"),
    new ComponentReference("Url Rewrite", "fa fa-exchange", UrlRewriteComponentName, "url_rewrite", "/api/webserver/url-rewrite/{id}"),
    new ComponentReference(FileSystemModuleName, "fa fa-files-o", FilesComponentName, "files", "/api/files/{id}"),
]
