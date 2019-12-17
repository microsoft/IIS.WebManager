var SETTINGS = {
    "version": "2.2.7",
    "api_version": "2.3.0",
    "api_setup_version": "2.3.0",
    "api_download_url": "http://go.microsoft.com/fwlink/?LinkId=829373",
    "ga_track": "UA-XXXXXXXX-X",
}

var GLOBAL_MODULES = [
    {
        "name": "Web Sites",
        "ico": "fa fa-globe",
        "component_name": "WebSiteListComponent",
        "module": "app/webserver/websites/websites.module#WebSitesModule",
        "api_name": "websites",
        "api_path": "/api/webserver/websites?application_pool.id={appPoolId}"
    },
    {
        "name": "Application Pools",
        "ico": "fa fa-cogs",
        "component_name": "AppPoolListComponent",
        "module": "app/webserver/app-pools/app-pools.module#AppPoolsModule",
        "api_name": "app_pools",
        "api_path": "/api/webserver/application-pools"
    },
    {
        "name": "Files",
        "ico": "fa fa-files-o",
        "component_name": "WebFilesComponent",
        "module": "app/webserver/files/webfiles.module#WebFilesModule",
        "api_name": "files",
        "api_path": "/api/webserver/files/{id}"
    },
    {
        "name": "Web Applications",
        "ico": "fa fa-code",
        "component_name": "WebAppListComponent",
        "module": "app/webserver/webapps/webapps.module#WebAppsModule",
        "api_name": "webapps",
        "api_path": "/api/webserver/webapps?website.id={websiteid}&application_pool.id={apppoolid}"
    },
    {
        "name": "Virtual Directories",
        "ico": "fa fa-folder-o",
        "component_name": "VdirListComponent",
        "module": "app/webserver/vdirs/vdirs.module#VdirsModule",
        "api_name": "vdirs",
        "api_path": "/api/webserver/virtual-directories?website.id={siteId}&webapp.id={appId}"
    },
    {
        "name": "Authentication",
        "ico": "fa fa-sign-in",
        "component_name": "AuthenticationComponent",
        "module": "app/webserver/authentication/authentication.module#AuthenticationModule",
        "api_name": "authentication",
        "api_path": "/api/webserver/authentication/{id}"
    },
    {
        "name": "Authorization",
        "ico": "fa fa-user-o",
        "component_name": "AuthorizationComponent",
        "module": "app/webserver/authorization/authorization.module#AuthorizationModule",
        "api_name": "authorization",
        "api_path": "/api/webserver/authorization/{id}"
    },
    {
        "name": "Certificates",
        "ico": "fa fa-lock",
        "component_name": "CertificatesComponent",
        "module": "app/certificates/certificates.module#CertificatesModule",
        "api_name": "certificates",
        "api_path": "/api/certificates"
    },
    {
        "name": "Central Certificate Store",
        "ico": "fa fa-certificate",
        "component_name": "CentralCertificateComponent",
        "module": "app/webserver/central-certificates/central-certificate.module#CentralCertificateModule",
        "api_name": "central_certificates",
        "api_path": "/api/webserver/centralized-certificates/{id}"
    },
    {
        "name": "Default Documents",
        "ico": "fa fa-file-text-o",
        "component_name": "DefaultDocumentsComponent",
        "module": "app/webserver/default-documents/default-documents.module#DefaultDocumentsModule",
        "api_name": "default_document",
        "api_path": "/api/webserver/default-documents/{id}"
    },
    {
        "name": "Directory Browsing",
        "ico": "fa fa-folder-open-o",
        "component_name": "DirectoryBrowsingComponent",
        "module": "app/webserver/directory-browsing/directory-browsing.module#DirectoryBrowsingModule",
        "api_name": "directory_browsing",
        "api_path": "/api/webserver/directory-browsing/{id}"
    },
    {
        "name": "IP Restrictions",
        "ico": "fa fa-ban",
        "component_name": "IpRestrictionsComponent",
        "module": "app/webserver/ip-restrictions/ip-restrictions.module#IpRestrictionsModule",
        "api_name": "ip_restrictions",
        "api_path": "/api/webserver/ip-restrictions/{id}"
    },
    {
        "name": "Logging",
        "ico": "fa fa-pencil",
        "component_name": "LoggingComponent",
        "module": "app/webserver/logging/logging.module#LoggingModule",
        "api_name": "logging",
        "api_path": "/api/webserver/logging/{id}"
    },
    {
        "name": "Mime Maps",
        "ico": "fa fa-arrows-h",
        "component_name": "MimeMapsComponent",
        "module": "app/webserver/mime-maps/mime-maps.module#MimeMapsModule",
        "api_name": "static_content",
        "api_path": "/api/webserver/static-content/{id}"
    },
    {
        "name": "Monitoring",
        "ico": "fa fa-medkit",
        "component_name": "MonitoringComponent",
        "module": "app/webserver/monitoring/monitoring.module#MonitoringModule",
        "api_name": "monitoring",
        "api_path": "/api/webserver/monitoring/{id}"
    },
    {
        "name": "Modules",
        "ico": "fa fa-th",
        "component_name": "ModulesComponent",
        "module": "app/webserver/modules/modules.module#ModulesModule",
        "api_name": "modules",
        "api_path": "/api/webserver/http-modules/{id}"
    },
    {
        "name": "Response Compression",
        "ico": "fa fa-compress",
        "component_name": "CompressionComponent",
        "module": "app/webserver/compression/compression.module#CompressionModule",
        "api_name": "response_compression",
        "api_path": "/api/webserver/http-response-compression/{id}"
    },
    {
        "name": "Request Filtering",
        "ico": "fa fa-filter",
        "component_name": "RequestFilteringComponent",
        "module": "app/webserver/request-filtering/request-filtering.module#RequestFilteringModule",
        "api_name": "request_filtering",
        "api_path": "/api/webserver/http-request-filtering/{id}"
    },
    {
        "name": "Response Headers",
        "ico": "fa fa-arrow-down",
        "component_name": "HttpResponseHeadersComponent",
        "module": "app/webserver/http-response-headers/http-response-headers.module#HttpResponseHeadersModule",
        "api_name": "response_headers",
        "api_path": "/api/webserver/http-response-headers/{id}"
    },
    {
        "name": "Request Tracing",
        "ico": "fa fa-flag-o",
        "component_name": "RequestTracingComponent",
        "module": "app/webserver/request-tracing/request-tracing.module#RequestTracingModule",
        "api_name": "request_tracing",
        "api_path": "/api/webserver/http-request-tracing/{id}"
    },
    {
        "name": "Static Content",
        "ico": "fa fa-file-o",
        "component_name": "StaticContentComponent",
        "module": "app/webserver/static-content/static-content.module#StaticContentModule",
        "api_name": "static_content",
        "api_path": "/api/webserver/static-content/{id}"
    },
    {
        "name": "Url Rewrite",
        "ico": "fa fa-exchange",
        "component_name": "UrlRewriteComponent",
        "module": "app/webserver/url-rewrite/url-rewrite.module#UrlRewriteModule",
        "api_name": "url_rewrite",
        "api_path": "/api/webserver/url-rewrite/{id}"
    }
]