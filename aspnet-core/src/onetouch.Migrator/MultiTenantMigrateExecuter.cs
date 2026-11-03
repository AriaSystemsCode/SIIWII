using System;
using Abp.Dependency;
using Abp.Extensions;
using Abp.Runtime.Security;
using Microsoft.Data.SqlClient;
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
                }
                catch (Exception ex)
                {
                    failed = true;
                    var sql = ex as SqlException ?? ex.InnerException as SqlException;
                    Log.Write($"{environment} database={target.Label}: FAILED type={ex.GetType().Name} sqlNumber={sql?.Number}");
                }
            }

            Log.Write(failed
                ? $"Migration finished for {environment} with failures. Review each database result above."
                : $"Migration completed successfully for all {targets.Count} {environment} database(s).");
            return !failed;
        }
    }
}
