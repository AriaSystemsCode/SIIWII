using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class AppContact_PartnerId_FixForignKey : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_AppContacts_PartnerId",
                table: "AppContacts",
                column: "PartnerId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_AppContacts_PartnerId",
                table: "AppContacts",
                column: "PartnerId",
                principalTable: "AppContacts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_AppContacts_PartnerId",
                table: "AppContacts");

            migrationBuilder.DropIndex(
                name: "IX_AppContacts_PartnerId",
                table: "AppContacts");
        }
    }
}
