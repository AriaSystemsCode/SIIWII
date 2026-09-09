using System.Data;
using System.Diagnostics;
using System.Text.Json;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using onetouch.EntityFrameworkCore;
using onetouch.Migrations.Seed;

namespace onetouch.Seeder;

public static class Program
{
    public static int Main(string[] args)
    {
        if (args.Length == 0 || args.Contains("--help"))
        {
            Console.WriteLine("onetouch.Seeder --config <release-settings.json> --content-root <backend-release-folder> [--check | --apply --maintenance-confirmed] [--client-url <exact registered URL>] [--command-timeout <seconds>]");
            Console.WriteLine("Default: read-only check. Exit 0=ready, 1=failure, 2=seed required. No migrations or database creation. Secrets may instead use ConnectionStrings__Default and ConnectionStrings__AriaMaster environment variables.");
            return 0;
        }

        try
        {
            var options = Options.Parse(args);
            var targets = LoadTargets(options);
            if (options.Apply)
            {
                // Existing seed routines resolve Assets relative to the current directory.
                if (!Directory.Exists(Path.Combine(options.ContentRoot, "Assets")))
                    throw new InvalidOperationException("Release content root must contain Assets.");
                Directory.SetCurrentDirectory(options.ContentRoot);
            }

            var failed = false;
            var pending = false;
            foreach (var target in targets)
            {
                var timer = Stopwatch.StartNew();
                try
                {
                    var ready = Process(target, options);
                    pending |= !ready;
                    Console.WriteLine($"{DateTime.UtcNow:O} {target.Label}: {(ready ? "READY" : "SEED_REQUIRED")} version={SeedRelease.RequiredVersion} elapsed={timer.Elapsed}");
                }
                catch (Exception ex)
                {
                    failed = true;
                    // SQL/EF exception messages can contain credentials or customer data.
                    var sql = ex as SqlException ?? ex.InnerException as SqlException;
                    Console.Error.WriteLine($"{DateTime.UtcNow:O} {target.Label}: FAILED type={ex.GetType().Name} sqlNumber={sql?.Number} elapsed={timer.Elapsed}. Traffic must remain offline; investigate then rerun.");
                }
            }
            return failed ? 1 : pending ? 2 : 0;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Seeder could not complete ({ex.GetType().Name}). Check arguments, release assets, configuration and database access. No readiness approval issued.");
            return 1;
        }
    }

    private static List<Target> LoadTargets(Options options)
    {
        using var settings = JsonDocument.Parse(File.ReadAllText(options.ConfigPath),
            new JsonDocumentOptions { CommentHandling = JsonCommentHandling.Skip, AllowTrailingCommas = true });
        string Connection(string name)
        {
            var value = Environment.GetEnvironmentVariable("ConnectionStrings__" + name);
            if (string.IsNullOrWhiteSpace(value) &&
                settings.RootElement.TryGetProperty("ConnectionStrings", out var section) &&
                section.TryGetProperty(name, out var entry))
                value = entry.GetString();
            if (string.IsNullOrWhiteSpace(value))
                throw new InvalidOperationException("Missing connection configuration.");
            return value;
        }

        var targets = new List<Target>();
        if (options.ClientUrl == null)
            targets.Add(Target.Create("default", Connection("Default")));

        using var master = new SqlConnection(Connection("AriaMaster"));
        master.Open();
        using var command = master.CreateCommand();
        command.CommandTimeout = options.CommandTimeout;
        // No enabled/disabled column is assumed: every registered client is required.
        command.CommandText = options.ClientUrl == null
            ? "SELECT Url, ConnectionString FROM dbo.Clients ORDER BY Url"
            : "SELECT Url, ConnectionString FROM dbo.Clients WHERE Url = @url";
        if (options.ClientUrl != null)
            command.Parameters.AddWithValue("@url", options.ClientUrl);
        using var reader = command.ExecuteReader();
        var index = 0;
        while (reader.Read())
        {
            index++;
            if (reader.IsDBNull(1) || string.IsNullOrWhiteSpace(reader.GetString(1)))
                throw new InvalidOperationException("Registered client has no connection string.");
            // Labels deliberately omit URLs and connection strings from deployment logs.
            targets.Add(Target.Create($"client-{index}", reader.GetString(1)));
        }
        if (options.ClientUrl != null && index == 0)
            throw new InvalidOperationException("Requested client is not registered.");
        return targets.DistinctBy(t => t.Identity, StringComparer.Ordinal).ToList();
    }

    private static bool Process(Target target, Options options)
    {
        // A session-owned application lock covers both history setup and seed execution.
        // Pooling is disabled so disposal always closes the physical lock-owning session.
        var builder = new SqlConnectionStringBuilder(target.ConnectionString) { Pooling = false };
        using var connection = new SqlConnection(builder.ConnectionString);
        connection.Open();
        if (!options.Apply)
            return ReadVersion(connection, options.CommandTimeout) == SeedRelease.RequiredVersion;

        using (var acquire = connection.CreateCommand())
        {
            acquire.CommandTimeout = options.CommandTimeout;
            acquire.CommandText = "DECLARE @r int; EXEC @r = sys.sp_getapplock @Resource=N'onetouch:deployment-seed', @LockMode='Exclusive', @LockOwner='Session', @LockTimeout=0; SELECT @r;";
            if (Convert.ToInt32(acquire.ExecuteScalar()) < 0)
                throw new InvalidOperationException("Another seeder owns this database.");
        }

        var current = ReadVersion(connection, options.CommandTimeout);
        if (current > SeedRelease.RequiredVersion)
            throw new InvalidOperationException("Database seed version is newer than this release; downgrade refused.");
        if (current == SeedRelease.RequiredVersion)
            return true;

        using (var create = connection.CreateCommand())
        {
            create.CommandTimeout = options.CommandTimeout;
            create.CommandText = "IF OBJECT_ID(N'dbo.__OneTouchSeedHistory', N'U') IS NULL CREATE TABLE dbo.__OneTouchSeedHistory (Version int NOT NULL PRIMARY KEY, AppliedAtUtc datetime2 NOT NULL, RunnerVersion nvarchar(100) NOT NULL);";
            create.ExecuteNonQuery();
        }

        var contextOptions = new DbContextOptionsBuilder<onetouchDbContext>()
            .UseSqlServer(connection, sql => sql.CommandTimeout(options.CommandTimeout)).Options;
        using var context = new onetouchDbContext(contextOptions);
        using var transaction = context.Database.BeginTransaction();
        // Reuse the existing cumulative seed snapshot unchanged. All SaveChanges calls
        // share this transaction, so a failed attempt does not leave a partial seed.
        SeedHelper.SeedHostDb(context);
        context.SaveChanges();
        context.Database.ExecuteSqlInterpolated($"INSERT INTO dbo.__OneTouchSeedHistory (Version, AppliedAtUtc, RunnerVersion) VALUES ({SeedRelease.RequiredVersion}, SYSUTCDATETIME(), {typeof(Program).Assembly.GetName().Version!.ToString()})");
        transaction.Commit();
        return true;
    }

    private static int ReadVersion(SqlConnection connection, int timeout)
    {
        using var command = connection.CreateCommand();
        command.CommandTimeout = timeout;
        command.CommandText = "IF OBJECT_ID(N'dbo.__OneTouchSeedHistory', N'U') IS NULL SELECT 0; ELSE EXEC(N'SELECT COALESCE(MAX(Version), 0) FROM dbo.__OneTouchSeedHistory');";
        return Convert.ToInt32(command.ExecuteScalar());
    }
}

public static class SeedRelease
{
    // Increment only when the cumulative seed snapshot changes. Never change through CLI.
    // This is seed data versioning, not EF schema migration versioning.
    public const int RequiredVersion = 1;
}

public sealed record Target(string Label, string ConnectionString, string Identity)
{
    public static Target Create(string label, string connectionString)
    {
        var builder = new SqlConnectionStringBuilder(connectionString);
        if (string.IsNullOrWhiteSpace(builder.DataSource) || string.IsNullOrWhiteSpace(builder.InitialCatalog))
            throw new ArgumentException("Explicit SQL server and database are required.");
        // Preserve catalog case: SQL instances may use case-sensitive database names.
        // Alternate names for the same physical DB are still protected by its lock/history.
        return new Target(label, connectionString, builder.DataSource.Trim().ToUpperInvariant() + "\n" + builder.InitialCatalog.Trim());
    }
}

public sealed record Options(string ConfigPath, string ContentRoot, bool Apply, string? ClientUrl, int CommandTimeout)
{
    public static Options Parse(string[] args)
    {
        var values = new Dictionary<string, string>(StringComparer.Ordinal);
        var switches = new HashSet<string>(StringComparer.Ordinal);
        for (var i = 0; i < args.Length; i++)
        {
            var key = args[i];
            if (key is "--check" or "--apply" or "--maintenance-confirmed")
            {
                if (!switches.Add(key)) throw new ArgumentException("Duplicate switch.");
            }
            else if (key is "--config" or "--content-root" or "--client-url" or "--command-timeout")
            {
                if (++i >= args.Length || string.IsNullOrWhiteSpace(args[i]) || args[i].StartsWith("--") || !values.TryAdd(key, args[i]))
                    throw new ArgumentException("Missing or duplicate argument.");
            }
            else throw new ArgumentException("Unknown argument.");
        }
        var apply = switches.Contains("--apply");
        if (apply && (!switches.Contains("--maintenance-confirmed") || switches.Contains("--check")))
            throw new ArgumentException("Apply requires maintenance confirmation and cannot be combined with check.");
        if (!values.TryGetValue("--config", out var config)) throw new ArgumentException("Config is required.");
        if (apply && !values.ContainsKey("--content-root")) throw new ArgumentException("Content root is required for apply.");
        var timeout = values.TryGetValue("--command-timeout", out var seconds) ? int.Parse(seconds) : 120;
        if (timeout < 1 || timeout > 3600) throw new ArgumentException("Timeout must be between 1 and 3600 seconds.");
        return new Options(Path.GetFullPath(config), Path.GetFullPath(values.GetValueOrDefault("--content-root", ".")), apply,
            values.GetValueOrDefault("--client-url"), timeout);
    }
}
