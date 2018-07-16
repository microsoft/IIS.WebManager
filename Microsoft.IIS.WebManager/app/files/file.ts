export type ApiFileType = "file" | "directory";
export const ApiFileType = {
    File: "file" as ApiFileType,
    Directory: "directory" as ApiFileType
}

export class ApiFile {
    public name: string;
    public alias: string;
    public isLocation: boolean;
    public id: string;
    public type: ApiFileType;
    public physical_path: string;
    public created: Date;
    public last_modified: Date;
    public total_files: number;
    public size: number;
    public e_tag: string;
    public parent: ApiFile;
    public exists: boolean;
    public _links: any;

    public static fromObj(obj: any): ApiFile {
        if (!obj) {
            return null;
        }

        let f: ApiFile = new ApiFile();
        Object.assign(f, obj);

        f.created = obj.created ? new Date(<string>obj.created) : null;
        f.last_modified = obj.last_modified ? new Date(<string>obj.last_modified) : null;

        if (f.parent) {
            f.parent = ApiFile.fromObj(f.parent);
        }

        return f;
    }

    public get extension(): string {
        if (this.type == ApiFileType.File && this.name) {
            let segments = this.name.split('.');
            if (segments.length > 1) {
                return segments.pop().toLocaleLowerCase();
            }
        }

        return "";
    }

    public get description(): string {
        switch (this.type) {
            case ApiFileType.Directory:
                return "File Folder";
            case ApiFileType.File:
                let ext = this.extension.toLocaleUpperCase();
                return ext ? (ext + " File") : "";
        }

        return "";
    }

    public static isDir(file: ApiFile): boolean {
        return file && file.type == ApiFileType.Directory;
    }

    public static equal(a: ApiFile, b: ApiFile): boolean {
        if (!a || !b) {
            return false;
        }

        if (!a.physical_path || !b.physical_path) {
            return a.physical_path == b.physical_path;
        }

        return this.trimRight(a.physical_path.toLocaleLowerCase().replace(/\\/g, '/'), '/') == this.trimRight(b.physical_path.toLocaleLowerCase().replace(/\\/g, '/'), '/');
    }

    private static trimRight(from: string, target: string): string {
        while (from.endsWith(target)) {
            from = from.substr(0, from.length - target.length);
        }
        return from;
    }
}

export type MimeTypes = "application/files+json" | "URL" | "application/clipboard-op+json";
export const MimeTypes = {
    ApiFiles: "application/files+json" as MimeTypes,
    Url: "URL" as MimeTypes,
    ClipboardOperation: "application/clipboard-op+json" as MimeTypes
}


export type ChangeType = "created" | "deleted" | "updated";
export const ChangeType = {
    Created: "created" as ChangeType,
    Deleted: "deleted" as ChangeType,
    Updated: "updated" as ChangeType
}

export class FileChangeEvent {
    public target: ApiFile;
    public type: ChangeType;

    public static created(target: ApiFile) {
        let evt = new FileChangeEvent();
        evt.type = ChangeType.Created;
        evt.target = target;
        return evt;
    }

    public static updated(target: ApiFile) {
        let evt = new FileChangeEvent();
        evt.type = ChangeType.Updated;
        evt.target = target;
        return evt;
    }

    public static deleted(target: ApiFile) {
        let evt = new FileChangeEvent();
        evt.type = ChangeType.Deleted;
        evt.target = target;
        return evt;
    }
}

export class ExplorerOptions {
    public EnableRefresh: boolean;
    public EnableNewFile: boolean;
    public EnableNewFolder: boolean;
    public EnableUpload: boolean;
    public EnableDelete: boolean;

    private static _allEnabled = new ExplorerOptions(true);

    constructor(initalValue: boolean) {
        this.setAll(initalValue);
    }

    public static get AllEnabled() {
        return this._allEnabled;
    }

    private setAll(val: boolean) {
        this.EnableRefresh = val;
        this.EnableNewFile = val;
        this.EnableNewFolder = val;
        this.EnableUpload = val;
        this.EnableDelete = val;
    }
}