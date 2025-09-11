using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddFeaturesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppFeatures",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    UnitOfMeasurementCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UnitOfMeasurementName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    UnitOfMeasurementId = table.Column<long>(type: "bigint", nullable: false),
                    FeaturePeriodLimit = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Billable = table.Column<bool>(type: "bit", nullable: false),
                    BillingCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TrackActivity = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppFeatures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppFeatures_AppEntities_Id",
                        column: x => x.Id,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppFeatures_AppEntities_UnitOfMeasurementId",
                        column: x => x.UnitOfMeasurementId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppFeatures_UnitOfMeasurementId",
                table: "AppFeatures",
                column: "UnitOfMeasurementId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppFeatures");
        }
    }
}
