using System;
using System.IO;
using System.Linq;
using System.Reflection;
using Abp.AspNetCore;
using Abp.AspNetCore.Mvc.Antiforgery;
using Abp.AspNetCore.SignalR.Hubs;
using Abp.AspNetZeroCore.Web.Authentication.JwtBearer;
using Abp.Castle.Logging.Log4Net;
using Abp.Extensions;
using Abp.Hangfire;
using Abp.PlugIns;
using Castle.Facilities.Logging;
using Hangfire;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using onetouch.Authorization;
using onetouch.Configuration;
using onetouch.EntityFrameworkCore;
using onetouch.Identity;
using onetouch.Web.Chat.SignalR;
using onetouch.Web.Common;
using Swashbuckle.AspNetCore.Swagger;
using onetouch.Web.IdentityServer;
using onetouch.Web.Swagger;
using Stripe;
using ILoggerFactory = Microsoft.Extensions.Logging.ILoggerFactory;
using GraphQL.Server;
using GraphQL.Server.Ui.Playground;
using HealthChecks.UI.Client;
using IdentityServer4.Configuration;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using onetouch.Configure;
using onetouch.Schemas;
using onetouch.Web.HealthCheck;
using Newtonsoft.Json.Serialization;
using Owl.reCAPTCHA;
using HealthChecksUISettings = HealthChecks.UI.Configuration.Settings;
using onetouch.ActionFilters;
using onetouch.Helpers;
using Abp.Dependency;
using onetouch.AppItems;
using DevExpress.AspNetCore;
using DevExpress.XtraReports.Web.Extensions;
using DevExpress.XtraReports.Security;
using onetouch.Web.Services;
using Microsoft.Extensions.Logging;
using DevExpress.AspNetCore.Reporting;
using Microsoft.AspNetCore.Mvc;
using DevExpress.XtraReports.Web.WebDocumentViewer;
using DevExpress.AspNetCore.Reporting.WebDocumentViewer;
using onetouch.Web.Controllers;
using Swashbuckle.AspNetCore.SwaggerGen;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http.Features;
using DevExpress.AspNetCore.Reporting.QueryBuilder;

namespace onetouch.Web.Startup
{
    public class Startup
    {
        private const string DefaultCorsPolicyName = "localhost";

        private readonly IConfigurationRoot _appConfiguration;
        private readonly IWebHostEnvironment _hostingEnvironment;

        public Startup(IWebHostEnvironment env)
        {
            _hostingEnvironment = env;
            _appConfiguration = env.GetAppConfiguration();
        }

        public IServiceProvider ConfigureServices(IServiceCollection services)
        {
            ////DevExpress config
            //services.AddTransient<WebDocumentViewerController>();
            //services.AddTransient<ReportDesignerController>();
            //services.AddTransient<DevExpress.AspNetCore.Reporting.ReportDesigner.ReportDesignerController>();
            //services.AddDevExpressControls();
            //services.AddScoped<ReportStorageWebExtension, CustomReportStorageWebExtension>();
            //services.AddSingleton<IWebDocumentViewerExceptionHandler, CustomWebDocumentViewerExceptionHandler>();
            //services
            //    .AddMvc()
            //    .AddDefaultReportingControllers()
            //    .AddNewtonsoftJson()
            //    .SetCompatibilityVersion(CompatibilityVersion.Version_3_0);

            //services.AddDevExpressControls();
            //hia
            services.AddTransient<onetouch.Web.Host.Controllers.CustomWebDocumentViewerController>();
            services.AddTransient<onetouch.Web.Host.Controllers.CustomReportDesignerController>();
            services.AddTransient<ReportDesignerController>();
            services.AddDevExpressControls();
            services.AddScoped<ReportStorageWebExtension, CustomReportStorageWebExtension>();
            services.AddSingleton<IWebDocumentViewerExceptionHandler, CustomWebDocumentViewerExceptionHandler>();
            services.AddTransient<onetouch.Web.Host.Controllers.CustomQueryBuilderController>();



            services.Configure<FormOptions>(x =>
            {
                x.MultipartBodyLengthLimit = long.MaxValue; // In case of multipart
            });
            services.ConfigureReportingServices(configurator =>
            {
                configurator.ConfigureReportDesigner(designerConfigurator =>
                {
                    designerConfigurator.RegisterDataSourceWizardConfigFileConnectionStringsProvider();
                });
                configurator.ConfigureWebDocumentViewer(viewerConfigurator =>
                {
                    viewerConfigurator.UseCachedReportSourceBuilder();
                });
            });


            //MVC
            services.AddControllersWithViews(options =>
            {
                options.Filters.Add(new AbpAutoValidateAntiforgeryTokenAttribute());
            }).AddNewtonsoftJson();

            //services.AddMvc(options =>
            //{
            //    options.Filters.Add(new DataActionFilter());
            //});

            services.AddSingleton<Helper>();
            services.AddSingleton<SystemTables>();
            services.AddSingleton<ExcelHelper>();
            //MMT
            services.AddSingleton<DateTimeHelper>();
            //MMT
            services.AddSignalR(options => { options.EnableDetailedErrors = true; });

            //Configure CORS for angular2 UI
            services.AddCors(options =>
            {
                options.AddPolicy(DefaultCorsPolicyName, builder =>
                {
                    //App:CorsOrigins in appsettings.json can contain more than one address with splitted by comma.
                    builder
                        .WithOrigins(
                            // App:CorsOrigins in appsettings.json can contain more than one address separated by comma.
                            _appConfiguration["App:CorsOrigins"]
                                .Split(",", StringSplitOptions.RemoveEmptyEntries)
                                .Select(o => o.RemovePostFix("/"))
                                .ToArray()
                        )
                        .SetIsOriginAllowedToAllowWildcardSubdomains()
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
            });

            IdentityRegistrar.Register(services);
            AuthConfigurer.Configure(services, _appConfiguration);

            //Identity server
            if (bool.Parse(_appConfiguration["IdentityServer:IsEnabled"]))
            {
                IdentityServerRegistrar.Register(services, _appConfiguration, options =>
                     options.UserInteraction = new UserInteractionOptions()
                     {
                         LoginUrl = "/UI/Login",
                         LogoutUrl = "/UI/LogOut",
                         ErrorUrl = "/Error"
                     });
            }

            if (WebConsts.SwaggerUiEnabled)
            {
                //Swagger - Enable this line and the related lines in Configure method to enable swagger UI
                services.AddSwaggerGen(options =>
                {
                    options.SwaggerDoc("v1", new OpenApiInfo() { Title = "onetouch API", Version = "v1" });
                    //options.DocInclusionPredicate((docName, description) => true);
                    options.DocInclusionPredicate((docName, apiDesc) =>
                    {
                        if (!apiDesc.TryGetMethodInfo(out MethodInfo methodInfo)) return false;
                        // Exclude all DevExpress reporting controllers
                        return !methodInfo.DeclaringType.AssemblyQualifiedName.StartsWith("DevExpress", StringComparison.OrdinalIgnoreCase);
                    });
                    options.ParameterFilter<SwaggerEnumParameterFilter>();
                    options.SchemaFilter<SwaggerEnumSchemaFilter>();
                    options.OperationFilter<SwaggerOperationIdFilter>();
                    options.OperationFilter<SwaggerOperationFilter>();
                    options.CustomDefaultSchemaIdSelector();
                }).AddSwaggerGenNewtonsoftSupport();
            }

            //Recaptcha
            services.AddreCAPTCHAV3(x =>
            {
                x.SiteKey = _appConfiguration["Recaptcha:SiteKey"];
                x.SiteSecret = _appConfiguration["Recaptcha:SecretKey"];
            });

            if (WebConsts.HangfireDashboardEnabled)
            {
                //Hangfire(Enable to use Hangfire instead of default job manager)
                services.AddHangfire(config =>
                {
                    config.UseSqlServerStorage(_appConfiguration.GetConnectionString("Default"));
                });
            }

            if (WebConsts.GraphQL.Enabled)
            {
                services.AddAndConfigureGraphQL();
            }

            if (bool.Parse(_appConfiguration["HealthChecks:HealthChecksEnabled"]))
            {
                services.AddAbpZeroHealthCheck();

                var healthCheckUISection = _appConfiguration.GetSection("HealthChecks")?.GetSection("HealthChecksUI");

                if (bool.Parse(healthCheckUISection["HealthChecksUIEnabled"]))
                {
                    services.Configure<HealthChecksUISettings>(settings =>
                    {
                        healthCheckUISection.Bind(settings, c => c.BindNonPublicProperties = true);
                    });
                    services.AddHealthChecksUI();
                }
            }

            //services.AddDevExpressControls();
            //services.AddScoped<ReportStorageWebExtension, CustomReportStorageWebExtension>();

            //Configure Abp and Dependency Injection
            return services.AddAbp<onetouchWebHostModule>(options =>
            {
                //Configure Log4Net logging
                options.IocManager.IocContainer.AddFacility<LoggingFacility>(
                    f => f.UseAbpLog4Net().WithConfig(_hostingEnvironment.IsDevelopment()
                            ? "log4net.config"
                            : "log4net.Production.config")
                );

                options.PlugInSources.AddFolder(Path.Combine(_hostingEnvironment.WebRootPath, "Plugins"), SearchOption.AllDirectories);
            });

        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory)
        {
            /*var builder = new DbContextOptionsBuilder<onetouchDbContext>();
            builder.UseSqlServer(_appConfiguration["ConnectionStrings:Default"]);

            var x = new onetouchDbContext(builder.Options);
            x.Database.Migrate();
            x.Database.CloseConnection();*/
            //Initializes ABP framework.
            app.UseAbp(options =>
            {
                options.UseAbpRequestLocalization = false; //used below: UseAbpRequestLocalization
            });

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseStatusCodePagesWithRedirects("~/Error?statusCode={0}");
                app.UseExceptionHandler("/Error");
            }

            app.UseStaticFiles();
            app.UseRouting();

            app.UseCors(DefaultCorsPolicyName); //Enable CORS!

            app.UseAuthentication();
            app.UseJwtTokenMiddleware();

            if (bool.Parse(_appConfiguration["IdentityServer:IsEnabled"]))
            {
                app.UseJwtTokenMiddleware("IdentityBearer");
                app.UseIdentityServer();
            }

            app.UseAuthorization();

            using (var scope = app.ApplicationServices.CreateScope())
            {
                if (scope.ServiceProvider.GetService<DatabaseCheckHelper>().Exist(_appConfiguration["ConnectionStrings:Default"]))
                {
                    app.UseAbpRequestLocalization();
                }
            }

            if (WebConsts.HangfireDashboardEnabled)
            {
                //Hangfire dashboard &server(Enable to use Hangfire instead of default job manager)
                app.UseHangfireDashboard(WebConsts.HangfireDashboardEndPoint, new DashboardOptions
                {
                    Authorization = new[] { new AbpHangfireAuthorizationFilter(AppPermissions.Pages_Administration_HangfireDashboard) }
                });
                app.UseHangfireServer();
            }

            if (bool.Parse(_appConfiguration["Payment:Stripe:IsActive"]))
            {
                StripeConfiguration.ApiKey = _appConfiguration["Payment:Stripe:SecretKey"];
            }

            if (WebConsts.GraphQL.Enabled)
            {
                app.UseGraphQL<MainSchema>();
                if (WebConsts.GraphQL.PlaygroundEnabled)
                {
                    app.UseGraphQLPlayground(
                        new GraphQLPlaygroundOptions()); //to explorer API navigate https://*DOMAIN*/ui/playground
                }
            }

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapHub<AbpCommonHub>("/signalr");
                endpoints.MapHub<ChatHub>("/signalr-chat");

                endpoints.MapControllerRoute("defaultWithArea", "{area}/{controller=Home}/{action=Index}/{id?}");
                endpoints.MapControllerRoute("default", "{controller=Home}/{action=Index}/{id?}");

                if (bool.Parse(_appConfiguration["HealthChecks:HealthChecksEnabled"]))
                {
                    endpoints.MapHealthChecks("/health", new HealthCheckOptions()
                    {
                        Predicate = _ => true,
                        ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
                    });
                }
            });

            if (bool.Parse(_appConfiguration["HealthChecks:HealthChecksEnabled"]))
            {
                if (bool.Parse(_appConfiguration["HealthChecks:HealthChecksUI:HealthChecksUIEnabled"]))
                {
                    app.UseHealthChecksUI();
                }
            }

            if (WebConsts.SwaggerUiEnabled)
            {
                // Enable middleware to serve generated Swagger as a JSON endpoint
                app.UseSwagger();
                // Enable middleware to serve swagger-ui assets (HTML, JS, CSS etc.)

                app.UseSwaggerUI(options =>
                {
                    options.SwaggerEndpoint(_appConfiguration["App:SwaggerEndPoint"], "onetouch API V1");
                    options.IndexStream = () => Assembly.GetExecutingAssembly()
                        .GetManifestResourceStream("onetouch.Web.wwwroot.swagger.ui.index.html");
                    options.InjectBaseUrl(_appConfiguration["App:ServerRootAddress"]);
                }); //URL: /swagger
            }


            //DevExpress config
            var reportingLogger = loggerFactory.CreateLogger("DXReporting");
            DevExpress.XtraReports.Web.ClientControls.LoggerService.Initialize((exception, message) =>
            {
                var logMessage = $"[{DateTime.Now}]: Exception occurred. Message: '{message}'. Exception Details:\r\n{exception}";
                reportingLogger.LogError(logMessage);
            });

            DevExpress.XtraReports.Configuration.Settings.Default.UserDesignerOptions.DataBindingMode = DevExpress.XtraReports.UI.DataBindingMode.Expressions;
            app.UseDevExpressControls();
            ScriptPermissionManager.GlobalInstance = new ScriptPermissionManager(ExecutionMode.Unrestricted);


            ConfigureXtraReportConnectionStrings();
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            System.Net.ServicePointManager.SecurityProtocol |= System.Net.SecurityProtocolType.Tls12;
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");
            });

        }

        void ProcessException(Exception ex, string message)
        {
            // Log exceptions here. For instance:
            System.Diagnostics.Debug.WriteLine("[{0}]: Exception occured. Message: '{1}'. Exception Details:\r\n{2}",
                DateTime.Now, message, ex);
        }


        private void ConfigureXtraReportConnectionStrings()
        {
            var globalConnectionStrings = _appConfiguration
                .GetSection("ConnectionStrings")
                .AsEnumerable(true)
                .Where(x => x.Key == "Reports")
                .ToDictionary(x => x.Key, x => x.Value);
            DevExpress.DataAccess.DefaultConnectionStringProvider.AssignConnectionStrings(globalConnectionStrings);
        }


    }
}
