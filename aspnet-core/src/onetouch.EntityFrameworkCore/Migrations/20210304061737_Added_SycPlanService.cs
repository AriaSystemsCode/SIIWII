using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Added_SycPlanService : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SycPlanServices",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UnitOfMeasure = table.Column<string>(maxLength: 50, nullable: true),
                    UnitPrice = table.Column<decimal>(nullable: false),
                    Units = table.Column<int>(nullable: false),
                    BillingFrequency = table.Column<int>(nullable: false),
                    SycApplicationId = table.Column<int>(nullable: true),
                    SycPlanId = table.Column<int>(nullable: true),
                    SycServiceId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SycPlanServices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SycPlanServices_SycApplications_SycApplicationId",
                        column: x => x.SycApplicationId,
                        principalTable: "SycApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SycPlanServices_SycPlans_SycPlanId",
                        column: x => x.SycPlanId,
                        principalTable: "SycPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SycPlanServices_SycServices_SycServiceId",
                        column: x => x.SycServiceId,
                        principalTable: "SycServices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SycPlanServices_SycApplicationId",
                table: "SycPlanServices",
                column: "SycApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_SycPlanServices_SycPlanId",
                table: "SycPlanServices",
                column: "SycPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_SycPlanServices_SycServiceId",
                table: "SycPlanServices",
                column: "SycServiceId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SycPlanServices");
        }
    }
}
