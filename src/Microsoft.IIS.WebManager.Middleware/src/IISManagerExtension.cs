// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

using System.IO;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Rewrite;

namespace Microsoft.IIS.WebManager.Middleware
{
    public static class IISManagerExtension
    {
        public static void UseIISWebManager(this IApplicationBuilder app, IHostingEnvironment env, string requestPath = "")
        {
            using (var iisUrlRewriteStreamReader = File.OpenText(Path.Join(env.WebRootPath, "web.config")))
            {
                var options = new RewriteOptions().AddIISUrlRewrite(iisUrlRewriteStreamReader);
                app.UseRewriter(options);
            }
            app.UseDefaultFiles(requestPath);
            app.UseStaticFiles(requestPath);
        }
    }
}
