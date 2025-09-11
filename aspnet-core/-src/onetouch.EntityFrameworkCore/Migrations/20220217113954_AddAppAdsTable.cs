using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class AddAppAdsTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppAdvertisements",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreationTime = table.Column<DateTime>(nullable: false),
                    CreatorUserId = table.Column<long>(nullable: true),
                    LastModificationTime = table.Column<DateTime>(nullable: true),
                    LastModifierUserId = table.Column<long>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false),
                    DeleterUserId = table.Column<long>(nullable: true),
                    DeletionTime = table.Column<DateTime>(nullable: true),
                    Code = table.Column<string>(maxLength: 50, nullable: false),
                    TenantId = table.Column<long>(nullable: true),
                    Description = table.Column<string>(maxLength: 100, nullable: true),
                    StartDate = table.Column<DateTime>(nullable: false),
                    EndDate = table.Column<DateTime>(nullable: false),
                    StartTime = table.Column<string>(nullable: true),
                    EndTime = table.Column<string>(nullable: true),
                    TimeZone = table.Column<string>(maxLength: 40, nullable: true),
                    IsApproved = table.Column<bool>(nullable: false),
                    ApprovalDateTime = table.Column<DateTime>(nullable: false),
                    PaymentMethod = table.Column<string>(maxLength: 15, nullable: true),
                    InvoiceNumber = table.Column<long>(nullable: false),
                    UTCFromDateTime = table.Column<DateTime>(nullable: false),
                    UTCToDateTime = table.Column<DateTime>(nullable: false),
                    NumberOfOccurences = table.Column<int>(nullable: false),
                    PeriodOfView = table.Column<int>(nullable: false),
                    AppEntityId = table.Column<long>(nullable: false),
                    UserId = table.Column<long>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppAdvertisements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppAdvertisements_AppEntities_AppEntityId",
                        column: x => x.AppEntityId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppAdvertisements_AbpUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AbpUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppAdvertisements_AppEntityId",
                table: "AppAdvertisements",
                column: "AppEntityId");

            migrationBuilder.CreateIndex(
                name: "IX_AppAdvertisements_UserId",
                table: "AppAdvertisements",
                column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppAdvertisements");
        }
    }
}
