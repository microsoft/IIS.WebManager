export class StringUtil {
    public static trimRight(from: string, targets: Array<string>): string {
        let found = true;
        while (found) {
            found = false
            for (let target of targets) {
                if (from.endsWith(target)) {
                    from = from.substr(0, from.length - target.length);
                    found = true;
                    continue;
                }
            }
        }
        return from;
    }
}