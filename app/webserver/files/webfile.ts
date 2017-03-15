import { WebSite } from '../websites/site'
import { ApiFileType, ApiFile } from '../../files/file';

export type WebFileType = "file" | "directory" | "vdir";
export const WebFileType = {
    Application: "application" as WebFileType,
    File: "file" as WebFileType,
    Directory: "directory" as WebFileType,
    Vdir: "vdir" as WebFileType
}


export class WebFile {
    public id: string;
    public name: string;
    public type: WebFileType;
    public path: string;
    public parent: WebFile;
    public website: WebSite;
    public file_info: ApiFile = new ApiFile();
    public _links: any;

    public static clone(f: WebFile): WebFile {
        return WebFile.fromObj(JSON.parse(JSON.stringify(f))); 
    }

    public static fromObj(obj: any): WebFile {
        if (!obj) {
            return null;
        }

        let f: WebFile = new WebFile();
        Object.assign(f, obj);

        if (f.file_info) {
            f.file_info = ApiFile.fromObj(obj.file_info);
        }

        return f;
    }

    public get description(): string {
        switch (this.type) {
            case WebFileType.Application:
                return "Web Application";
            case WebFileType.Vdir:
                return "Virtual Directory";
            default:
                return this.file_info.description;
        }
    }

    public get isVirtual(): boolean {
        return this.type == WebFileType.Application || this.type == WebFileType.Vdir;
    }

    public static isDir(file: WebFile): boolean {
        return file && (file.type == WebFileType.Directory || file.type == WebFileType.Vdir || file.type == WebFileType.Application);
    }
}
