declare var GLOBAL_MODULES: any;

import { UrlUtil } from './url';

export class ModuleUtil {
    public static initModules(modules: Array<any>, resource: any, resourceName: string): Array<any> {
        if (resource) {
            let links = Object.keys(resource._links);
            for (let module of GLOBAL_MODULES) {
                for (let link of links) {
                    if (module.api_name == link && resource._links[link].href) {
                        let matches = UrlUtil.getUrlMatch(resource._links[link].href, module.api_path);

                        if (matches) {
                            // Create copy of module
                            let m = JSON.parse(JSON.stringify(module));

                            m.data = matches;
                            m.data[resourceName] = resource;

                            modules.push(m);
                        }
                    }
                }
            }
        }

        return modules
    }
}