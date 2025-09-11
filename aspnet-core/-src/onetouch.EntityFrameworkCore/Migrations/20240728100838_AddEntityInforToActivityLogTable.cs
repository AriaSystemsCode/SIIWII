using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddEntityInforToActivityLogTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RelatedEntityCode",
                table: "AppTenantActivitiesLog",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "RelatedEntityId",
                table: "AppTenantActivitiesLog",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "RelatedEntityObjectTypeId",
                table: "AppTenantActivitiesLog",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppTenantActivitiesLog_RelatedEntityId",
                table: "AppTenantActivitiesLog",
                column: "RelatedEntityId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTenantActivitiesLog_RelatedEntityObjectTypeId",
                table: "AppTenantActivitiesLog",
                column: "RelatedEntityObjectTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppTenantActivitiesLog_AppEntities_RelatedEntityId",
                table: "AppTenantActivitiesLog",
                column: "RelatedEntityId",
                principalTable: "AppEntities",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppTenantActivitiesLog_SycEntityObjectTypes_RelatedEntityObjectTypeId",
                table: "AppTenantActivitiesLog",
                column: "RelatedEntityObjectTypeId",
                principalTable: "SycEntityObjectTypes",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppTenantActivitiesLog_AppEntities_RelatedEntityId",
                table: "AppTenantActivitiesLog");

            migrationBuilder.DropForeignKey(
                name: "FK_AppTenantActivitiesLog_SycEntityObjectTypes_RelatedEntityObjectTypeId",
                table: "AppTenantActivitiesLog");

            migrationBuilder.DropIndex(
                name: "IX_AppTenantActivitiesLog_RelatedEntityId",
                table: "AppTenantActivitiesLog");

            migrationBuilder.DropIndex(
                name: "IX_AppTenantActivitiesLog_RelatedEntityObjectTypeId",
                table: "AppTenantActivitiesLog");

            migrationBuilder.DropColumn(
                name: "RelatedEntityCode",
                table: "AppTenantActivitiesLog");

            migrationBuilder.DropColumn(
                name: "RelatedEntityId",
                table: "AppTenantActivitiesLog");

            migrationBuilder.DropColumn(
                name: "RelatedEntityObjectTypeId",
                table: "AppTenantActivitiesLog");
        }
    }
}
