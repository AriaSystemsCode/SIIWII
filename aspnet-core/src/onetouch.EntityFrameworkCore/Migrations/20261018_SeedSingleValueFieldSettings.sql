-- Run after FieldValidEntries. This is an idempotent host seed script;
-- the 20261016 migration resources remain unchanged for migration replay.
IF COL_LENGTH(N'dbo.AppFieldSettingValues', N'Value') IS NULL
   OR COL_LENGTH(N'dbo.AppFieldHistorySettingValues', N'Value') IS NULL
   OR COL_LENGTH(N'dbo.AppTableFieldSettingValues', N'Value') IS NULL
    THROW 51131, 'Apply the single setting Value migration before seeding.', 1;

INSERT dbo.AppFieldSettingValues
    (TenantId, AppFieldId, SettingFieldId, SettingFieldCode, SettingFieldName, [Value])
SELECT f.TenantId, f.Id, s.Id, s.FieldCode, s.FieldName, v.[Value]
FROM dbo.AppFields AS f
CROSS APPLY (VALUES
    (N'DefaultValue', f.DefaultValue),
    (N'DateFormat', f.DateFormat),
    (N'TimeFormat', f.TimeFormat),
    (N'Length', CONVERT(nvarchar(2000), f.[Length])),
    (N'Decimals', CONVERT(nvarchar(2000), f.Decimals)),
    (N'AllowNull', CASE WHEN f.AllowNull = 1 THEN N'true' ELSE N'false' END),
    (N'AllowMultiSelect', CASE WHEN f.AllowMultiSelect = 1 THEN N'true' ELSE N'false' END),
    (N'Required', CASE WHEN f.Required = 1 THEN N'true' ELSE N'false' END),
    (N'Visible', CASE WHEN f.Visible = 1 THEN N'true' ELSE N'false' END),
    (N'Editable', CASE WHEN f.Editable = 1 THEN N'true' ELSE N'false' END)
) AS v(FieldName, [Value])
JOIN dbo.AppFields AS s ON s.EntitySycObjectId = f.FieldTypeId
    AND s.SycObjectId IS NOT NULL AND s.TenantId IS NULL AND s.IsDeleted = 0
    AND s.FieldName = v.FieldName
WHERE f.SycObjectId IS NULL AND v.[Value] IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.AppFieldSettingValues AS old
      WHERE old.AppFieldId = f.Id AND old.SettingFieldId = s.Id);

INSERT dbo.AppFieldHistorySettingValues
    (AppFieldHistoryId, SettingFieldId, SettingFieldCode, SettingFieldName, [Value])
SELECT h.Id, s.Id, s.FieldCode, s.FieldName, v.[Value]
FROM dbo.AppFieldsHistory AS h
CROSS APPLY (VALUES
    (N'DefaultValue', h.DefaultValue),
    (N'DateFormat', h.DateFormat),
    (N'TimeFormat', h.TimeFormat),
    (N'Length', CONVERT(nvarchar(2000), h.[Length])),
    (N'Decimals', CONVERT(nvarchar(2000), h.Decimals)),
    (N'AllowNull', CASE WHEN h.AllowNull = 1 THEN N'true' ELSE N'false' END),
    (N'AllowMultiSelect', CASE WHEN h.AllowMultiSelect = 1 THEN N'true' ELSE N'false' END),
    (N'Required', CASE WHEN h.Required = 1 THEN N'true' ELSE N'false' END),
    (N'Visible', CASE WHEN h.Visible = 1 THEN N'true' ELSE N'false' END),
    (N'Editable', CASE WHEN h.Editable = 1 THEN N'true' ELSE N'false' END)
) AS v(FieldName, [Value])
JOIN dbo.AppFields AS s ON s.EntitySycObjectId = h.FieldTypeId
    AND s.SycObjectId IS NOT NULL AND s.TenantId IS NULL AND s.IsDeleted = 0
    AND s.FieldName = v.FieldName
WHERE h.SycObjectId IS NULL AND v.[Value] IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.AppFieldHistorySettingValues AS old
      WHERE old.AppFieldHistoryId = h.Id AND old.SettingFieldId = s.Id);

INSERT dbo.AppTableFieldSettingValues
    (AppTableFieldId, SettingFieldId, SettingFieldCode, SettingFieldName, [Value])
SELECT a.Id, s.Id, s.FieldCode, s.FieldName, v.[Value]
FROM dbo.AppTableFields AS a
CROSS APPLY (VALUES
    (N'DefaultValue', a.DefaultValue),
    (N'DateFormat', a.DateFormat),
    (N'TimeFormat', a.TimeFormat),
    (N'Length', CONVERT(nvarchar(2000), a.[Length])),
    (N'Decimals', CONVERT(nvarchar(2000), a.Decimals)),
    (N'AllowNull', CASE WHEN a.AllowNull = 1 THEN N'true' ELSE N'false' END),
    (N'AllowMultiSelect', CASE WHEN a.AllowMultiSelect = 1 THEN N'true' ELSE N'false' END),
    (N'Required', CASE WHEN a.Required = 1 THEN N'true' ELSE N'false' END),
    (N'Visible', CASE WHEN a.Visible = 1 THEN N'true' ELSE N'false' END),
    (N'Editable', CASE WHEN a.Editable = 1 THEN N'true' ELSE N'false' END)
) AS v(FieldName, [Value])
JOIN dbo.AppFields AS s ON s.EntitySycObjectId = a.FieldTypeId
    AND s.SycObjectId IS NOT NULL AND s.TenantId IS NULL AND s.IsDeleted = 0
    AND s.FieldName = v.FieldName
WHERE a.DefinitionSycObjectId IS NULL AND v.[Value] IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.AppTableFieldSettingValues AS old
      WHERE old.AppTableFieldId = a.Id AND old.SettingFieldId = s.Id);

UPDATE setting
SET setting.ValidEntries = N'yyyy-MM-dd|MM/dd/yyyy|dd/MM/yyyy'
FROM dbo.AppFields AS setting
JOIN dbo.SycEntityObjectTypes AS fieldType ON fieldType.Id = setting.EntitySycObjectId
JOIN dbo.SydObjects AS fieldObject ON fieldObject.Id = setting.SycObjectId
WHERE fieldType.Code = N'DP' AND fieldObject.Code = N'FIELD'
  AND setting.FieldName = N'DateFormat' AND setting.TenantId IS NULL
  AND setting.IsDeleted = 0 AND setting.ValidEntries IS NULL;
