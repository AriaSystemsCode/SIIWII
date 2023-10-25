using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class waeldbchanges1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_SycEntityObjectStatuses_SycEntityObjectStatusId",
                table: "AppContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_SycEntityObjectTypes_SycEntityObjectTypeId",
                table: "AppContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_SydObjects_SydObjectId",
                table: "AppContacts");

            migrationBuilder.DropIndex(
                name: "IX_AppContacts_SycEntityObjectStatusId",
                table: "AppContacts");

            migrationBuilder.DropIndex(
                name: "IX_AppContacts_SycEntityObjectTypeId",
                table: "AppContacts");

            migrationBuilder.DropIndex(
                name: "IX_AppContacts_SydObjectId",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "ExtraData",
                table: "SycEntityObjectTypes");

            migrationBuilder.DropColumn(
                name: "IsSystemData",
                table: "SycEntityObjectStatuses");

            migrationBuilder.DropColumn(
                name: "IsSystemData",
                table: "SycEntityObjectClassifications");

            migrationBuilder.DropColumn(
                name: "IsSystemData",
                table: "SycEntityObjectCategories");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "AppEntities");

            migrationBuilder.DropColumn(
                name: "SycEntityObjectStatusId",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "SycEntityObjectTypeId",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "SydObjectId",
                table: "AppContacts");

            migrationBuilder.AddColumn<string>(
                name: "ExtraAttributes",
                table: "SycEntityObjectTypes",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TenantId",
                table: "SycEntityObjectStatuses",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "AppEntities",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExtraAttributes",
                table: "SycEntityObjectTypes");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "SycEntityObjectStatuses");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "AppEntities");

            migrationBuilder.AddColumn<string>(
                name: "ExtraData",
                table: "SycEntityObjectTypes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsSystemData",
                table: "SycEntityObjectStatuses",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsSystemData",
                table: "SycEntityObjectClassifications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsSystemData",
                table: "SycEntityObjectCategories",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "AppEntities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SycEntityObjectStatusId",
                table: "AppContacts",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SycEntityObjectTypeId",
                table: "AppContacts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SydObjectId",
                table: "AppContacts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_AppContacts_SycEntityObjectStatusId",
                table: "AppContacts",
                column: "SycEntityObjectStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_AppContacts_SycEntityObjectTypeId",
                table: "AppContacts",
                column: "SycEntityObjectTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_AppContacts_SydObjectId",
                table: "AppContacts",
                column: "SydObjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_SycEntityObjectStatuses_SycEntityObjectStatusId",
                table: "AppContacts",
                column: "SycEntityObjectStatusId",
                principalTable: "SycEntityObjectStatuses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_SycEntityObjectTypes_SycEntityObjectTypeId",
                table: "AppContacts",
                column: "SycEntityObjectTypeId",
                principalTable: "SycEntityObjectTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_SydObjects_SydObjectId",
                table: "AppContacts",
                column: "SydObjectId",
                principalTable: "SydObjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
