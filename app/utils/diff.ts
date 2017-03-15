export class DiffUtil {
    public static diff(original, modified) {

        if (original == null || modified == null) {

            // Usually this function will not be called with any null parameters
            // We return null in this case because it may be useful to some

            return null;
        }

        if ((typeof o2 == 'object' && typeof modified == 'object') && (Object.keys(original).length != Object.keys(modified).length)) {

            // A key from original is missing in modified OR a key was added to modified
            // We don't know how to handle this so we just return the whole modified object
            return modified;
        }

        var result = {};
        for (var key in original) {
            var o1 = original[key];
            var o2 = modified[key];


            if (typeof (o2) === "undefined") {

                // A key from original is missing in modified
                // We don't know how to handle this so we just return the whole modified object
                return modified;
            }

            /* Arrays */

            if (Array.isArray(o2) && Array.isArray(o1)) {

                if (o1.length != o2.length) {
                    result[key] = o2;
                }
                else {
                    for (var x in o1) {
                        if (typeof (o1[x]) != typeof (o2[x])) {
                            result[key] = o2;
                        }
                        else {
                            // Array of objects
                            if (typeof (o1[x]) === "object") {
                                var res = DiffUtil.diff(o1[x], o2[x]);
                                if (Object.keys(res).length > 0) {
                                    result[key] = o2;
                                }
                            }
                            // Array of primitives
                            else {
                                if (o1[x] !== o2[x]) {
                                    result[key] = o2;
                                }
                            }

                        }
                    }
                }
            }

            /* Objects */

            // This is the case where both properties are non null objects and we can recursively call the function
            else if ((typeof o2 == 'object' && o2 != null) && (typeof o1 == 'object' && o1 != null)) {

                var diff = DiffUtil.diff(o1, o2);
                if (Object.keys(diff).length > 0) {
                    result[key] = diff;
                }
            }

            // If one or both values are null, the result should have the property present with the value of the modified property
            // This allows us to avoid recursively calling with a null parameter
            else if ((typeof o2 == 'object' && typeof o1 == 'object') && (o1 == null || o2 == null)) {

                if (o1 != o2) {
                    // They're not both null
                    result[key] = o2;
                }

                // If they're both null, there is no change to put in the change set
            }

            /* primitives */

            else if (o2 != o1) {
                result[key] = o2;
            }
        }
        return result;
    }


    public static set(obj: any, data: any): any {
        if (!data) {
            return obj;
        }

        for (var k in data) {
            var val = data[k];

            if (typeof val == 'object') {
                if (!obj[k]) {
                    obj[k] = val;
                }
                else {
                    DiffUtil.set(obj[k], val);
                }
            }
            else {
                obj[k] = val;
            }
        }

        return obj;
    }
}