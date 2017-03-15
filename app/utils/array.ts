export class ArrayUtil {
    public static findIndex(arr: Array<any>, pred: (e) => boolean) {
        for (let i = 0; i < arr.length; i++) {
            if (pred(arr[i])) {
                return i;
            }
        }
        return -1;
    }

    public static find(arr: Array<any>, pred: (e) => boolean) {
        let res = ArrayUtil.findIndex(arr, pred);
        return res === -1 ? undefined : arr[res];
    }
}