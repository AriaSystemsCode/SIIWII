using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Added_Ticket : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Tickets",
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
                    Title = table.Column<string>(maxLength: 255, nullable: true),
                    TicketType = table.Column<int>(nullable: false),
                    TicketNumber = table.Column<string>(maxLength: 50, nullable: true),
                    TicketCategory = table.Column<int>(nullable: false),
                    SubIssueType = table.Column<int>(nullable: false),
                    Status = table.Column<int>(nullable: false),
                    Source = table.Column<int>(nullable: false),
                    ServiceThermometerTemperature = table.Column<int>(nullable: false),
                    ServiceLevelAgreementPausedNextEventHours = table.Column<decimal>(nullable: false),
                    ServiceLevelAgreementID = table.Column<int>(nullable: false),
                    ServiceLevelAgreementHasBeenMet = table.Column<bool>(nullable: false),
                    RMMAlertID = table.Column<string>(maxLength: 50, nullable: true),
                    RMAType = table.Column<int>(nullable: false),
                    RMAStatus = table.Column<int>(nullable: false),
                    ResolvedDueDateTime = table.Column<DateTime>(nullable: false),
                    ResolvedDateTime = table.Column<DateTime>(nullable: false),
                    ResolutionPlanDueDateTime = table.Column<DateTime>(nullable: false),
                    ResolutionPlanDateTime = table.Column<DateTime>(nullable: false),
                    Resolution = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tickets", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_TenantId",
                table: "Tickets",
                column: "TenantId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Tickets");
        }
    }
}
