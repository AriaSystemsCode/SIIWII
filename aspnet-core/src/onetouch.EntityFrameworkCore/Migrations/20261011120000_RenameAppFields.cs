using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20261011120000_RenameAppFields")]
    public class RenameAppFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            Rename(migrationBuilder, reverse: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            Rename(migrationBuilder, reverse: true);
        }

        private static void Rename(MigrationBuilder migrationBuilder, bool reverse)
        {
            migrationBuilder.Sql($@"
DECLARE @reverse bit = {(reverse ? 1 : 0)};
DECLARE @oldTable sysname = CASE WHEN @reverse = 1 THEN N'AppFields' ELSE N'APPFields' END;
DECLARE @newTable sysname = CASE WHEN @reverse = 1 THEN N'APPFields' ELSE N'AppFields' END;
DECLARE @temporaryTable sysname = N'AppFields_Rename_20261011_Temp';
DECLARE @qualified nvarchar(500);

IF @reverse = 0 AND NOT EXISTS
    (SELECT 1 FROM dbo.__EFMigrationsHistory
     WHERE MigrationId = N'20261006120000_SnapshotAppTableFields')
    THROW 51072, 'Apply the field snapshot migration before renaming AppFields.', 1;

IF NOT EXISTS
    (SELECT 1 FROM sys.tables
     WHERE schema_id = SCHEMA_ID(N'dbo')
       AND name COLLATE Latin1_General_100_BIN2 = @oldTable COLLATE Latin1_General_100_BIN2)
    THROW 51073, 'The source field table was not found.', 1;

IF EXISTS
    (SELECT 1 FROM sys.tables
     WHERE schema_id = SCHEMA_ID(N'dbo')
       AND name COLLATE Latin1_General_100_BIN2 = @newTable COLLATE Latin1_General_100_BIN2)
    THROW 51074, 'The destination field table already exists.', 1;

SET @qualified = N'dbo.' + QUOTENAME(@oldTable);
EXEC sys.sp_rename @qualified, @temporaryTable, N'OBJECT';
SET @qualified = N'dbo.' + QUOTENAME(@temporaryTable);
EXEC sys.sp_rename @qualified, @newTable, N'OBJECT';

DECLARE @renames TABLE
(
    Id int IDENTITY(1,1) PRIMARY KEY,
    OldName sysname NOT NULL,
    NewName sysname NOT NULL,
    Kind nvarchar(10) NOT NULL
);
INSERT @renames (OldName, NewName, Kind) VALUES
    (N'PK_APPFields', N'PK_AppFields', N'OBJECT'),
    (N'FK_APPFields_APPFields_SourceFieldId', N'FK_AppFields_AppFields_SourceFieldId', N'OBJECT'),
    (N'FK_APPFields_SycEntityObjectTypes_FieldTypeId', N'FK_AppFields_SycEntityObjectTypes_FieldTypeId', N'OBJECT'),
    (N'FK_APPFields_SycEntityObjectTypes_WidgetTypeId', N'FK_AppFields_SycEntityObjectTypes_WidgetTypeId', N'OBJECT'),
    (N'FK_APPFields_SydObjects_EntitySycObjectId', N'FK_AppFields_SydObjects_EntitySycObjectId', N'OBJECT'),
    (N'FK_APPFields_SydObjects_SycObjectId', N'FK_AppFields_SydObjects_SycObjectId', N'OBJECT'),
    (N'FK_AppFieldsHistory_APPFields_AppFieldId', N'FK_AppFieldsHistory_AppFields_AppFieldId', N'OBJECT'),
    (N'DF_APPFields_FieldDefinitionKey', N'DF_AppFields_FieldDefinitionKey', N'OBJECT'),
    (N'APPFields_Trigger', N'AppFields_Trigger', N'OBJECT'),
    (N'IX_APPFields_EntitySycObjectId', N'IX_AppFields_EntitySycObjectId', N'INDEX'),
    (N'IX_APPFields_FieldTypeId', N'IX_AppFields_FieldTypeId', N'INDEX'),
    (N'IX_APPFields_FieldDefinitionKey', N'IX_AppFields_FieldDefinitionKey', N'INDEX'),
    (N'IX_APPFields_SourceFieldId', N'IX_AppFields_SourceFieldId', N'INDEX'),
    (N'IX_APPFields_SycObjectId', N'IX_AppFields_SycObjectId', N'INDEX'),
    (N'IX_APPFields_TenantId_FieldCode', N'IX_AppFields_TenantId_FieldCode', N'INDEX'),
    (N'IX_APPFields_TenantId_SourceFieldId', N'IX_AppFields_TenantId_SourceFieldId', N'INDEX'),
    (N'IX_APPFields_TenantId_SycObjectId', N'IX_AppFields_TenantId_SycObjectId', N'INDEX'),
    (N'IX_APPFields_WidgetTypeId', N'IX_AppFields_WidgetTypeId', N'INDEX');

DECLARE @id int, @fromName sysname, @toName sysname, @kind nvarchar(10);
DECLARE @temporaryName sysname;
DECLARE rename_cursor CURSOR LOCAL FAST_FORWARD FOR
    SELECT Id,
           CASE WHEN @reverse = 1 THEN NewName ELSE OldName END,
           CASE WHEN @reverse = 1 THEN OldName ELSE NewName END,
           Kind
    FROM @renames ORDER BY Id;
OPEN rename_cursor;
FETCH NEXT FROM rename_cursor INTO @id, @fromName, @toName, @kind;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @temporaryName = N'AppFields_Rename_20261011_' + CONVERT(nvarchar(10), @id);
    IF @kind = N'INDEX'
    BEGIN
        IF EXISTS (SELECT 1 FROM sys.indexes
                   WHERE object_id = OBJECT_ID(N'dbo.' + QUOTENAME(@newTable))
                     AND name COLLATE Latin1_General_100_BIN2 = @fromName COLLATE Latin1_General_100_BIN2)
        BEGIN
            SET @qualified = N'dbo.' + QUOTENAME(@newTable) + N'.' + QUOTENAME(@fromName);
            EXEC sys.sp_rename @qualified, @temporaryName, N'INDEX';
            SET @qualified = N'dbo.' + QUOTENAME(@newTable) + N'.' + QUOTENAME(@temporaryName);
            EXEC sys.sp_rename @qualified, @toName, N'INDEX';
        END;
    END
    ELSE IF EXISTS (SELECT 1 FROM sys.objects
                    WHERE schema_id = SCHEMA_ID(N'dbo')
                      AND name COLLATE Latin1_General_100_BIN2 = @fromName COLLATE Latin1_General_100_BIN2)
    BEGIN
        SET @qualified = N'dbo.' + QUOTENAME(@fromName);
        EXEC sys.sp_rename @qualified, @temporaryName, N'OBJECT';
        SET @qualified = N'dbo.' + QUOTENAME(@temporaryName);
        EXEC sys.sp_rename @qualified, @toName, N'OBJECT';
    END;
    FETCH NEXT FROM rename_cursor INTO @id, @fromName, @toName, @kind;
END;
CLOSE rename_cursor;
DEALLOCATE rename_cursor;
");
        }
    }
}
