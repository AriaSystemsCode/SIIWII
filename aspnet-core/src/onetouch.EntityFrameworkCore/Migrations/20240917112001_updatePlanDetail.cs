using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class updatePlanDetail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAddOn",
                table: "AppSubscriptionPlanDetails");

            migrationBuilder.AddColumn<bool>(
                name: "IsAddOn",
                table: "AppFeatures",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAddOn",
                table: "AppFeatures");

            migrationBuilder.AddColumn<bool>(
                name: "IsAddOn",
                table: "AppSubscriptionPlanDetails",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
