using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

#nullable disable

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20261103120000_UseColorHexForLineSheetSwatch")]
    public class UseColorHexForLineSheetSwatch : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DECLARE @procedureDefinition nvarchar(max) = OBJECT_DEFINITION(OBJECT_ID(N'dbo.Color_Sizes2', N'P'));
IF @procedureDefinition IS NULL
    THROW 50000, 'Could not read dbo.Color_Sizes2.', 1;

IF CHARINDEX(N'/* ColorHexSwatch */', @procedureDefinition) = 0
BEGIN
    DECLARE @attachmentUrlMarker nvarchar(200) = N'ELSE ' + REPLICATE(N'''', 3) + N' + @attachmentBaseUrl';
    DECLARE @attachmentUrlPosition int = CHARINDEX(UPPER(@attachmentUrlMarker), UPPER(@procedureDefinition));
    IF @attachmentUrlPosition = 0
        THROW 50000, 'Could not locate the Color_Sizes2 attachment URL expression.', 1;

    DECLARE @reversedCasePosition int = CHARINDEX(
        N'ESAC',
        REVERSE(LEFT(@procedureDefinition, @attachmentUrlPosition)));
    IF @reversedCasePosition = 0
        THROW 50000, 'Could not locate the Color_Sizes2 attachment CASE expression.', 1;

    DECLARE @casePosition int = @attachmentUrlPosition - @reversedCasePosition - 2;
    IF UPPER(SUBSTRING(@procedureDefinition, @casePosition, 4)) <> N'CASE'
        THROW 50000, 'The Color_Sizes2 attachment CASE expression was not found.', 1;

    DECLARE @colorHexBranch nvarchar(max) = N' WHEN EXISTS (
        SELECT 1
        FROM dbo.AppEntityExtraData AS colorHex
        WHERE colorHex.EntityId = SM.EntityId
          AND colorHex.AttributeId = 201
          AND LEN(LTRIM(RTRIM(colorHex.AttributeValue))) > 0
    ) THEN (
        SELECT TOP (1) colorHex.AttributeValue
        FROM dbo.AppEntityExtraData AS colorHex
        WHERE colorHex.EntityId = SM.EntityId
          AND colorHex.AttributeId = 201
          AND LEN(LTRIM(RTRIM(colorHex.AttributeValue))) > 0
        ORDER BY colorHex.Id
    ) /* ColorHexSwatch */';

    SET @procedureDefinition = STUFF(
        @procedureDefinition,
        @casePosition + LEN(N'CASE'),
        0,
        @colorHexBranch);
END;

DECLARE @createOrAlterPosition int = CHARINDEX(N'CREATE OR ALTER', UPPER(@procedureDefinition));
DECLARE @createPosition int;
IF @createOrAlterPosition > 0
    SET @procedureDefinition = STUFF(@procedureDefinition, @createOrAlterPosition, LEN(N'CREATE OR ALTER'), N'ALTER');
ELSE
BEGIN
    SET @createPosition = CHARINDEX(N'CREATE', UPPER(@procedureDefinition));
    IF @createPosition > 0
        SET @procedureDefinition = STUFF(@procedureDefinition, @createPosition, LEN(N'CREATE'), N'ALTER');
    ELSE IF CHARINDEX(N'ALTER', UPPER(@procedureDefinition)) = 0
        THROW 50000, 'Could not locate the dbo.Color_Sizes2 definition header.', 1;
END;

EXEC sys.sp_executesql @procedureDefinition;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Keep the swatch fallback; removing it would restore the incorrect product-image binding.
        }
    }
}
