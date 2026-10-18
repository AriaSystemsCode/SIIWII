-- Replace the Date--Date picker type's XML with the five settings in the design.
-- AppFields definitions and assignments are separate and are not changed here.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @dateTypeId bigint;
    SELECT @dateTypeId = t.Id
    FROM dbo.SycEntityObjectTypes AS t WITH (UPDLOCK, HOLDLOCK)
    JOIN dbo.SydObjects AS o ON o.Id = t.ObjectId
    WHERE o.Code = N'FIELD' AND o.ObjectTypeCode = N'ENTITY'
      AND o.IsDeleted = 0 AND t.Code = N'DP'
      AND t.Name = N'Date--Date picker' AND t.IsDeleted = 0;

    IF @dateTypeId IS NULL
        THROW 51360, 'The Field / Date--Date picker object type was not found.', 1;

    DECLARE @oldAttributes xml;
    SELECT @oldAttributes = TRY_CONVERT(xml, ExtraAttributes)
    FROM dbo.SycEntityObjectTypes WHERE Id = @dateTypeId;

    IF EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes
               WHERE Id = @dateTypeId AND ExtraAttributes IS NOT NULL)
       AND @oldAttributes IS NULL
        THROW 51361, 'The Date--Date picker ExtraAttributes value is not valid XML.', 1;

    IF @oldAttributes IS NOT NULL
       AND @oldAttributes.exist('/ItemExtraAttributes/ExtraAttributes') <> 1
        THROW 51362, 'The Date--Date picker ExtraAttributes XML has an unexpected structure.', 1;

    CREATE TABLE #DatePickerAttributes
    (
        Ordinal int NOT NULL PRIMARY KEY,
        AttributeId bigint NULL,
        Code nvarchar(100) COLLATE DATABASE_DEFAULT NOT NULL UNIQUE,
        Name nvarchar(100) COLLATE DATABASE_DEFAULT NOT NULL,
        DataType nvarchar(100) COLLATE DATABASE_DEFAULT NOT NULL,
        DefaultValue nvarchar(100) COLLATE DATABASE_DEFAULT NULL,
        Usage nvarchar(100) COLLATE DATABASE_DEFAULT NOT NULL
    );

    INSERT #DatePickerAttributes
        (Ordinal, Code, Name, DataType, DefaultValue, Usage)
    VALUES
        (1, N'AllowNull',    N'Allow Null',    N'boolean',  N'false', N'FieldManager.AdvancedInformation'),
        (2, N'DateFormat',   N'Date Format',   N'string',   NULL,     N'FieldManager.AdvancedInformation'),
        (3, N'DefaultValue', N'Default Value', N'Datetime', NULL,     N'FieldManager.AdvancedInformation'),
        (4, N'Required',     N'Required',      N'boolean',  N'false', N'FieldManager.AdvancedInformation'),
        (5, N'Visible',      N'Visible',       N'boolean',  N'true',  N'FieldManager.ExtraAttributes');

    IF @oldAttributes IS NOT NULL AND EXISTS
    (
        SELECT 1
        FROM @oldAttributes.nodes('/ItemExtraAttributes/ExtraAttributes/ExtraAttribute') AS A(Node)
        JOIN #DatePickerAttributes AS d
          ON LOWER(A.Node.value('(Code/text())[1]', 'nvarchar(100)')) = LOWER(d.Code)
        GROUP BY d.Code HAVING COUNT(*) > 1
    )
        THROW 51363, 'The Date--Date picker XML contains duplicate setting codes.', 1;

    IF @oldAttributes IS NOT NULL
        UPDATE d SET AttributeId = A.Node.value('(AttributeId/text())[1]', 'bigint')
        FROM #DatePickerAttributes AS d
        JOIN @oldAttributes.nodes('/ItemExtraAttributes/ExtraAttributes/ExtraAttribute') AS A(Node)
          ON LOWER(A.Node.value('(Code/text())[1]', 'nvarchar(100)')) = LOWER(d.Code);

    DECLARE @lastAttributeId bigint;
    ;WITH Parsed AS
    (
        SELECT TRY_CONVERT(xml, ExtraAttributes) AS AttributesXml
        FROM dbo.SycEntityObjectTypes WHERE ExtraAttributes IS NOT NULL
    )
    SELECT @lastAttributeId = COALESCE(MAX(
        A.Node.value('(AttributeId/text())[1]', 'bigint')), 0)
    FROM Parsed
    CROSS APPLY AttributesXml.nodes(
        '/ItemExtraAttributes/ExtraAttributes/ExtraAttribute') AS A(Node);

    ;WITH Missing AS
    (
        SELECT Ordinal, ROW_NUMBER() OVER (ORDER BY Ordinal) AS SequenceNo
        FROM #DatePickerAttributes WHERE AttributeId IS NULL
    )
    UPDATE d SET AttributeId = @lastAttributeId + m.SequenceNo
    FROM #DatePickerAttributes AS d JOIN Missing AS m ON m.Ordinal = d.Ordinal;

    DECLARE @newAttributes xml;
    SELECT @newAttributes =
    (
        SELECT
        (
            SELECT AttributeId, Code, Name, Name AS Description, DataType,
                   N'' AS Width, 0 AS Decimals,
                   COALESCE(DefaultValue, N'') AS DefaultValue,
                   Usage, N'false' AS IsLookup,
                   N'' AS EntityObjectTypeCode,
                   N'false' AS AllowAddNew,
                   N'false' AS AcceptMultipleValues,
                   N'' AS ValidEntries,
                   N'false' AS IsVariation,
                   N'false' AS IsAdvancedSearch
            FROM #DatePickerAttributes ORDER BY Ordinal
            FOR XML PATH('ExtraAttribute'), TYPE
        )
        FOR XML PATH('ExtraAttributes'), ROOT('ItemExtraAttributes'), TYPE
    );

    UPDATE dbo.SycEntityObjectTypes
    SET ExtraAttributes = CONVERT(nvarchar(max), @newAttributes)
    WHERE Id = @dateTypeId;

    DROP TABLE #DatePickerAttributes;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
