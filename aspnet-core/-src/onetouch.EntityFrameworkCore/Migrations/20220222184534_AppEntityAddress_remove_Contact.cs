using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class AppEntityAddress_remove_Contact : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppEntityAddresses_AppContacts_ContactId",
                table: "AppEntityAddresses");

            migrationBuilder.DropIndex(
                name: "IX_AppEntityAddresses_ContactId",
                table: "AppEntityAddresses");

            migrationBuilder.DropColumn(
                name: "ContactId",
                table: "AppEntityAddresses");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityAddresses_EntityId",
                table: "AppEntityAddresses",
                column: "EntityId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppEntityAddresses_AppEntities_EntityId",
                table: "AppEntityAddresses",
                column: "EntityId",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppEntityAddresses_AppEntities_EntityId",
                table: "AppEntityAddresses");

            migrationBuilder.DropIndex(
                name: "IX_AppEntityAddresses_EntityId",
                table: "AppEntityAddresses");

            migrationBuilder.AddColumn<long>(
                name: "ContactId",
                table: "AppEntityAddresses",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityAddresses_ContactId",
                table: "AppEntityAddresses",
                column: "ContactId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppEntityAddresses_AppContacts_ContactId",
                table: "AppEntityAddresses",
                column: "ContactId",
                principalTable: "AppContacts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
