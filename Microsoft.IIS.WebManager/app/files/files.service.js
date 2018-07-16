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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
var Subject_1 = require("rxjs/Subject");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var httpclient_1 = require("../common/httpclient");
var notification_service_1 = require("../notification/notification.service");
var notification_1 = require("../notification/notification");
var progress_1 = require("./progress");
var file_1 = require("./file");
var parallel_executor_1 = require("./parallel-executor");
var FilesService = /** @class */ (function () {
    function FilesService(_http, _notificationService) {
        var _this = this;
        this._http = _http;
        this._notificationService = _notificationService;
        this._uploadSignal = -1;
        this._fields = "name,id,alias,type,physical_path,size,created,last_modified,mime_type,e_tag,parent";
        this._subscriptions = [];
        this._uploadComponentName = "UploadComponent";
        this._creator = new parallel_executor_1.ParallelExecutor(10);
        this._uploader = new parallel_executor_1.ParallelExecutor(50);
        this._change = new Subject_1.Subject();
        this._progress = new BehaviorSubject_1.BehaviorSubject([]);
        this._subscriptions.push(this.progress.subscribe(function (progresses) {
            _this.signalUploadDisplay(progresses.length == 0);
        }));
    }
    FilesService_1 = FilesService;
    FilesService.prototype.dispose = function () {
        for (var _i = 0, _a = this._subscriptions; _i < _a.length; _i++) {
            var sub = _a[_i];
            sub.unsubscribe();
        }
    };
    Object.defineProperty(FilesService.prototype, "change", {
        get: function () {
            return this._change.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FilesService.prototype, "progress", {
        get: function () {
            return this._progress.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    FilesService.prototype.get = function (id) {
        return this._http.get("/files?id=" + id)
            .then(function (file) {
            return file_1.ApiFile.fromObj(file);
        });
    };
    FilesService.prototype.getByPhysicalPath = function (path) {
        var _this = this;
        return this._http.get("/files?physical_path=" + path, null, false)
            .then(function (res) {
            return file_1.ApiFile.fromObj(res);
        })
            .catch(function (e) {
            _this.handleError(e, path);
            throw e;
        });
    };
    FilesService.prototype.getChildren = function (dir) {
        var _this = this;
        return this._http.get("/files?parent.id=" + dir.id + "&fields=" + this._fields, null, false)
            .then(function (res) {
            return res.files.map(function (f) { return file_1.ApiFile.fromObj(f); });
        })
            .catch(function (e) {
            _this.handleError(e, dir.physical_path);
            throw e;
        });
    };
    FilesService.prototype.getRoots = function () {
        var _this = this;
        return this._http.get("/files?fields=" + this._fields + ",claims")
            .then(function (res) {
            return res.files.map(function (f) {
                var apiFile = file_1.ApiFile.fromObj(f);
                apiFile.isLocation = true;
                return apiFile;
            });
        })
            .catch(function (e) {
            _this.handleError(e, "/");
            throw e;
        });
    };
    FilesService.prototype.getLocation = function (id) {
        var _this = this;
        return this._http.get("/files/locations/" + id)
            .catch(function (e) {
            _this.handleError(e, "/");
            throw e;
        });
    };
    FilesService.prototype.createLocation = function (location) {
        this.createLocationInternal(location);
    };
    FilesService.prototype.deleteLocations = function (locations) {
        this.deleteLocationsInternal(locations);
    };
    FilesService.prototype.updateLocation = function (location, data) {
        return this.updateLocationInternal(location, data);
    };
    FilesService.prototype.create = function (file, parent) {
        this.createInternal(file, parent);
    };
    FilesService.prototype.update = function (file, data) {
        return this.updateInternal(file, data);
    };
    FilesService.prototype.delete = function (files) {
        this.deleteInternal(files);
    };
    FilesService.prototype.upload = function (parent, files) {
        this.uploadInternal(parent, files);
    };
    FilesService.prototype.uploadItems = function (items, to) {
        this.uploadItemsInternal(items, to);
    };
    FilesService.prototype.getFileContent = function (file) {
        var url = "/files/content?id=" + file.id;
        var opts = this._http.getOptions(http_1.RequestMethod.Get, url, null);
        return this._http.request(url, opts);
    };
    FilesService.prototype.setFileContent = function (file, content) {
        var _this = this;
        if (typeof (content) === 'string') {
            content = FilesService_1.str2utf8(content);
        }
        var url = "/files/content?id=" + file.id;
        var opts = this._http.getOptions(http_1.RequestMethod.Put, url, null);
        //
        // Content type workaround for https://github.com/angular/angular/issues/13973
        opts.headers.append("Content-Type", "application/octet-binary");
        var totalBytes = content.byteLength;
        if (totalBytes > 0) {
            opts.headers.append('Content-Range', 'bytes 0-' + (totalBytes - 1) + '/' + totalBytes);
        }
        // Set Content
        opts.body = content;
        return this._http.request(url, opts, false)
            .then(function (r) {
            //
            // Refresh metadata
            _this.get(file.id).then(function (f) {
                Object.assign(file, f);
                _this._change.next(file_1.FileChangeEvent.updated(file));
            });
            return r;
        })
            .catch(function (e) {
            _this.handleError(e, file.physical_path);
            throw e;
        });
    };
    FilesService.prototype.download = function (file) {
        this.downloadInternal(file);
    };
    FilesService.prototype.move = function (sources, destination, name) {
        if (name === void 0) { name = null; }
        this.copyMove(false, sources, destination, name);
    };
    FilesService.prototype.copy = function (sources, destination, name) {
        if (name === void 0) { name = null; }
        this.copyMove(true, sources, destination, name);
    };
    FilesService.prototype.rename = function (file, name) {
        if (name && file.name.toLocaleLowerCase() != name.toLocaleLowerCase()) {
            this._notificationService.clearWarnings();
            var oldName_1 = file.name;
            file.name = name;
            this.update(file, { name: name }).catch(function (e) {
                file.name = oldName_1;
                throw e;
            });
        }
    };
    FilesService.prototype.generateDownloadLink = function (file, ttl) {
        var _this = this;
        if (ttl === void 0) { ttl = 0; }
        var dlUrl = "/files/downloads";
        var dl = {
            file: file
        };
        if (ttl) {
            dl.ttl = ttl;
        }
        var opts = this._http.getOptions(http_1.RequestMethod.Post, dlUrl, null);
        opts.headers.append("Content-Type", "application/json");
        opts.body = JSON.stringify(dl);
        return this._http.request(dlUrl, opts)
            .then(function (response) {
            return _this._http.endpoint().url + response.headers.get("location");
        });
    };
    FilesService.prototype.drag = function (e, files) {
        if (files && files.length > 0) {
            var dt = e.dataTransfer;
            e.dataTransfer.effectAllowed = "copyMove";
            var json = JSON.stringify(files);
            try {
                dt.setData(file_1.MimeTypes.ApiFiles, json);
            }
            catch (e) {
                // IE does not recognize custom mime types
                // If setData causes an error, e.dataTransfer is null
                dt.setData("Text", json);
            }
        }
    };
    FilesService.prototype.drop = function (e, destination) {
        var _this = this;
        var apiFiles = this.getDraggedFiles(e);
        var items = e.dataTransfer.items;
        var files = e.dataTransfer.files;
        var copy = (e.dataTransfer.effectAllowed == "all") || ((e.dataTransfer.effectAllowed.toLowerCase() == "copymove") && e.ctrlKey);
        var promise = (destination instanceof file_1.ApiFile) ? Promise.resolve(destination) : this.getByPhysicalPath(destination);
        promise.then(function (file) {
            //
            // Copy/Move File(s)
            if (apiFiles.length > 0) {
                copy ? _this.copy(apiFiles, file) : _this.move(apiFiles, file);
                return;
            }
            //
            // Upload items
            if (items && items.length > 0) {
                _this.uploadItems(items, file);
                return;
            }
            //
            // Upload local File(s)
            if (files && files.length > 0) {
                _this.upload(file, files);
                return;
            }
        });
    };
    FilesService.prototype.getDraggedFiles = function (e) {
        //
        // Get all data in advance, because dataTransfer is only availabe during drop event
        // Otherwise the async operations will not have access to these
        var apiFilesData = null;
        try {
            apiFilesData = e.dataTransfer.getData(file_1.MimeTypes.ApiFiles);
        }
        catch (e) {
            // IE does not support custom mime types       
            apiFilesData = e.dataTransfer.getData("Text");
        }
        return apiFilesData ? JSON.parse(apiFilesData).map(function (f) { return file_1.ApiFile.fromObj(f); }) : [];
    };
    FilesService.prototype.clipboardCopy = function (e, files) {
        e.clipboardData.clearData();
        if (files && files.length > 0) {
            e.preventDefault();
            e.clipboardData.setData(file_1.MimeTypes.ClipboardOperation, e.type.toLowerCase());
            e.clipboardData.setData(file_1.MimeTypes.ApiFiles, JSON.stringify(files));
        }
    };
    FilesService.prototype.clipboardPaste = function (e, destination) {
        var op = e.clipboardData.getData(file_1.MimeTypes.ClipboardOperation);
        if (!op) {
            return;
        }
        var data = e.clipboardData.getData(file_1.MimeTypes.ApiFiles);
        var files = data ? JSON.parse(data).map(function (f) { return file_1.ApiFile.fromObj(f); }) : [];
        if (files && files.length > 0) {
            e.preventDefault();
            if (op == "copy") {
                this.copy(files, destination);
            }
            else if (op == "cut") {
                e.clipboardData.clearData();
                this.move(files, destination);
            }
        }
    };
    FilesService.prototype.handleError = function (e, path) {
        if (path === void 0) { path = null; }
        if (e.status) {
            if (e.status === 403 && e.title && e.title.toLowerCase() == 'forbidden') {
                e.message = "Access Denied\n\n" + e.name;
            }
            else if ((e.status === 404 || e.status == 400) && e.name && (e.name.toLowerCase() == 'path' || e.name.toLowerCase() == 'physical_path')) {
                e.message = "Path not found\n\n" + (path || "");
            }
            else if (e.status == 409) {
                e.message = "Already exists\n\n" + (path || "");
            }
            else if (e.status == 403 && e.title && e.title.toLowerCase() == 'object is locked') {
                e.message = "File in use\n\n" + (path || "");
            }
            this._notificationService.apiError(e);
        }
        this._progress.next(this._progress.getValue());
    };
    //
    //
    //
    FilesService.prototype.createLocationInternal = function (location) {
        var _this = this;
        return this._http.post("/files/locations", JSON.stringify(location))
            .then(function (location) {
            return _this.get(location.id)
                .then(function (f) {
                var file = file_1.ApiFile.fromObj(f);
                file.isLocation = true;
                _this._change.next(file_1.FileChangeEvent.created(file));
                return file;
            });
        })
            .catch(function (e) {
            if (e && e.status == 400 && e.name == "parent") {
                //
                // Location API not installed. Api is trying to create a directory is being created
                e.message = "Ability to create root folders is not available. Please install the latest version.";
                _this._notificationService.apiError(e);
            }
            else {
                _this.handleError(e);
            }
            throw e;
        });
    };
    FilesService.prototype.deleteLocationsInternal = function (locations, index) {
        var _this = this;
        if (index === void 0) { index = 0; }
        if (index == 0) {
            locations = locations.filter(function () { return true; });
        }
        if (index > locations.length - 1) {
            return;
        }
        return this._http.delete("/files/locations/" + locations[index].id)
            .then(function () {
            _this._change.next(file_1.FileChangeEvent.deleted(locations[index]));
            index++;
            return _this.deleteLocationsInternal(locations, index);
        })
            .catch(function (e) {
            _this.handleError(e);
            throw e;
        });
    };
    FilesService.prototype.updateLocationInternal = function (location, data) {
        var _this = this;
        return this.get(location.id)
            .then(function (existingDir) {
            existingDir.isLocation = true;
            return _this._http.patch("/files/locations?id=" + location.id, JSON.stringify(data))
                .then(function (l) {
                Object.assign(location, l);
                return _this.get(location.id)
                    .then(function (d) {
                    _this._change.next(file_1.FileChangeEvent.deleted(existingDir));
                    var newDir = file_1.ApiFile.fromObj(d);
                    newDir.isLocation = true;
                    _this._change.next(file_1.FileChangeEvent.created(newDir));
                    return location;
                });
            });
        })
            .catch(function (e) {
            _this.handleError(e, location.path);
            throw e;
        });
        ;
    };
    //
    //
    //
    FilesService.prototype.createInternal = function (file, parent) {
        var _this = this;
        return this._creator.execute(function () {
            file.parent = parent;
            return _this._http.post("/files", JSON.stringify(file))
                .then(function (f) {
                Object.assign(file, file_1.ApiFile.fromObj(f));
                _this._change.next(file_1.FileChangeEvent.created(file));
                return f;
            })
                .catch(function (e) {
                _this.handleError(e);
                throw e;
            });
        });
    };
    FilesService.prototype.updateInternal = function (file, data) {
        var _this = this;
        return this._http.patch("/files?id=" + file.id, JSON.stringify(data))
            .then(function (f) {
            Object.assign(file, file_1.ApiFile.fromObj(f));
            _this._change.next(file_1.FileChangeEvent.updated(file));
            return file;
        })
            .catch(function (e) {
            _this.handleError(e, file.physical_path);
            throw e;
        });
    };
    FilesService.prototype.deleteInternal = function (files) {
        var _this = this;
        var root = files.find(function (file) { return !file.parent; });
        if (root) {
            var message = "Root folders cannot be deleted: '" + root.name + "'";
            this._notificationService.warn(message);
            return Promise.reject(message);
        }
        var promises = [];
        var _loop_1 = function (file) {
            promises.push(this_1._http.delete("/files?id=" + file.id)
                .then(function (_) {
                _this._change.next(file_1.FileChangeEvent.deleted(file));
            }));
        };
        var this_1 = this;
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            _loop_1(file);
        }
        return Promise.all(promises)
            .catch(function (e) {
            _this.handleError(e);
            throw e;
        });
    };
    FilesService.prototype.uploadInternal = function (parent, files) {
        var _this = this;
        var promises = [];
        var forAll = null;
        var overwrite = null;
        this.showUploads(true);
        var _loop_2 = function (content) {
            var apiFile = new file_1.ApiFile();
            apiFile.name = content.name;
            apiFile.type = file_1.ApiFileType.File;
            promises.push(this_2.createSetContent(apiFile, parent, content).catch(function (e) {
                if (e.status != 409) {
                    throw e;
                }
                if (overwrite === null) {
                    overwrite = confirm(content.name + " already exists. Would you like to overwrite existing files?");
                }
                var path = parent.physical_path + '\\' + content.name;
                if (overwrite) {
                    _this._notificationService.clearWarnings();
                    return _this.getByPhysicalPath(path)
                        .then(function (existing) {
                        return _this.setContent(existing, content)
                            .then(function () { return _this.updateMetadata(existing, content); });
                    });
                }
                else {
                    _this.handleError(e, path);
                    throw e;
                }
            }));
        };
        var this_2 = this;
        for (var _i = 0, files_2 = files; _i < files_2.length; _i++) {
            var content = files_2[_i];
            _loop_2(content);
        }
        return Promise.all(promises);
    };
    FilesService.prototype.downloadInternal = function (file) {
        this.generateDownloadLink(file)
            .then(function (location) {
            if (location) {
                window.location.href = location;
            }
        });
    };
    FilesService.prototype.uploadItemsInternal = function (items, to) {
        var _this = this;
        var dirPromise = null;
        var files = [];
        var filePromises = [];
        var dirPromises = [];
        var _loop_3 = function (i) {
            var item = items[i];
            if (item.webkitGetAsEntry) {
                item = item.webkitGetAsEntry();
            }
            if (!item) {
                return "continue";
            }
            var entry = item;
            if (entry.isDirectory) {
                dirPromises.push(this_3.uploadFileSystemDirectoryEntry(entry, to));
            }
            if (entry.isFile && entry.file) {
                filePromises.push(new Promise(function (resolve, reject) {
                    entry.file(function (f) {
                        files.push(f);
                        resolve(f);
                    }, function (e) { return reject(e); });
                }));
            }
        };
        var this_3 = this;
        for (var i = 0; i < items.length; ++i) {
            _loop_3(i);
        }
        var filesPromise = Promise.all(filePromises)
            .then(function (res) { return _this.upload(to, files); });
        return Promise.all(dirPromises.concat(filesPromise));
    };
    FilesService.prototype.uploadFileSystemDirectoryEntry = function (fsDirectory, to) {
        var _this = this;
        var dir = new file_1.ApiFile();
        dir.type = file_1.ApiFileType.Directory;
        dir.name = fsDirectory.name;
        return this.createInternal(dir, to)
            .catch(function (e) {
            if (e.status != 409) {
                throw e;
            }
            _this._notificationService.clearWarnings();
            return _this.getByPhysicalPath(to.physical_path + '\\' + dir.name);
        })
            .then(function (newDir) {
            return _this.getChildItems(fsDirectory)
                .then(function (entries) {
                return _this.uploadItemsInternal(entries, newDir)
                    .then(function (uploadItems) {
                    return _this.getFileSystemEntryMetadata(fsDirectory)
                        .then(function (metadata) {
                        // Update LastModified
                        return _this.update(newDir, { last_modified: metadata.modificationTime });
                    });
                });
            })
                .catch(function (e) {
                _this.handleError(e);
                if (newDir) {
                    _this._notificationService.warn("An error occured while uploading " + dir.physical_path);
                }
                throw e;
            });
        });
    };
    FilesService.prototype.getFileSystemEntryMetadata = function (fsDirectory) {
        return new Promise(function (resolve, reject) {
            fsDirectory.getMetadata(function (metadata) { return resolve(metadata); }, function (error) { return reject(error); });
        });
    };
    FilesService.prototype.getChildItems = function (fsDirectory, reader) {
        var _this = this;
        var r = reader ? reader : fsDirectory.createReader();
        return new Promise(function (resolve, reject) {
            r.readEntries(function (entries) {
                var children = [];
                for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                    var entry = entries_1[_i];
                    children.push(entry);
                }
                if (entries.length > 0) {
                    _this.getChildItems(fsDirectory, r)
                        .then(function (c) { return resolve(children.concat(c)); });
                }
                else {
                    resolve(children);
                }
            }, function (e) {
                reject(e);
            });
        });
    };
    FilesService.prototype.noConflictUpload = function (parent, files) {
        var _this = this;
        if (files.length == 0) {
            return Promise.resolve([]);
        }
        this.showUploads(true);
        var promises = [];
        var _loop_4 = function (content) {
            var apiFile = new file_1.ApiFile();
            apiFile.name = content.name;
            apiFile.type = file_1.ApiFileType.File;
            var progress = this_4.addProgress(content.size);
            promises.push(this_4.createSetContent(apiFile, parent, content, progress).catch(function (e) {
                if (e.status == 409) {
                    // Conflict
                }
                _this.removeProgress(progress);
                _this.handleError(e, parent.physical_path + '\\' + content.name);
                throw e;
            }));
        };
        var this_4 = this;
        for (var _i = 0, files_3 = files; _i < files_3.length; _i++) {
            var content = files_3[_i];
            _loop_4(content);
        }
        return Promise.all(promises);
    };
    FilesService.prototype.copyMove = function (copy, sources, destination, name) {
        var _this = this;
        if (name === void 0) { name = null; }
        var forAll = null;
        var promises = [];
        this.getChildren(destination)
            .then(function (children) {
            var _loop_5 = function (source) {
                var n = name ? name : source.name;
                var existing = children.find(function (c) { return c.name === n; });
                if (existing) {
                    promises.push(_this.get(source.id)
                        .then(function (s) {
                        if (s.parent.id == destination.id) {
                            return copy ? _this.performCopy(s, destination, _this.getUniqueName(children, n, " - Copy")) : Promise.resolve(s);
                        }
                        else if ((forAll || confirm('The destination already has a file named "' + n + '". Do you want to overwrite it?'))) {
                            if (sources.length > 1 && forAll === null) {
                                forAll = confirm("Do this for all conflicts?");
                            }
                            return copy ? _this.performCopy(s, destination, n) : _this.performMove(s, destination, n);
                        }
                    }));
                }
                else {
                    promises.push(copy ? _this.performCopy(source, destination, n) : _this.performMove(source, destination, n));
                }
            };
            for (var _i = 0, sources_1 = sources; _i < sources_1.length; _i++) {
                var source = sources_1[_i];
                _loop_5(source);
            }
        });
        return Promise.all(promises);
    };
    FilesService.prototype.performMove = function (source, destination, name) {
        var _this = this;
        var move = {
            file: source,
            parent: destination,
            name: name ? name : null
        };
        return this._http.post('files/move', JSON.stringify(move), null, false)
            .then(function (progress) {
            return _this.monitorProgress(progress)
                .then(function (_) {
                return _this._http.get("/files?id=" + progress.file.id, null, false)
                    .then(function (f) {
                    _this._change.next(file_1.FileChangeEvent.deleted(source));
                    _this._change.next(file_1.FileChangeEvent.created(file_1.ApiFile.fromObj(f)));
                    return f;
                })
                    .catch(function (e) {
                    if (e.status == 404) {
                        _this._notificationService.warn('Moving "' + move.file.name + '" failed.');
                        return;
                    }
                    throw e;
                });
            });
        })
            .catch(function (e) {
            _this.handleError(e, source.physical_path);
            throw e;
        });
    };
    FilesService.prototype.performCopy = function (source, destination, name) {
        var _this = this;
        var copy = {
            file: source,
            parent: destination,
            name: name ? name : null
        };
        if (source.id == destination.id) {
            return Promise.reject("Invalid destination.");
        }
        return this._http.post('files/copy', JSON.stringify(copy), null, false)
            .then(function (progress) {
            return _this.monitorProgress(progress)
                .then(function (_) {
                return _this._http.get("/files?id=" + progress.file.id, null, false)
                    .then(function (f) {
                    _this._change.next(file_1.FileChangeEvent.created(file_1.ApiFile.fromObj(f)));
                    return f;
                })
                    .catch(function (e) {
                    if (e.status == 404) {
                        _this._notificationService.warn('Copying "' + copy.file.name.toLowerCase() + '" failed.');
                        return;
                    }
                    throw e;
                });
            });
        })
            .catch(function (e) {
            _this.handleError(e, source.physical_path);
            throw e;
        });
    };
    FilesService.prototype.monitorProgress = function (p, progress) {
        var _this = this;
        this.showUploads(true);
        if (!progress) {
            progress = this.addProgress(p.total_size);
        }
        progress.completed = p.current_size;
        this._progress.next(this._progress.getValue());
        return this._http.get(p._links.self.href.replace('/api', ''), null, false)
            .then(function (p2) { return _this.monitorProgress(p2, progress); })
            .catch(function (e) {
            _this.removeProgress(progress);
            if (e.status == 404) {
                return Promise.resolve(null);
            }
            throw e;
        });
    };
    FilesService.prototype.getUniqueName = function (files, targetName, addendum) {
        var name = targetName;
        var extensionIndex = targetName.lastIndexOf('.');
        var preExtension = extensionIndex == -1 ? targetName : targetName.substring(0, extensionIndex);
        var extension = extensionIndex == -1 ? "" : targetName.substring(extensionIndex);
        if (files.find(function (c) { return c.name === name; })) {
            for (var i = 0; i <= files.length; i++) {
                name = preExtension + (i == 0 ? addendum : (addendum + ' (' + i + ')')) + extension;
                if (!files.find(function (c2) { return c2.name === name; })) {
                    break;
                }
            }
        }
        return name;
    };
    FilesService.prototype.setContent = function (file, fileInfo, progress) {
        var _this = this;
        return this._uploader.execute(function () { return _this._setContent(file, fileInfo, progress); });
    };
    FilesService.prototype._setContent = function (file, fileInfo, progress) {
        var _this = this;
        if (fileInfo.size == 0) {
            if (progress) {
                this._progress.next(this._progress.getValue().filter(function (p) { return p !== progress; }));
            }
            return Promise.resolve(file);
        }
        var chunkSize = 1024 * 1024 * 2; // In bytes;
        var initialLength = fileInfo.size < chunkSize ? fileInfo.size : chunkSize;
        var url = "/files/content?id=" + file.id;
        return this.read(fileInfo, 0, initialLength)
            .then(function (content) {
            return _this.setContentChunked(fileInfo, url, 0, initialLength, content, chunkSize, fileInfo.size, progress);
        })
            .catch(function (e) {
            _this.handleError(e);
            throw e;
        });
        ;
    };
    FilesService.prototype.createSetContent = function (file, parent, content, progress) {
        var _this = this;
        return this.createInternal(file, parent)
            .then(function (f) {
            return _this.setContent(f, content, progress)
                .then(function (res) {
                //
                // Update LastModified
                return _this.updateMetadata(f, content);
            })
                .catch(function (e) {
                _this.delete([f]);
                return Promise.reject("Upload failed.");
            });
        });
    };
    FilesService.prototype.updateMetadata = function (file, metaData) {
        return this.updateInternal(file, { last_modified: metaData.lastModifiedDate })
            .then(function (fileInfo) {
            return file_1.ApiFile.fromObj(fileInfo);
        });
    };
    FilesService.prototype.setContentChunked = function (fileInfo, url, start, length, content, chunkSize, totalSize, progress) {
        var _this = this;
        if (!progress) {
            progress = this.addProgress(totalSize);
        }
        var opts = this._http.getOptions(http_1.RequestMethod.Put, url, null);
        //
        // Content type workaround for https://github.com/angular/angular/issues/13973
        opts.headers.append("Content-Type", "application/octet-binary");
        opts.headers.append('Content-Range', 'bytes ' + start + '-' + (start + length - 1) + '/' + totalSize);
        opts.body = content;
        return this._http.request(url, opts, false)
            .then(function (suc) {
            _this._progress.getValue().find(function (p) { return p === progress; }).completed = start + length;
            _this._progress.next(_this._progress.getValue());
            start = start + length;
            if (start >= totalSize) {
                _this._progress.next(_this._progress.getValue().filter(function (p) { return p !== progress; }));
                return suc;
            }
            else {
                var l_1 = totalSize - start < chunkSize ? totalSize - start : chunkSize;
                return _this.read(fileInfo, start, l_1)
                    .then(function (d) {
                    return _this.setContentChunked(fileInfo, url, start, l_1, d, chunkSize, totalSize, progress);
                });
            }
        })
            .catch(function (e) {
            _this._progress.next(_this._progress.getValue().filter(function (p) { return p !== progress; }));
            throw e;
        });
    };
    FilesService.prototype.read = function (file, start, length) {
        var reader = new FileReader();
        var slice = file.slice(start, start + length);
        return new Promise(function (resolve, reject) {
            reader.onload = function (e) {
                resolve(e.target.result);
            };
            reader.onerror = function (e) {
                reject(e);
            };
            reader.readAsArrayBuffer(slice);
        });
    };
    FilesService.prototype.showUploads = function (show) {
        var _this = this;
        if (show) {
            if (!this._notificationService.getNotifications().find(function (n) { return n.componentName == _this._uploadComponentName; })) {
                this._notificationService.notify({
                    type: notification_1.NotificationType.Information,
                    componentName: this._uploadComponentName,
                    module: "app/files/upload.component#Module",
                    data: null,
                    highPriority: true
                });
                this._notificationService.show();
            }
        }
        else {
            var uploadNotification = this._notificationService.getNotifications().find(function (n) { return n.componentName == _this._uploadComponentName; });
            if (uploadNotification) {
                this._notificationService.remove(uploadNotification);
            }
        }
    };
    FilesService.prototype.signalUploadDisplay = function (hide) {
        var _this = this;
        if (hide) {
            if (this._uploadSignal == -1) {
                this._uploadSignal = setTimeout(function () {
                    _this.showUploads(false);
                    _this._uploadSignal = -1;
                }, 500);
            }
        }
        else {
            if (this._uploadSignal != -1) {
                clearTimeout(this._uploadSignal);
                this._uploadSignal = -1;
            }
        }
    };
    FilesService.prototype.addProgress = function (outOf) {
        var p = new progress_1.Progress();
        p.completed = 0;
        p.outOf = outOf;
        this._progress.getValue().push(p);
        this._progress.next(this._progress.getValue());
        return p;
    };
    FilesService.prototype.removeProgress = function (progress) {
        this._progress.next(this._progress.getValue().filter(function (p) { return p !== progress; }));
    };
    FilesService.str2utf8 = function (s) {
        if (s == null) {
            return null;
        }
        //
        // Convert jscript string (UTF-16) to UTF-8
        s = unescape(encodeURIComponent(s));
        // Buffer
        var buff = new Uint8Array(s.length + 3 /*3 bytes for UTF-8 BOM*/);
        // Write UTF-8 BOM
        buff[0] = 0xEF;
        buff[1] = 0xBB;
        buff[2] = 0xBF;
        // Write string
        for (var i = 0; i < s.length; ++i) {
            buff[i + 3] = s.charCodeAt(i);
        }
        return buff.buffer;
    };
    FilesService = FilesService_1 = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [httpclient_1.HttpClient,
            notification_service_1.NotificationService])
    ], FilesService);
    return FilesService;
    var FilesService_1;
}());
exports.FilesService = FilesService;
//# sourceMappingURL=files.service.js.map