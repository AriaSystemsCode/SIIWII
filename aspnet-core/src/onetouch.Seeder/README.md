# Deployment database seeding

The web process does not seed databases during startup or connection resolution.
Publish and run this console application from the SAME release as the backend.
It reuses the existing seed helper; translation generation is not changed.

## Release contract

`SeedRelease.RequiredVersion` in `Program.cs` is the version-controlled required
seed snapshot (version 11 enables multiple DropdownOptions selections). Increment it whenever
the cumulative seed routines or their assets change. It is not an arbitrary
command-line value.
Each database records successful snapshots in `dbo.__OneTouchSeedHistory`.
This is a cumulative snapshot runner, not an ordered migration engine: a database
at version 1 moving to 3 executes release 3's complete existing seed helper once.
Future non-cumulative data transformations require explicit ordered steps instead.

Version 2 runs the idempotent AppEntity, transaction header, and transaction
detail Field Manager scripts after schema migrations. A database whose AppFields
rows were cleared after the older one-time EF migration will be refilled when
this seeder applies version 2 or later. The existing Migrator and installer also call the
same host seed method directly.

Version 3 also seeds six Field Manager setting definitions for String--Textbox
(AllowNull, Length, DefaultValue, Required, Visible, Editable) and six applied
snapshots scoped to that type. The script is idempotent, so databases moving
directly from an older seed version can run the cumulative host seed safely.

Version 4 adds Date--Date picker settings (AllowNull, DateFormat, DefaultValue,
Required, Visible) and five applied snapshots scoped to that type. The current
seed gives each type its own definitions: DateFormat is a string setting,
DefaultValue is a date setting, and the Boolean settings are independent of
String--Textbox. Existing shared assignments are remapped when reseeded.

Version 5 adds the `inputmask` and `NoOfDecmials` XML attributes, the input mask
AppFields definition and Date picker snapshot, and uses SycEntityObjectTypes
IDs for `EntitySycObjectId` in new field definitions. The associated EF migration
remaps existing definitions and snapshots before the cumulative seed runs.

Version 6 replaces Date--Date picker XML with AllowNull, DateFormat,
DefaultValue, Required, and Visible. The host seed no longer adds `inputmask`
to that XML or seeds a new input-mask AppFields definition. Existing AppFields
definitions and table snapshots are not removed by this seed.
Version 6 also assigns setting definitions directly to their owning
`SycEntityObjectTypes` rows, including separate Boolean definitions for the
Date picker and String--Textbox.

Version 7 seeds independent definitions, applied snapshots, history rows and
type XML for Numeric input (6 settings), Currency (6), Dropdown (5), and
Checkbox (3). The Numeric input XML replaces the old `NoOfDecmials` code with
`Decimals`, preserving its attribute ID when possible. Existing matching
snapshots retain their applied revision and values.

Version 8 follows the `DetachOrdinaryFieldDefinitions` schema migration.
Ordinary `AppFields` definitions have no `SycObjectId` or
`EntitySycObjectId`; `AppTableFields.SycObjectId` still identifies the assigned
data object. The six Field type setting groups retain their definition owner.

Version 9 follows `20261016150000_DynamicFieldSettings`. It creates the
setting-option and setting-value tables and backfills current fields, history,
and table assignments from the legacy typed columns. Apply the schema migration
before running the seeder; the cumulative seed reruns the idempotent backfill
after all type-owned setting definitions are present.

Version 10 adds three common DateFormat choices and maps matching current
Date picker setting values to those options. The option seed is idempotent.

Version 11 follows `20261016170000_UseFieldSettingOptionsOnly`. It enables
multiple selections for the List--Dropdown `DropdownOptions` setting. The
matching option choices and selections live in `AppFieldsOptions` and the
setting-value tables; the separate dropdown-option tables have been removed.

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

Unless `--default-only` is selected, all rows of `dbo.Clients` are included; the current implementation assumes no
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

To run only `ConnectionStrings.Default`, use `--default-only --expected-database
onetouchDevDb3`. The runner compares the actual default catalog to that exact
name and does not query or seed any registered client. The Seeder project also
includes Visual Studio launch profiles named `onetouchDevDb3 - check` and
`onetouchDevDb3 - apply`. Select the apply profile explicitly to seed from
Visual Studio. Those profiles use paths relative to the Seeder project folder;
confirm that the Web Host config points to the intended server before applying.
For a local SQL Server on the developer's computer, use `Local onetouchDevDb3 -
check` or `Local onetouchDevDb3 - apply` instead. These profiles override only
`ConnectionStrings.Default` with integrated authentication to `localhost` and
do not query the client registry. Relative paths are resolved from the current
working directory first, then the Seeder project folder for Visual Studio runs.

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

Status/timing, exception type/SQL error number, and the first application stack
location go to stdout/stderr for pipeline
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
