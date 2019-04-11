import { WebSite } from '../websites/site';
import { FeatureContext } from 'common/feature-vtabs.component';

export class WebApp implements FeatureContext {
    id: string;
    path: string;
    location: string;
    physical_path: string;
    enabled_protocols: string;
    website: WebSite;
    application_pool: any;
    links: any;
}
