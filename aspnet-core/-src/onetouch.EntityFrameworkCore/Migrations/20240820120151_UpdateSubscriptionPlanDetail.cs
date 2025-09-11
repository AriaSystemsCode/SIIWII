using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSubscriptionPlanDetail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "AppFeatureId",
                table: "AppSubscriptionPlanDetails",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppSubscriptionPlanDetails_AppFeatureId",
                table: "AppSubscriptionPlanDetails",
                column: "AppFeatureId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppSubscriptionPlanDetails_AppFeatures_AppFeatureId",
                table: "AppSubscriptionPlanDetails",
                column: "AppFeatureId",
                principalTable: "AppFeatures",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppSubscriptionPlanDetails_AppFeatures_AppFeatureId",
                table: "AppSubscriptionPlanDetails");

            migrationBuilder.DropIndex(
                name: "IX_AppSubscriptionPlanDetails_AppFeatureId",
                table: "AppSubscriptionPlanDetails");

            migrationBuilder.DropColumn(
                name: "AppFeatureId",
                table: "AppSubscriptionPlanDetails");
        }
    }
}
