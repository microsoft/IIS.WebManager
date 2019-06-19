import { Status } from 'common/status';
import { FeatureContext } from 'common/feature-vtabs.component';
import { StatusModel } from 'common/status-controller.component'

export class WebServer implements FeatureContext, StatusModel {
    id: string;
    name: string;
    status: Status;
    supports_sni: boolean;
    version: string;
    _links: any;
}
