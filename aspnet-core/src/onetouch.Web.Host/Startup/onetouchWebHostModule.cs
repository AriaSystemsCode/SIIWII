using System.Collections.Generic;
using Abp.AspNetZeroCore;
using Abp.AspNetZeroCore.Web.Authentication.External;
using Abp.AspNetZeroCore.Web.Authentication.External.Facebook;
using Abp.AspNetZeroCore.Web.Authentication.External.Google;
using Abp.AspNetZeroCore.Web.Authentication.External.Microsoft;
using Abp.AspNetZeroCore.Web.Authentication.External.OpenIdConnect;
using Abp.AspNetZeroCore.Web.Authentication.External.WsFederation;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Abp.Domain.Uow;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Abp.Threading.BackgroundWorkers;
using DevExpress.AspNetCore.Reporting.QueryBuilder;
using DevExpress.AspNetCore.Reporting.WebDocumentViewer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using onetouch.Auditing;
using onetouch.Configuration;
using onetouch.EntityFrameworkCore;
using onetouch.MultiTenancy;
using onetouch.Web.Controllers;
using Abp.Configuration.Startup;
using Abp.Domain.Uow;
using Abp.MultiTenancy;
using Abp.Runtime.Session;
using Microsoft.AspNetCore.Http;
using System;
using System.Linq;
using System.Data.SqlClient;
using onetouch.Accounts;
using onetouch.Web.Configuration;

namespace onetouch.Web.Startup
{



    public class OriginBasedConnectionStringResolver : DefaultConnectionStringResolver
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly AppConfigurationAccessor _configurationAccessor;

        public OriginBasedConnectionStringResolver(
            IAbpStartupConfiguration configuration,
            IHttpContextAccessor httpContextAccessor,
             AppConfigurationAccessor appConfiguration
        ) : base(configuration)
        {
            _httpContextAccessor = httpContextAccessor;
            _configurationAccessor = appConfiguration;
        }

        private void ConfigureXtraReportConnectionStrings()
        {
            var _appConfiguration = _configurationAccessor.Configuration;
            var globalConnectionStrings = _appConfiguration
                .GetSection("ConnectionStrings")
                .AsEnumerable(true)
                .Where(x => x.Key == "Reports")
                .ToDictionary(x => x.Key, x => x.Value);
            DevExpress.DataAccess.DefaultConnectionStringProvider.AssignConnectionStrings(globalConnectionStrings);
        }


        public override string GetNameOrConnectionString(ConnectionStringResolveArgs args)
        {

            var origin = _httpContextAccessor.HttpContext?.Items["XXXRequestOrigin"]?.ToString();
            //return "Server=AriaSQL\\AriaNexus; Database=onetouchDevDb3;TrustServerCertificate=True; User=sa; Password=Aria@2021;";
            //Aria.MASTER
            if (!string.IsNullOrWhiteSpace(origin))
            {
                string AriaMasterConnection = "Server=WEBAPP-DEV\\SIIWII; Database=Aria.MASTER;TrustServerCertificate=True;User ID=sa;Password=Siiwii@2024;";
                using (var conn = new SqlConnection(AriaMasterConnection))
                {
                    conn.Open();

                    using (var cmd = new SqlCommand("SELECT TOP 1 * FROM Clients WHERE Url = @Url", conn))
                    {
                        cmd.Parameters.AddWithValue("@Url", origin);
                        using (var reader = cmd.ExecuteReader())
                        {
                            if (reader.Read()) // only first row
                            {
                                var connectionString = reader["ConnectionString"]?.ToString();
                                var reportsConnectionString = reader["ReportsConnectionString"]?.ToString();
                                var url = reader["Url"]?.ToString();
                                var path = reader["Path"]?.ToString();   // <-- Path column
                                var pathTemp = reader["TempPath"]?.ToString();   // <-- Path Temp column
                                var omitt = reader["Omitt"]?.ToString();   // <-- Omitt column

                                if (!string.IsNullOrEmpty(connectionString))
                                {
                                    var _appConfiguration = _configurationAccessor.Configuration;
                                    _appConfiguration["App:ClientRootAddress"] = url;
                                    _appConfiguration["Attachment:Path"] = @path;   // <-- set from DB
                                    _appConfiguration["Attachment:PathTemp"] = @pathTemp;   // <-- set from DB
                                    _appConfiguration["Attachment:Omitt"] = @omitt;   // <-- set from DB
                                    _appConfiguration["ConnectionStrings:Reports"] = @reportsConnectionString;   // <-- set from DB
                                    ConfigureXtraReportConnectionStrings();

                                    return connectionString;
                                }
                            }

                            // fallback if no row or no valid connection string
                            return base.GetNameOrConnectionString(args);
                        }
                    }

                }
            }

            return base.GetNameOrConnectionString(args);
        }
  
    
   
    
    
    }


    [DependsOn(
        typeof(onetouchWebCoreModule)
    )]
    public class onetouchWebHostModule : AbpModule
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfigurationRoot _appConfiguration;

        public onetouchWebHostModule(
            IWebHostEnvironment env)
        {
            _env = env;
            _appConfiguration = env.GetAppConfiguration();
        }

        public override void PreInitialize()
        {
            Configuration.Modules.AbpWebCommon().MultiTenancy.DomainFormat = _appConfiguration["App:ServerRootAddress"] ?? "https://localhost:44339/";
            Configuration.Modules.AspNetZero().LicenseCode = _appConfiguration["AbpZeroLicenseCode"];


            IocManager.Register<IConnectionStringResolver, OriginBasedConnectionStringResolver>(Abp.Dependency.DependencyLifeStyle.Transient);


        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(onetouchWebHostModule).GetAssembly());
            //IocManager.Register(typeof(WebDocumentViewerController), DependencyLifeStyle.Transient);
            //IocManager.Register(typeof(QueryBuilderController), DependencyLifeStyle.Transient);
            //IocManager.Register(typeof(ReportDesignerController), DependencyLifeStyle.Transient);
        }

        public override void PostInitialize()
        {
            using (var scope = IocManager.CreateScope())
            {
                if (!scope.Resolve<DatabaseCheckHelper>().Exist(_appConfiguration["ConnectionStrings:Default"]))
                {
                    return;
                }
            }

            var workManager = IocManager.Resolve<IBackgroundWorkerManager>();
            if (IocManager.Resolve<IMultiTenancyConfig>().IsEnabled)
            {
                workManager.Add(IocManager.Resolve<SubscriptionExpirationCheckWorker>());
                workManager.Add(IocManager.Resolve<SubscriptionExpireEmailNotifierWorker>());
            }

            if (Configuration.Auditing.IsEnabled && ExpiredAuditLogDeleterWorker.IsEnabled)
            {
                workManager.Add(IocManager.Resolve<ExpiredAuditLogDeleterWorker>());
            }

            ConfigureExternalAuthProviders();
        }

        private void ConfigureExternalAuthProviders()
        {
            var externalAuthConfiguration = IocManager.Resolve<ExternalAuthConfiguration>();

            if (bool.Parse(_appConfiguration["Authentication:OpenId:IsEnabled"]))
            {
                var jsonClaimMappings = new List<JsonClaimMap>();
                _appConfiguration.GetSection("Authentication:OpenId:ClaimsMapping").Bind(jsonClaimMappings);

                externalAuthConfiguration.Providers.Add(
                    new ExternalLoginProviderInfo(
                        OpenIdConnectAuthProviderApi.Name,
                        _appConfiguration["Authentication:OpenId:ClientId"],
                        _appConfiguration["Authentication:OpenId:ClientSecret"],
                        typeof(OpenIdConnectAuthProviderApi),
                        new Dictionary<string, string>
                        {
                            {"Authority", _appConfiguration["Authentication:OpenId:Authority"]},
                            {"LoginUrl",_appConfiguration["Authentication:OpenId:LoginUrl"]},
                            {"ValidateIssuer",_appConfiguration["Authentication:OpenId:ValidateIssuer"]}
                        },
                        jsonClaimMappings
                    )
                );
            }

            if (bool.Parse(_appConfiguration["Authentication:WsFederation:IsEnabled"]))
            {
                externalAuthConfiguration.Providers.Add(
                    new ExternalLoginProviderInfo(
                        WsFederationAuthProviderApi.Name,
                        _appConfiguration["Authentication:WsFederation:ClientId"],
                        "",
                        typeof(WsFederationAuthProviderApi),
                        new Dictionary<string, string>
                        {
                            {"Tenant", _appConfiguration["Authentication:WsFederation:Tenant"]},
                            {"MetaDataAddress", _appConfiguration["Authentication:WsFederation:MetaDataAddress"]},
                            {"Authority", _appConfiguration["Authentication:WsFederation:Authority"]}
                        })
                );
            }

            if (bool.Parse(_appConfiguration["Authentication:Facebook:IsEnabled"]))
            {
                externalAuthConfiguration.Providers.Add(
                    new ExternalLoginProviderInfo(
                        FacebookAuthProviderApi.Name,
                        _appConfiguration["Authentication:Facebook:AppId"],
                        _appConfiguration["Authentication:Facebook:AppSecret"],
                        typeof(FacebookAuthProviderApi)
                    )
                );
            }

            if (bool.Parse(_appConfiguration["Authentication:Google:IsEnabled"]))
            {
                externalAuthConfiguration.Providers.Add(
                    new ExternalLoginProviderInfo(
                        GoogleAuthProviderApi.Name,
                        _appConfiguration["Authentication:Google:ClientId"],
                        _appConfiguration["Authentication:Google:ClientSecret"],
                        typeof(GoogleAuthProviderApi),
                        new Dictionary<string, string>
                        {
                            {"UserInfoEndpoint", _appConfiguration["Authentication:Google:UserInfoEndpoint"]}
                        }
                    )
                );
            }

            //not implemented yet. Will be implemented with https://github.com/aspnetzero/aspnet-zero-angular/issues/5
            if (bool.Parse(_appConfiguration["Authentication:Microsoft:IsEnabled"]))
            {
                externalAuthConfiguration.Providers.Add(
                    new ExternalLoginProviderInfo(
                        MicrosoftAuthProviderApi.Name,
                        _appConfiguration["Authentication:Microsoft:ConsumerKey"],
                        _appConfiguration["Authentication:Microsoft:ConsumerSecret"],
                        typeof(MicrosoftAuthProviderApi)
                    )
                );
            }
        }
    }
}
