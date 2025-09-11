using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class waelRenaming_103 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppEntities_SycEntityObjectStatuses_SycEntityObjectStatusId",
                table: "AppEntities");

            migrationBuilder.DropForeignKey(
                name: "FK_AppEntities_SycEntityObjectTypes_SycEntityObjectTypeId",
                table: "AppEntities");

            migrationBuilder.DropForeignKey(
                name: "FK_AppEntities_SydObjects_SydObjectId",
                table: "AppEntities");

            migrationBuilder.DropForeignKey(
                name: "FK_SycEntityObjectCategories_SydObjects_SydObjectId",
                table: "SycEntityObjectCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_SycEntityObjectClassifications_SydObjects_SydObjectId",
                table: "SycEntityObjectClassifications");

            migrationBuilder.DropForeignKey(
                name: "FK_SycEntityObjectStatuses_SydObjects_SydObjectId",
                table: "SycEntityObjectStatuses");

            migrationBuilder.DropForeignKey(
                name: "FK_SycEntityObjectTypes_SydObjects_SydObjectId",
                table: "SycEntityObjectTypes");

            migrationBuilder.DropForeignKey(
                name: "FK_SydObjects_SysObjectTypes_SysObjectTypeId",
                table: "SydObjects");

            migrationBuilder.DropIndex(
                name: "IX_SydObjects_SysObjectTypeId",
                table: "SydObjects");

            migrationBuilder.DropIndex(
                name: "IX_SycEntityObjectTypes_SydObjectId",
                table: "SycEntityObjectTypes");

            migrationBuilder.DropIndex(
                name: "IX_SycEntityObjectStatuses_SydObjectId",
                table: "SycEntityObjectStatuses");

            migrationBuilder.DropIndex(
                name: "IX_SycEntityObjectClassifications_SydObjectId",
                table: "SycEntityObjectClassifications");

            migrationBuilder.DropIndex(
                name: "IX_SycEntityObjectCategories_SydObjectId",
                table: "SycEntityObjectCategories");

            migrationBuilder.DropIndex(
                name: "IX_AppEntities_SycEntityObjectStatusId",
                table: "AppEntities");

            migrationBuilder.DropIndex(
                name: "IX_AppEntities_SycEntityObjectTypeId",
                table: "AppEntities");

            migrationBuilder.DropIndex(
                name: "IX_AppEntities_SydObjectId",
                table: "AppEntities");

            migrationBuilder.DropColumn(
                name: "SysObjectTypeId",
                table: "SydObjects");

            migrationBuilder.DropColumn(
                name: "ParentIdCode",
                table: "SycEntityObjectTypes");

            migrationBuilder.DropColumn(
                name: "SydObjectId",
                table: "SycEntityObjectTypes");

            migrationBuilder.DropColumn(
                name: "SydObjectIdCode",
                table: "SycEntityObjectTypes");

            migrationBuilder.DropColumn(
                name: "SydObjectId",
                table: "SycEntityObjectStatuses");

            migrationBuilder.DropColumn(
                name: "ParentIdCode",
                table: "SycEntityObjectClassifications");

            migrationBuilder.DropColumn(
                name: "SydObjectId",
                table: "SycEntityObjectClassifications");

            migrationBuilder.DropColumn(
                name: "SydObjectIdCode",
                table: "SycEntityObjectClassifications");

            migrationBuilder.DropColumn(
                name: "ParentIdCode",
                table: "SycEntityObjectCategories");

            migrationBuilder.DropColumn(
                name: "SydObjectId",
                table: "SycEntityObjectCategories");

            migrationBuilder.DropColumn(
                name: "SydObjectIdCode",
                table: "SycEntityObjectCategories");

            migrationBuilder.DropColumn(
                name: "ParentIdCode",
                table: "SycAttachmentCategories");

            migrationBuilder.DropColumn(
                name: "EntityIdCode",
                table: "AppMessages");

            migrationBuilder.DropColumn(
                name: "ParentIdCode",
                table: "AppMessages");

            migrationBuilder.DropColumn(
                name: "EntityIdCode",
                table: "AppEntityClassifications");

            migrationBuilder.DropColumn(
                name: "EntityObjectClassificationIdCode",
                table: "AppEntityClassifications");

            migrationBuilder.DropColumn(
                name: "EntityIdCode",
                table: "AppEntityCategories");

            migrationBuilder.DropColumn(
                name: "EntityObjectCategoryIdCode",
                table: "AppEntityCategories");

            migrationBuilder.DropColumn(
                name: "AttachmentCategoryIdCode",
                table: "AppEntityAttachments");

            migrationBuilder.DropColumn(
                name: "AttachmentIdCode",
                table: "AppEntityAttachments");

            migrationBuilder.DropColumn(
                name: "EntityIdCode",
                table: "AppEntityAttachments");

            migrationBuilder.DropColumn(
                name: "SycEntityObjectStatusId",
                table: "AppEntities");

            migrationBuilder.DropColumn(
                name: "SycEntityObjectTypeId",
                table: "AppEntities");

            migrationBuilder.DropColumn(
                name: "SydObjectId",
                table: "AppEntities");

            migrationBuilder.DropColumn(
                name: "EntityIdCode",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "ParentIdCode",
                table: "AppContacts");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "SysObjectTypes",
                maxLength: 250,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "SysObjectTypes",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10);

            migrationBuilder.AddColumn<string>(
                name: "ParentCode",
                table: "SysObjectTypes",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "SydObjects",
                maxLength: 250,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "SydObjects",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150);

            migrationBuilder.AddColumn<string>(
                name: "ObjectTypeCode",
                table: "SydObjects",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "ObjectTypeId",
                table: "SydObjects",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "ParentCode",
                table: "SydObjects",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "SycEntityObjectTypes",
                maxLength: 250,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "SycEntityObjectTypes",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10);

            migrationBuilder.AddColumn<string>(
                name: "ObjectCode",
                table: "SycEntityObjectTypes",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ObjectId",
                table: "SycEntityObjectTypes",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ParentCode",
                table: "SycEntityObjectTypes",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TenantId",
                table: "SycEntityObjectTypes",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "SycEntityObjectStatuses",
                maxLength: 250,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "SycEntityObjectStatuses",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10,
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDefault",
                table: "SycEntityObjectStatuses",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ObjectCode",
                table: "SycEntityObjectStatuses",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ObjectId",
                table: "SycEntityObjectStatuses",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<long>(
                name: "UserId",
                table: "SycEntityObjectStatuses",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "SycEntityObjectClassifications",
                maxLength: 250,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "SycEntityObjectClassifications",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10);

            migrationBuilder.AddColumn<bool>(
                name: "IsDefault",
                table: "SycEntityObjectClassifications",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ObjectCode",
                table: "SycEntityObjectClassifications",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ObjectId",
                table: "SycEntityObjectClassifications",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParentCode",
                table: "SycEntityObjectClassifications",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "UserId",
                table: "SycEntityObjectClassifications",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "SycEntityObjectCategories",
                maxLength: 250,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "SycEntityObjectCategories",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10);

            migrationBuilder.AddColumn<bool>(
                name: "IsDefault",
                table: "SycEntityObjectCategories",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ObjectCode",
                table: "SycEntityObjectCategories",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ObjectId",
                table: "SycEntityObjectCategories",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ParentCode",
                table: "SycEntityObjectCategories",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "UserId",
                table: "SycEntityObjectCategories",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "SycAttachmentCategories",
                maxLength: 250,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "SycAttachmentCategories",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AddColumn<string>(
                name: "EntityObjectTypeCode",
                table: "SycAttachmentCategories",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParentCode",
                table: "SycAttachmentCategories",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EntityCode",
                table: "AppMessages",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParentCode",
                table: "AppMessages",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EntityCode",
                table: "AppEntityClassifications",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EntityObjectClassificationCode",
                table: "AppEntityClassifications",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EntityCode",
                table: "AppEntityCategories",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EntityObjectCategoryCode",
                table: "AppEntityCategories",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AttachmentCategoryCode",
                table: "AppEntityAttachments",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AttachmentCode",
                table: "AppEntityAttachments",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EntityCode",
                table: "AppEntityAttachments",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "AppEntities",
                maxLength: 250,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "AppEntities",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EntityObjectStatusCode",
                table: "AppEntities",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EntityObjectStatusId",
                table: "AppEntities",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EntityObjectTypeCode",
                table: "AppEntities",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EntityObjectTypeId",
                table: "AppEntities",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ObjectCode",
                table: "AppEntities",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ObjectId",
                table: "AppEntities",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "EntityCode",
                table: "AppContacts",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParentCode",
                table: "AppContacts",
                nullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "ShouldChangePasswordOnNextLogin",
                table: "AbpUsers",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<string>(
                name: "NormalizedUserName",
                table: "AbpUsers",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(256)",
                oldMaxLength: 256);

            migrationBuilder.AlterColumn<string>(
                name: "NormalizedEmailAddress",
                table: "AbpUsers",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(256)",
                oldMaxLength: 256);

            migrationBuilder.AddColumn<string>(
                name: "Discriminator",
                table: "AbpUsers",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_SydObjects_ObjectTypeId",
                table: "SydObjects",
                column: "ObjectTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_SycEntityObjectTypes_ObjectId",
                table: "SycEntityObjectTypes",
                column: "ObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_SycEntityObjectStatuses_ObjectId",
                table: "SycEntityObjectStatuses",
                column: "ObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_SycEntityObjectStatuses_UserId",
                table: "SycEntityObjectStatuses",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SycEntityObjectClassifications_ObjectId",
                table: "SycEntityObjectClassifications",
                column: "ObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_SycEntityObjectClassifications_UserId",
                table: "SycEntityObjectClassifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SycEntityObjectCategories_ObjectId",
                table: "SycEntityObjectCategories",
                column: "ObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_SycEntityObjectCategories_UserId",
                table: "SycEntityObjectCategories",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntities_EntityObjectStatusId",
                table: "AppEntities",
                column: "EntityObjectStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntities_EntityObjectTypeId",
                table: "AppEntities",
                column: "EntityObjectTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntities_ObjectId",
                table: "AppEntities",
                column: "ObjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppEntities_SycEntityObjectStatuses_EntityObjectStatusId",
                table: "AppEntities",
                column: "EntityObjectStatusId",
                principalTable: "SycEntityObjectStatuses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppEntities_SycEntityObjectTypes_EntityObjectTypeId",
                table: "AppEntities",
                column: "EntityObjectTypeId",
                principalTable: "SycEntityObjectTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AppEntities_SydObjects_ObjectId",
                table: "AppEntities",
                column: "ObjectId",
                principalTable: "SydObjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SycEntityObjectCategories_SydObjects_ObjectId",
                table: "SycEntityObjectCategories",
                column: "ObjectId",
                principalTable: "SydObjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SycEntityObjectCategories_AbpUsers_UserId",
                table: "SycEntityObjectCategories",
                column: "UserId",
                principalTable: "AbpUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SycEntityObjectClassifications_SydObjects_ObjectId",
                table: "SycEntityObjectClassifications",
                column: "ObjectId",
                principalTable: "SydObjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SycEntityObjectClassifications_AbpUsers_UserId",
                table: "SycEntityObjectClassifications",
                column: "UserId",
                principalTable: "AbpUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SycEntityObjectStatuses_SydObjects_ObjectId",
                table: "SycEntityObjectStatuses",
                column: "ObjectId",
                principalTable: "SydObjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SycEntityObjectStatuses_AbpUsers_UserId",
                table: "SycEntityObjectStatuses",
                column: "UserId",
                principalTable: "AbpUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SycEntityObjectTypes_SydObjects_ObjectId",
                table: "SycEntityObjectTypes",
                column: "ObjectId",
                principalTable: "SydObjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SydObjects_SysObjectTypes_ObjectTypeId",
                table: "SydObjects",
                column: "ObjectTypeId",
                principalTable: "SysObjectTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppEntities_SycEntityObjectStatuses_EntityObjectStatusId",
                table: "AppEntities");

            migrationBuilder.DropForeignKey(
                name: "FK_AppEntities_SycEntityObjectTypes_EntityObjectTypeId",
                table: "AppEntities");

            migrationBuilder.DropForeignKey(
                name: "FK_AppEntities_SydObjects_ObjectId",
                table: "AppEntities");

            migrationBuilder.DropForeignKey(
                name: "FK_SycEntityObjectCategories_SydObjects_ObjectId",
                table: "SycEntityObjectCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_SycEntityObjectCategories_AbpUsers_UserId",
                table: "SycEntityObjectCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_SycEntityObjectClassifications_SydObjects_ObjectId",
                table: "SycEntityObjectClassifications");

            migrationBuilder.DropForeignKey(
                name: "FK_SycEntityObjectClassifications_AbpUsers_UserId",
                table: "SycEntityObjectClassifications");

            migrationBuilder.DropForeignKey(
                name: "FK_SycEntityObjectStatuses_SydObjects_ObjectId",
                table: "SycEntityObjectStatuses");

            migrationBuilder.DropForeignKey(
                name: "FK_SycEntityObjectStatuses_AbpUsers_UserId",
                table: "SycEntityObjectStatuses");

            migrationBuilder.DropForeignKey(
                name: "FK_SycEntityObjectTypes_SydObjects_ObjectId",
                table: "SycEntityObjectTypes");

            migrationBuilder.DropForeignKey(
                name: "FK_SydObjects_SysObjectTypes_ObjectTypeId",
                table: "SydObjects");

            migrationBuilder.DropIndex(
                name: "IX_SydObjects_ObjectTypeId",
                table: "SydObjects");

            migrationBuilder.DropIndex(
                name: "IX_SycEntityObjectTypes_ObjectId",
                table: "SycEntityObjectTypes");

            migrationBuilder.DropIndex(
                name: "IX_SycEntityObjectStatuses_ObjectId",
                table: "SycEntityObjectStatuses");

            migrationBuilder.DropIndex(
                name: "IX_SycEntityObjectStatuses_UserId",
                table: "SycEntityObjectStatuses");

            migrationBuilder.DropIndex(
                name: "IX_SycEntityObjectClassifications_ObjectId",
                table: "SycEntityObjectClassifications");

            migrationBuilder.DropIndex(
                name: "IX_SycEntityObjectClassifications_UserId",
                table: "SycEntityObjectClassifications");

            migrationBuilder.DropIndex(
                name: "IX_SycEntityObjectCategories_ObjectId",
                table: "SycEntityObjectCategories");

            migrationBuilder.DropIndex(
                name: "IX_SycEntityObjectCategories_UserId",
                table: "SycEntityObjectCategories");

            migrationBuilder.DropIndex(
                name: "IX_AppEntities_EntityObjectStatusId",
                table: "AppEntities");

            migrationBuilder.DropIndex(
                name: "IX_AppEntities_EntityObjectTypeId",
                table: "AppEntities");

            migrationBuilder.DropIndex(
                name: "IX_AppEntities_ObjectId",
                table: "AppEntities");

            migrationBuilder.DropColumn(
                name: "ParentCode",
                table: "SysObjectTypes");

            migrationBuilder.DropColumn(
                name: "ObjectTypeCode",
                table: "SydObjects");

            migrationBuilder.DropColumn(
                name: "ObjectTypeId",
                table: "SydObjects");

            migrationBuilder.DropColumn(
                name: "ParentCode",
                table: "SydObjects");

            migrationBuilder.DropColumn(
                name: "ObjectCode",
                table: "SycEntityObjectTypes");

            migrationBuilder.DropColumn(
                name: "ObjectId",
                table: "SycEntityObjectTypes");

            migrationBuilder.DropColumn(
                name: "ParentCode",
                table: "SycEntityObjectTypes");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "SycEntityObjectTypes");

            migrationBuilder.DropColumn(
                name: "IsDefault",
                table: "SycEntityObjectStatuses");

            migrationBuilder.DropColumn(
                name: "ObjectCode",
                table: "SycEntityObjectStatuses");

            migrationBuilder.DropColumn(
                name: "ObjectId",
                table: "SycEntityObjectStatuses");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "SycEntityObjectStatuses");

            migrationBuilder.DropColumn(
                name: "IsDefault",
                table: "SycEntityObjectClassifications");

            migrationBuilder.DropColumn(
                name: "ObjectCode",
                table: "SycEntityObjectClassifications");

            migrationBuilder.DropColumn(
                name: "ObjectId",
                table: "SycEntityObjectClassifications");

            migrationBuilder.DropColumn(
                name: "ParentCode",
                table: "SycEntityObjectClassifications");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "SycEntityObjectClassifications");

            migrationBuilder.DropColumn(
                name: "IsDefault",
                table: "SycEntityObjectCategories");

            migrationBuilder.DropColumn(
                name: "ObjectCode",
                table: "SycEntityObjectCategories");

            migrationBuilder.DropColumn(
                name: "ObjectId",
                table: "SycEntityObjectCategories");

            migrationBuilder.DropColumn(
                name: "ParentCode",
                table: "SycEntityObjectCategories");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "SycEntityObjectCategories");

            migrationBuilder.DropColumn(
                name: "EntityObjectTypeCode",
                table: "SycAttachmentCategories");

            migrationBuilder.DropColumn(
                name: "ParentCode",
                table: "SycAttachmentCategories");

            migrationBuilder.DropColumn(
                name: "EntityCode",
                table: "AppMessages");

            migrationBuilder.DropColumn(
                name: "ParentCode",
                table: "AppMessages");

            migrationBuilder.DropColumn(
                name: "EntityCode",
                table: "AppEntityClassifications");

            migrationBuilder.DropColumn(
                name: "EntityObjectClassificationCode",
                table: "AppEntityClassifications");

            migrationBuilder.DropColumn(
                name: "EntityCode",
                table: "AppEntityCategories");

            migrationBuilder.DropColumn(
                name: "EntityObjectCategoryCode",
                table: "AppEntityCategories");

            migrationBuilder.DropColumn(
                name: "AttachmentCategoryCode",
                table: "AppEntityAttachments");

            migrationBuilder.DropColumn(
                name: "AttachmentCode",
                table: "AppEntityAttachments");

            migrationBuilder.DropColumn(
                name: "EntityCode",
                table: "AppEntityAttachments");

            migrationBuilder.DropColumn(
                name: "EntityObjectStatusCode",
                table: "AppEntities");

            migrationBuilder.DropColumn(
                name: "EntityObjectStatusId",
                table: "AppEntities");

            migrationBuilder.DropColumn(
                name: "EntityObjectTypeCode",
                table: "AppEntities");

            migrationBuilder.DropColumn(
                name: "EntityObjectTypeId",
                table: "AppEntities");

            migrationBuilder.DropColumn(
                name: "ObjectCode",
                table: "AppEntities");

            migrationBuilder.DropColumn(
                name: "ObjectId",
                table: "AppEntities");

            migrationBuilder.DropColumn(
                name: "EntityCode",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "ParentCode",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "Discriminator",
                table: "AbpUsers");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "SysObjectTypes",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldMaxLength: 250);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "SysObjectTypes",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "SydObjects",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldMaxLength: 250);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "SydObjects",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldMaxLength: 50);

            migrationBuilder.AddColumn<long>(
                name: "SysObjectTypeId",
                table: "SydObjects",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "SycEntityObjectTypes",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldMaxLength: 250);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "SycEntityObjectTypes",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldMaxLength: 50);

            migrationBuilder.AddColumn<string>(
                name: "ParentIdCode",
                table: "SycEntityObjectTypes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SydObjectId",
                table: "SycEntityObjectTypes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "SydObjectIdCode",
                table: "SycEntityObjectTypes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "SycEntityObjectStatuses",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldMaxLength: 250);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "SycEntityObjectStatuses",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SydObjectId",
                table: "SycEntityObjectStatuses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "SycEntityObjectClassifications",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldMaxLength: 250);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "SycEntityObjectClassifications",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldMaxLength: 50);

            migrationBuilder.AddColumn<string>(
                name: "ParentIdCode",
                table: "SycEntityObjectClassifications",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SydObjectId",
                table: "SycEntityObjectClassifications",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SydObjectIdCode",
                table: "SycEntityObjectClassifications",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "SycEntityObjectCategories",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldMaxLength: 250);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "SycEntityObjectCategories",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldMaxLength: 50);

            migrationBuilder.AddColumn<string>(
                name: "ParentIdCode",
                table: "SycEntityObjectCategories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SydObjectId",
                table: "SycEntityObjectCategories",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "SydObjectIdCode",
                table: "SycEntityObjectCategories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "SycAttachmentCategories",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldMaxLength: 250);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "SycAttachmentCategories",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldMaxLength: 50);

            migrationBuilder.AddColumn<string>(
                name: "ParentIdCode",
                table: "SycAttachmentCategories",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EntityIdCode",
                table: "AppMessages",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParentIdCode",
                table: "AppMessages",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EntityIdCode",
                table: "AppEntityClassifications",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EntityObjectClassificationIdCode",
                table: "AppEntityClassifications",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EntityIdCode",
                table: "AppEntityCategories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EntityObjectCategoryIdCode",
                table: "AppEntityCategories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AttachmentCategoryIdCode",
                table: "AppEntityAttachments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AttachmentIdCode",
                table: "AppEntityAttachments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EntityIdCode",
                table: "AppEntityAttachments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "AppEntities",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldMaxLength: 250);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "AppEntities",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SycEntityObjectStatusId",
                table: "AppEntities",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SycEntityObjectTypeId",
                table: "AppEntities",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SydObjectId",
                table: "AppEntities",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "EntityIdCode",
                table: "AppContacts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParentIdCode",
                table: "AppContacts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "ShouldChangePasswordOnNextLogin",
                table: "AbpUsers",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "NormalizedUserName",
                table: "AbpUsers",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                oldClrType: typeof(string),
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "NormalizedEmailAddress",
                table: "AbpUsers",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                oldClrType: typeof(string),
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SydObjects_SysObjectTypeId",
                table: "SydObjects",
                column: "SysObjectTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_SycEntityObjectTypes_SydObjectId",
                table: "SycEntityObjectTypes",
                column: "SydObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_SycEntityObjectStatuses_SydObjectId",
                table: "SycEntityObjectStatuses",
                column: "SydObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_SycEntityObjectClassifications_SydObjectId",
                table: "SycEntityObjectClassifications",
                column: "SydObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_SycEntityObjectCategories_SydObjectId",
                table: "SycEntityObjectCategories",
                column: "SydObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntities_SycEntityObjectStatusId",
                table: "AppEntities",
                column: "SycEntityObjectStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntities_SycEntityObjectTypeId",
                table: "AppEntities",
                column: "SycEntityObjectTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntities_SydObjectId",
                table: "AppEntities",
                column: "SydObjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppEntities_SycEntityObjectStatuses_SycEntityObjectStatusId",
                table: "AppEntities",
                column: "SycEntityObjectStatusId",
                principalTable: "SycEntityObjectStatuses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppEntities_SycEntityObjectTypes_SycEntityObjectTypeId",
                table: "AppEntities",
                column: "SycEntityObjectTypeId",
                principalTable: "SycEntityObjectTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AppEntities_SydObjects_SydObjectId",
                table: "AppEntities",
                column: "SydObjectId",
                principalTable: "SydObjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SycEntityObjectCategories_SydObjects_SydObjectId",
                table: "SycEntityObjectCategories",
                column: "SydObjectId",
                principalTable: "SydObjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SycEntityObjectClassifications_SydObjects_SydObjectId",
                table: "SycEntityObjectClassifications",
                column: "SydObjectId",
                principalTable: "SydObjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SycEntityObjectStatuses_SydObjects_SydObjectId",
                table: "SycEntityObjectStatuses",
                column: "SydObjectId",
                principalTable: "SydObjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SycEntityObjectTypes_SydObjects_SydObjectId",
                table: "SycEntityObjectTypes",
                column: "SydObjectId",
                principalTable: "SydObjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SydObjects_SysObjectTypes_SysObjectTypeId",
                table: "SydObjects",
                column: "SysObjectTypeId",
                principalTable: "SysObjectTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
