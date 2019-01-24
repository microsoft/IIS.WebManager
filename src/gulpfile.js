"use strict";

const gulp = require('gulp');
const gutil = require('gulp-util');
const clean = require('gulp-clean');
const gulpTslint = require('gulp-tslint');
const tslint = require('tslint');
const inlineNg2Template = require('gulp-inline-ng2-template');
const spawn = require('child_process').spawn;
const gulpPsCode = require('./gulps/gulp-ps-code');
const gulpResJson = require('./gulps/gulp-resjson');
const gulpSvgCode = require('./gulps/gulp-svg-code');
const gulpMergeJsonInFolders = require('./gulps/gulp-merge-json-in-folders');
const gulpLicense = require('./tools/gulp-license');
const through = require('through');
const Vinyl = require('vinyl');

gulp.task('license', () => {
    return gulp.src('app/**/*.*')
        .pipe(gulpLicense((fileType) => {    
            switch (fileType) {
                case '.ts': {
                    return '// Copyright (c) Microsoft Corporation. All rights reserved.\n// Licensed under the MIT License.\n\r';
                }
                case '.html': {
                    return '<!-- Copyright (c) Microsoft Corporation. All rights reserved.\n Licensed under the MIT License. -->\n\r';
                }
                default: {
                    return;
                }
            }
        }))
        .pipe(gulp.dest('app'));
});

gulp.task('clean', () => {
    return gulp.src(['../dist', '../bundle', 'generated', 'app/assets/strings', 'inlineSrc'], { allowEmpty: true, read: false })
        .pipe(clean({ force: true }));
});

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
    // merge the base json with the json file specific to the scenario
    return gulp.src(['angular.template.json', `angular.${scenario}.json`])
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

gulp.task('generate-powershell', () => {
    return gulp.src(['app/resources/*scripts/**/*.ps1'])
        .pipe(gulpPsCode({ name: 'powershell-scripts.ts', removeComments: true }))
        .pipe(gulp.dest('generated'));
});

gulp.task('generate-svg', () => {
    return gulp.src(['app/resources/icons/**/*.svg'])
        .pipe(gulpSvgCode())
        .pipe(gulp.dest('generated'));
});

gulp.task('generate-resjson-json', () => {
    return gulp.src(['app/resources/strings/**/*.resjson'])
        .pipe(gulpResJson({ json: true }))
        .pipe(gulp.dest('app/assets/strings'));
});

gulp.task('generate-resjson-interface', () => {
    return gulp.src(['app/resources/strings/**/*.resjson'])
        .pipe(gulpResJson({ typescript: 'interface' }))
        .pipe(gulp.dest('generated'));
});

gulp.task('merge-localized-json', () => {
    return gulp.src(['./node_modules/@microsoft/windows-admin-center-sdk/core/assets/strings'])
        .pipe(gulpMergeJsonInFolders({ src: 'app/assets/strings' }))
        .pipe(gulp.dest('app/assets/strings'));
});

gulp.task('generate-resjson', gulp.series(gulp.parallel('generate-resjson-json', 'generate-resjson-interface'), 'merge-localized-json'), () => null);

gulp.task('generate', gulp.series('generate-angular-json', 'generate-powershell', 'generate-svg', 'generate-resjson'), () => null);

gulp.task('lint', () => {
    var program = tslint.Linter.createProgram("app/tsconfig.json");
    return gulp.src('app/**/*.ts')
        .pipe(gulpTslint({ program }))
        .pipe(gulpTslint.report({
            "emitError": true,
            "reportLimit": 0,
            "summarizeFailureOutput": true
        }));
});

gulp.task('inline', function() {
    return gulp.src('app/**/*.ts')
        .pipe(inlineNg2Template({ useRelativePaths: true }))
        .pipe(gulp.dest('inlineSrc'));
});

gulp.task('copy', () => {
    return gulp.src(['./app/**/*.json', './app/**/*.d.ts', './app/assets/**/*.*'], { base: '.' })
        .pipe(gulp.dest('../dist'));
});

gulp.task('bundle', () => {
    var args = process.argv.slice(3);
    args.unshift('build');
    let proc = spawn('ng.cmd', args);
    proc.stdout.on('data', function (data) { gutil.log(data.toString()); });
    proc.stderr.on('data', function (data) { gutil.log(data.toString()); });
    // cmd.on('exit', function (code) { cb(); });
    return proc
});

gulp.task('serve', () => {
    var args = process.argv.slice(3);
    args.unshift('serve');
    let proc = spawn('ng.cmd', args);
    proc.stdout.on('data', function (data) { gutil.log(data.toString()); });
    proc.stderr.on('data', function (data) { gutil.log(data.toString()); });
    // cmd.on('exit', function (code) { cb(); });
    return proc
});

gulp.task('build', gulp.series('clean', 'generate', 'copy', 'bundle'), () => null);
