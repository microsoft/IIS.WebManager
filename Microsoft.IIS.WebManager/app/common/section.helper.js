"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var url_1 = require("../utils/url");
var SectionHelper = /** @class */ (function () {
    function SectionHelper(sections, defaultSection, markLocation, location, activatedRoute, router) {
        var _this = this;
        this._sections = [];
        this._hashCache = [];
        this._subscriptions = [];
        this._active = new BehaviorSubject_1.BehaviorSubject("");
        this._markLocation = markLocation;
        this._location = location;
        this._route = activatedRoute;
        this._router = router;
        this._sections = sections;
        if (markLocation) {
            this._subscriptions.push(this._location.subscribe(function (e) {
                if (e.type == 'popstate') {
                    _this.navigateSection(_this.getSectionFromUrl());
                }
            }));
            this._subscriptions.push(this._router.events.subscribe(function (e) {
                if (e instanceof router_1.NavigationStart && _this._router.isActive(e.url, true)) {
                    // Re-navigating to the current route should cause the tab to reset to the first tab
                    var section = _this.getSectionFromUrl(e.url);
                    if (_this.section && !section) {
                        _this.selectSectionInternal(section, false);
                    }
                }
            }));
        }
        this.section = defaultSection || "";
        // Automatically navigate to first section if no default provided
        if (!this.section && sections.length > 0) {
            this.navigateSection(sections[0]);
        }
    }
    SectionHelper.prototype.dispose = function () {
        this._subscriptions.forEach(function (sub) {
            sub.unsubscribe();
        });
    };
    SectionHelper.normalize = function (val) {
        return val.toLocaleLowerCase().replace(/ /g, "-");
    };
    SectionHelper.prototype.addSection = function (section) {
        if (!this._sections.find(function (s) { return SectionHelper.normalize(s) == SectionHelper.normalize(section); })) {
            this._sections.push(section);
        }
    };
    Object.defineProperty(SectionHelper.prototype, "section", {
        get: function () {
            return this._active.getValue();
        },
        set: function (val) {
            var v = SectionHelper.normalize(val);
            this._active.next(this._sections.find(function (s) { return SectionHelper.normalize(s) === v; }));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SectionHelper.prototype, "active", {
        get: function () {
            return this._active.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    SectionHelper.prototype.selectSection = function (name) {
        if (!this._markLocation) {
            this.section = name;
            return;
        }
        this.selectSectionInternal(name, false);
    };
    SectionHelper.prototype.removeSection = function (name) {
        var v = SectionHelper.normalize(name);
        var i = this._sections.findIndex(function (s) { return SectionHelper.normalize(s) === v; });
        if (i != -1) {
            this._sections.splice(i, 1);
        }
    };
    SectionHelper.prototype.selectSectionInternal = function (name, replaceState) {
        if (this.section && this.section == this.getSectionFromUrl()) {
            this._hashCache[SectionHelper.normalize(this.section)] = url_1.UrlUtil.getFragment(this._location.path(true));
        }
        if (this._markLocation) {
            this.setSection(name, replaceState);
        }
    };
    SectionHelper.prototype.getSectionIndex = function (name) {
        var n = SectionHelper.normalize(name);
        return this._sections.findIndex(function (s) {
            return SectionHelper.normalize(s) === n;
        });
    };
    SectionHelper.prototype.navigateSection = function (section) {
        section = SectionHelper.normalize(section);
        if (section === this.section) {
            return;
        }
        var exists = this._sections.find(function (s) {
            return SectionHelper.normalize(s) == section;
        });
        if (!exists) {
            section = "";
        }
        this.selectSectionInternal(section, true);
    };
    SectionHelper.prototype.setSection = function (name, replaceState) {
        var section = SectionHelper.normalize(name);
        var go = replaceState ? this._location.replaceState : this._location.go;
        var url;
        var urlSec = this.getSectionFromUrl();
        if (section == urlSec) {
            url = this._location.path(false);
            replaceState = true;
        }
        else if (this.section) {
            url = this.prefix + section;
        }
        else {
            url = this._location.path(false) + "/" + section;
        }
        if (this._hashCache[section]) {
            url += this._hashCache[SectionHelper.normalize(section)];
        }
        if (replaceState) {
            this._location.replaceState(url);
        }
        else {
            this._location.go(url);
        }
        this.section = section;
    };
    SectionHelper.prototype.getSectionFromUrl = function (url) {
        if (url) {
            var hashIndex = url.indexOf('#');
            var end = hashIndex == -1 ? url.length : hashIndex;
            url = url.substr(0, end);
        }
        var path = url ? url : this._location.path(false);
        var lastSegment = SectionHelper.normalize(path.substring(this.prefix.length));
        var lastSlash = lastSegment.indexOf('/');
        if (lastSlash != -1) {
            lastSegment = lastSegment.substr(0, lastSlash);
        }
        var ret = null;
        for (var i = 0; i < this._sections.length; i++) {
            if (SectionHelper.normalize(this._sections[i]) == lastSegment) {
                ret = this._sections[i];
                break;
            }
        }
        return ret || "";
    };
    Object.defineProperty(SectionHelper.prototype, "prefix", {
        get: function () {
            var prefix = this._root;
            if (!prefix && prefix !== '') {
                var path = this._location.path(false);
                prefix = !this.section ? path : path.substr(0, path.lastIndexOf('/'));
            }
            return prefix.endsWith('/') ? prefix : prefix + '/';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SectionHelper.prototype, "suffix", {
        get: function () {
            var suffix = this._location.path(false).substr(this.prefix.length + this.getSectionFromUrl().length);
            return suffix;
        },
        enumerable: true,
        configurable: true
    });
    return SectionHelper;
}());
exports.SectionHelper = SectionHelper;
//# sourceMappingURL=section.helper.js.map