(function () {
    //
    // angulartics
    window.ga = null;
    window._gaq = null;

    // Activate loading indicator
    $(document).ready(function () {
        window.setTimeout(function () {
            $(".loader").addClass("active");
        }, 1)
    });

    $.get('./package.v' + SETTINGS.version + '.json', function (appData) {

        function ver(name) {

            if (appData.dependencies != null && appData.dependencies[name]) {
                return appData.dependencies[name];
            }

            return '0.0.0';
        }

        System.config({
            defaultJSExtensions: true,
            map: {

                // angular bundles
                '@angular/core': 'node_modules/@angular/core/bundles/core.umd.v' + ver('@angular/core') + '.js',
                '@angular/common': 'node_modules/@angular/common/bundles/common.umd.v' + ver('@angular/common') + '.js',
                '@angular/compiler': 'node_modules/@angular/compiler/bundles/compiler.umd.v' + ver('@angular/compiler') + '.js',
                '@angular/platform-browser': 'node_modules/@angular/platform-browser/bundles/platform-browser.umd.v' + ver('@angular/platform-browser') + '.js',
                '@angular/platform-browser-dynamic': 'node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.v' + ver('@angular/platform-browser-dynamic') + '.js',
                '@angular/http': 'node_modules/@angular/http/bundles/http.umd.v' + ver('@angular/http') + '.js',
                '@angular/router': 'node_modules/@angular/router/bundles/router.umd.v' + ver('@angular/router') + '.js',
                '@angular/forms': 'node_modules/@angular/forms/bundles/forms.umd.v' + ver('@angular/forms') + '.js',
                '@angular/upgrade': 'node_modules/@angular/upgrade/bundles/upgrade.umd.v' + ver('@angular/upgrade') + '.js',


                'chart.js': 'node_modules/chart.js/dist/chart.min.v' + ver('@angular/upgrade') + '.js',
                'ng2-charts': 'node_modules/ng2-charts/charts/charts.v' + ver('@angular/upgrade') + '.js',

                // other libraries
                'angulartics2': 'node_modules/angulartics2',
                'rxjs': 'node_modules/rxjs',
                'ts': 'node_modules/plugin-typescript@4.0.10/lib/plugin.v' + ver('ts') + '.js',
                'typescript': 'node_modules/typescript@2.0.2/lib/typescript.v' + ver('typescript') + '.js'
            },
            packages: {
                defaultExtension: 'js',
                app: {
                    format: 'cjs',
                    defaultExtension: 'v' + SETTINGS.version + '.js'
                },
                angulartics2: {
                    main: 'index',
                    defaultExtension: 'v' + ver('angulartics2') + '.js'
                },
                rxjs: {
                    defaultExtension: 'v' + ver('rxjs') + '.js'
                }
            }
        });

        System.import('app/main/main').catch(function (err) {
            console.error(err);
        });
    });
})();