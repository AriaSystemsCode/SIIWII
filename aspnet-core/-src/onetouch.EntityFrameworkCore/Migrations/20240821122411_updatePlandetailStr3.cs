using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class updatePlandetailStr3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey("PK_AppSubscriptionPlanDetails", "AppSubscriptionPlanDetails");
            migrationBuilder.DropColumn("OldId", "AppSubscriptionPlanDetails");
            migrationBuilder.AddPrimaryKey("PK_AppSubscriptionPlanDetails", "AppSubscriptionPlanDetails", "Id", null);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
