import { Observable } from "rxjs/Observable";
import { Drop } from './navigation.component';

export interface INavigation {
    path: Observable<string>;
    onPathChanged(path: string): void;
    drop(drop: Drop): void;
}