using System;
using System.IO;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20261016120000_RemapFieldEntityObjectTypes")]
    public class RemapFieldEntityObjectTypes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            const string resourceName = "onetouch.Migrations.Seed.20261016_RemapFieldEntityObjectTypes.sql";
            using (var stream = typeof(RemapFieldEntityObjectTypes).Assembly.GetManifestResourceStream(resourceName))
            {
                if (stream == null)
                    throw new InvalidOperationException("Missing Field Manager migration resource: " + resourceName);
                using (var reader = new StreamReader(stream))
                    migrationBuilder.Sql(reader.ReadToEnd());
            }
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.foreign_keys
    WHERE name = N'FK_AppFields_SycEntityObjectTypes_EntitySycObjectId'
      AND parent_object_id = OBJECT_ID(N'dbo.AppFields'))
BEGIN
    ALTER TABLE dbo.AppFields
        DROP CONSTRAINT FK_AppFields_SycEntityObjectTypes_EntitySycObjectId;
    UPDATE f SET EntitySycObjectId = NULL
    FROM dbo.AppFields f JOIN dbo.SydObjects o ON o.Id = f.SycObjectId
    WHERE o.Code = N'FIELD' AND f.FieldName = N'input mask';
    UPDATE h SET EntitySycObjectId = NULL
    FROM dbo.AppFieldsHistory h JOIN dbo.AppFields f ON f.Id = h.AppFieldId
    JOIN dbo.SydObjects o ON o.Id = f.SycObjectId
    WHERE o.Code = N'FIELD' AND f.FieldName = N'input mask';
    UPDATE a SET EntitySycObjectId = NULL
    FROM dbo.AppTableFields a JOIN dbo.AppFields f
        ON f.FieldDefinitionKey = a.FieldDefinitionKey
    JOIN dbo.SydObjects o ON o.Id = f.SycObjectId
    WHERE o.Code = N'FIELD' AND f.FieldName = N'input mask';
    UPDATE f SET EntitySycObjectId = t.ObjectId
    FROM dbo.AppFields f JOIN dbo.SycEntityObjectTypes t ON t.Id = f.EntitySycObjectId;
    UPDATE h SET EntitySycObjectId = t.ObjectId
    FROM dbo.AppFieldsHistory h JOIN dbo.SycEntityObjectTypes t
        ON t.Id = h.EntitySycObjectId;
    UPDATE a SET EntitySycObjectId = t.ObjectId
    FROM dbo.AppTableFields a JOIN dbo.SycEntityObjectTypes t
        ON t.Id = a.EntitySycObjectId;
    ALTER TABLE dbo.AppFields WITH CHECK ADD CONSTRAINT
        FK_AppFields_SydObjects_EntitySycObjectId
        FOREIGN KEY (EntitySycObjectId) REFERENCES dbo.SydObjects(Id);
END;");
        }
    }
}
