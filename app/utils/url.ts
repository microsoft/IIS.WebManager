export class UrlUtil {

    private static _anchor: HTMLAnchorElement;

    private static get anchor(): HTMLAnchorElement {
        if (!UrlUtil._anchor) {
            UrlUtil._anchor = window.document.createElement('a');
        }

        return UrlUtil._anchor;
    }

    public static getQueryString(url: string) {
        UrlUtil.anchor.href = url;
        return UrlUtil.anchor.search;
    }

    public static getFragment(url: string) {
        UrlUtil.anchor.href = url;
        return UrlUtil.anchor.hash;
    }

    public static getUrlMatch(given, template) {

        var fGiven = given;
        var fTemplate = template;

        // Removen query string and fragment for matching
        given = UrlUtil.trimUrlOfQueryAndHash(given);
        template = UrlUtil.trimUrlOfQueryAndHash(template);

        // Make sure both urls start with a '/'
        if (given[0] != '/') {
            given = "/" + given;
        }
        if (template[0] != '/') {
            template = "/" + template;
        }

        // Make sure no urls end with '/'
        if (given[given.length - 1] === '/') {
            given = given.substring(0, given.length - 1);
        }
        if (template[template.length - 1] === '/') {
            template = template.substring(0, template.length - 1);
        }

        var seg, templateSeg;
        var matches = {}

        var maxRuns = 500;
        var runCount = 0;

        while (given.length > 0 && template.length > 0 && runCount < 500) {
            seg = UrlUtil.getSegment(given);
            given = given.substring(seg.length);

            templateSeg = UrlUtil.getSegment(template);
            template = template.substring(templateSeg.length);

            if (given.length === 0 && template.length !== 0 || given.length !== 0 && template.length === 0) {

                // No match
                return null;
            }

            seg = UrlUtil.removeLeadingSlash(seg);
            templateSeg = UrlUtil.removeLeadingSlash(templateSeg);

            // Check if templateSegment is something like "{id}"
            var templateKey = UrlUtil.isTemplate(templateSeg);

            if (templateKey) {
                matches[templateKey] = seg;
            }
            else {
                if (seg !== templateSeg) {
                    return null;
                }
            }
            runCount++;
        }

        if (runCount >= maxRuns) {
            return null;
        }

        var fTemplateQueryIndex = fTemplate.indexOf('?');
        if (fTemplateQueryIndex != -1) {

            var templateQuery = fTemplate.substring(fTemplateQueryIndex);
            var givenQuery = fGiven.substring(fGiven.indexOf('?'));

            var tQuery = UrlUtil.getQueryParams(templateQuery);
            var gQuery = UrlUtil.getQueryParams(givenQuery);

            for (var key in tQuery) {
                if (!gQuery.hasOwnProperty(key)) {
                    continue;
                }

                var val = UrlUtil.isTemplate(tQuery[key]);

                if (val) {
                    matches[val] = gQuery[key];
                }
            }
        }

        return matches;
    }

    public static getQueryParams(queryString): any {

        // Split parts of the query string
        var qs = queryString.split("&");

        // The query string is now split up into an array of key value pairs.
        // The split call causes the first key to start with '?' which must be removed.
        if (qs.length > 0 && qs[0].indexOf("?") == 0) {
            qs[0] = qs[0].substr(1, qs[0].length - 1);
        }

        // Initialize object to hold query parameters
        var obj = {};

        // For each query string kvp we split the key from the value which is separated by '='
        for (var x in qs) {

            var filter = qs[x];
            var index = filter.indexOf("=");

            // Kvp separated by '='
            if (index > 0) {
                var key = filter.substr(0, index);

                // Prevent the case where part 2 is "=" for a query string like "?something="
                var ind = (filter.length < index + 1) ? index + 1 : filter.length;

                var value = filter.substring(index + 1, ind);

                obj[key] = value;
            }

            // Query string part does not have value
            else {
                obj[filter] = null;
            }
        }

        return obj;
    }

    private static getSegment(str): string {

        var initialSlash = false;
        if (str[0] == '/') {
            str = str.substring(1);
            initialSlash = true;
        }

        var slashIndex = str.indexOf('/');
        var queryIndex = str.indexOf('?');
        var hashIndex = str.indexOf('#');

        if (slashIndex != -1) {

            str = str.substring(0, slashIndex);
        }
        else if (queryIndex != -1) {
            str = str.substring(0, queryIndex);
        }
        else if (hashIndex != -1) {
            str = str.substring(0, hashIndex);
        }
        if (initialSlash) {
            str = '/' + str;
        }
        return str;
    }

    private static trimUrlOfQueryAndHash(url): string {
        var queryIndex = url.indexOf('?');

        if (queryIndex != -1) {
            url = url.substring(0, queryIndex);
        }

        var hashIndex = url.indexOf('#');

        if (hashIndex != -1) {
            url = url.substring(0, hashIndex);
        }
        return url;
    }


    private static removeLeadingSlash(str): string {
        if (str.length > 0 && str[0] === '/') {
            str = str.substring(1);
        }
        return str;
    }

    private static isTemplate(str) {

        if (!str) {
            return null;
        }

        var isTemplateSeg = str.length > 2 && str[0] === '{' && str[str.length - 1] === '}';

        if (isTemplateSeg) {
            return str.substring(1, str.length - 1);
        }
        else {
            return null;
        }
    }
}