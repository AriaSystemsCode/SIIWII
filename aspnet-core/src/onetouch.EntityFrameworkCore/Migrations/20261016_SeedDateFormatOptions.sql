-- Idempotent choices for the Date--Date picker DateFormat setting.
IF OBJECT_ID(N'dbo.AppFieldsOptions', N'U') IS NOT NULL
   AND OBJECT_ID(N'dbo.AppFieldSettingValues', N'U') IS NOT NULL
BEGIN
    INSERT dbo.AppFieldsOptions (TenantId, SettingFieldId, Code, Name, SortOrder, IsActive)
    SELECT NULL, setting.Id, choice.Code, choice.Name, choice.SortOrder, 1
    FROM dbo.AppFields AS setting
    JOIN dbo.SycEntityObjectTypes AS fieldType ON fieldType.Id = setting.EntitySycObjectId
    JOIN dbo.SydObjects AS fieldObject ON fieldObject.Id = setting.SycObjectId
    CROSS JOIN (VALUES
        (N'yyyy-MM-dd', N'Year-Month-Day (2026-10-16)', 1),
        (N'MM/dd/yyyy', N'Month/Day/Year (10/16/2026)', 2),
        (N'dd/MM/yyyy', N'Day/Month/Year (16/10/2026)', 3)
    ) AS choice(Code, Name, SortOrder)
    WHERE fieldType.Code = N'DP' AND fieldObject.Code = N'FIELD'
      AND setting.FieldName = N'DateFormat' AND setting.TenantId IS NULL
      AND setting.IsDeleted = 0
      AND NOT EXISTS (SELECT 1 FROM dbo.AppFieldsOptions AS existing
          WHERE existing.SettingFieldId = setting.Id AND existing.Code = choice.Code);

    -- Backfilled current values were scalar before these choices existed.
    -- Preserve their meaning and make them valid selections for subsequent edits.
    UPDATE valueRow
       SET valueRow.AppFieldsOptionId = choice.Id,
           valueRow.OptionCode = choice.Code,
           valueRow.OptionName = choice.Name,
           valueRow.ValueText = NULL
    FROM dbo.AppFieldSettingValues AS valueRow
    JOIN dbo.AppFieldsOptions AS choice ON choice.SettingFieldId = valueRow.SettingFieldId
        AND choice.Code = valueRow.ValueText
    JOIN dbo.AppFields AS setting ON setting.Id = valueRow.SettingFieldId
    JOIN dbo.SycEntityObjectTypes AS fieldType ON fieldType.Id = setting.EntitySycObjectId
    WHERE fieldType.Code = N'DP' AND setting.FieldName = N'DateFormat'
      AND valueRow.AppFieldsOptionId IS NULL;
END;
