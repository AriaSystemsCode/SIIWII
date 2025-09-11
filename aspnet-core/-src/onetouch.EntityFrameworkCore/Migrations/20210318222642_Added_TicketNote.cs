using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Added_TicketNote : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TicketNotes",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreationTime = table.Column<DateTime>(nullable: false),
                    CreatorUserId = table.Column<long>(nullable: true),
                    LastModificationTime = table.Column<DateTime>(nullable: true),
                    LastModifierUserId = table.Column<long>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false),
                    DeleterUserId = table.Column<long>(nullable: true),
                    DeletionTime = table.Column<DateTime>(nullable: true),
                    TenantId = table.Column<int>(nullable: true),
                    RefTicketID = table.Column<int>(nullable: false),
                    Title = table.Column<string>(maxLength: 250, nullable: true),
                    Publish = table.Column<int>(nullable: false),
                    NoteType = table.Column<int>(nullable: false),
                    LastActivityDate = table.Column<DateTime>(nullable: false),
                    ImpersonatorUpdaterResourceID = table.Column<int>(nullable: false),
                    ImpersonatorCreatorResourceID = table.Column<int>(nullable: false),
                    Description = table.Column<string>(nullable: true),
                    CreatorResourceID = table.Column<int>(nullable: false),
                    CreatedByContactID = table.Column<int>(nullable: false),
                    CreateDateTime = table.Column<DateTime>(nullable: false),
                    RefTicketNoteID = table.Column<int>(nullable: false),
                    TicketId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TicketNotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TicketNotes_Tickets_TicketId",
                        column: x => x.TicketId,
                        principalTable: "Tickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TicketNotes_TenantId",
                table: "TicketNotes",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TicketNotes_TicketId",
                table: "TicketNotes",
                column: "TicketId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TicketNotes");
        }
    }
}
