declare var System: any;

export class ComponentLoader {   

    public static LoadAsync(name, path) {
        return System.import(path)
            .then(m => {
                return m[name]
            });
    }
}