using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20261011140000_AddSydObjectBaseEntity")]
    public class AddSydObjectBaseEntity : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "BaseEntityId",
                table: "SydObjects",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SydObjects_BaseEntityId",
                table: "SydObjects",
                column: "BaseEntityId");

            migrationBuilder.AddForeignKey(
                name: "FK_SydObjects_SydObjects_BaseEntityId",
                table: "SydObjects",
                column: "BaseEntityId",
                principalTable: "SydObjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SydObjects_SydObjects_BaseEntityId",
                table: "SydObjects");
            migrationBuilder.DropIndex(
                name: "IX_SydObjects_BaseEntityId",
                table: "SydObjects");
            migrationBuilder.DropColumn(
                name: "BaseEntityId",
                table: "SydObjects");
        }
    }
}
