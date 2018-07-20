# Microsoft IIS Web Manager
Microsoft IIS Web Manager provides a browser interface for users to manage local and remote installations of IIS.

### Deploying IIS Web Manager
* IIS Web Manager is shipped as a part of [Microsoft IIS Administration API](https://github.com/microsoft/iis.administration)
* Standalone dotnet core host [WIP]
* Extract the website [zip file] and add it as a website on IIS

### Building
* (Optional) [Microsoft Visual Studio 2017](https://visualstudio.microsoft.com/downloads/)
* (Minimal, if VS2017 is not installed) [Visual Studio 2017 Build Tools](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools&rel=15)
* [Typescript 2.8.* For Visual Studio 2017](https://marketplace.visualstudio.com/items?itemName=TypeScriptTeam.typescript-281-vs2017)

Run

    msbuild Microsoft.IIS.WebManager.sln

### Images

![Website settings in the web manager][file-editor]

[file-editor]: https://iisnetblogs.blob.core.windows.net/media/adminapi/1.0.39/file_editor_with_diff_shrunk2.png "Website settings in the web manager"
