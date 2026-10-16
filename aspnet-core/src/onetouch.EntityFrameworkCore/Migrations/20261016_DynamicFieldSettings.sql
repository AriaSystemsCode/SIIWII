-- Idempotent Field Manager schema and legacy-value backfill. No GO: also run by EF/seeder.
IF OBJECT_ID(N'dbo.AppFieldsOptions', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AppFieldsOptions
    (
        Id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_AppFieldsOptions PRIMARY KEY,
        TenantId int NULL,
        SettingFieldId bigint NOT NULL,
        Code nvarchar(100) NOT NULL,
        Name nvarchar(500) NOT NULL,
        SortOrder int NOT NULL,
        IsActive bit NOT NULL CONSTRAINT DF_AppFieldsOptions_IsActive DEFAULT (1),
        CONSTRAINT FK_AppFieldsOptions_SettingField FOREIGN KEY (SettingFieldId) REFERENCES dbo.AppFields(Id)
    );
    CREATE UNIQUE INDEX IX_AppFieldsOptions_SettingFieldId_Code ON dbo.AppFieldsOptions(SettingFieldId, Code);
END;

IF OBJECT_ID(N'dbo.AppFieldSettingValues', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AppFieldSettingValues
    (
        Id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_AppFieldSettingValues PRIMARY KEY,
        TenantId int NULL,
        AppFieldId bigint NOT NULL,
        SettingFieldId bigint NOT NULL,
        SettingFieldCode nvarchar(11) NOT NULL,
        SettingFieldName nvarchar(250) NOT NULL,
        AppFieldsOptionId bigint NULL,
        OptionCode nvarchar(100) NULL,
        OptionName nvarchar(500) NULL,
        ValueText nvarchar(2000) NULL,
        ValueNumber decimal(18,6) NULL,
        ValueBoolean bit NULL,
        ValueDateTime datetime2 NULL,
        CONSTRAINT FK_AppFieldSettingValues_Field FOREIGN KEY (AppFieldId) REFERENCES dbo.AppFields(Id) ON DELETE CASCADE,
        CONSTRAINT FK_AppFieldSettingValues_Setting FOREIGN KEY (SettingFieldId) REFERENCES dbo.AppFields(Id),
        CONSTRAINT CK_AppFieldSettingValues_OneValue CHECK
        (
            (CASE WHEN AppFieldsOptionId IS NULL THEN 0 ELSE 1 END) +
            (CASE WHEN ValueText IS NULL THEN 0 ELSE 1 END) +
            (CASE WHEN ValueNumber IS NULL THEN 0 ELSE 1 END) +
            (CASE WHEN ValueBoolean IS NULL THEN 0 ELSE 1 END) +
            (CASE WHEN ValueDateTime IS NULL THEN 0 ELSE 1 END) = 1
        )
    );
    CREATE UNIQUE INDEX IX_AppFieldSettingValues_Scalar ON dbo.AppFieldSettingValues(AppFieldId, SettingFieldId)
        WHERE AppFieldsOptionId IS NULL;
    CREATE UNIQUE INDEX IX_AppFieldSettingValues_Option ON dbo.AppFieldSettingValues(AppFieldId, SettingFieldId, AppFieldsOptionId)
        WHERE AppFieldsOptionId IS NOT NULL;
    CREATE INDEX IX_AppFieldSettingValues_SettingFieldId ON dbo.AppFieldSettingValues(SettingFieldId);
    CREATE INDEX IX_AppFieldSettingValues_SettingFieldId_AppFieldsOptionId
        ON dbo.AppFieldSettingValues(SettingFieldId, AppFieldsOptionId);
END;

IF OBJECT_ID(N'dbo.AppFieldHistorySettingValues', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AppFieldHistorySettingValues
    (
        Id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_AppFieldHistorySettingValues PRIMARY KEY,
        AppFieldHistoryId bigint NOT NULL,
        SettingFieldId bigint NOT NULL,
        SettingFieldCode nvarchar(11) NOT NULL,
        SettingFieldName nvarchar(250) NOT NULL,
        AppFieldsOptionId bigint NULL,
        OptionCode nvarchar(100) NULL,
        OptionName nvarchar(500) NULL,
        ValueText nvarchar(2000) NULL,
        ValueNumber decimal(18,6) NULL,
        ValueBoolean bit NULL,
        ValueDateTime datetime2 NULL,
        CONSTRAINT FK_AppFieldHistorySettingValues_History FOREIGN KEY (AppFieldHistoryId)
            REFERENCES dbo.AppFieldsHistory(Id) ON DELETE CASCADE
    );
    CREATE INDEX IX_AppFieldHistorySettingValues_AppFieldHistoryId
        ON dbo.AppFieldHistorySettingValues(AppFieldHistoryId);
END;

IF OBJECT_ID(N'dbo.AppTableFieldSettingValues', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AppTableFieldSettingValues
    (
        Id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_AppTableFieldSettingValues PRIMARY KEY,
        AppTableFieldId bigint NOT NULL,
        SettingFieldId bigint NOT NULL,
        SettingFieldCode nvarchar(11) NOT NULL,
        SettingFieldName nvarchar(250) NOT NULL,
        AppFieldsOptionId bigint NULL,
        OptionCode nvarchar(100) NULL,
        OptionName nvarchar(500) NULL,
        ValueText nvarchar(2000) NULL,
        ValueNumber decimal(18,6) NULL,
        ValueBoolean bit NULL,
        ValueDateTime datetime2 NULL,
        CONSTRAINT FK_AppTableFieldSettingValues_TableField FOREIGN KEY (AppTableFieldId)
            REFERENCES dbo.AppTableFields(Id) ON DELETE CASCADE
    );
    CREATE INDEX IX_AppTableFieldSettingValues_AppTableFieldId
        ON dbo.AppTableFieldSettingValues(AppTableFieldId);
END;

-- A selected option must belong to the same setting. These checks also upgrade
-- a database that ran an earlier draft of this idempotent script.
IF NOT EXISTS (SELECT 1 FROM sys.key_constraints
    WHERE name = N'AK_AppFieldsOptions_SettingFieldId_Id' AND parent_object_id = OBJECT_ID(N'dbo.AppFieldsOptions'))
    ALTER TABLE dbo.AppFieldsOptions ADD CONSTRAINT AK_AppFieldsOptions_SettingFieldId_Id
        UNIQUE (SettingFieldId, Id);
IF EXISTS (SELECT 1 FROM sys.foreign_keys
    WHERE name = N'FK_AppFieldSettingValues_Option' AND parent_object_id = OBJECT_ID(N'dbo.AppFieldSettingValues'))
    ALTER TABLE dbo.AppFieldSettingValues DROP CONSTRAINT FK_AppFieldSettingValues_Option;
IF EXISTS (SELECT 1 FROM sys.indexes
    WHERE name = N'IX_AppFieldSettingValues_AppFieldsOptionId' AND object_id = OBJECT_ID(N'dbo.AppFieldSettingValues'))
    DROP INDEX IX_AppFieldSettingValues_AppFieldsOptionId ON dbo.AppFieldSettingValues;
IF NOT EXISTS (SELECT 1 FROM sys.indexes
    WHERE name = N'IX_AppFieldSettingValues_SettingFieldId_AppFieldsOptionId' AND object_id = OBJECT_ID(N'dbo.AppFieldSettingValues'))
    CREATE INDEX IX_AppFieldSettingValues_SettingFieldId_AppFieldsOptionId
        ON dbo.AppFieldSettingValues(SettingFieldId, AppFieldsOptionId);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys
    WHERE name = N'FK_AppFieldSettingValues_SettingOption' AND parent_object_id = OBJECT_ID(N'dbo.AppFieldSettingValues'))
    ALTER TABLE dbo.AppFieldSettingValues ADD CONSTRAINT FK_AppFieldSettingValues_SettingOption
        FOREIGN KEY (SettingFieldId, AppFieldsOptionId)
        REFERENCES dbo.AppFieldsOptions(SettingFieldId, Id);

-- Type-owned AppFields rows define applicable settings. Existing values remain
-- on the old columns for compatibility, but are copied into the new source of truth.
INSERT dbo.AppFieldSettingValues
    (TenantId, AppFieldId, SettingFieldId, SettingFieldCode, SettingFieldName,
     ValueText, ValueNumber, ValueBoolean)
SELECT f.TenantId, f.Id, s.Id, s.FieldCode, s.FieldName,
    CASE s.FieldName
        WHEN N'DefaultValue' THEN f.DefaultValue
        WHEN N'DateFormat' THEN f.DateFormat
        WHEN N'TimeFormat' THEN f.TimeFormat END,
    CASE s.FieldName
        WHEN N'Length' THEN CONVERT(decimal(18,6), f.[Length])
        WHEN N'Decimals' THEN CONVERT(decimal(18,6), f.Decimals) END,
    CASE s.FieldName
        WHEN N'AllowNull' THEN f.AllowNull
        WHEN N'AllowMultiSelect' THEN f.AllowMultiSelect
        WHEN N'Required' THEN f.Required
        WHEN N'Visible' THEN f.Visible
        WHEN N'Editable' THEN f.Editable END
FROM dbo.AppFields AS f
JOIN dbo.AppFields AS s ON s.EntitySycObjectId = f.FieldTypeId
    AND s.SycObjectId IS NOT NULL AND s.TenantId IS NULL AND s.IsDeleted = 0
WHERE f.SycObjectId IS NULL
  AND s.FieldName IN (N'DefaultValue', N'DateFormat', N'TimeFormat', N'Length', N'Decimals',
      N'AllowNull', N'AllowMultiSelect', N'Required', N'Visible', N'Editable')
  AND (s.FieldName NOT IN (N'DefaultValue', N'DateFormat', N'TimeFormat', N'Length', N'Decimals')
    OR (s.FieldName = N'DefaultValue' AND f.DefaultValue IS NOT NULL)
    OR (s.FieldName = N'DateFormat' AND f.DateFormat IS NOT NULL)
    OR (s.FieldName = N'TimeFormat' AND f.TimeFormat IS NOT NULL)
    OR (s.FieldName = N'Length' AND f.[Length] IS NOT NULL)
    OR (s.FieldName = N'Decimals' AND f.Decimals IS NOT NULL))
  AND NOT EXISTS (SELECT 1 FROM dbo.AppFieldSettingValues v
      WHERE v.AppFieldId = f.Id AND v.SettingFieldId = s.Id);

INSERT dbo.AppFieldHistorySettingValues
    (AppFieldHistoryId, SettingFieldId, SettingFieldCode, SettingFieldName,
     ValueText, ValueNumber, ValueBoolean)
SELECT h.Id, s.Id, s.FieldCode, s.FieldName,
    CASE s.FieldName
        WHEN N'DefaultValue' THEN h.DefaultValue
        WHEN N'DateFormat' THEN h.DateFormat
        WHEN N'TimeFormat' THEN h.TimeFormat END,
    CASE s.FieldName
        WHEN N'Length' THEN CONVERT(decimal(18,6), h.[Length])
        WHEN N'Decimals' THEN CONVERT(decimal(18,6), h.Decimals) END,
    CASE s.FieldName
        WHEN N'AllowNull' THEN h.AllowNull
        WHEN N'AllowMultiSelect' THEN h.AllowMultiSelect
        WHEN N'Required' THEN h.Required
        WHEN N'Visible' THEN h.Visible
        WHEN N'Editable' THEN h.Editable END
FROM dbo.AppFieldsHistory AS h
JOIN dbo.AppFields AS s ON s.EntitySycObjectId = h.FieldTypeId
    AND s.SycObjectId IS NOT NULL AND s.TenantId IS NULL AND s.IsDeleted = 0
WHERE h.SycObjectId IS NULL
  AND s.FieldName IN (N'DefaultValue', N'DateFormat', N'TimeFormat', N'Length', N'Decimals',
      N'AllowNull', N'AllowMultiSelect', N'Required', N'Visible', N'Editable')
  AND (s.FieldName NOT IN (N'DefaultValue', N'DateFormat', N'TimeFormat', N'Length', N'Decimals')
    OR (s.FieldName = N'DefaultValue' AND h.DefaultValue IS NOT NULL)
    OR (s.FieldName = N'DateFormat' AND h.DateFormat IS NOT NULL)
    OR (s.FieldName = N'TimeFormat' AND h.TimeFormat IS NOT NULL)
    OR (s.FieldName = N'Length' AND h.[Length] IS NOT NULL)
    OR (s.FieldName = N'Decimals' AND h.Decimals IS NOT NULL))
  AND NOT EXISTS (SELECT 1 FROM dbo.AppFieldHistorySettingValues v
      WHERE v.AppFieldHistoryId = h.Id AND v.SettingFieldId = s.Id);

INSERT dbo.AppTableFieldSettingValues
    (AppTableFieldId, SettingFieldId, SettingFieldCode, SettingFieldName,
     ValueText, ValueNumber, ValueBoolean)
SELECT a.Id, s.Id, s.FieldCode, s.FieldName,
    CASE s.FieldName
        WHEN N'DefaultValue' THEN a.DefaultValue
        WHEN N'DateFormat' THEN a.DateFormat
        WHEN N'TimeFormat' THEN a.TimeFormat END,
    CASE s.FieldName
        WHEN N'Length' THEN CONVERT(decimal(18,6), a.[Length])
        WHEN N'Decimals' THEN CONVERT(decimal(18,6), a.Decimals) END,
    CASE s.FieldName
        WHEN N'AllowNull' THEN a.AllowNull
        WHEN N'AllowMultiSelect' THEN a.AllowMultiSelect
        WHEN N'Required' THEN a.Required
        WHEN N'Visible' THEN a.Visible
        WHEN N'Editable' THEN a.Editable END
FROM dbo.AppTableFields AS a
JOIN dbo.AppFields AS s ON s.EntitySycObjectId = a.FieldTypeId
    AND s.SycObjectId IS NOT NULL AND s.TenantId IS NULL AND s.IsDeleted = 0
WHERE a.DefinitionSycObjectId IS NULL
  AND s.FieldName IN (N'DefaultValue', N'DateFormat', N'TimeFormat', N'Length', N'Decimals',
      N'AllowNull', N'AllowMultiSelect', N'Required', N'Visible', N'Editable')
  AND (s.FieldName NOT IN (N'DefaultValue', N'DateFormat', N'TimeFormat', N'Length', N'Decimals')
    OR (s.FieldName = N'DefaultValue' AND a.DefaultValue IS NOT NULL)
    OR (s.FieldName = N'DateFormat' AND a.DateFormat IS NOT NULL)
    OR (s.FieldName = N'TimeFormat' AND a.TimeFormat IS NOT NULL)
    OR (s.FieldName = N'Length' AND a.[Length] IS NOT NULL)
    OR (s.FieldName = N'Decimals' AND a.Decimals IS NOT NULL))
  AND NOT EXISTS (SELECT 1 FROM dbo.AppTableFieldSettingValues v
      WHERE v.AppTableFieldId = a.Id AND v.SettingFieldId = s.Id);
