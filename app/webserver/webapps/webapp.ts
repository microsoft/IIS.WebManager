import {WebSite} from '../websites/site';

export class WebApp {
    id: string;
    path: string;
    location: string;
    physical_path: string;
    enabled_protocols: string;
    website: WebSite;
    application_pool: any;
    _links: any;
}