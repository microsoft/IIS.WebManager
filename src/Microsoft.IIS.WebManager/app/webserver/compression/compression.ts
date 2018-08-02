import {Metadata} from '../../common/metadata';
import {WebSite} from '../websites/site';


export class ResponseCompression {
    id: string;
    scope: string;
    metadata: Metadata;
    directory: string;
    do_disk_space_limitting: boolean;
    max_disk_space_usage: number;
    min_file_size: number;
    do_dynamic_compression: boolean;
    do_static_compression: boolean;
    website: WebSite;

    _links: any;
}
