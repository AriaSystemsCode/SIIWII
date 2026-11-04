using System;
using System.Linq;
using Abp.Dependency;
using Abp.Extensions;
using Abp.Runtime.Security;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using onetouch.EntityFrameworkCore;
using onetouch.Migrations.Deployment;
using onetouch.MultiTenancy;

namespace onetouch.Migrator
{
    public class MultiTenantMigrateExecuter : ITransientDependency
    {
        public Log Log { get; private set; }

        private readonly AbpZeroDbMigrator _migrator;

        public MultiTenantMigrateExecuter(AbpZeroDbMigrator migrator, Log log)
        {
            Log = log;
            _migrator = migrator;
        }

        public bool Run(DeploymentEnvironment environment, bool skipConfirmation)
        {
            var targets = ClientDatabaseRegistry.LoadTargets(
                MigratorConfiguration.Current.GetConnectionString("AriaMaster"), environment);

            Log.Write($"Selected {targets.Count} {environment} database(s) from Aria.Master dbo.Clients:");
            foreach (var target in targets)
                Log.Write($"  {target.Label}");

            if (!skipConfirmation)
            {
                Log.Write("Continue with schema migrations for these databases? (Y/N): ");
                var answer = Console.ReadLine();
                if (!answer.IsIn("Y", "y"))
                {
                    Log.Write("Migration canceled. No client databases were processed.");
                    return false;
                }
            }

            var failed = false;
            var index = 0;
            foreach (var target in targets)
            {
                index++;
                Log.Write($"{environment} database={target.Label}: connection={DescribeConnection(target.ConnectionString)}");
                LogMigrationStatus(target, "BEFORE", Log);
                try
                {
                    // The existing ABP migrator expects a tenant record with an encrypted
                    // connection string. This transient record points it at the selected
                    // Aria.Master client database without consulting the host tenant table.
                    var tenant = new Tenant($"deployment-{index}", target.Label)
                    {
                        ConnectionString = SimpleStringCipher.Instance.Encrypt(target.ConnectionString)
                    };
                    _migrator.CreateOrMigrateForTenant(tenant);
                    Log.Write($"{environment} database={target.Label}: MIGRATED");
                    LogMigrationStatus(target, "AFTER", Log);
                }
                catch (Exception ex)
                {
                    failed = true;
                    var sql = FindSqlException(ex);
                    Log.Write($"{environment} database={target.Label}: FAILED type={ex.GetType().Name} sqlNumber={sql?.Number}{Environment.NewLine}{ex}");
                    LogMigrationStatus(target, "AFTER FAILURE", Log);
                }
            }

            Log.Write(failed
                ? $"Migration finished for {environment} with failures. Review each database result above."
                : $"Migration completed successfully for all {targets.Count} {environment} database(s).");
            return !failed;
        }

        private static string DescribeConnection(string connectionString)
        {
            var connection = new SqlConnectionStringBuilder(connectionString);
            var authentication = connection.IntegratedSecurity
                ? "Windows integrated"
                : string.IsNullOrWhiteSpace(connection.UserID)
                    ? "SQL/default credentials"
                    : $"SQL login={connection.UserID}";

            return $"Server={connection.DataSource}; Database={connection.InitialCatalog}; Authentication={authentication}; " +
                   $"Encrypt={connection["Encrypt"]}; TrustServerCertificate={connection["TrustServerCertificate"]}; " +
                   $"ConnectTimeout={connection.ConnectTimeout} seconds; Password=(redacted)";
        }

        private static void LogMigrationStatus(ClientDatabaseTarget target, string phase, Log log)
        {
            try
            {
                var options = new DbContextOptionsBuilder<onetouchDbContext>();
                onetouchDbContextConfigurer.Configure(options, target.ConnectionString);
                using var context = new onetouchDbContext(options.Options);

                var appMigrations = context.Database.GetMigrations().ToList();
                var databaseMigrations = context.Database.GetAppliedMigrations().ToList();
                var pendingCount = appMigrations.Except(databaseMigrations).Count();
                log.Write($"{phase} migration status database={target.Label}: " +
                          $"currentDbMigration={databaseMigrations.LastOrDefault() ?? "(none)"}; " +
                          $"currentAppMigration={appMigrations.LastOrDefault() ?? "(none)"}; " +
                          $"pendingMigrations={pendingCount}");
            }
            catch (Exception ex)
            {
                log.Write($"{phase} migration status unavailable database={target.Label}: {ex}");
            }
        }

        private static SqlException FindSqlException(Exception exception)
        {
            for (var current = exception; current != null; current = current.InnerException)
            {
                if (current is SqlException sqlException)
                    return sqlException;
            }

            return null;
        }
    }
}
