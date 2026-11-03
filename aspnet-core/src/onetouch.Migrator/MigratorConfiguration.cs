using System;
using Microsoft.Extensions.Configuration;
using onetouch.Migrations.Deployment;

namespace onetouch.Migrator
{
    public static class MigratorConfiguration
    {
        public static IConfigurationRoot Current { get; private set; }

        public static void Load(string configPath)
        {
            Current = DeploymentConfiguration.Load(configPath);
        }
    }
}
