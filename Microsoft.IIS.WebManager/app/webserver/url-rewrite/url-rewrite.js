"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UrlRewrite = /** @class */ (function () {
    function UrlRewrite() {
    }
    return UrlRewrite;
}());
exports.UrlRewrite = UrlRewrite;
var AllowedServerVariablesSection = /** @class */ (function () {
    function AllowedServerVariablesSection() {
    }
    return AllowedServerVariablesSection;
}());
exports.AllowedServerVariablesSection = AllowedServerVariablesSection;
var GlobalSection = /** @class */ (function () {
    function GlobalSection() {
    }
    return GlobalSection;
}());
exports.GlobalSection = GlobalSection;
var InboundSection = /** @class */ (function () {
    function InboundSection() {
    }
    return InboundSection;
}());
exports.InboundSection = InboundSection;
var OutboundSection = /** @class */ (function () {
    function OutboundSection() {
    }
    return OutboundSection;
}());
exports.OutboundSection = OutboundSection;
var ProvidersSection = /** @class */ (function () {
    function ProvidersSection() {
    }
    return ProvidersSection;
}());
exports.ProvidersSection = ProvidersSection;
var RewriteMapsSection = /** @class */ (function () {
    function RewriteMapsSection() {
    }
    return RewriteMapsSection;
}());
exports.RewriteMapsSection = RewriteMapsSection;
var InboundRule = /** @class */ (function () {
    function InboundRule() {
        this.action = new Action();
    }
    return InboundRule;
}());
exports.InboundRule = InboundRule;
var OutboundRule = /** @class */ (function () {
    function OutboundRule() {
    }
    return OutboundRule;
}());
exports.OutboundRule = OutboundRule;
var PreCondition = /** @class */ (function () {
    function PreCondition() {
    }
    return PreCondition;
}());
exports.PreCondition = PreCondition;
var CustomTags = /** @class */ (function () {
    function CustomTags() {
    }
    return CustomTags;
}());
exports.CustomTags = CustomTags;
var Provider = /** @class */ (function () {
    function Provider() {
    }
    return Provider;
}());
exports.Provider = Provider;
var RewriteMap = /** @class */ (function () {
    function RewriteMap() {
    }
    return RewriteMap;
}());
exports.RewriteMap = RewriteMap;
var Action = /** @class */ (function () {
    function Action() {
    }
    return Action;
}());
exports.Action = Action;
var ServerVariableAssignment = /** @class */ (function () {
    function ServerVariableAssignment() {
    }
    return ServerVariableAssignment;
}());
exports.ServerVariableAssignment = ServerVariableAssignment;
var Condition = /** @class */ (function () {
    function Condition() {
    }
    return Condition;
}());
exports.Condition = Condition;
var OutboundTags = /** @class */ (function () {
    function OutboundTags() {
    }
    return OutboundTags;
}());
exports.OutboundTags = OutboundTags;
var CustomTag = /** @class */ (function () {
    function CustomTag() {
    }
    return CustomTag;
}());
exports.CustomTag = CustomTag;
var ProviderSetting = /** @class */ (function () {
    function ProviderSetting() {
    }
    return ProviderSetting;
}());
exports.ProviderSetting = ProviderSetting;
var RewriteMapping = /** @class */ (function () {
    function RewriteMapping() {
    }
    return RewriteMapping;
}());
exports.RewriteMapping = RewriteMapping;
exports.ActionType = {
    None: "none",
    Rewrite: "rewrite",
    Redirect: "redirect",
    CustomResponse: "custom_response",
    AbortRequest: "abort_request"
};
exports.RedirectType = {
    Permanent: "permanent",
    Found: "found",
    SeeOther: "seeother",
    Temporary: "temporary"
};
exports.ConditionMatchConstraints = {
    MatchAny: "match_any",
    MatchAll: "match_all"
};
exports.ResponseCacheDirective = {
    Auto: "auto",
    Always: "always",
    Never: "never",
    NotIfRuleMatched: "not_if_rule_matched"
};
exports.PatternSyntax = {
    RegularExpression: "regular_expression",
    Wildcard: "wildcard",
    ExactMatch: "exact_match"
};
exports.MatchType = {
    Pattern: "pattern",
    IsFile: "is_file",
    IsDirectory: "is_directory"
};
exports.OutboundMatchType = {
    ServerVariable: "server_variable",
    Response: "response"
};
exports.MatchConstraint = {
    All: "all",
    Any: "any",
};
var ActionTypeHelper = /** @class */ (function () {
    function ActionTypeHelper() {
    }
    ActionTypeHelper.toFriendlyActionType = function (actionType) {
        switch (actionType) {
            case exports.ActionType.AbortRequest:
                return "Abort";
            case exports.ActionType.CustomResponse:
                return "Custom Response";
            case exports.ActionType.Rewrite:
                return "Rewrite";
            case exports.ActionType.Redirect:
                return "Redirect";
            case exports.ActionType.None:
                return "None";
            default:
                throw new Error("Invalid action type");
        }
    };
    return ActionTypeHelper;
}());
exports.ActionTypeHelper = ActionTypeHelper;
var OutboundMatchTypeHelper = /** @class */ (function () {
    function OutboundMatchTypeHelper() {
    }
    OutboundMatchTypeHelper.display = function (matchType) {
        switch (matchType) {
            case exports.OutboundMatchType.Response:
                return "Response";
            case exports.OutboundMatchType.ServerVariable:
                return "Server Variable";
            default:
                throw new Error("Invalid match type");
        }
    };
    return OutboundMatchTypeHelper;
}());
exports.OutboundMatchTypeHelper = OutboundMatchTypeHelper;
exports.IIS_SERVER_VARIABLES = [
    "ALL_HTTP",
    "ALL_RAW",
    "APP_POOL_ID",
    "APPL_MD_PATH",
    "APPL_PHYSICAL_PATH",
    "AUTH_PASSWORD",
    "AUTH_TYPE",
    "AUTH_USER",
    "CACHE_URL",
    "CERT_COOKIE",
    "CERT_FLAGS",
    "CERT_ISSUER",
    "CERT_KEYSIZE",
    "CERT_SECRETKEYSIZE",
    "CERT_SERIALNUMBER",
    "CERT_SERVER_ISSUER",
    "CERT_SERVER_SUBJECT",
    "CERT_SUBJECT",
    "CONTENT_LENGTH",
    "CONTENT_TYPE",
    "GATEWAY_INTERFACE",
    "HTTP_ACCEPT",
    "HTTP_ACCEPT_ENCODING",
    "HTTP_ACCEPT_LANGUAGE",
    "HTTP_CONNECTION",
    "HTTP_COOKIE",
    "HTTP_HOST",
    "HTTP_METHOD",
    "HTTP_REFERER",
    "HTTP_URL",
    "HTTP_USER_AGENT",
    "HTTP_VERSION",
    "HTTPS",
    "HTTPS_KEYSIZE",
    "HTTPS_SECRETKEYSIZE",
    "HTTP_SERVER_ISSUER",
    "HTTPS_SERVER_SUBJECT",
    "INSTANCE_ID",
    "INSTANCE_META_PATH",
    "LOCAL_ADDR",
    "LOGON_USER",
    "PATH_INFO",
    "PATH_TRANSLATE",
    "QUERY_STRING",
    "REMOTE_ADDR",
    "REMOTE_HOST",
    "REMOTE_PORT",
    "REMOTE_USER",
    "REQUEST_METHOD",
    "SCRIPT_NAME",
    "SCRIPT_TRANSLATED",
    "SERVER_NAME",
    "SERVER_PORT",
    "SERVER_PORT_SECURE",
    "SERVER_PROTOCOL",
    "SERVER_SOFTWARE",
    "SSI_EXEC_DISABLED",
    "UNENCODED_URL",
    "UNMAPPED_REMOTE_USER",
    "URL",
    "URL_PATH_INFO"
];
//# sourceMappingURL=url-rewrite.js.map