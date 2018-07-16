"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("rxjs/add/operator/take");
var Subject_1 = require("rxjs/Subject");
var Executable = /** @class */ (function () {
    function Executable() {
    }
    return Executable;
}());
var ParallelExecutor = /** @class */ (function () {
    function ParallelExecutor(size) {
        var _this = this;
        this._consuming = 0;
        this._queue = [];
        this._notifier = new Subject_1.Subject();
        this.consumer = this._notifier.asObservable().subscribe(function (q) {
            if (_this._queue.length > 0 && _this._consuming < _this._size) {
                var executable = _this._queue.shift();
                _this._consuming++;
                executable.notifier.next(executable.executor()
                    .then(function (r) {
                    _this._consuming--;
                    _this._notifier.next();
                    return r;
                })
                    .catch(function (e) {
                    _this._consuming--;
                    _this._notifier.next();
                    throw e;
                }));
            }
        });
        this._size = size;
    }
    ParallelExecutor.prototype.enqueue = function (executable) {
        this._queue.push(executable);
        this._notifier.next(null);
    };
    ParallelExecutor.prototype.execute = function (executor) {
        var _this = this;
        var notifier = new Subject_1.Subject();
        var executable = new Executable();
        executable.notifier = notifier;
        executable.executor = executor;
        return new Promise(function (resolve, reject) {
            notifier.asObservable().take(1).subscribe(function (p) {
                p.then(function (res) { return resolve(res); }).catch(function (e) { return reject(e); });
            });
            _this.enqueue(executable);
        });
    };
    return ParallelExecutor;
}());
exports.ParallelExecutor = ParallelExecutor;
//# sourceMappingURL=parallel-executor.js.map