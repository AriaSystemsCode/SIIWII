using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class add_SycAttachmentCategories_EntityObjectTypeId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF COL_LENGTH(N'dbo.SycAttachmentCategories', N'EntityObjectTypeId') IS NULL
    ALTER TABLE [dbo].[SycAttachmentCategories] ADD [EntityObjectTypeId] int NULL;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [object_id] = OBJECT_ID(N'dbo.SycAttachmentCategories')
      AND [name] = N'IX_SycAttachmentCategories_EntityObjectTypeId')
    CREATE INDEX [IX_SycAttachmentCategories_EntityObjectTypeId]
        ON [dbo].[SycAttachmentCategories] ([EntityObjectTypeId]);

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE [parent_object_id] = OBJECT_ID(N'dbo.SycAttachmentCategories')
      AND [name] = N'FK_SycAttachmentCategories_SycEntityObjectTypes_EntityObjectTypeId')
    ALTER TABLE [dbo].[SycAttachmentCategories] WITH CHECK
        ADD CONSTRAINT [FK_SycAttachmentCategories_SycEntityObjectTypes_EntityObjectTypeId]
        FOREIGN KEY ([EntityObjectTypeId])
        REFERENCES [dbo].[SycEntityObjectTypes] ([Id]);
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE [parent_object_id] = OBJECT_ID(N'dbo.SycAttachmentCategories')
      AND [name] = N'FK_SycAttachmentCategories_SycEntityObjectTypes_EntityObjectTypeId')
    ALTER TABLE [dbo].[SycAttachmentCategories]
        DROP CONSTRAINT [FK_SycAttachmentCategories_SycEntityObjectTypes_EntityObjectTypeId];

IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [object_id] = OBJECT_ID(N'dbo.SycAttachmentCategories')
      AND [name] = N'IX_SycAttachmentCategories_EntityObjectTypeId')
    DROP INDEX [IX_SycAttachmentCategories_EntityObjectTypeId]
        ON [dbo].[SycAttachmentCategories];

IF COL_LENGTH(N'dbo.SycAttachmentCategories', N'EntityObjectTypeId') IS NOT NULL
    ALTER TABLE [dbo].[SycAttachmentCategories] DROP COLUMN [EntityObjectTypeId];
");
        }
    }
}
