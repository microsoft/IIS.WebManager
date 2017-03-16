import {Status} from '../common/status';

export class WebServer {
    id: string;
    name: string;
    status: Status;
    version: string;

    _links: any;
}
