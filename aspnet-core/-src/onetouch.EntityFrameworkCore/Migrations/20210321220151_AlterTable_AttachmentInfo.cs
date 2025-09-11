using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class AlterTable_AttachmentInfo : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "TicketId",
                table: "AttachmentInfo",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "TicketNoteId",
                table: "AttachmentInfo",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TicketId",
                table: "AttachmentInfo");

            migrationBuilder.DropColumn(
                name: "TicketNoteId",
                table: "AttachmentInfo");
        }
    }
}
