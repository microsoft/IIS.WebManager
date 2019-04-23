"use strict";

const gulp = require('gulp');
const gutil = require('gulp-util');
const jasmine = require('gulp-jasmine');
const reporters = require('jasmine-reporters');
const terminalReporter = require('jasmine-terminal-reporter');
const clean = require('gulp-clean');
const tslint = require('gulp-tslint');
const argv = require('yargs').argv;
const watch = require('gulp-watch');
const batch = require('gulp-batch');
const plumber = require('gulp-plumber');
const inlineNg2Template = require('gulp-inline-ng2-template');
const childProcess = require('child_process');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const manifestResource = require('@microsoft/windows-admin-center-sdk/tools/gulp-manifest-resource');
const gulpResJson = require('@microsoft/windows-admin-center-sdk/tools/gulp-resjson');
const gulpMergeJsonInFolders = require('@microsoft/windows-admin-center-sdk/tools/gulp-merge-json-in-folders');
const psCim = require('@microsoft/windows-admin-center-sdk/tools/gulp-ps-cim');
const psCode = require('@microsoft/windows-admin-center-sdk/tools/gulp-ps-code');
const psModule = require('@microsoft/windows-admin-center-sdk/tools/gulp-ps-module');
const psManifest = require('@microsoft/windows-admin-center-sdk/tools/gulp-ps-manifest');
const gulpManifestValidator = require('@microsoft/windows-admin-center-sdk/tools/gulp-manifest-validator');
const ngc = require('@angular/compiler-cli/src/main');
const through = require('through');
const Vinyl = require('vinyl');

const args = {
    verbose: !!argv['verbose'],
    junit: !!argv['junit']
};

// Check if obj is javascript primitive type
function isPrimitive(obj) {
    return (obj !== Object(obj));
}

// Merge javascript json objects. We are not using gulp-merge-json currently because it messed up the order of css files
function merge(obj1, obj2) {
    if (Array.isArray(obj2)) {
        // array can only merge with array
        if (Array.isArray(obj1)) {
            // If array is a primitive array, just concat
            // Note that we assume that both array's element are primitive
            // by just sampling the first element of second list
            if (obj2.length > 0) {
                let test = obj2[0]
                if (isPrimitive(test)) {
                    return obj1.concat(obj2)
                }
            }
            // merge elements of same indices
            for (let i = 0; i < obj2.length; i++) {
                if (i >= obj1.length) {
                    // if reached EOL for first array, just copy the rest of the second array over
                    while (i < obj2.length) {
                        obj1.push(obj2[i])
                        i++
                    }
                } else {
                    obj1[i] = merge(obj1[i], obj2[i])
                }
            }
        } else {
            throw `lhs is not array, rhs is`
        }
    } else {
        if (Array.isArray(obj1)) {
            throw `lhs is array, rhs is not`
        } else {
            for (let key in obj2) {
                // merge properties of the same name
                if (obj1[key]) {
                    obj1[key] = merge(obj1[key], obj2[key])
                } else {
                    obj1[key] = obj2[key]
                }
            }
        }
    }
    return obj1
}


gulp.task('generate-angular-json', (_) => {
    var override = process.argv.slice(3).find(function(s, _, __) { return s.startsWith('--configuration=') || s.startsWith('-c=') })
    var scenario = override ? override.split('=').pop().split('.')[0] : 'site'
    var mode = override && override.trim().endsWith('prod') ? 'prod' : 'debug'
    // merge the base json with the json file specific to the scenario
    return gulp.src(['angular.common.json', `angular.${scenario}.json`, `angular.${mode}.json`])
        .pipe(function() {
            let merged = {}
            function parseAndMerge(file) {
                let data = file.contents.toString('utf8')
                let obj = JSON.parse(data)
                merged = merge(merged, obj)
            }
            function endStream() {
                this.emit('data', new Vinyl({
                    path: 'angular.json',
                    contents: Buffer.from(JSON.stringify(merged, null, 2)),
                })),
                this.emit('end')
            }
            return through(parseAndMerge, endStream)
        }())
        .pipe(gulp.dest('.'))
});

gulp.task('clean', () => {
    return gulp.src(['dist', 'app/generated', 'inlineDist', 'inlineSrc'], { read: false, allowEmpty: true })
        .pipe(clean({ force: true }));
});

gulp.task('lint', () => {
    return gulp.src(['app/**/*.ts', '!app/generated/**/*.*'])
        .pipe(tslint())
        .pipe(tslint.report({
            "emitError": true,
            "reportLimit": 0,
            "summarizeFailureOutput": true
        }))
});

gulp.task('validate', () => {
    return gulp.src('app/resources/manifest.json')
        .pipe(gulpManifestValidator());
});

gulp.task('generate-resjson-json', () => {
    return gulp.src(['app/resources/strings/**/*.resjson'])
        .pipe(gulpResJson({ json: true }))
        .pipe(gulp.dest('app/assets/strings'));
});

gulp.task('generate-resjson-json-localized', () => {
    return gulp.src('loc/output/**/*.resjson')
        .pipe(gulpResJson({ json: true, localeOffset: 1 }))
        .pipe(gulp.dest('app/assets/strings'));
});

gulp.task('generate-resjson-interface', () => {
    return gulp.src('app/resources/strings/**/*.resjson')
        .pipe(gulpResJson({ typescript: 'interface' }))
        .pipe(gulp.dest('app/generated'));
});

gulp.task('merge-localized-json', () => {
    return gulp.src('./node_modules/@microsoft/windows-admin-center-sdk/**/assets/strings')
        .pipe(gulpMergeJsonInFolders({ src: './app/assets/strings' }))
        .pipe(gulp.dest('app/assets/strings'));
});

gulp.task('update-manifest-resource', () => {
    return gulp.src(['app/resources/strings/strings.resjson', 'loc/output/**/*.resjson'])
        .pipe(manifestResource({ resourceName: '{!company-package-id}', manifest: './app/resources/manifest.json' }))
        .pipe(gulp.dest('.'));
});

gulp.task('generate-resjson',
    gulp.series(
        gulp.parallel(
            'generate-resjson-json',
            'generate-resjson-json-localized',
            'generate-resjson-interface'),
        'merge-localized-json',
        'update-manifest-resource'));

// Configure PowerShell module information.
const powerShellModule = {
    name: '{!company-name}.{!module-name}',
    guid: '{!guid}',
    list: [
        'src',
        'node_modules/@microsoft/windows-admin-center-sdk'
    ]
};

gulp.task('generate-powershell-code', () => {
    return gulp.src(['app/resources/scripts/**/*.ps1', 'app/generated/scripts/**/*.ps1'])
        .pipe(psCode({ powerShellModuleName: powerShellModule.name }))
        .pipe(gulp.dest('app/generated/'));
});        

gulp.task('generate-powershell-module', () => {
    const powerShellModulePaths = [];
    powerShellModule.list.forEach(item => {
        powerShellModulePaths.push(item + '/resources/scripts/**/*.ps1');
        powerShellModulePaths.push(item + '/generated/scripts/**/*.ps1'); 
    });
    return gulp.src(powerShellModulePaths)
        .pipe(psModule(powerShellModule))
        .pipe(gulp.dest('../dist/powershell-module/' + powerShellModule.name));
});

gulp.task('generate-powershell-manifest', () => {
    // required for manifest where add-connection script or dynamic tool script are used.
    return gulp.src(['app/resources/scripts/**/*.ps1'])
        .pipe(psManifest({ powerShellModuleName: powerShellModule.name, manifest: 'app/resources/manifest.json' }))
        .pipe(gulp.dest('.'));
});

gulp.task('generate-powershell', gulp.series('generate-angular-json', 'generate-powershell-code', 'generate-powershell-module', 'generate-powershell-manifest'));

gulp.task('generate', gulp.series('generate-powershell', 'generate-resjson'));

gulp.task('inline-source', () => {
    return gulp.src('./app/**/*.ts')
        .pipe(inlineNg2Template({ useRelativePaths: true }))
        .pipe(gulp.dest('inlineSrc'));
});

gulp.task('inline-compile', cb => {
    var errors = [];
    ngc.main(['-p', './tsconfig.inline.json'], (consoleError) => { errors.push(consoleError); });
    errors.length > 0 ? cb(errors.join('\n')) : cb();
});

gulp.task('inline-dist', () => {
    return gulp.src('inlineDist/inlineSrc/**/*.*')
        .pipe(gulp.dest('../dist'));    
});

gulp.task('compile', gulp.series('inline-source', 'inline-compile', 'inline-dist'));

gulp.task('copy', () => {
    return gulp.src(['app/**/*.json', 'app/**/*.d.ts', 'app/**/*.ps1', 'app/assets/**/*.*'], { base: 'app' })
        .pipe(gulp.dest('../dist'));
});

gulp.task('bundle', cb => {
    var args = process.argv.slice(3);
    args.unshift('build', "microsoft.iis.web-manager");
    // '--aot', '--progress=false', '--extract-licenses=false', '--output-hashing=all'];
    // if (argv['verbose']) { args.push('--verbose'); }
    // if (argv['prod']) { args.push('--prod'); }
    // if (argv['watch']) { args.push('--watch'); }
    gutil.log('ng.cmd', args.join(' '));
    var errors = [];
    var cmd = childProcess.spawn('ng.cmd', args);
    cmd.stdout.on('data', function (data) { gutil.log(data.toString()); });
    cmd.stderr.on('data', function (data) { gutil.log(data.toString()); errors.push(data.toString()); });
    cmd.on('exit', function (code) {
        var error = false; 
        errors.forEach(err => { if (err.trim().toUpperCase().startsWith('ERROR')) { error = true } });
        error ? cb(errors.join('\n')) : cb();
    });
});

gulp.task('serve-ng', (cb) => {
    var args = process.argv.slice(3);
    args.splice(0, 0, 'serve');
    gutil.log(args.join(' '));
    var cmd = childProcess.spawn('ng.cmd', args);
    cmd.stdout.on('data', function (data) { gutil.log(data.toString()); });
    cmd.stderr.on('data', function (data) { gutil.log(data.toString()); });
    cmd.on('exit', function (code) { cb(); });
});

gulp.task('serve', gulp.series('generate', 'serve-ng'));

// gulp.task('test', () => {
//     let reporter = [];
//     if (args.junit) {
//         reporter.push(new reporters.JUnitXmlReporter({
//             savePath: 'unitTests'
//         }));
//     } else {
//         reporter.push(new terminalReporter({
//             isVerbose: args.verbose,
//             showColors: true,
//             includeStackTrace: args.verbose
//         }));
//     }

//     return gulp.src('../dist/**/*.test.js')
//         .pipe(jasmine({
//             verbose: args.verbose,
//             reporter: reporter,
//             includeStackTrace: args.verbose,
//             config: {
//                 helpers: ['../dist/**/*.test.helper.js'],
//                 stopSpecOnExpectationFailure: true
//             }
//         }))
//         .on('jasmineDone', (output) => {
//             if (args.junit) {
//                 gutil.log(`Tests ${output ? gutil.colors.green('Passed') : gutil.colors.yellow('Failed')}.`);
//                 gutil.log(`Full results at ${process.cwd()}\\unittests\\junitresults.xml`);
//             }
//         });
// });

// const config = {
//     e2e: {
//         src: '/e2e',
//         dest: '../dist/e2e',
//         commonCodeFolder: '/node_modules/@microsoft/windows-admin-center-sdk/e2e',
//         generatedStringsFolder: 'app/assets/strings',
//         assetsFolder: '../dist/assets',
//         jasmine: {
//             src: '../dist/e2e/specs/*.js',
//             options: {
//                 reporter: [ new reporters.JUnitXmlReporter( { savePath: __dirname + "/scenariotestresults", consolidateAll: true } )],
//                 timeout: 180000 // 3 minutes.
//             }
//         },
//     }
// };

// gulp.task('e2e-clean', ['generate-resjson'], function () {
//     return gulp.src([__dirname + config.e2e.assetsFolder,
//     __dirname + config.e2e.dest,
//     __dirname + config.e2e.commonCodeFolder + '/**/*.js',
//     __dirname + config.e2e.commonCodeFolder + '/**/*.js.map',
//     __dirname + config.e2e.commonCodeFolder + '/**/*.d.ts'], { read: false })
//         .pipe(clean({ force: true }));
// });

// gulp.task('e2e-build-generated', ['e2e-clean'], function () {
//         return gulp.src(config.e2e.generatedStringsFolder + '/*.*', { base: 'src' })
//         .pipe(gulp.dest('../dist'));
// });

// gulp.task('e2e-build-common', ['e2e-build-generated'], function () {
//     var tsProject = ts.createProject(__dirname + config.e2e.commonCodeFolder + '/tsconfig.json');
//     return gulp.src([__dirname + config.e2e.commonCodeFolder + '/**/*.ts', '!' + __dirname + config.e2e.commonCodeFolder + '/**/*.d.ts'])
//         .pipe(sourcemaps.init())
//         .pipe(tsProject())
//         .pipe(sourcemaps.mapSources(function (sourcePath, file) {
//             var newPathSegments = sourcePath.replace('../../', '').split('/');
//             return newPathSegments[newPathSegments.length - 1];
//         }))
//         .pipe(sourcemaps.write('./'))
//         .pipe(gulp.dest(__dirname + config.e2e.commonCodeFolder));
// });

// gulp.task('e2e-build', ['e2e-build-common'], function () {
//     var tsProject = ts.createProject(__dirname + config.e2e.src + '/tsconfig.json');
//     return gulp.src([__dirname + config.e2e.src + '/**/*.ts', '!' + __dirname + config.e2e.src + '/**/*.d.ts'])
//         .pipe(sourcemaps.init())
//         .pipe(tsProject())
//         .pipe(sourcemaps.mapSources(function (sourcePath, file) {
//             var sourcePath = sourcePath.replace('../../', '');
//             var folderDepth = sourcePath.split('/').length;
//             var newPath = '';
//             for (var i = 0; i < folderDepth; i++) {
//                 newPath += '../';
//             }
//             newPath += '..' + config.e2e.src + '/' + sourcePath;
//             return newPath;
//         }))
//         .pipe(sourcemaps.write('./'))
//         .pipe(gulp.dest(__dirname + config.e2e.dest));
// });

// gulp.task('e2e-run', function () {
//     return gulp.src(config.e2e.jasmine.src)
//         .pipe(jasmine(config.e2e.jasmine.options))
//         .on('jasmineDone', (output) => {
//             if (args.junit) {
//                 gutil.log(`Tests ${output ? gutil.colors.green('Passed') : gutil.colors.yellow('Failed')}.`);
//                 gutil.log(`Full results at ${process.cwd()}\\unittests\\junitresults.xml`);
//             }
//         });
// });


// gulp.task('e2e', gulp.series('e2e-build', 'e2e-run'));


gulp.task('build', gulp.series('clean', // 'validate',
        'generate', // 'lint', 'compile',
        'copy',
        // 'test',
        'bundle'));