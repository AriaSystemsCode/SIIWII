using onetouch.Seeder;

var count = 0;
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

var read = Options.Parse(new[] { "--config", "settings.json" });
Check(!read.Apply && read.CommandTimeout == 120, "default mode is read-only");
Reject("apply without maintenance", "--config", "x", "--content-root", ".", "--apply");
Reject("apply without assets root", "--config", "x", "--apply", "--maintenance-confirmed");
Reject("conflicting modes", "--config", "x", "--content-root", ".", "--apply", "--check", "--maintenance-confirmed");
Reject("unknown switch", "--config", "x", "--force");
Reject("duplicate config", "--config", "x", "--config", "y");
Reject("unlimited command timeout", "--config", "x", "--command-timeout", "0");
Reject("missing value", "--config", "--apply");
var apply = Options.Parse(new[] { "--config", "x", "--content-root", ".", "--apply", "--maintenance-confirmed", "--client-url", "https://client", "--command-timeout", "300" });
Check(apply.Apply && apply.ClientUrl == "https://client" && apply.CommandTimeout == 300, "targeted apply arguments");
var first = Target.Create("default", "Server=sql;Database=client;Integrated Security=True");
var second = Target.Create("client-1", "Data Source=SQL;Initial Catalog=client;User ID=other;Password=not-real");
Check(StringComparer.Ordinal.Equals(first.Identity, second.Identity), "identity ignores credentials and connection keyword aliases");
Check(new[] { first, second }.DistinctBy(t => t.Identity, StringComparer.Ordinal).Count() == 1, "shared default/client database deduplicated");
Check(first.Identity != Target.Create("case-sensitive", "Server=sql;Database=CLIENT;Integrated Security=True").Identity, "case-sensitive database names are not accidentally skipped");
Check(first.Identity != Target.Create("other", "Server=sql;Database=other;Integrated Security=True").Identity, "different catalogs remain separate");
try { Target.Create("invalid", "Server=sql;Integrated Security=True"); throw new Exception("FAIL: implicit database"); }
catch (ArgumentException) { Check(true, "implicit database refused"); }
Check(SeedRelease.RequiredVersion > 0, "release version positive");
Console.WriteLine($"{count} checks passed; no database connections made.");
