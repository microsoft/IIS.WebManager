(function () {
    System.config({
        defaultJSExtensions: true,
        map: {

            // angular bundles
            '@angular/core': 'node_modules/@angular/core/bundles/core.umd.js',
            '@angular/common': 'node_modules/@angular/common/bundles/common.umd.js',
            '@angular/compiler': 'node_modules/@angular/compiler/bundles/compiler.umd.js',
            '@angular/platform-browser': 'node_modules/@angular/platform-browser/bundles/platform-browser.umd.js',
            '@angular/platform-browser-dynamic': 'node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
            '@angular/http': 'node_modules/@angular/http/bundles/http.umd.js',
            '@angular/router': 'node_modules/@angular/router/bundles/router.umd.js',
            '@angular/forms': 'node_modules/@angular/forms/bundles/forms.umd.js',
            '@angular/upgrade': 'node_modules/@angular/upgrade/bundles/upgrade.umd.js',

            // other libraries
            'rxjs': 'node_modules/rxjs',
            'ts': 'node_modules/plugin-typescript@4.0.10/lib/plugin.js',
            'typescript': 'node_modules/typescript@2.0.2/lib/typescript.js',

            'angulartics2': 'node_modules/angulartics2'
        },
        packages: {
            defaultExtension: 'js',
            app: {
                format: 'cjs',
                defaultExtension: 'v' + SETTINGS.version + '.js'
            },
            angulartics2: {
                main: 'index',
                defaultExtension: 'v' + SETTINGS.version + '.js'
            }
        }
    });

    // Activate loading indicator
    $(document).ready(function () {
        window.setTimeout(function () {
            $(".loader").addClass("active");
        }, 1)
    });

    //
    // angulartics
    window.ga = null;
    window._gaq = null;

    System.import('app/main/main').catch(function (err) {
        console.error(err);
    });
})();