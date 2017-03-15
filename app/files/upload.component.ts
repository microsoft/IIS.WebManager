import { NgModule, Component, Inject, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import 'rxjs/add/operator/buffer';

import { Subscription } from 'rxjs/Subscription';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';

import { Progress } from './progress';
import { FilesService } from './files.service';

@Component({
    selector: 'notification',
    template: `
        <div class="container">
            <span class="support">Total items: {{numFinished + _numUploading}}</span>
            <span>{{uploadProgress}}% complete</span>
            <div class="load-border border-active">
                <div class="background-active" [style.width]="_uploadProgress + '%'"></div>
            </div>
            <span class="support">Time remaining: {{getTimeRemaining()}}</span>
            <span class="support">Items remaining: {{_numUploading}} ({{getRemaining()}})</span>
            <span class="support">Speed: {{getSpeed()}}</span>
        </div>
    `,
    styles: [`
        .container {
            min-height: 50px;
            padding-top: 10px;
            padding-bottom: 10px;
        }
        
        span {
            margin-bottom: 10px;
            display: block;
        }

        .load-border {
            border-style: solid;
            border-width: 1px;
            margin-bottom: 8px;
        }

        .load-border div {
            height: 4px;
        }

        .support {
            font-size: 13px;
            margin-bottom: 0;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadComponent implements OnDestroy {
    private _numUploading: number = 0;
    private _uploadProgress: number = 0;
    private _bytesRemaining: number = 0;

    private _finished: Array<Progress> = [];
    private _subscriptions: Array<Subscription> = [];
    private _avg: SlidingAverage = new SlidingAverage();

    constructor(@Inject("FilesService") private _filesService: FilesService,
                private _changeDetector: ChangeDetectorRef) {

        this._subscriptions.push(this._filesService.progress.subscribe((progresses: Array<Progress>) => {
            this._numUploading = progresses.length;

            if (this._numUploading == 0) {
                return;
            }

            let completed = 0, outOf = 0, finished = 0;

            progresses.forEach(p => {
                if (p.completed == p.outOf && !(<any>p)._finished) {
                    this._finished.push(p);
                    (<any>p)._finished = true;
                }
                else {
                    completed += p.completed;
                    outOf += p.outOf;
                }
            });

            this._finished.forEach(p => {
                finished += p.completed;
            });

            let totalCompleted = completed + finished;
            let totalOutof = outOf + finished;

            this._avg.next(totalCompleted);
            this._bytesRemaining = outOf - completed;
            this._uploadProgress = (totalCompleted / totalOutof * 100);
        }));

        this._subscriptions.push(this._filesService.progress.buffer(IntervalObservable.create(100)).filter(v => v.length > 0).subscribe(p => {
            this._changeDetector.markForCheck();
        }))
    }

    private getRemaining(): string {
        let kbs = this._bytesRemaining / 1024;

        if (kbs <= 1024) {
            return Math.ceil(kbs) + 'KB';
        }

        return Math.ceil(kbs / 1024) + 'MB';
    }

    private getSpeed(): string {
        let kbs = (this._avg ? this._avg.current : 0);

        if (kbs <= 1024) {
            return Math.ceil(kbs) + ' KB/s';
        }

        return Math.ceil(kbs / 1024) + ' MB/s';
    }

    private getTimeRemaining(): string {
        const calculating = "calculating...";
        if (!this._avg || this._avg.current == 0) {
            return calculating;
        }

        let kbs = this._avg.current;
        let kbRemaining = this._bytesRemaining / 1024;

        let secondsRemaining = kbRemaining / kbs;

        if (secondsRemaining > 60) {
            return Math.floor(secondsRemaining / 60) + 'min';
        }

        return Math.ceil(secondsRemaining) + 's';
    }

    private get uploadProgress(): number {
        return this._uploadProgress > 99 ? 99 : Math.ceil(this._uploadProgress);
    }

    private get numFinished(): number {
        return this._finished.length;
    }

    ngOnDestroy() {
        for (let sub of this._subscriptions) {
            sub.unsubscribe();
        }
    }
}

class SlidingAverage {
    private _average: number = 0;
    private _window: number = 50;
    private _previousTimes: Array<number> = [];
    private _previousValues: Array<number> = [];

    public next(current: number): number {

        let elapsed = 0, delta = 0;

        if (this._previousTimes.length < this._window) {
            elapsed = Date.now() - this._previousTimes[0];
            delta = current - this._previousValues[0];
        }
        else {
            elapsed = Date.now() - this._previousTimes.shift();
            delta = current - this._previousValues.shift();
        }

        this._average = delta / elapsed;

        this._previousValues.push(current);
        this._previousTimes.push(Date.now());

        return this._average;
    }

    public get current(): number {
        return this._average;
    }
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        UploadComponent
    ],
    declarations: [
        UploadComponent
    ]
})
export class Module { }