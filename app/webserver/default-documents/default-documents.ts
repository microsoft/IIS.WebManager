import {Metadata} from '../../common/metadata';

export class File {
    name: string;
    id: string;
    default_document: any;
    _links: any;
}

export class DefaultDocuments {
    id: string;
    scope: string;
    metadata: Metadata;
    enabled: boolean;

    website: any;
    _links: any;
}
