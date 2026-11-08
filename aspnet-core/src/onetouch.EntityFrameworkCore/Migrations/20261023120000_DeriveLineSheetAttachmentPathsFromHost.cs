using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

#nullable disable

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20261023120000_DeriveLineSheetAttachmentPathsFromHost")]
    public class DeriveLineSheetAttachmentPathsFromHost : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DECLARE @pathBlock nvarchar(max) = N'
      IF RIGHT(@attachmentBaseUrl, 1) = ''/''
          SET @attachmentBaseUrl = LEFT(@attachmentBaseUrl, LEN(@attachmentBaseUrl) - 1);

      DECLARE @attachmentUrlHost nvarchar(250) = LOWER(LTRIM(RTRIM(@attachmentBaseUrl)));
      SET @attachmentUrlHost = REPLACE(@attachmentUrlHost, ''https://'', '''');
      SET @attachmentUrlHost = REPLACE(@attachmentUrlHost, ''http://'', '''');
      SET @attachmentUrlHost = LEFT(@attachmentUrlHost, CHARINDEX(''/'', @attachmentUrlHost + ''/'') - 1);
      SET @attachmentUrlHost = LEFT(@attachmentUrlHost, CHARINDEX('':'', @attachmentUrlHost + '':'') - 1);

      DECLARE @attachmentSiteKey nvarchar(100) =
          LEFT(@attachmentUrlHost, CHARINDEX(''.'', @attachmentUrlHost + ''.'') - 1);
      SET @attachmentSiteKey =
          LEFT(@attachmentSiteKey, CHARINDEX(''-'', @attachmentSiteKey + ''-'') - 1);

      DECLARE @attachmentsPath nvarchar(250) =
          CASE WHEN @attachmentSiteKey IN (''app'', ''localhost'')
               THEN ''/attachments/''
               ELSE ''/attachments/'' + @attachmentSiteKey + ''/''
          END;
';

DECLARE @name sysname;
DECLARE @definition nvarchar(max);
DECLARE @position int;
DECLARE @lineEnd int;
DECLARE @assignmentPosition int;
DECLARE @lineText nvarchar(max);
DECLARE @marker nvarchar(200);
DECLARE @markerPosition int;
DECLARE @expressionStart int;
DECLARE @expressionEnd int;
DECLARE @createOrAlterPosition int;
DECLARE @createPosition int;

IF (SELECT COUNT(*) FROM sys.procedures
    WHERE name IN ('ItemsListsReport1', 'LineSheet_ColorsData', 'Color_Sizes2')) <> 3
    THROW 50000, 'One or more line sheet procedures are missing.', 1;

DECLARE procedure_cursor CURSOR LOCAL FAST_FORWARD FOR
    SELECT name
    FROM sys.procedures
    WHERE name IN ('ItemsListsReport1', 'LineSheet_ColorsData', 'Color_Sizes2');

OPEN procedure_cursor;
FETCH NEXT FROM procedure_cursor INTO @name;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @definition = OBJECT_DEFINITION(OBJECT_ID(N'dbo.' + QUOTENAME(@name)));
    IF @definition IS NULL
        THROW 50000, 'Could not read a line sheet procedure definition.', 1;

    -- Remove any environment-specific localhost assignment, including old HTTPS variants.
    SET @assignmentPosition = CHARINDEX(N'SET @ATTACHMENTBASEURL', UPPER(@definition));
    WHILE @assignmentPosition > 0
    BEGIN
        SET @lineEnd = CHARINDEX(CHAR(10), @definition, @assignmentPosition);
        IF @lineEnd = 0 SET @lineEnd = LEN(@definition) + 1;
        SET @lineText = UPPER(SUBSTRING(@definition, @assignmentPosition, @lineEnd - @assignmentPosition));

        IF @lineText LIKE N'%LOCALHOST%'
            SET @definition = STUFF(
                @definition,
                @assignmentPosition,
                @lineEnd - @assignmentPosition,
                N'-- Use the attachment base URL supplied by the application');

        SET @assignmentPosition = CHARINDEX(N'SET @ATTACHMENTBASEURL', UPPER(@definition), @assignmentPosition + 1);
    END;

    IF @name = 'ItemsListsReport1'
    BEGIN
        IF CHARINDEX(N'@attachmentsPath', @definition) = 0
        BEGIN
            SET @position = CHARINDEX(N'DECLARE @ATTACHMENTBASEURL1', UPPER(@definition));
            IF @position > 0
            BEGIN
                SET @lineEnd = CHARINDEX(CHAR(10), @definition, @position);
                IF @lineEnd = 0 SET @lineEnd = LEN(@definition) + 1;
                SET @definition = STUFF(
                    @definition,
                    @position,
                    @lineEnd - @position,
                    @pathBlock + N'      DECLARE @attachmentBaseUrl1 nvarchar(500) = @attachmentBaseUrl + @attachmentsPath;');
            END
            ELSE
            BEGIN
                SET @position = CHARINDEX(N'DECLARE @ATTACHMENTCATEGORYLOGO', UPPER(@definition));
                IF @position = 0
                    THROW 50000, 'Could not locate the ItemsListsReport1 attachment declaration point.', 1;
                SET @definition = STUFF(@definition, @position, 0, @pathBlock);
            END;
        END;

        SET @definition = REPLACE(@definition,
            N'@attachmentBaseUrl+''/attachments/''',
            N'@attachmentBaseUrl+@attachmentsPath');
        SET @definition = REPLACE(@definition,
            N'@attachmentBaseUrl + ''/attachments/''',
            N'@attachmentBaseUrl+@attachmentsPath');
    END
    ELSE IF @name = 'LineSheet_ColorsData'
    BEGIN
        IF CHARINDEX(N'@attachmentsPath', @definition) = 0
        BEGIN
            SET @position = CHARINDEX(N'DECLARE @VISTIED', UPPER(@definition));
            IF @position = 0
                THROW 50000, 'Could not locate the LineSheet_ColorsData declaration point.', 1;
            SET @definition = STUFF(@definition, @position, 0, @pathBlock);
        END;

        SET @definition = REPLACE(@definition,
            N'@attachmentBaseUrl+''/attachments/''+',
            N'@attachmentBaseUrl+@attachmentsPath+');
        SET @definition = REPLACE(@definition,
            N'@attachmentBaseUrl + ''/attachments/'' +',
            N'@attachmentBaseUrl+@attachmentsPath+');
    END
    ELSE IF @name = 'Color_Sizes2'
    BEGIN
        IF CHARINDEX(N'@attachmentsPath', @definition) = 0
        BEGIN
            SET @position = CHARINDEX(N'DECLARE @SQLQUERY', UPPER(@definition));
            IF @position = 0
                THROW 50000, 'Could not locate the Color_Sizes2 dynamic SQL declaration.', 1;
            SET @definition = STUFF(@definition, @position, 0, @pathBlock);
        END;

        SET @marker = N'ELSE ' + REPLICATE(N'''', 3) + N' + @attachmentBaseUrl';
        SET @markerPosition = CHARINDEX(@marker, @definition);
        IF @markerPosition > 0
        BEGIN
            SET @expressionStart = @markerPosition + LEN(@marker);
            SET @expressionEnd = CHARINDEX(N'END AS attachment', @definition, @expressionStart);
            IF @expressionEnd = 0
                THROW 50000, 'Could not locate the end of the Color_Sizes2 attachment URL expression.', 1;

            SET @definition = STUFF(
                @definition,
                @expressionStart,
                @expressionEnd - @expressionStart,
                N' + @attachmentsPath + ' + REPLICATE(N'''', 3) + N' + sm.attachment ');
        END
        ELSE
        BEGIN
            -- Older Color_Sizes2 definitions build the image URL without a CASE expression.
            SET @definition = REPLACE(@definition,
                N'@attachmentBaseUrl+''/attachments/''',
                N'@attachmentBaseUrl+@attachmentsPath');
            SET @definition = REPLACE(@definition,
                N'@attachmentBaseUrl + ''/attachments/''',
                N'@attachmentBaseUrl+@attachmentsPath');
        END;

        IF CHARINDEX(N'@attachmentsPath', @definition) = 0
            THROW 50000, 'Could not update the Color_Sizes2 attachment URL expression.', 1;
    END;

    SET @createOrAlterPosition = CHARINDEX(N'CREATE OR ALTER', UPPER(@definition));
    IF @createOrAlterPosition > 0
        SET @definition = STUFF(@definition, @createOrAlterPosition, LEN(N'CREATE OR ALTER'), N'ALTER');
    ELSE
    BEGIN
        SET @createPosition = CHARINDEX(N'CREATE', UPPER(@definition));
        IF @createPosition > 0
            SET @definition = STUFF(@definition, @createPosition, LEN(N'CREATE'), N'ALTER');
        ELSE IF CHARINDEX(N'ALTER', UPPER(@definition)) = 0
            THROW 50000, 'Could not locate a procedure statement.', 1;
    END;

    EXEC sys.sp_executesql @definition;

    FETCH NEXT FROM procedure_cursor INTO @name;
END;

CLOSE procedure_cursor;
DEALLOCATE procedure_cursor;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Intentionally keep the corrected URL handling; restoring machine-specific paths is unsafe.
        }
    }
}
