using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20261012100000_SeedBaseEntityObjects")]
    public class SeedBaseEntityObjects : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF COL_LENGTH(N'dbo.SydObjects', N'BaseEntityId') IS NULL
    THROW 51090, 'Apply AddSydObjectBaseEntity before seeding base entities.', 1;

DECLARE @entityTypeId bigint;
DECLARE @dataTypeId bigint;
DECLARE @baseEntityId bigint;
DECLARE @appEntityId bigint;
DECLARE @transactionHeaderId bigint;
DECLARE @transactionObjectId bigint;

IF (SELECT COUNT(*) FROM dbo.SysObjectTypes WHERE Code = N'ENTITY' AND IsDeleted = 0) <> 1
    THROW 51091, 'Expected exactly one active ENTITY object type.', 1;
IF (SELECT COUNT(*) FROM dbo.SysObjectTypes WHERE Code = N'DATA' AND IsDeleted = 0) <> 1
    THROW 51092, 'Expected exactly one active DATA object type.', 1;
SELECT @entityTypeId = Id FROM dbo.SysObjectTypes WHERE Code = N'ENTITY' AND IsDeleted = 0;
SELECT @dataTypeId = Id FROM dbo.SysObjectTypes WHERE Code = N'DATA' AND IsDeleted = 0;
IF EXISTS (SELECT 1 FROM dbo.SydObjects
    WHERE (Code = N'TRANSACTION' OR Name = N'Transaction')
      AND NOT (Code = N'TRANSACTION' AND ObjectTypeCode = N'ENTITY'
          AND ObjectTypeId = @entityTypeId AND ParentId IS NULL
          AND NULLIF(LTRIM(RTRIM(ParentCode)), N'') IS NULL AND IsDeleted = 0))
    THROW 51100, 'A conflicting Transaction object exists.', 1;
IF NOT EXISTS (SELECT 1 FROM dbo.SydObjects WHERE Code = N'TRANSACTION' AND IsDeleted = 0)
    INSERT dbo.SydObjects (CreationTime, IsDeleted, Name, Code, ObjectTypeCode, ObjectTypeId)
    VALUES (SYSUTCDATETIME(), 0, N'Transaction', N'TRANSACTION', N'ENTITY', @entityTypeId);
IF (SELECT COUNT(*) FROM dbo.SydObjects WHERE Code = N'TRANSACTION' AND IsDeleted = 0) <> 1
    THROW 51100, 'Expected one Transaction object.', 1;
SELECT @transactionObjectId = Id FROM dbo.SydObjects
WHERE Code = N'TRANSACTION' AND IsDeleted = 0;
IF EXISTS (SELECT 1 FROM dbo.SydObjects
    WHERE (Code = N'TRANSACTION-HEADER-DATA' OR Name = N'AppTransactionHeaders')
      AND NOT (Code = N'TRANSACTION-HEADER-DATA' AND Name = N'AppTransactionHeaders'
          AND ObjectTypeCode = N'DATA' AND ObjectTypeId = @dataTypeId
          AND ParentId = @transactionObjectId AND ParentCode = N'TRANSACTION'
          AND IsDeleted = 0))
    THROW 51101, 'A conflicting AppTransactionHeaders object exists.', 1;
IF NOT EXISTS (SELECT 1 FROM dbo.SydObjects
    WHERE Code = N'TRANSACTION-HEADER-DATA' AND IsDeleted = 0)
    INSERT dbo.SydObjects
        (CreationTime, IsDeleted, Name, Code, ParentId, ParentCode, ObjectTypeCode, ObjectTypeId)
    VALUES (SYSUTCDATETIME(), 0, N'AppTransactionHeaders', N'TRANSACTION-HEADER-DATA',
            @transactionObjectId, N'TRANSACTION', N'DATA', @dataTypeId);
IF (SELECT COUNT(*) FROM dbo.SydObjects
    WHERE Code = N'TRANSACTION-HEADER-DATA' AND Name = N'AppTransactionHeaders'
      AND ObjectTypeCode = N'DATA' AND ObjectTypeId = @dataTypeId
      AND ParentId = @transactionObjectId AND IsDeleted = 0) <> 1
    THROW 51093, 'Expected exactly one active AppTransactionHeaders object.', 1;
SELECT @transactionHeaderId = Id FROM dbo.SydObjects
WHERE Code = N'TRANSACTION-HEADER-DATA' AND Name = N'AppTransactionHeaders'
  AND ObjectTypeCode = N'DATA' AND ObjectTypeId = @dataTypeId AND IsDeleted = 0;

IF EXISTS (SELECT 1 FROM dbo.SydObjects
    WHERE (Code = N'BASEENTITY' OR Name = N'BaseEntity')
      AND NOT (Code = N'BASEENTITY' AND Name = N'BaseEntity'
          AND ObjectTypeCode = N'ENTITY' AND ObjectTypeId = @entityTypeId
          AND ParentId IS NULL AND NULLIF(LTRIM(RTRIM(ParentCode)), N'') IS NULL AND IsDeleted = 0))
    THROW 51094, 'A conflicting BaseEntity object exists.', 1;
IF (SELECT COUNT(*) FROM dbo.SydObjects
    WHERE Code = N'BASEENTITY' AND Name = N'BaseEntity' AND IsDeleted = 0) > 1
    THROW 51095, 'Multiple BaseEntity objects exist.', 1;

IF NOT EXISTS (SELECT 1 FROM dbo.SydObjects WHERE Code = N'BASEENTITY' AND IsDeleted = 0)
    INSERT dbo.SydObjects (CreationTime, IsDeleted, Name, Code, ObjectTypeCode, ObjectTypeId)
    VALUES (SYSUTCDATETIME(), 0, N'BaseEntity', N'BASEENTITY', N'ENTITY', @entityTypeId);

SELECT @baseEntityId = Id FROM dbo.SydObjects
WHERE Code = N'BASEENTITY' AND Name = N'BaseEntity'
  AND ObjectTypeCode = N'ENTITY' AND ObjectTypeId = @entityTypeId AND IsDeleted = 0;

IF EXISTS (SELECT 1 FROM dbo.SydObjects
    WHERE (Code = N'APPENTITY-DATA' OR Name = N'AppEntity')
      AND NOT (Code = N'APPENTITY-DATA' AND Name = N'AppEntity'
          AND ObjectTypeCode = N'DATA' AND ObjectTypeId = @dataTypeId
          AND ParentId = @baseEntityId AND ParentCode = N'BASEENTITY' AND IsDeleted = 0))
    THROW 51096, 'A conflicting AppEntity object exists.', 1;
IF (SELECT COUNT(*) FROM dbo.SydObjects
    WHERE Code = N'APPENTITY-DATA' AND Name = N'AppEntity' AND IsDeleted = 0) > 1
    THROW 51097, 'Multiple AppEntity objects exist.', 1;

IF NOT EXISTS (SELECT 1 FROM dbo.SydObjects WHERE Code = N'APPENTITY-DATA' AND IsDeleted = 0)
    INSERT dbo.SydObjects
        (CreationTime, IsDeleted, Name, Code, ParentId, ParentCode, ObjectTypeCode, ObjectTypeId)
    VALUES (SYSUTCDATETIME(), 0, N'AppEntity', N'APPENTITY-DATA',
            @baseEntityId, N'BASEENTITY', N'DATA', @dataTypeId);

SELECT @appEntityId = Id FROM dbo.SydObjects
WHERE Code = N'APPENTITY-DATA' AND Name = N'AppEntity'
  AND ParentId = @baseEntityId AND ParentCode = N'BASEENTITY'
  AND ObjectTypeCode = N'DATA' AND ObjectTypeId = @dataTypeId AND IsDeleted = 0;

IF @baseEntityId IS NULL OR @appEntityId IS NULL
    THROW 51098, 'BaseEntity hierarchy could not be resolved.', 1;
IF EXISTS (SELECT 1 FROM dbo.SydObjects
    WHERE Id = @transactionHeaderId AND BaseEntityId IS NOT NULL AND BaseEntityId <> @appEntityId)
    THROW 51099, 'AppTransactionHeaders already has a different base entity.', 1;

UPDATE dbo.SydObjects SET BaseEntityId = @appEntityId
WHERE Id = @transactionHeaderId AND BaseEntityId IS NULL;
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Preserve metadata that may have become referenced by later objects.
            // Up is idempotent, so the migration can be applied again after rollback.
        }
    }
}
