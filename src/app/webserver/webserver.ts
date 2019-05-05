import { Status } from 'common/status';
import { FeatureContext } from 'common/feature-vtabs.component';

export class WebServer implements FeatureContext {
    id: string;
    name: string;
    status: Status;
    supports_sni: boolean;
    version: string;
    _links: any;
}
