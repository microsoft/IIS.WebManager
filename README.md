# Microsoft IIS Web Manager
Microsoft IIS Web Manager provides a browser interface for users to manage local and remote installations of IIS.

## Instructions

### Prerequisites
Get [npm](https://www.npmjs.com/get-npm). All dependencies would be brought in on `npm install`

### Building

Run the build command. Use `--purge` to clear `node_modules` directory if desired. `--output-hashing` is recommended for cache breaking.

```
build.ps1 [--purge] [--output-hashing]
```

Output would be generated in `dist` directory. You may deploy the `dist\app` directory on any application server that supports angular application. Follow the guidance from [angular guides](https://angular.io/guide/deployment#development-servers).

* For IIS deployment, `web.config` is generated for you on the `dist\app`directory.

### Snapshots

![Website settings in the web manager][file-editor]

[file-editor]: https://iisnetblogs.blob.core.windows.net/media/adminapi/1.0.39/file_editor_with_diff_shrunk2.png "Website settings in the web manager"
