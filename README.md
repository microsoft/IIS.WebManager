# Microsoft IIS Web Manager
Microsoft IIS Web Manager provides a browser interface for users to manage local and remote installations of  IIS. It can be used standalone or inside the Windows Admin Center (WAC). Currently, the project is built and tested for WAC only.

## Windows Admin Center (WAC) and IIS Extension
Information about WAC and the IIS Extension can be found here,
* [Windows Admin Center Overview | Microsoft Docs](https://docs.microsoft.com/en-us/windows-server/manage/windows-admin-center/overview)
* [Manage Internet Information Services (IIS) using Windows Admin Center (WAC)](https://4sysops.com/archives/manage-internet-information-services-iis-using-windows-admin-center-wac/)
* [Windows Admin Center Common Troubleshooting Steps | Microsoft Docs](https://docs.microsoft.com/en-us/windows-server/manage/windows-admin-center/support/troubleshooting)
* [Develop an extension for Windows Admin Center (WAC SDK)](https://docs.microsoft.com/en-us/windows-server/manage/windows-admin-center/extend/developing-extensions)

## Prerequisites
* Install Node.js from https://nodejs.org/en/download/
* Install Gulp, `npm install --global gulp-cli`
* Install dependencies by running `nmp install` in the 'src` sub folder
* Run `npm audit fix --legacy-peer-deps` to get rid of some security warnings
* Path to `NuGet.exe` must be in PATH environment variable. NuGet.exe can be found [here](https://www.nuget.org/downloads)

```
npm install --global gulp-cli
cd src
npm install
npm audit fix --legacy-peer-deps
```

## Build

* [Optional] Start PowerShell as Administrator, run `Set-ExecutionPolicy -ExecutionPolicy Unrestricted` to grant persmissions for PowerShell scripts
* Open a PowerShell window, go to the project root folder, run `.\build.ps1` to build the project
* Run `.\build.ps1 --pack --output-hashing all --version=xx.xxx` to create the NuGet package

```
.\build.ps1                       # for wac
.\build.ps1 --env=wac             # for wac
.\build.ps1 --env=site            # for non-wac build
.\build.ps1 --pack --output-hashing all --version=0.2.1
```

Output will be generated in `dist` directory. 

## Test with Windows Admin Center (WAC)

* Install WAC on a Window client to manage other Windows client or Windows server machines. To avoid permission issues with IIS Administration, you should use WAC to manage IIS on a different machine. 
* You don't need to install WAC in Dev mode as instructed by the WAC documentation
* To install the newly built NuGet package on WAC, first add a new Feeds location as described [here](https://docs.microsoft.com/en-us/windows-server/manage/windows-admin-center/configure/using-extensions#installing-extensions-from-a-different-feed), pointing to your msft.iis.iis-management.x.x.x.nupkg in the `dist` folder
* Once you see **msft.iis.iis-management** from the available IIS extensions section, install it
* When you update the IIS Extension in WAC, the browser may hold cache for the updated pages. To make sure you are not accessing the cached pages, open the browser as guest, and close/re-open WAC after you have updated the IIS Extension

## Test it standalone
You can run the project locally with `gulp`.

```
cd src
gulp build
gulp serve
```


