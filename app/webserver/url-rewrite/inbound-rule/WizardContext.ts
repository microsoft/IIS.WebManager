import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export interface IWizardContext {
    readonly current: Observable<string>;
    next(): void;
    previous(): void;
}

export class WizardContext implements IWizardContext {
    private _current: BehaviorSubject<string> = new BehaviorSubject<string>(SlideType.Name);

    public get current(): Observable<string> {
        return this._current.asObservable();
    }

    public next(): void {
        switch (this._current.getValue()) {
            case SlideType.Name:
                this._current.next(SlideType.Pattern);
                return;
            case SlideType.Pattern:
                this._current.next(SlideType.Action);
                return;
            case SlideType.Action:
                this._current.next(SlideType.Name);
                return;
            default:
                break;
        }
    }

    public previous(): void {
        switch (this._current.getValue()) {
            case SlideType.Name:
                this._current.next(SlideType.Action);
                return;
            case SlideType.Pattern:
                this._current.next(SlideType.Name);
                return;
            case SlideType.Action:
                this._current.next(SlideType.Pattern);
                return;
            default:
                break;
        }
    }
}

export type SlideType = "name" | "pattern" | "action";
export const SlideType = {
    Name: "name" as SlideType,
    Pattern: "pattern" as SlideType,
    Action: "action" as SlideType
}