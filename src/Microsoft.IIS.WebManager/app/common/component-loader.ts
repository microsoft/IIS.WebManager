import { Type, Compiler, ModuleWithComponentFactories } from '@angular/core'
import { WebSiteListComponentName,
    AppPoolComponentName,
    WebFilesComponentName,
    WebAppListComponentName,
    VdirListComponentName,
    AuthenticationComponentName,
    AuthorizationComponentName,
    CertificatesComponentName,
    CentralCertificateComponentName,
    DefaultDocumentsComponentName,
    DirectoryBrowsingComponentName,
    IpRestrictionsComponentName,
    LoggingComponentName,
    MimeMapsComponentName,
    MonitoringComponentName,
    ModulesComponentName,
    CompressionComponentName,
    RequestFilteringComponentName,
    HttpResponseHeadersComponentName,
    RequestTracingComponentName,
    StaticContentComponentName,
    UrlRewriteComponentName,
    ComponentReference,
    FilesComponentName,
    UploadComponentName,
    WarningComponentName,
    AppModuleName
} from '../main/settings'


export class ComponentLoader {
    public static async LoadAsync(compiler: Compiler, component: ComponentReference): Promise<ModuleWithComponentFactories<{}>> {
        // cannot assign module type as property of ComponentReference to avoid circular reference
        var moduleType : Promise<Type<{}>> = null
        switch (component.component_name) {
            case WebSiteListComponentName:
                moduleType = import('../webserver/websites/websites.module').then(m => {
                    return m.WebSitesModule
                }) ; break;

            case AppPoolComponentName:
                moduleType = import('../webserver/app-pools/app-pools.module').then(m => {
                    return m.AppPoolsModule
                }) ; break;

            case WebFilesComponentName:
                moduleType = import('../webserver/files/webfiles.module').then(m => {
                    return m.WebFilesModule
                }) ; break;

            case WebAppListComponentName:
                moduleType = import('../webserver/webapps/webapps.module').then(m => {
                    return m.WebAppsModule
                }) ; break;

            case VdirListComponentName:
                moduleType = import('../webserver/vdirs/vdirs.module').then(m => {
                    return m.VdirsModule
                }) ; break;

            case AuthenticationComponentName:
                moduleType = import('../webserver/authentication/authentication.module').then(m => {
                    return m.AuthenticationModule
                }) ; break;

            case AuthorizationComponentName:
                moduleType = import('../webserver/authorization/authorization.module').then(m => {
                    return m.AuthorizationModule
                }) ; break;

            case CertificatesComponentName:
                moduleType = import('../certificates/certificates.module').then(m => {
                    return m.CertificatesModule
                }) ; break;

            case CentralCertificateComponentName:
                moduleType = import('../webserver/central-certificates/central-certificate.module').then(m => {
                    return m.CentralCertificateModule
                }) ; break;

            case DefaultDocumentsComponentName:
                moduleType = import('../webserver/default-documents/default-documents.module').then(m => {
                    return m.DefaultDocumentsModule
                }) ; break;

            case DirectoryBrowsingComponentName:
                moduleType = import('../webserver/directory-browsing/directory-browsing.module').then(m => {
                    return m.DirectoryBrowsingModule
                }) ; break;

            case IpRestrictionsComponentName:
                moduleType = import('../webserver/ip-restrictions/ip-restrictions.module').then(m => {
                    return m.IpRestrictionsModule
                }) ; break;

            case LoggingComponentName:
                moduleType = import('../webserver/logging/logging.module').then(m => {
                    return m.LoggingModule
                }) ; break;

            case MimeMapsComponentName:
                moduleType = import('../webserver/mime-maps/mime-maps.module').then(m => {
                    return m.MimeMapsModule
                }) ; break;

            case MonitoringComponentName:
                moduleType = import('../webserver/monitoring/monitoring.module').then(m => {
                    return m.MonitoringModule
                }) ; break;

            case ModulesComponentName:
                moduleType = import('../webserver/modules/modules.module').then(m => {
                    return m.ModulesModule
                }) ; break;

            case CompressionComponentName:
                moduleType = import('../webserver/compression/compression.module').then(m => {
                    return m.CompressionModule
                }) ; break;

            case RequestFilteringComponentName:
                moduleType = import('../webserver/request-filtering/request-filtering.module').then(m => {
                    return m.RequestFilteringModule
                }) ; break;

            case HttpResponseHeadersComponentName:
                moduleType = import('../webserver/http-response-headers/http-response-headers.module').then(m => {
                    return m.HttpResponseHeadersModule
                }) ; break;

            case RequestTracingComponentName:
                moduleType = import('../webserver/request-tracing/request-tracing.module').then(m => {
                    return m.RequestTracingModule
                }) ; break;

            case StaticContentComponentName:
                moduleType = import('../webserver/static-content/static-content.module').then(m => {
                    return m.StaticContentModule
                }) ; break;

            case UrlRewriteComponentName:
                moduleType = import('../webserver/url-rewrite/url-rewrite.module').then(m => {
                    return m.UrlRewriteModule
                }) ; break;

            case FilesComponentName:
                moduleType = import('../files/files.module').then(m => {
                    return m.FilesModule
                }) ; break;

            case UploadComponentName:
                moduleType = import('../files/upload.component').then(m => {
                    return m.Module
                }) ; break;

            case WarningComponentName:
                moduleType = import('../notification/warning.component').then(m => {
                return m.Module
            }) ; break;

            case AppModuleName:
                moduleType = import('../main/app.module').then(m => {
                    return m.AppModule
                }) ; break;

            default:
                throw new Error("Unexpected component " + component.component_name)
        }
        return moduleType.then(m => {
            return compiler.compileModuleAndAllComponentsAsync(m)
        })
    }
}
