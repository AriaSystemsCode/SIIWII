# Deployment database seeding

The web process does not seed databases during startup or connection resolution.
Publish and run this console application from the SAME release as the backend.
It reuses the existing seed helper; translation generation is not changed.

## Release contract

`SeedRelease.RequiredVersion` in `Program.cs` is the version-controlled required
seed snapshot (version 19 adds AppEntity lookup settings). Increment it whenever
the cumulative seed routines or their assets change. It is not an arbitrary
command-line value.
Each database records successful snapshots in `dbo.__OneTouchSeedHistory`.
This is a cumulative snapshot runner, not an ordered migration engine: a database
at version 1 moving to 3 executes release 3's complete existing seed helper once.
Future non-cumulative data transformations require explicit ordered steps instead.

Version 2 runs the idempotent AppEntity, transaction header, and transaction
detail Field Manager scripts after schema migrations. A database whose AppFields
rows were cleared after the older one-time EF migration will be refilled when
this seeder applies version 2 or later. The installer also calls the same host
seed method directly.

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

Version 12 adds the String--Chips and String--dropDownList field types and
their setting definitions, and assigns DateFormat the dropDownList type.
Databases already marked version 11 must apply this snapshot to receive them.

Version 13 changes the List--Dropdown `DropdownOptions` setting's value type
from List--Dropdown to String--Chips. It keeps the setting ID and code, records
a new revision, and updates its applied Field Manager snapshot.

Version 17 renames the `LD` field type to String--Dropdown and removes the
superseded `SD` String--dropDownList type. Existing references are moved to
`LD` before removal. The earlier seed scripts remain rerunnable after this
consolidation.

Version 18 moves the twelve type-owned settings to the revised Advanced
Information and Extra Attributes sections. Previous revisions remain intact;
the new definition revisions and applied table snapshots use the new Usage.

Existing `Clients.IsSeeded` values are ignored and left untouched. Do not mark old
databases version 1 merely because that flag is True: run the new seed baseline.
No database or EF schema migration is applied automatically. Existing schema must
already match the release. New databases must be created/migrated separately.

## Build / publish (no database access)

From `aspnet-core`:

```powershell
dotnet publish src/onetouch.Migrator/onetouch.Migrator.csproj -c Release -o artifacts/migrator
dotnet publish src/onetouch.Seeder/onetouch.Seeder.csproj -c Release -o artifacts/seeder
dotnet run --project tests/onetouch.Seeder.Tests/onetouch.Seeder.Tests.csproj
```

Publish the backend and its `Assets` directory normally. Keep seeder artifacts
outside the IIS web root. The runner sets its working directory to the supplied
backend content root because existing seeds read `Assets` from that location.
The seeder requires the .NET 7 runtime, matching the existing backend target.

## Environment selection and read-only preflight

Both the Migrator and Seeder prompt for Testing, Staging, or Production before
starting database work. Each reads `dbo.Clients` from `ConnectionStrings.AriaMaster`
and selects rows where `Server` contains the chosen environment, case-insensitively.
Only those client databases are processed; the default application database is
not added to the target list. If there are no matching rows, the tool exits with
an error and processes no databases. Duplicate rows pointing to the same SQL
server and catalog are processed once.

Both tools accept the same `--config <settings.json>` path. For example, point
both at the BE folder's `appsettings.Production.json`. When the selected file is
named `appsettings.<Environment>.json`, the tools load the sibling `appsettings.json`
first, then apply that environment file as an override. Environment variables,
including `ConnectionStrings__AriaMaster`, take precedence. There is no hardcoded
credential fallback or secret logging. Do not commit production credentials.

```powershell
dotnet artifacts/migrator/onetouch.Migrator.dll --config <BE-folder>\appsettings.Production.json
dotnet artifacts/seeder/onetouch.Seeder.dll --config <BE-folder>\appsettings.Production.json --check
```

Check mode only reads the selected client registry rows and seed history; it creates no tables or seed data.
Exit codes: **0** all selected databases match this release, **1** failure,
**2** at least one selected database does not match the required seed version.
A newer database is not accepted by check and is refused by apply (no downgrade).
The SQL principal needs permission to see/read the history table for check mode.

Blank or invalid matching connections fail the job rather than silently skipping
a client. Client databases are deduplicated by server/catalog; server case is
normalized but catalog case is preserved for case-sensitive SQL instances.
Physical databases reached by aliases still share the database lock and version
history, preventing a second successful application of the same version.

## Deployment sequence (operator / pipeline)

1. Back up affected databases and test the release against disposable restored
   copies. Freeze registry/provisioning changes for the deployment window.
2. Put EVERY backend instance serving these databases offline, drain active requests,
   and pause background workers that write to them. `app_offline.htm` on one server
   alone is not sufficient for a multi-server deployment.
3. Deploy the backend, Migrator, Seeder and matching Assets. Do not restore traffic yet.
   Run the Migrator and select the target environment; it applies schema changes to
   each matching client database and reports every result.
4. Run the guarded Seeder wrapper (from `aspnet-core`):

```powershell
./deployment/Invoke-SeedRelease.ps1 -SeederDll <published-seeder.dll> -BackendReleasePath <backend-release-directory> -ConfigPath <BE-folder>\appsettings.Production.json
```

5. Require successful exit, review per-database status, and run deployment smoke
   checks. Only then remove the maintenance marker/restore traffic. The wrapper
   intentionally NEVER deletes the marker, even after success.

The wrapper checks that `app_offline.htm` exists, but cannot prove that all workers
are drained or other servers are offline. That remains a deployment responsibility.
There is deliberately no per-request readiness query. Traffic gating is operational;
bypassing this sequence can expose an unseeded database. Ordinary restarts do not seed.

## New client provisioning / targeted retry

After schema provisioning and registry registration, before enabling client access,
the Seeder can target one URL within the selected environment:

```powershell
dotnet <published-seeder.dll> --config <BE-folder>\appsettings.Production.json --content-root <backend-release-directory> --client-url <exact-registered-url> --apply --maintenance-confirmed
dotnet <published-seeder.dll> --config <BE-folder>\appsettings.Production.json --client-url <exact-registered-url> --check
```

`--client-url` selects one matching registry row within the environment you choose,
not the unrelated default DB. The Visual Studio profiles `Seeder - check` and
`Seeder - apply` use the Web Host settings file and still prompt for the environment.
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

Status/timing, exception type/SQL error number, and the first application stack
location go to stdout/stderr for pipeline
capture. Raw exception messages are suppressed because they may expose credentials
or customer data. Inspect SQL diagnostics securely when deeper investigation is
required. Do not blindly retry a deterministic data/schema failure.

## Required staging acceptance tests

The included no-database tests validate CLI safety and target identity only.
On disposable restored databases, verify:

- Environment filtering across Testing, Staging, and Production, no-match failure,
  duplicate registry connections, and targeted selection within an environment.
- Initial version applies, repeat run skips, increased release version applies.
- Newer recorded version refuses downgrade; unknown client/blank connection fails.
- Seed error after earlier SaveChanges rolls back both seed writes and success record.
- Two simultaneous runners: one holds the lock; the other fails without seeding.
- Timeout, unavailable DB and process interruption leave traffic offline; retry works.
- Asset-based seeds and ABP auditing/default values remain correct in the explicit context.
- Web startup, login and pool recycling perform no seed operations.

Do not deploy the startup/resolver removal without also deploying and executing this
workflow. Database integration tests are required before production rollout.
