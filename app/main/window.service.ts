
import {Injectable, ElementRef, Renderer} from '@angular/core';

import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class WindowService {
    private _scroll: BehaviorSubject<Event> = new BehaviorSubject<Event>(null);
    private _resize: BehaviorSubject<Event> = new BehaviorSubject<Event>(null);

    public get scroll(): Observable<Event> {
        return this._scroll.asObservable();
    }

    public get resize(): Observable<Event> {
        return this._resize.asObservable();
    }

    public initialize(eRef: ElementRef, renderer: Renderer): void {
        renderer.listen(eRef.nativeElement, 'scroll', (evt: Event) => {
            this._scroll.next(evt);
        });

        renderer.listenGlobal('window', 'resize', (evt: Event) => {
            this._resize.next(evt);
        }); 
    }

    public trigger() {
        try {
            window.dispatchEvent(new Event('resize'));
        }
        catch (e) {
            let event = document.createEvent("Event");
            event.initEvent("resize", false, true);
            // args: string type, boolean bubbles, boolean cancelable
            window.dispatchEvent(event);
        }
    }
}
