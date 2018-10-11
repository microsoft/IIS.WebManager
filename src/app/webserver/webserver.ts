import { Status } from '../common/status';

export class WebServer {
    id: string;
    name: string;
    status: Status;
    supports_sni: boolean;
    version: string;

    _links: any;
}