using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

#nullable disable

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20260927120000_FixLineSheetQuantityFormatting")]
    public class FixLineSheetQuantityFormatting : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DECLARE @definition nvarchar(max) = OBJECT_DEFINITION(OBJECT_ID(N'dbo.Color_Sizes2'));
DECLARE @originalDefinition nvarchar(max) = @definition;
DECLARE @createPosition int;

IF @definition IS NULL
    THROW 50000, 'Could not locate dbo.Color_Sizes2.', 1;

-- STR pads values with spaces. Those padded strings can be clipped in the
-- narrow size columns, making quantities such as 200 and 1200 appear shorter.
SET @definition = REPLACE(@definition, 'str(sum( size', 'convert(varchar(20), sum(size');
SET @definition = REPLACE(@definition, 'str(sum(size', 'convert(varchar(20), sum(size');
SET @definition = REPLACE(@definition, 'str(sum( total ),20) as total', 'convert(varchar(20), sum(total)) as total');
SET @definition = REPLACE(@definition, 'str(sum( total )) as total', 'convert(varchar(20), sum(total)) as total');
SET @definition = REPLACE(@definition, 'str(sum(total),20) as total', 'convert(varchar(20), sum(total)) as total');

IF @definition = @originalDefinition
    THROW 50000, 'Could not find the expected padded quantity expressions in dbo.Color_Sizes2.', 1;

SET @createPosition = CHARINDEX('CREATE', UPPER(@definition));
IF @createPosition > 0
    SET @definition = STUFF(@definition, @createPosition, 6, 'ALTER');
ELSE IF CHARINDEX('ALTER', UPPER(@definition)) = 0
    THROW 50000, 'Could not locate a procedure statement for dbo.Color_Sizes2.', 1;

EXEC sys.sp_executesql @definition;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Leave quantity values unpadded when rolling back; formatting does not change stored data.
        }
    }
}
