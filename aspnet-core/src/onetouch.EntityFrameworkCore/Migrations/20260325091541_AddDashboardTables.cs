using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddDashboardTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "FeatureDescription",
                table: "AppSubscriptionPlanDetails",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastViewDate",
                table: "AppEntitySharings",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateTable(
                name: "AppDashboards",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    IsTemplate = table.Column<bool>(type: "bit", nullable: false),
                    SharingLevel = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppDashboards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppDashboards_AppEntities_Id",
                        column: x => x.Id,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AppDashboardCards",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    EntityType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Filter = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Height = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Width = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    XPosition = table.Column<long>(type: "bigint", nullable: false),
                    YPosition = table.Column<long>(type: "bigint", nullable: false),
                    AppDashboardId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppDashboardCards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppDashboardCards_AppDashboards_AppDashboardId",
                        column: x => x.AppDashboardId,
                        principalTable: "AppDashboards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppDashboardCards_AppEntities_Id",
                        column: x => x.Id,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppDashboardCards_AppDashboardId",
                table: "AppDashboardCards",
                column: "AppDashboardId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppDashboardCards");

            migrationBuilder.DropTable(
                name: "AppDashboards");

            migrationBuilder.DropColumn(
                name: "LastViewDate",
                table: "AppEntitySharings");

            migrationBuilder.AlterColumn<string>(
                name: "FeatureDescription",
                table: "AppSubscriptionPlanDetails",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(250)",
                oldMaxLength: 250,
                oldNullable: true);
        }
    }
}
