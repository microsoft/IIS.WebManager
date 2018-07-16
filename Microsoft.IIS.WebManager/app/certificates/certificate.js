"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Certificate = /** @class */ (function () {
    function Certificate() {
    }
    Certificate.friendlyValidTo = function (cert) {
        if (!cert.valid_to) {
            return "";
        }
        return cert.valid_to.substring(0, 10);
    };
    Certificate.friendlyValidFrom = function (cert) {
        if (!cert.valid_from) {
            return "";
        }
        return cert.valid_from.substring(0, 10);
    };
    Certificate.friendlyIssuedBy = function (cert) {
        if (!cert.issued_by) {
            return "";
        }
        if (cert.issued_by.indexOf("CN=") == 0) {
            return cert.issued_by.substring(3, cert.issued_by.length);
        }
        return cert.issued_by;
    };
    Certificate.displayName = function (cert) {
        return cert.name || cert.alias || cert.subject || cert.thumbprint || "";
    };
    return Certificate;
}());
exports.Certificate = Certificate;
var CertStore = /** @class */ (function () {
    function CertStore() {
    }
    return CertStore;
}());
exports.CertStore = CertStore;
//# sourceMappingURL=certificate.js.map