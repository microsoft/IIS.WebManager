import { Router, NavigationStart } from '@angular/router';
import { Location } from '@angular/common';
import { Observable, Subscription, BehaviorSubject } from 'rxjs'
import { IDisposable } from './IDisposable';
import { UrlUtil } from '../utils/url';

export class SectionHelper implements IDisposable {
    private _root: string;
    private _hashCache: Array<string> = [];
    private _subscriptions: Array<Subscription> = [];
    private _active: BehaviorSubject<string> = new BehaviorSubject<string>("");

    constructor(
        private _sections: Array<string> = [],
        private defaultSection: string,
        private _markLocation: boolean,
        private _location: Location,
        private _router: Router,
    ) {
        if (_markLocation) {
            this._subscriptions.push((<Subscription>this._location.subscribe(e => {
                if (e.type == 'popstate') {
                    this.navigateSection(this.getSectionFromUrl());
                }
            })));

            this._subscriptions.push(this._router.events.subscribe(e => {
                if (e instanceof NavigationStart && this._router.isActive(e.url, true)) {
                    // Re-navigating to the current route should cause the tab to reset to the first tab
                    let section = this.getSectionFromUrl(e.url);

                    if (this.section && !section) {
                        this.selectSectionInternal(section, false);
                    }
                }
            }));
        }

        this.section = defaultSection || "";

        // Automatically navigate to first section if no default provided
        if (!this.section && _sections.length > 0) {
            this.navigateSection(_sections[0]);
        }
    }

    public dispose() {
        this._subscriptions.forEach(sub => {
            sub.unsubscribe();
        });
    }

    public static normalize(val: string) {
        return val.toLocaleLowerCase().replace(/ /g, "-");
    }

    public addSection(section: string) {
        if (!this._sections.find(s => SectionHelper.normalize(s) == SectionHelper.normalize(section))) {
            this._sections.push(section);
        }
    }

    private get section(): string {
        return this._active.getValue();
    }

    private set section(val: string) {
        let v = SectionHelper.normalize(val);
        this._active.next(this._sections.find(s => SectionHelper.normalize(s) === v));
    }

    public get active(): Observable<string> {
        return this._active.asObservable();
    }

    public selectSection(name: string) {
        if (!this._markLocation) {
            this.section = name;
            return;
        }

        this.selectSectionInternal(name, false);
    }

    public removeSection(name: string) {
        let v = SectionHelper.normalize(name);
        let i = this._sections.findIndex(s => SectionHelper.normalize(s) === v);

        if (i != -1) {
            this._sections.splice(i, 1);
        }
    }

    private selectSectionInternal(name: string, replaceState: boolean) {
        if (this.section && this.section == this.getSectionFromUrl()) {
            this._hashCache[SectionHelper.normalize(this.section)] = UrlUtil.getFragment(this._location.path(true));
        }

        if (this._markLocation) {
            this.setSection(name, replaceState);
        }
    }

    private getSectionIndex(name: string): number {
        let n = SectionHelper.normalize(name);
        return this._sections.findIndex(s => {
            return SectionHelper.normalize(s) === n;
        });
    }

    private navigateSection(section: string) {
        section = SectionHelper.normalize(section);

        if (section === this.section) {
            return;
        }

        let exists = this._sections.find(s => {
            return SectionHelper.normalize(s) == section;
        });

        if (!exists) {
            section = "";
        }

        this.selectSectionInternal(section, true);
    }

    private setSection(name: string, replaceState?: boolean) {
        let section: string = SectionHelper.normalize(name);

        let go: (url: string) => void = replaceState ? this._location.replaceState : this._location.go;

        let url: string;

        let urlSec = this.getSectionFromUrl();
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
    }

    private getSectionFromUrl(url?: string): string {
        if (url) {
            let hashIndex = url.indexOf('#');
            let end = hashIndex == -1 ? url.length : hashIndex;
            url = url.substr(0, end);
        }

        let path = url ? url : this._location.path(false);

        let lastSegment = SectionHelper.normalize(path.substring(this.prefix.length));
        let lastSlash = lastSegment.indexOf('/');
        if (lastSlash != -1) {
            lastSegment = lastSegment.substr(0, lastSlash);
        }

        let ret: string = null;

        for (let i = 0; i < this._sections.length; i++) {
            if (SectionHelper.normalize(this._sections[i]) == lastSegment) {
                ret = this._sections[i];
                break;
            }
        }

        return ret || "";
    }

    private get prefix(): string {
        let prefix = this._root;

        if (!prefix && prefix !== '') {
            let path = this._location.path(false);
            prefix = !this.section ? path : path.substr(0, path.lastIndexOf('/'));
        }

        return prefix.endsWith('/') ? prefix : prefix + '/';
    }

    private get suffix(): string {
        let suffix = this._location.path(false).substr(this.prefix.length + this.getSectionFromUrl().length);
        return suffix;
    }
}
