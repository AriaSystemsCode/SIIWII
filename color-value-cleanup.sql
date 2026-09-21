-- Local, recoverable cleanup of quoted color names. Preserve unmatched apostrophes.
SET NOCOUNT ON;
SET XACT_ABORT ON;
IF DB_NAME() <> N'onetouchDevDb3'
    THROW 50001, 'This cleanup is scoped to onetouchDevDb3.', 1;
BEGIN TRANSACTION;
IF OBJECT_ID(N'dbo.ColorAttributeQuoteBackup_20260918', N'U') IS NOT NULL
    THROW 50002, 'Backup already exists; inspect it before rerunning.', 1;

SELECT e.* INTO dbo.ColorAttributeQuoteBackup_20260918
FROM dbo.AppEntityExtraData e WITH (UPDLOCK, HOLDLOCK)
WHERE AttributeId = 101
  AND LEFT(LTRIM(AttributeValue), 1) IN (NCHAR(34), NCHAR(39))
  AND RIGHT(RTRIM(AttributeValue), 1) IN (NCHAR(34), NCHAR(39))
OPTION (MAXDOP 1);

SELECT Id, AttributeValue AS CleanValue INTO #Clean
FROM dbo.ColorAttributeQuoteBackup_20260918;
UPDATE #Clean SET CleanValue = LTRIM(RTRIM(CleanValue));
WHILE EXISTS (SELECT 1 FROM #Clean WHERE LEFT(CleanValue,1) IN (NCHAR(34),NCHAR(39)))
    UPDATE #Clean SET CleanValue = LTRIM(SUBSTRING(CleanValue,2,LEN(CleanValue)))
    WHERE LEFT(CleanValue,1) IN (NCHAR(34),NCHAR(39));
WHILE EXISTS (SELECT 1 FROM #Clean WHERE RIGHT(CleanValue,1) IN (NCHAR(34),NCHAR(39)))
    UPDATE #Clean SET CleanValue = RTRIM(LEFT(CleanValue,LEN(CleanValue)-1))
    WHERE RIGHT(CleanValue,1) IN (NCHAR(34),NCHAR(39));
IF EXISTS (SELECT 1 FROM #Clean WHERE CleanValue = N'')
    THROW 50003, 'Cleanup would produce an empty color; aborting.', 1;

UPDATE e SET AttributeValue = c.CleanValue
FROM dbo.AppEntityExtraData e JOIN #Clean c ON c.Id=e.Id
OPTION (MAXDOP 1);
DECLARE @Updated int = @@ROWCOUNT;
IF EXISTS (SELECT 1 FROM dbo.AppEntityExtraData e JOIN #Clean c ON c.Id=e.Id
           WHERE e.AttributeValue <> c.CleanValue)
    THROW 50004, 'Verification failed.', 1;
COMMIT TRANSACTION;
SELECT @Updated AS UpdatedRows;
SELECT b.AttributeValue AS OriginalValue, e.AttributeValue AS CleanValue, COUNT(*) AS AffectedCount
FROM dbo.ColorAttributeQuoteBackup_20260918 b
JOIN dbo.AppEntityExtraData e ON e.Id=b.Id
GROUP BY b.AttributeValue,e.AttributeValue;
