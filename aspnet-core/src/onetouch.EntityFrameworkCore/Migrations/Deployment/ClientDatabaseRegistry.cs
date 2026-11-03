using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;

namespace onetouch.Migrations.Deployment
{
    public static class DeploymentConfiguration
    {
        public static IConfigurationRoot Load(string configPath)
        {
            var fullPath = Path.GetFullPath(configPath);
            if (!File.Exists(fullPath))
                throw new FileNotFoundException("The configuration file was not found.", fullPath);

            var fileName = Path.GetFileName(fullPath);
            var builder = new ConfigurationBuilder().SetBasePath(Path.GetDirectoryName(fullPath));
            if (!string.Equals(fileName, "appsettings.json", StringComparison.OrdinalIgnoreCase) &&
                fileName.StartsWith("appsettings.", StringComparison.OrdinalIgnoreCase))
                builder.AddJsonFile("appsettings.json", optional: true, reloadOnChange: false);

            return builder.AddJsonFile(fileName, optional: false, reloadOnChange: false)
                .AddUserSecrets(typeof(onetouch.Configuration.AppConfigurations).Assembly, optional: true)
                .AddEnvironmentVariables()
                .Build();
        }
    }

    public enum DeploymentEnvironment
    {
        Testing = 1,
        Staging = 2,
        Production = 3
    }

    public sealed class ClientDatabaseTarget
    {
        public string Label { get; }
        public string Url { get; }
        public string Server { get; }
        public string ConnectionString { get; }
        public string Identity { get; }

        public ClientDatabaseTarget(string url, string server, string connectionString)
        {
            Url = url;
            Server = server;
            ConnectionString = connectionString;
            var builder = new SqlConnectionStringBuilder(connectionString);
            if (string.IsNullOrWhiteSpace(builder.DataSource) || string.IsNullOrWhiteSpace(builder.InitialCatalog))
                throw new ClientDatabaseSelectionException("A selected Clients row has an invalid database connection string.");

            Label = builder.DataSource + "/" + builder.InitialCatalog;
            Identity = builder.DataSource.Trim().ToUpperInvariant() + "\n" + builder.InitialCatalog.Trim();
        }
    }

    public sealed class ClientDatabaseSelectionException : Exception
    {
        public ClientDatabaseSelectionException(string message) : base(message) { }
    }

    public static class ClientDatabaseRegistry
    {
        public static DeploymentEnvironment PromptForEnvironment()
        {
            while (true)
            {
                Console.WriteLine("Select the target environment:");
                Console.WriteLine("  1. Testing");
                Console.WriteLine("  2. Staging");
                Console.WriteLine("  3. Production");
                Console.Write("Enter 1, 2, or 3: ");
                var input = Console.ReadLine()?.Trim();
                if (input == "1") return DeploymentEnvironment.Testing;
                if (input == "2") return DeploymentEnvironment.Staging;
                if (input == "3") return DeploymentEnvironment.Production;
                Console.WriteLine("Invalid selection. Choose 1, 2, or 3.");
            }
        }

        public static IReadOnlyList<ClientDatabaseTarget> LoadTargets(
            string ariaMasterConnectionString,
            DeploymentEnvironment environment,
            int commandTimeout = 120,
            string clientUrl = null)
        {
            if (string.IsNullOrWhiteSpace(ariaMasterConnectionString))
                throw new ClientDatabaseSelectionException("ConnectionStrings.AriaMaster is required to select deployment databases.");

            var environmentName = environment.ToString().ToUpperInvariant();
            var targets = new List<ClientDatabaseTarget>();
            using (var connection = new SqlConnection(ariaMasterConnectionString))
            {
                connection.Open();
                using (var command = connection.CreateCommand())
                {
                    command.CommandTimeout = commandTimeout;
                    command.CommandText = "SELECT Url, [Server], ConnectionString FROM dbo.Clients WHERE UPPER([Server]) LIKE @Environment" +
                        (clientUrl == null ? string.Empty : " AND Url = @Url") + " ORDER BY Url";
                    command.Parameters.AddWithValue("@Environment", "%" + environmentName + "%");
                    if (clientUrl != null)
                        command.Parameters.AddWithValue("@Url", clientUrl);

                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            var url = reader.IsDBNull(0) ? string.Empty : reader.GetString(0);
                            var server = reader.IsDBNull(1) ? string.Empty : reader.GetString(1);
                            var connectionString = reader.IsDBNull(2) ? string.Empty : reader.GetString(2);
                            if (string.IsNullOrWhiteSpace(connectionString))
                                throw new ClientDatabaseSelectionException("A selected Clients row has no database connection string.");
                            targets.Add(new ClientDatabaseTarget(url, server, connectionString));
                        }
                    }
                }
            }

            var uniqueTargets = targets.GroupBy(target => target.Identity, StringComparer.Ordinal).Select(group => group.First()).ToList();
            if (uniqueTargets.Count == 0)
            {
                var suffix = clientUrl == null ? string.Empty : " matching the requested client";
                throw new ClientDatabaseSelectionException($"No Clients rows were found with Server containing {environmentName}{suffix}. No databases were processed.");
            }

            return uniqueTargets;
        }
    }
}
