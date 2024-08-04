using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionPlanTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppSubscriptionPlanHeaders",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    IsStandard = table.Column<bool>(type: "bit", nullable: false),
                    IsBillable = table.Column<bool>(type: "bit", nullable: false),
                    Discount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    BillingCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    MonthlyPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    YearlyPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppSubscriptionPlanHeaders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppSubscriptionPlanHeaders_AppEntities_Id",
                        column: x => x.Id,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AppSubscriptionPlanDetails",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    FeatureCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FeatureName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Availability = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    FeatureLimit = table.Column<int>(type: "int", nullable: false),
                    RollOver = table.Column<bool>(type: "bit", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FeaturePeriodLimit = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FeatureDescription = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    FeatureStatus = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    UnitOfMeasurementName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UnitOfMeasurmentCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    IsFeatureBillable = table.Column<bool>(type: "bit", nullable: false),
                    FeatureBillingCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    FeatureCategory = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Trackactivity = table.Column<bool>(type: "bit", nullable: false),
                    AppSubscriptionPlanHeaderId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppSubscriptionPlanDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppSubscriptionPlanDetails_AppEntities_Id",
                        column: x => x.Id,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppSubscriptionPlanDetails_AppSubscriptionPlanHeaders_AppSubscriptionPlanHeaderId",
                        column: x => x.AppSubscriptionPlanHeaderId,
                        principalTable: "AppSubscriptionPlanHeaders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppSubscriptionPlanDetails_AppSubscriptionPlanHeaderId",
                table: "AppSubscriptionPlanDetails",
                column: "AppSubscriptionPlanHeaderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppSubscriptionPlanDetails");

            migrationBuilder.DropTable(
                name: "AppSubscriptionPlanHeaders");
        }
    }
}
