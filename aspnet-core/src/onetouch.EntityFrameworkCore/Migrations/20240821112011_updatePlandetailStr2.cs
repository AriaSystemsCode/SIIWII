using Microsoft.EntityFrameworkCore.Migrations;
using Twilio.Rest.Insights.V1.Call;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class updatePlandetailStr2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "FeatureLimit",
                table: "AppSubscriptionPlanDetails",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");
            //migrationBuilder.DropIndex("PK_AppSubscriptionPlanDetails", "AppSubscriptionPlanDetails");
            // migrationBuilder.DropColumn("Id", "AppSubscriptionPlanDetails");
            /*migrationBuilder.AlterColumn<int>(
                name: "OldId",
                table: "AppSubscriptionPlanDetails",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                old);*/

            migrationBuilder.RenameColumn("Id", "AppSubscriptionPlanDetails", "OldId");
            migrationBuilder.AddColumn<long>(
                name: "Id",
                table: "AppSubscriptionPlanDetails",
                type: "bigint",
                nullable: false)                
                .Annotation("SqlServer:Identity", "1, 1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "FeatureLimit",
                table: "AppSubscriptionPlanDetails",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
          
        }
    }
}
