"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
require("rxjs/add/operator/buffer");
var IntervalObservable_1 = require("rxjs/observable/IntervalObservable");
var files_service_1 = require("./files.service");
var UploadComponent = /** @class */ (function () {
    function UploadComponent(_filesService, _changeDetector) {
        var _this = this;
        this._filesService = _filesService;
        this._changeDetector = _changeDetector;
        this._numUploading = 0;
        this._uploadProgress = 0;
        this._bytesRemaining = 0;
        this._finished = [];
        this._subscriptions = [];
        this._avg = new SlidingAverage();
        this._subscriptions.push(this._filesService.progress.subscribe(function (progresses) {
            _this._numUploading = progresses.length;
            if (_this._numUploading == 0) {
                return;
            }
            var completed = 0, outOf = 0, finished = 0;
            progresses.forEach(function (p) {
                if (p.completed == p.outOf && !p._finished) {
                    _this._finished.push(p);
                    p._finished = true;
                }
                else {
                    completed += p.completed;
                    outOf += p.outOf;
                }
            });
            _this._finished.forEach(function (p) {
                finished += p.completed;
            });
            var totalCompleted = completed + finished;
            var totalOutof = outOf + finished;
            _this._avg.next(totalCompleted);
            _this._bytesRemaining = outOf - completed;
            _this._uploadProgress = (totalCompleted / totalOutof * 100);
        }));
        this._subscriptions.push(this._filesService.progress.buffer(IntervalObservable_1.IntervalObservable.create(100)).filter(function (v) { return v.length > 0; }).subscribe(function (p) {
            _this._changeDetector.markForCheck();
        }));
    }
    UploadComponent.prototype.getRemaining = function () {
        var kbs = this._bytesRemaining / 1024;
        if (kbs <= 1024) {
            return Math.ceil(kbs) + 'KB';
        }
        return Math.ceil(kbs / 1024) + 'MB';
    };
    UploadComponent.prototype.getSpeed = function () {
        var kbs = (this._avg ? this._avg.current : 0);
        if (kbs <= 1024) {
            return Math.ceil(kbs) + ' KB/s';
        }
        return Math.ceil(kbs / 1024) + ' MB/s';
    };
    UploadComponent.prototype.getTimeRemaining = function () {
        var calculating = "calculating...";
        if (!this._avg || this._avg.current == 0) {
            return calculating;
        }
        var kbs = this._avg.current;
        var kbRemaining = this._bytesRemaining / 1024;
        var secondsRemaining = kbRemaining / kbs;
        if (secondsRemaining > 60) {
            return Math.floor(secondsRemaining / 60) + 'min';
        }
        return Math.ceil(secondsRemaining) + 's';
    };
    Object.defineProperty(UploadComponent.prototype, "uploadProgress", {
        get: function () {
            return this._uploadProgress > 99 ? 99 : Math.ceil(this._uploadProgress);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UploadComponent.prototype, "numFinished", {
        get: function () {
            return this._finished.length;
        },
        enumerable: true,
        configurable: true
    });
    UploadComponent.prototype.ngOnDestroy = function () {
        for (var _i = 0, _a = this._subscriptions; _i < _a.length; _i++) {
            var sub = _a[_i];
            sub.unsubscribe();
        }
    };
    UploadComponent = __decorate([
        core_1.Component({
            selector: 'notification',
            template: "\n        <div class=\"container\">\n            <span class=\"support\">Total items: {{numFinished + _numUploading}}</span>\n            <span>{{uploadProgress}}% complete</span>\n            <div class=\"load-border border-active\">\n                <div class=\"background-active\" [style.width]=\"_uploadProgress + '%'\"></div>\n            </div>\n            <span class=\"support\">Time remaining: {{getTimeRemaining()}}</span>\n            <span class=\"support\">Items remaining: {{_numUploading}} ({{getRemaining()}})</span>\n            <span class=\"support\">Speed: {{getSpeed()}}</span>\n        </div>\n    ",
            styles: ["\n        .container {\n            min-height: 50px;\n            padding-top: 10px;\n            padding-bottom: 10px;\n        }\n        \n        span {\n            margin-bottom: 10px;\n            display: block;\n        }\n\n        .load-border {\n            border-style: solid;\n            border-width: 1px;\n            margin-bottom: 8px;\n        }\n\n        .load-border div {\n            height: 4px;\n        }\n\n        .support {\n            font-size: 13px;\n            margin-bottom: 0;\n        }\n    "],
            changeDetection: core_1.ChangeDetectionStrategy.OnPush
        }),
        __param(0, core_1.Inject("FilesService")),
        __metadata("design:paramtypes", [files_service_1.FilesService,
            core_1.ChangeDetectorRef])
    ], UploadComponent);
    return UploadComponent;
}());
exports.UploadComponent = UploadComponent;
var SlidingAverage = /** @class */ (function () {
    function SlidingAverage() {
        this._average = 0;
        this._window = 50;
        this._previousTimes = [];
        this._previousValues = [];
    }
    SlidingAverage.prototype.next = function (current) {
        var elapsed = 0, delta = 0;
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
    };
    Object.defineProperty(SlidingAverage.prototype, "current", {
        get: function () {
            return this._average;
        },
        enumerable: true,
        configurable: true
    });
    return SlidingAverage;
}());
var Module = /** @class */ (function () {
    function Module() {
    }
    Module = __decorate([
        core_1.NgModule({
            imports: [
                forms_1.FormsModule,
                common_1.CommonModule
            ],
            exports: [
                UploadComponent
            ],
            declarations: [
                UploadComponent
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=upload.component.js.map