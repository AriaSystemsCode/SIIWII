using onetouch.Seeder;
using onetouch.Migrations.Deployment;

var count = 0;
var settingsPath = Path.Combine(Path.GetTempPath(), "onetouch-seeder-tests-" + Guid.NewGuid().ToString("N") + ".json");
File.WriteAllText(settingsPath, "{}");
void Check(bool condition, string name)
{
    if (!condition) throw new Exception("FAIL: " + name);
    Console.WriteLine("PASS: " + name);
    count++;
}
void Reject(string name, params string[] args)
{
    try { Options.Parse(args); }
    catch (ArgumentException) { Check(true, name); return; }
    throw new Exception("FAIL: accepted " + name);
}

var read = Options.Parse(new[] { "--config", settingsPath });
Check(!read.Apply && read.CommandTimeout == 120, "default mode is read-only");
Reject("apply without maintenance", "--config", settingsPath, "--content-root", ".", "--apply");
Reject("apply without assets root", "--config", settingsPath, "--apply", "--maintenance-confirmed");
Reject("conflicting modes", "--config", settingsPath, "--content-root", ".", "--apply", "--check", "--maintenance-confirmed");
Reject("unknown switch", "--config", settingsPath, "--force");
Reject("duplicate config", "--config", settingsPath, "--config", "y");
Reject("unlimited command timeout", "--config", settingsPath, "--command-timeout", "0");
Reject("missing value", "--config", "--apply");
var apply = Options.Parse(new[] { "--config", settingsPath, "--content-root", ".", "--apply", "--maintenance-confirmed", "--client-url", "https://client", "--command-timeout", "300" });
Check(apply.Apply && apply.ClientUrl == "https://client" && apply.CommandTimeout == 300, "targeted apply arguments");
var first = new ClientDatabaseTarget("default", "TESTING", "Server=sql;Database=client;Integrated Security=True");
var second = new ClientDatabaseTarget("client-1", "TESTING", "Data Source=SQL;Initial Catalog=client;User ID=other;Password=not-real");
Check(StringComparer.Ordinal.Equals(first.Identity, second.Identity), "identity ignores credentials and connection keyword aliases");
Check(new[] { first, second }.DistinctBy(t => t.Identity, StringComparer.Ordinal).Count() == 1, "duplicate client database deduplicated");
Check(first.Identity != new ClientDatabaseTarget("case-sensitive", "TESTING", "Server=sql;Database=CLIENT;Integrated Security=True").Identity, "case-sensitive database names are not accidentally skipped");
Check(first.Identity != new ClientDatabaseTarget("other", "TESTING", "Server=sql;Database=other;Integrated Security=True").Identity, "different catalogs remain separate");
try { new ClientDatabaseTarget("invalid", "TESTING", "Server=sql;Integrated Security=True"); throw new Exception("FAIL: implicit database"); }
catch (ClientDatabaseSelectionException) { Check(true, "implicit database refused"); }
Check(SeedRelease.RequiredVersion > 0, "release version positive");
File.Delete(settingsPath);
Console.WriteLine($"{count} checks passed; no database connections made.");
