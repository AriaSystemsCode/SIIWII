using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Add_AccountId_To_AppContact : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "AccountId",
                table: "AppContacts",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppContacts_AccountId",
                table: "AppContacts",
                column: "AccountId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_AppContacts_AccountId",
                table: "AppContacts",
                column: "AccountId",
                principalTable: "AppContacts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_AppContacts_AccountId",
                table: "AppContacts");

            migrationBuilder.DropIndex(
                name: "IX_AppContacts_AccountId",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "AccountId",
                table: "AppContacts");
        }
    }
}
