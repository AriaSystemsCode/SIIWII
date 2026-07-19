using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

#nullable disable

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20260719210000_UseConfiguredLineSheetAttachmentUrl")]
    public class UseConfiguredLineSheetAttachmentUrl : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DECLARE @name sysname;
DECLARE @definition nvarchar(max);
DECLARE @createPosition int;

DECLARE procedure_cursor CURSOR LOCAL FAST_FORWARD FOR
    SELECT name
    FROM sys.procedures
    WHERE name IN ('ItemsListsReport1', 'LineSheet_ColorsData', 'Color_Sizes2');

OPEN procedure_cursor;
FETCH NEXT FROM procedure_cursor INTO @name;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @definition = OBJECT_DEFINITION(OBJECT_ID(N'dbo.' + QUOTENAME(@name)));
    SET @definition = REPLACE(
        @definition,
        'set @attachmentBaseUrl = ''http://localhost''',
        '-- Use the attachment base URL supplied by the application');
    SET @definition = REPLACE(
        @definition,
        'Set @attachmentBaseUrl = ''http://localhost''',
        '-- Use the attachment base URL supplied by the application');

    SET @createPosition = CHARINDEX('CREATE', UPPER(@definition));
    IF @createPosition > 0
        SET @definition = STUFF(@definition, @createPosition, 6, 'ALTER');
    ELSE IF CHARINDEX('ALTER', UPPER(@definition)) = 0
        THROW 50000, 'Could not locate a procedure statement.', 1;

    EXEC sys.sp_executesql @definition;

    FETCH NEXT FROM procedure_cursor INTO @name;
END;

CLOSE procedure_cursor;
DEALLOCATE procedure_cursor;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Intentionally do not restore machine-specific localhost URLs.
        }
    }
}
