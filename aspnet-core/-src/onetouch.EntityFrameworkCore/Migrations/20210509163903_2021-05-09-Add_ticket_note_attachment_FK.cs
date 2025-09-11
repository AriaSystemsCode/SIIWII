using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class _20210509Add_ticket_note_attachment_FK : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_AttachmentInfo_TicketId",
                table: "AttachmentInfo",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_AttachmentInfo_TicketNoteId",
                table: "AttachmentInfo",
                column: "TicketNoteId");

            migrationBuilder.AddForeignKey(
                name: "FK_AttachmentInfo_Tickets_TicketId",
                table: "AttachmentInfo",
                column: "TicketId",
                principalTable: "Tickets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AttachmentInfo_TicketNotes_TicketNoteId",
                table: "AttachmentInfo",
                column: "TicketNoteId",
                principalTable: "TicketNotes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AttachmentInfo_Tickets_TicketId",
                table: "AttachmentInfo");

            migrationBuilder.DropForeignKey(
                name: "FK_AttachmentInfo_TicketNotes_TicketNoteId",
                table: "AttachmentInfo");

            migrationBuilder.DropIndex(
                name: "IX_AttachmentInfo_TicketId",
                table: "AttachmentInfo");

            migrationBuilder.DropIndex(
                name: "IX_AttachmentInfo_TicketNoteId",
                table: "AttachmentInfo");
        }
    }
}
