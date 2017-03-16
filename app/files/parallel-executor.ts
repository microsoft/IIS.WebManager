import 'rxjs/add/operator/take';
import {Subject} from "rxjs/Subject";

class Executable {
    executor: () => Promise<any>;
    notifier: Subject<any>;
}

export class ParallelExecutor {
    private _size: number;
    private _consuming = 0;
    private _queue: Array<Executable> = [];

    constructor(size: number) {
       this. _size = size;
    }

    private _notifier: Subject<any> = new Subject<any>();

    private enqueue(executable: Executable) {
        this._queue.push(executable);
        this._notifier.next(null);
    }

    private consumer = this._notifier.asObservable().subscribe(q => {
        if (this._queue.length > 0 && this._consuming < this._size) {
            let executable = this._queue.shift();

            this._consuming++;
            executable.notifier.next(executable.executor()
                .then(r => {
                    this._consuming--;
                    this._notifier.next();
                    return r;
                })
                .catch(e => {
                    this._consuming--;
                    this._notifier.next();
                    throw e;
                }));
        }
    })


    public execute(executor: () => Promise<any>): Promise<any> {
        let notifier = new Subject<Promise<any>>();

        let executable = new Executable();
        executable.notifier = notifier;
        executable.executor = executor;

        return new Promise((resolve, reject) => {

            notifier.asObservable().take(1).subscribe(p => {
                p.then(res => resolve(res)).catch(e => reject(e));
            });

            this.enqueue(executable);
        });
    }
}
