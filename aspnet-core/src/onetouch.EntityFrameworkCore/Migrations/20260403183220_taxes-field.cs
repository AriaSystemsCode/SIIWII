//using Microsoft.EntityFrameworkCore.Migrations;

//#nullable disable

//namespace onetouch.Migrations
//{
//    /// <inheritdoc />
//    public partial class taxesfield : Migration
//    {
//        /// <inheritdoc />
//        protected override void Up(MigrationBuilder migrationBuilder)
//        {
//            migrationBuilder.AlterColumn<string>(
//                name: "FeatureDescription",
//                table: "AppSubscriptionPlanDetails",
//                type: "nvarchar(250)",
//                maxLength: 250,
//                nullable: true,
//                oldClrType: typeof(string),
//                oldType: "nvarchar(50)",
//                oldMaxLength: 50,
//                oldNullable: true);

//            migrationBuilder.AddColumn<string>(
//                name: "BuyerSSIN",
//                table: "AppMarketplaceItemPrices",
//                type: "nvarchar(max)",
//                nullable: true);

//            migrationBuilder.AddColumn<decimal>(
//                name: "TaxRate",
//                table: "AppItems",
//                type: "decimal(18,2)",
//                nullable: false,
//                defaultValue: 0m);

//            migrationBuilder.AddColumn<string>(
//                name: "BuyerSSIN",
//                table: "AppItemPrices",
//                type: "nvarchar(max)",
//                nullable: true);
//        }

//        /// <inheritdoc />
//        protected override void Down(MigrationBuilder migrationBuilder)
//        {
//            migrationBuilder.DropColumn(
//                name: "BuyerSSIN",
//                table: "AppMarketplaceItemPrices");

//            migrationBuilder.DropColumn(
//                name: "TaxRate",
//                table: "AppItems");

//            migrationBuilder.DropColumn(
//                name: "BuyerSSIN",
//                table: "AppItemPrices");

//            migrationBuilder.AlterColumn<string>(
//                name: "FeatureDescription",
//                table: "AppSubscriptionPlanDetails",
//                type: "nvarchar(50)",
//                maxLength: 50,
//                nullable: true,
//                oldClrType: typeof(string),
//                oldType: "nvarchar(250)",
//                oldMaxLength: 250,
//                oldNullable: true);
//        }
//    }
//}
