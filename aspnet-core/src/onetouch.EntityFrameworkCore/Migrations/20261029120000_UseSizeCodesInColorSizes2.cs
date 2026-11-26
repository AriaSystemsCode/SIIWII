using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

#nullable disable

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20261029120000_UseSizeCodesInColorSizes2")]
    public class UseSizeCodesInColorSizes2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DECLARE @viewDefinition nvarchar(max) = OBJECT_DEFINITION(OBJECT_ID(N'dbo.vw_variation_sock', N'V'));
IF @viewDefinition IS NULL
    THROW 50000, 'Could not read dbo.vw_variation_sock.', 1;

IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.vw_variation_sock', N'V')
      AND name = N'SizeCode')
BEGIN
    DECLARE @viewMarker nvarchar(100) = N'sz.Id AS id';
    DECLARE @viewMarkerPosition int = CHARINDEX(UPPER(@viewMarker), UPPER(@viewDefinition));
    IF @viewMarkerPosition = 0
        THROW 50000, 'Could not locate the size-scale ID in dbo.vw_variation_sock.', 1;

    SET @viewDefinition = STUFF(
        @viewDefinition,
        @viewMarkerPosition + LEN(@viewMarker),
        0,
        N', b.AttributeCode AS SizeCode');

    DECLARE @viewCreateOrAlterPosition int = CHARINDEX(N'CREATE OR ALTER', UPPER(@viewDefinition));
    DECLARE @viewCreatePosition int;
    IF @viewCreateOrAlterPosition > 0
        SET @viewDefinition = STUFF(@viewDefinition, @viewCreateOrAlterPosition, LEN(N'CREATE OR ALTER'), N'ALTER');
    ELSE
    BEGIN
        SET @viewCreatePosition = CHARINDEX(N'CREATE', UPPER(@viewDefinition));
        IF @viewCreatePosition > 0
            SET @viewDefinition = STUFF(@viewDefinition, @viewCreatePosition, LEN(N'CREATE'), N'ALTER');
        ELSE IF CHARINDEX(N'ALTER', UPPER(@viewDefinition)) = 0
            THROW 50000, 'Could not locate the dbo.vw_variation_sock definition header.', 1;
    END;

    EXEC sys.sp_executesql @viewDefinition;
    EXEC sys.sp_refreshview N'dbo.vw_variation_sock';
END;
", suppressTransaction: true);

            // Commit the view change before compiling modules that reference the new column.
            migrationBuilder.Sql(@"
DECLARE @sizeCodeHelper nvarchar(max) = N'
CREATE OR ALTER PROCEDURE dbo.GetVariationSizeCodes
    @ParentId bigint,
    @ProductListId bigint = 0
AS
BEGIN
    SET NOCOUNT ON;

    SELECT SizeCode, MIN(id) AS id
    FROM dbo.vw_variation_sock
    WHERE ParentId = @ParentId
      AND SizeCode IS NOT NULL
      AND (@ProductListId = 0 OR AppItemId IN
          (SELECT ItemId FROM dbo.AppItemsListDetails WHERE ItemsListId = @ProductListId))
    GROUP BY SizeCode
    ORDER BY MIN(id);
END;';
EXEC sys.sp_executesql @sizeCodeHelper;

DECLARE @procedureDefinition nvarchar(max) = OBJECT_DEFINITION(OBJECT_ID(N'dbo.Color_Sizes2', N'P'));
IF @procedureDefinition IS NULL
    THROW 50000, 'Could not read dbo.Color_Sizes2.', 1;

-- Keep the existing GetVariations contract unchanged; Color_Sizes2 gets codes from its own helper.
SET @procedureDefinition = REPLACE(@procedureDefinition, N'[dbo].[Getvariations]', N'[dbo].[GetVariationSizeCodes]');
SET @procedureDefinition = REPLACE(@procedureDefinition, N'[dbo].[GetVariations]', N'[dbo].[GetVariationSizeCodes]');
SET @procedureDefinition = REPLACE(@procedureDefinition, N'[dbo].[GETVARIATIONS]', N'[dbo].[GetVariationSizeCodes]');
SET @procedureDefinition = REPLACE(@procedureDefinition, N'AttributeValue2', N'SizeCode');
SET @procedureDefinition = REPLACE(@procedureDefinition, N'attributevalue2', N'SizeCode');
SET @procedureDefinition = REPLACE(@procedureDefinition, N'ATTRIBUTEVALUE2', N'SizeCode');

IF CHARINDEX(N'[DBO].[GETVARIATIONS]', UPPER(@procedureDefinition)) > 0
    THROW 50000, 'Could not redirect dbo.Color_Sizes2 to the size-code helper.', 1;
IF CHARINDEX(N'ATTRIBUTEVALUE2', UPPER(@procedureDefinition)) > 0
    THROW 50000, 'Could not replace all size-name pivot references in dbo.Color_Sizes2.', 1;
IF CHARINDEX(N'SIZECODE', UPPER(@procedureDefinition)) = 0
    THROW 50000, 'Size-code references were not added to dbo.Color_Sizes2.', 1;

DECLARE @procedureCreateOrAlterPosition int = CHARINDEX(N'CREATE OR ALTER', UPPER(@procedureDefinition));
DECLARE @procedureCreatePosition int;
IF @procedureCreateOrAlterPosition > 0
    SET @procedureDefinition = STUFF(@procedureDefinition, @procedureCreateOrAlterPosition, LEN(N'CREATE OR ALTER'), N'ALTER');
ELSE
BEGIN
    SET @procedureCreatePosition = CHARINDEX(N'CREATE', UPPER(@procedureDefinition));
    IF @procedureCreatePosition > 0
        SET @procedureDefinition = STUFF(@procedureDefinition, @procedureCreatePosition, LEN(N'CREATE'), N'ALTER');
    ELSE IF CHARINDEX(N'ALTER', UPPER(@procedureDefinition)) = 0
        THROW 50000, 'Could not locate the dbo.Color_Sizes2 definition header.', 1;
END;

EXEC sys.sp_executesql @procedureDefinition;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Keep the code-based size pivot; reverting it could break line-sheet consumers.
        }
    }
}
