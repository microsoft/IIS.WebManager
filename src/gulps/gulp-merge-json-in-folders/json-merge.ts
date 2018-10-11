const fs = require('fs');
const fsPath = require('path');
const readlineSync = require('readline-sync');
const gutil = require('gulp-util');
const Vinyl = require('vinyl');

export interface Options {
    // source folder
    src: string;
}

export class JsonMerge {
    /**
     * Recursively merges JSON files with the same name and same subPath from the sourceFolders into the JSON files
     * in the targetFolderPath.
     *
     * @example
     *  src/assets/resources/strings/ <- targetFolderPath
     *                              strings.json
     *                              es/strings.json
     *                              pt/strings.json
     * [
     *     'node_modules/@msft-sme/core/dist/assets/resources/strings',
     *     'node_modules/@msft-sme/ng2/dist/assets/resources/strings'
     * ] <- sourceFoldersPath
     *
     *                               src/assets/resources/strings/strings.json contents are merged with the contents of
     *  node_modules/@msft-sme/core/dist/assets/resources/strings/strings.json and
     *  node_modules/@msft-ng2/core/dist/assets/resources/strings/strings.json
     *  and the source file is overwritten by the merged content
     *
     * @param targetFolderPathRoot {string} The path of the base folder where the destination files are placed.
     * @param sourceFoldersPathRoot {string[]} The array of paths to the source folders from where to read the JSON files to merge
     */
    public mergeJsonInFolders(targetFolderPathRoot: string, sourceFoldersPathRoot: string[]): any[] {
        const outputFiles: any[] = []; 
        const targetFilesContentMap = {};
        let targetFiles = this.getFilePaths(targetFolderPathRoot);
        targetFiles.forEach((targetFile) => {
            let relativePath = targetFile.substring(targetFolderPathRoot.length + 1, targetFile.length);
            targetFilesContentMap[relativePath] = this.readJSON(targetFile);

        });

        sourceFoldersPathRoot.forEach((sourceFolderPathRoot) => {
            let sourceFiles = this.getFilePaths(sourceFolderPathRoot);
            sourceFiles.forEach((sourceFile) => {
                let relativePath = sourceFile.substring(sourceFolderPathRoot.length + 1, sourceFile.length);
                let sourceJson = this.readJSON(sourceFile);

                this.mergeJsons(relativePath, sourceJson, targetFilesContentMap);
            });
        });

        Object.keys(targetFilesContentMap).forEach(path => {
            let jsonFile = new Vinyl({
                    cwd: './',
                    path: path,
                    contents: new Buffer(JSON.stringify(targetFilesContentMap[path]))
            });
            outputFiles.push(jsonFile);
        });

        return outputFiles;
    }

    private getFilePaths(dir, paths: string[] = []): string[] {
        if (!dir.endsWith('/')) {
            dir += '/';
        }

        let files = fs.readdirSync(dir);
        files.forEach(file => {
            let filePath = dir + file;
            if (fs.statSync(filePath).isDirectory()) {
                paths.concat(this.getFilePaths(filePath, paths));
            } else {
                paths.push(dir + file);
            }

        });

        return paths;
    }

    private mergeJsons(relativePath: string, sourceJson: any, targetFilesContentMap: {}): void {
        if (targetFilesContentMap[relativePath]) {
            this.extend(targetFilesContentMap[relativePath], [sourceJson]);
        } else {
            targetFilesContentMap[relativePath] = sourceJson;
        }
    }

    private readJSON(path: string): any {
        return JSON.parse(fs.readFileSync(path, 'utf8'));
    }

    private isObject(value): boolean {
        return value !== null && typeof value === 'object';
    }

    private isFunction(value): boolean {
        return typeof value === 'function';
    }

    private extend(dest: any, sources: any[]): any {
        if (!sources || sources.length === 0) {
            return dest;
        }

        for (let i = 0; i < sources.length; i++) {
            let src = sources[i];
            // Cant extend primitives or null/undefined values. so skip them
            if (!this.isObject(src) && !this.isFunction(src)) {
                continue;
            }
            let keys = Object.keys(src);
            let ki = keys.length;
            while (ki--) {
                let srcField = keys[ki];
                let srcValue = src[srcField];
                let destValue = srcValue;

                if (this.isObject(srcValue) && !Array.isArray(srcValue)) {
                    destValue = {};
                    this.extend(destValue, [dest[srcField], srcValue]);
                }

                dest[srcField] = destValue;
            }
        }

        return dest;
    }
}