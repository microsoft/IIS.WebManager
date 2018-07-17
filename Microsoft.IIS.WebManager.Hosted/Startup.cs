using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.Extensions.DependencyInjection;

namespace Microsoft.IIS.WebManager.Hosted
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            using (var iisUrlRewriteStreamReader = File.OpenText(Path.Join(env.WebRootPath, "web.config")))
            {
                var options = new RewriteOptions().AddIISUrlRewrite(iisUrlRewriteStreamReader);
                app.UseRewriter(options);
            }
            app.UseDefaultFiles();
            app.UseStaticFiles();
        }
    }
}
