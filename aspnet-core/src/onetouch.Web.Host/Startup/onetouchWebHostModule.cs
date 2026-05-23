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
using Microsoft.EntityFrameworkCore;
using onetouch.Migrations.Seed;
using StackExchange.Redis;
using System.Threading.Tasks;

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
                var _appConfigurationMaster = _configurationAccessor.Configuration;
                string AriaMasterConnection = _appConfigurationMaster["ConnectionStrings:AriaMaster"]?.ToString();
                if(string.IsNullOrEmpty(AriaMasterConnection))
                {
                    // use connection string from config if available, otherwise fallback to hardcoded one
                    AriaMasterConnection = "Server=WEBAPP-DEV\\SIIWII; Database=Aria.MASTER;TrustServerCertificate=True;User ID=sa;Password=Siiwii@2024;";
                }

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


                                    try
                                    {
                                        string isSeeded = reader["IsSeeded"]?.ToString();   // <-- IsSeeded column
                                        if (!string.IsNullOrEmpty(isSeeded) &&
                                            isSeeded.Equals("False", StringComparison.OrdinalIgnoreCase))
                                        {
                                            // Run seeding on a ThreadPool thread (no SynchronizationContext).
                                            // This prevents async-over-sync deadlocks (.ToListAsync().Result etc.)
                                            // that occur when seeding is called from within an ASP.NET HTTP request,
                                            // which has a captured SynchronizationContext on the current thread.
                                            // At startup there is no SynchronizationContext so seeding works fine;
                                            // during an HTTP request the context is present and causes a hang.
                                            Task.Run(() => EnsureDatabaseSeeded(connectionString, origin, AriaMasterConnection))
                                                .GetAwaiter().GetResult();
                                        }
                                    }
                                    catch (Exception ex)
                                    {
                                        // Log the exception or handle it as needed
                                        Console.WriteLine($"Error during database seeding: {ex.Message}");
                                        // Optionally, you can rethrow the exception or return a default connection string
                                        //throw;
                                    }

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


        private void EnsureDatabaseSeeded(string connectionString, string origin, string AriaMasterConnection)
        {
            // Open an explicit SqlConnection and pass it to DbContextOptionsBuilder.
            // This prevents ABP's IConnectionStringResolver from being re-invoked during
            // seeding (which would fail because there is no valid HTTP context at this point).
            // Use Microsoft.Data.SqlClient (same provider as EF Core's SQL Server) so the
            // connection string keywords (TrustServerCertificate, Encrypt, etc.) are handled
            // identically. The legacy System.Data.SqlClient package fails with "Instance failure"
            // when the connection string contains keywords or TLS settings it doesn't support.
            using (var sqlConn = new Microsoft.Data.SqlClient.SqlConnection(connectionString))
            {
                sqlConn.Open();

                var optionsBuilder = new DbContextOptionsBuilder<onetouchDbContext>();
                // Pass the already-open Microsoft.Data.SqlClient connection so EF Core
                // binds to it directly and never calls back into ABP's resolver.
                optionsBuilder.UseSqlServer(sqlConn);

                using (var context = new onetouchDbContext(optionsBuilder.Options))
                {
                    // Run migrations to ensure all tables exist in the client database
                    // context.Database.Migrate();

                    SeedHelper.SeedHostDb(context);

                    // Log DB name and seed datetime to Logs.txt (same file used by the app logger)
                    var seedDbName = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder(connectionString).InitialCatalog;
                    var seedLogDir  = System.IO.Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "App_Data", "Logs");
                    var seedLogPath = System.IO.Path.Combine(seedLogDir, "LogsSeeding.txt");
                    try
                    {
                        System.IO.Directory.CreateDirectory(seedLogDir); // no-op if already exists
                        var seedLogEntry = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC] Database seeded: {seedDbName}{Environment.NewLine}";
                        System.IO.File.AppendAllText(seedLogPath, seedLogEntry);
                    }
                    catch (Exception logEx)
                    {
                        // Last-resort: write the logging failure to Console so it appears in the process output
                        Console.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC] WARNING: Could not write seed log to '{seedLogPath}': {logEx.Message}");
                    }

                    // Update IsSeeded flag in Aria.MASTER
                    using (var conn = new System.Data.SqlClient.SqlConnection(AriaMasterConnection))
                    {
                        conn.Open();
                        using (var cmd = new System.Data.SqlClient.SqlCommand("UPDATE Clients SET IsSeeded = 'True' WHERE Url = @Url", conn))
                        {
                            cmd.Parameters.AddWithValue("@Url", origin);
                            cmd.ExecuteNonQuery();
                        }
                    }
                }
            }
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
            Configuration.Modules.AbpWebCommon().MultiTenancy.DomainFormat = _appConfiguration["App:ServerRootAddress"] ?? "https://localhost:44336/";
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
