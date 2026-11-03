using System;
using System.Linq;
using Abp;
using Abp.Dependency;
using Castle.Facilities.Logging;
using Abp.Castle.Logging.Log4Net;
using Abp.PlugIns;
using onetouch.Migrations.Deployment;

namespace onetouch.Migrator
{
    public class Program
    {
        private static bool _skipConnVerification;

        public static int Main(string[] args)
        {
            if (args.Contains("--help") || args.Contains("-h"))
            {
                Console.WriteLine("onetouch.Migrator --config <settings.json> [-s]");
                Console.WriteLine("Loads the specified settings file, prompts for Testing, Staging, or Production, then migrates matching dbo.Clients rows from Aria.Master.");
                Console.WriteLine("-s skips the final migration confirmation; it does not skip environment selection.");
                return 0;
            }

            try
            {
                var configPath = ParseArgs(args);
                MigratorConfiguration.Load(configPath);
                var environment = ClientDatabaseRegistry.PromptForEnvironment();

                using (var bootstrapper = AbpBootstrapper.Create<onetouchMigratorModule>())
                {
                    bootstrapper.IocManager.IocContainer
                        .AddFacility<LoggingFacility>(f => f.UseAbpLog4Net()
                            .WithConfig("log4net.config")
                        );

                    bootstrapper.Initialize();

                    using (var migrateExecuter = bootstrapper.IocManager.ResolveAsDisposable<MultiTenantMigrateExecuter>())
                        return migrateExecuter.Object.Run(environment, _skipConnVerification) ? 0 : 1;
                }
            }
            catch (ClientDatabaseSelectionException ex)
            {
                Console.Error.WriteLine($"Target selection failed: {ex.Message}");
                return 1;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Migration could not complete ({ex.GetType().Name}). No completion was reported.");
                return 1;
            }
        }

        private static string ParseArgs(string[] args)
        {
            string configPath = null;
            for (var i = 0; i < args.Length; i++)
            {
                if (args[i] == "-s")
                {
                    _skipConnVerification = true;
                }
                else if (args[i] == "--config")
                {
                    if (++i >= args.Length || string.IsNullOrWhiteSpace(args[i]) || configPath != null)
                        throw new ArgumentException("--config requires one settings file path.");
                    configPath = args[i];
                }
                else
                {
                    throw new ArgumentException($"Unknown argument: {args[i]}");
                }
            }

            if (string.IsNullOrWhiteSpace(configPath))
                throw new ArgumentException("--config <settings.json> is required.");
            return configPath;
        }
    }
}
