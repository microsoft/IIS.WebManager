declare var GLOBAL_MODULES: Array<any>;

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

    public static addModule(modules: Array<any>, moduleName: string): void {
        let targetIndex = GLOBAL_MODULES.findIndex(m => m.name.toLocaleLowerCase() == moduleName.toLocaleLowerCase());

        if (targetIndex == -1) {
            return;
        }

        let nextModules = GLOBAL_MODULES.filter((module, i) => i > targetIndex);

        let nextIndex = modules.findIndex(m => !!nextModules.find(nm => nm.name.toLocaleLowerCase() == m.name.toLocaleLowerCase()))

        let insertionIndex = nextIndex == -1 ? 0 : nextIndex;

        modules.splice(insertionIndex, 0, GLOBAL_MODULES[targetIndex]);
    }
}
