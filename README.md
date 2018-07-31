# Microsoft IIS Web Manager
Microsoft IIS Web Manager provides a browser interface for users to manage local and remote installations of IIS.

## Building it yourself

#### Prerequisites

* [Microsoft Visual Studio 2017](https://docs.microsoft.com/en-us/visualstudio/releasenotes/vs2017-relnotes) or [Microsoft Visual Studio 2017 Build Tools](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools&rel=15)

* [Typescript 2.8.* For Visual Studio 2017](https://marketplace.visualstudio.com/items?itemName=TypeScriptTeam.typescript-281-vs2017)

Run the following in developer command prompt for Visual Studio

    msbuild Microsoft.IIS.WebManager.sln
    cd src/Microsoft.IIS.WebManager.SelfHost
    dotnet restore
    msbuild

## How to deploy IIS Web Manager

After building, the `artifacts` directory would contain 2 directories

* To Deploy IIS Web Manager on IIS, deploy `artifacts/site` directory as a website on IIS

* To deploy IIS Web Manager as a .NET core self-host application. Run `dotnet Microsoft.IIS.WebManager.SelfHost.dll` in `artifacts/WebManagerApp/netcoreapp2.1`

### Snapshots

![Website settings in the web manager][file-editor]

[file-editor]: https://iisnetblogs.blob.core.windows.net/media/adminapi/1.0.39/file_editor_with_diff_shrunk2.png "Website settings in the web manager"
