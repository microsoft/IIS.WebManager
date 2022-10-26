export const SETTINGS = {
    Version: "3.0.0",
    APIVersion: "2.3.0",
    APISetupVersion: "2.3.0",
    DotnetFrameworkVersion: "2.1.* (x64)",
    AspnetSharedFrameworkVersion: "2.1.* (x64)",
    APIDownloadUrl: "http://go.microsoft.com/fwlink/?LinkId=829373",
    IISAdminApiServiceName: "Microsoft IIS Administration",
    GATrack: "UA-XXXXXXXX-X",
}

export const WebServerRoute: string = "webserver";

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
export const WebServerModuleIcon = "sme-icon sme-icon-server"
export const WebSitesModuleName = "Web Sites"
export const WebSiteModuleIcon = "sme-icon sme-icon-globe"
export const WebAppsModuleName = "Web Applications"
export const WebAppModuleIcon = "sme-icon sme-icon-embed"
export const AppPoolsModuleName = "Application Pools"
export const AppPoolModuleIcon = "sme-icon sme-icon-processing"
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
    new ComponentReference(WebSitesModuleName, WebSiteModuleIcon, WebSiteListComponentName, WebSitesApiName, "/api/webserver/websites?application_pool.id={appPoolId}"),
    new ComponentReference(AppPoolsModuleName, AppPoolModuleIcon, AppPoolComponentName, "app_pools", "/api/webserver/application-pools"),
    new ComponentReference(WebAppsModuleName, WebAppModuleIcon, WebAppListComponentName, "webapps", "/api/webserver/webapps?website.id={websiteid}&application_pool.id={apppoolid}"),
    new ComponentReference("Virtual Directories", "sme-icon sme-icon-folder", VdirListComponentName, "vdirs", "/api/webserver/virtual-directories?website.id={siteId}&webapp.id={appId}"),
    new ComponentReference("Authentication", "sme-icon sme-icon-permissions", AuthenticationComponentName, "authentication", "/api/webserver/authentication/{id}"),
    new ComponentReference("Authorization", "sme-icon sme-icon-contact", AuthorizationComponentName, "authorization", "/api/webserver/authorization/{id}"),
    new ComponentReference(CertificatesModuleName, "sme-icon sme-icon-lock", CertificatesComponentName, "certificates", "/api/certificates"),
    new ComponentReference("Central Certificate Store", "sme-icon sme-icon-certificateManager", CentralCertificateComponentName, "central_certificates", "/api/webserver/centralized-certificates/{id}"),
    new ComponentReference("Default Documents", "sme-icon sme-icon-companyDirectory", DefaultDocumentsComponentName, "default_document", "/api/webserver/default-documents/{id}"),
    new ComponentReference("Directory Browsing", "sme-icon sme-icon-openFolderHorizontal", DirectoryBrowsingComponentName, "directory_browsing", "/api/webserver/directory-browsing/{id}"),
    new ComponentReference(WebFilesModuleName, "sme-icon sme-icon-fileExplorer", WebFilesComponentName, FilesApiName, "/api/webserver/files/{id}"),
    new ComponentReference(FileSystemModuleName, "sme-icon sme-icon-fileExplorer", FilesComponentName, "files", "/api/files/{id}"),
    new ComponentReference("IP Restrictions", "sme-icon sme-icon-blocked", IpRestrictionsComponentName, "ip_restrictions", "/api/webserver/ip-restrictions/{id}"),
    new ComponentReference("Logging","sme-icon sme-icon-edit", LoggingComponentName, "logging","/api/webserver/logging/{id}"),
    new ComponentReference("Mime Maps", "sme-icon sme-icon-switch", MimeMapsComponentName, "static_content", "/api/webserver/static-content/{id}"),
    new ComponentReference("Monitoring", "sme-icon sme-icon-sDNMonitoring", MonitoringComponentName, "monitoring", "/api/webserver/monitoring/{id}"),
    new ComponentReference("Modules", "sme-icon sme-icon-registrayEditor", ModulesComponentName, "modules", "/api/webserver/http-modules/{id}"),
    new ComponentReference("Response Compression", "sme-icon sme-icon-backToWindow", CompressionComponentName, "response_compression", "/api/webserver/http-response-compression/{id}"),
    new ComponentReference("Request Filtering", "sme-icon sme-icon-filter", RequestFilteringComponentName, "request_filtering", "/api/webserver/http-request-filtering/{id}"),
    new ComponentReference("Response Headers", "sme-icon sme-icon-down", HttpResponseHeadersComponentName, "response_headers", "/api/webserver/http-response-headers/{id}"),
    new ComponentReference("Request Tracing", "sme-icon sme-icon-flag", RequestTracingComponentName, "request_tracing", "/api/webserver/http-request-tracing/{id}"),
    new ComponentReference("Static Content", "sme-icon sme-icon-customList", StaticContentComponentName, "static_content", "/api/webserver/static-content/{id}"),
    new ComponentReference("Url Rewrite", "sme-icon sme-icon-link", UrlRewriteComponentName, "url_rewrite", "/api/webserver/url-rewrite/{id}"),
]
