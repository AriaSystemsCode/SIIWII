using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class fix_AppContactAddress_AppContact_fk : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_AppContactAddresses_ContactId",
                table: "AppContactAddresses",
                column: "ContactId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppContactAddresses_AppContacts_ContactId",
                table: "AppContactAddresses",
                column: "ContactId",
                principalTable: "AppContacts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppContactAddresses_AppContacts_ContactId",
                table: "AppContactAddresses");

            migrationBuilder.DropIndex(
                name: "IX_AppContactAddresses_ContactId",
                table: "AppContactAddresses");
        }
    }
}
