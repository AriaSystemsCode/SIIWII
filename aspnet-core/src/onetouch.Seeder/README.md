# Deployment database seeding

The web process no longer seeds databases during startup or connection resolution.
Publish and run this console application from the SAME release as the backend.
It reuses the existing seed helper; translation generation is not changed.

## Release contract

`SeedRelease.RequiredVersion` in `Program.cs` is the version-controlled required
seed snapshot (initial version 1). Increment it whenever the existing cumulative
seed routines or their assets change. It is not an arbitrary command-line value.
Each database records successful snapshots in `dbo.__OneTouchSeedHistory`.
This is a cumulative snapshot runner, not an ordered migration engine: a database
at version 1 moving to 3 executes release 3's complete existing seed helper once.
Future non-cumulative data transformations require explicit ordered steps instead.

Existing `Clients.IsSeeded` values are ignored and left untouched. Do not mark old
databases version 1 merely because that flag is True: run the new seed baseline.
No database or EF schema migration is applied automatically. Existing schema must
already match the release. New databases must be created/migrated separately.

## Build / publish (no database access)

From `aspnet-core`:

```powershell
dotnet publish src/onetouch.Seeder/onetouch.Seeder.csproj -c Release -o artifacts/seeder
dotnet run --project tests/onetouch.Seeder.Tests/onetouch.Seeder.Tests.csproj
```

Publish the backend and its `Assets` directory normally. Keep seeder artifacts
outside the IIS web root. The runner sets its working directory to the supplied
backend content root because existing seeds read `Assets` from that location.
The seeder requires the .NET 7 runtime, matching the existing backend target.

## Configuration and read-only preflight

Pass one effective JSON settings file with `ConnectionStrings.Default` and
`ConnectionStrings.AriaMaster`. These can be overridden by environment variables
`ConnectionStrings__Default` and `ConnectionStrings__AriaMaster`. There is NO
hardcoded credential fallback, environment-specific JSON merge, or secret logging.
Do not commit production credentials. Select the intended environment explicitly.

```powershell
dotnet artifacts/seeder/onetouch.Seeder.dll --config <effective-settings.json> --check
```

Check mode only reads registry/history; it creates no tables or seed data.
Exit codes: **0** all selected databases match this release, **1** failure,
**2** at least one selected database does not match the required seed version.
A newer database is not accepted by check and is refused by apply (no downgrade).
The SQL principal needs permission to see/read the history table for check mode.

All rows of `dbo.Clients` are included; the current implementation assumes no
active-client column. Blank/invalid connections fail the job rather than silently
skipping a client. Default and client databases are deduplicated by server/catalog;
server case is normalized but catalog case is preserved for case-sensitive SQL instances.
Use consistent server names (DNS aliases cannot be normalized
offline). Physical databases reached by aliases still share the database lock and
version history, preventing a second successful application of the same version.
Console labels are `default` / `client-N` in registry URL order, without secrets.

## Deployment sequence (operator / pipeline)

1. Back up affected databases and test the release against disposable restored
   copies. Freeze registry/provisioning changes for the deployment window.
2. Put EVERY backend instance serving these databases offline, drain active requests,
   and pause background workers that write to them. `app_offline.htm` on one server
   alone is not sufficient for a multi-server deployment.
3. Deploy the backend, seeder, matching Assets and required schema changes. Do not
   restore traffic yet. Existing migrator tooling may itself seed; do not run it
   concurrently with this runner, and account for that legacy behavior separately.
4. Run the guarded wrapper (from `aspnet-core`):

```powershell
./deployment/Invoke-SeedRelease.ps1 -SeederDll <published-seeder.dll> -BackendReleasePath <backend-release-directory> -ConfigPath <effective-settings.json>
```

5. Require successful exit, review per-database status, and run deployment smoke
   checks. Only then remove the maintenance marker/restore traffic. The wrapper
   intentionally NEVER deletes the marker, even after success.

The wrapper checks that `app_offline.htm` exists, but cannot prove that all workers
are drained or other servers are offline. That remains a deployment responsibility.
There is deliberately no per-request readiness query. Traffic gating is operational;
bypassing this sequence can expose an unseeded database. Ordinary restarts do not seed.

## New client provisioning / targeted retry

After schema provisioning and registry registration, before enabling client access:

```powershell
dotnet <published-seeder.dll> --config <effective-settings.json> --content-root <backend-release-directory> --client-url <exact-registered-url> --apply --maintenance-confirmed
dotnet <published-seeder.dll> --config <effective-settings.json> --client-url <exact-registered-url> --check
```

`--client-url` selects only matching registry rows, not the unrelated default DB.
If other clients share that database, take all of them offline as well. The explicit
maintenance confirmation is an operator assertion, not automatic access control.

## Concurrency, failures and retry

Databases are processed sequentially. A session-owned SQL application lock prevents
concurrent seed runners for the same DB. Lock contention fails immediately. No
automatic retry loop hides failures; other databases are attempted but overall exit
is failure if any one fails. SQL command timeout defaults to 120 seconds and accepts
`--command-timeout 1..3600`; this is per command, NOT a whole-job deadline. Configure
an overall timeout and process-tree termination in the deployment orchestrator.

All existing seed `SaveChanges` calls and the successful history insert share one
explicit database transaction. On an exception/crash before commit, database writes
roll back; after commit, reruns skip that version. The empty history table may remain
after failure. Pooling is disabled on the lock-owning connection, so closing it
releases the lock. The principal needs table creation, seed write and application
lock permissions. A long transaction can require substantial transaction-log space.

Status/timing and exception type/SQL error number go to stdout/stderr for pipeline
capture. Raw exception messages are suppressed because they may expose credentials
or customer data. Inspect SQL diagnostics securely when deeper investigation is
required. Do not blindly retry a deterministic data/schema failure.

## Required staging acceptance tests

The included no-database tests validate CLI safety and target identity only.
On disposable restored databases, verify:

- Default plus two client DBs, duplicate registry connections, and targeted selection.
- Initial version applies, repeat run skips, increased release version applies.
- Newer recorded version refuses downgrade; unknown client/blank connection fails.
- Seed error after earlier SaveChanges rolls back both seed writes and success record.
- Two simultaneous runners: one holds the lock; the other fails without seeding.
- Timeout, unavailable DB and process interruption leave traffic offline; retry works.
- Asset-based seeds and ABP auditing/default values remain correct in the explicit context.
- Web startup, login and pool recycling perform no seed operations.

Do not deploy the startup/resolver removal without also deploying and executing this
workflow. Database integration tests are required before production rollout.
