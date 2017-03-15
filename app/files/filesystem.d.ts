interface Metadata {
    modificationTime: Date;
    size: number;
}

interface FileSystemEntry {
    filesystem: any;
    fullPath: string;
    isDirectory: boolean;
    isFile: boolean;
    name: string;

    getMetadata(successCallback: (metadata: Metadata) => void, errorCallback?: (fileError: any) => void): void;
}

interface FileSystemDirectoryEntry extends FileSystemEntry {
    createReader(): FileSystemDirectoryReader;
}

interface FileSystemFileEntry extends FileSystemEntry {
    file(successCallback: (file: File) => void, errorCallback?: (fileError: any) => void): void;
}

interface FileSystemDirectoryReader {
    readEntries(successCallback: (entries: Array<FileSystemEntry>) => void, errorCallback?: (fileError: any) => void): void;
}