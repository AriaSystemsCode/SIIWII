using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class addMarketplacecontactupdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppMarketplaceContactPaymentMethods");

            migrationBuilder.DropColumn(
                name: "PriceLevel",
                table: "AppMarketplaceContacts");

            migrationBuilder.AddColumn<DateTime>(
                name: "TimeStamp",
                table: "AppMarketplaceContacts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "TimeStamp",
                table: "AppMarketplaceContactAddresses",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "TimeStamp",
                table: "AppMarketplaceAddresses",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TimeStamp",
                table: "AppMarketplaceContacts");

            migrationBuilder.DropColumn(
                name: "TimeStamp",
                table: "AppMarketplaceContactAddresses");

            migrationBuilder.DropColumn(
                name: "TimeStamp",
                table: "AppMarketplaceAddresses");

            migrationBuilder.AddColumn<string>(
                name: "PriceLevel",
                table: "AppMarketplaceContacts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AppMarketplaceContactPaymentMethods",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ContactId = table.Column<long>(type: "bigint", nullable: false),
                    CardExpirationMonth = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: true),
                    CardExpirationYear = table.Column<string>(type: "nvarchar(4)", maxLength: 4, nullable: true),
                    CardHolderName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    CardNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CardPaymentToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CardProfileToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CardType = table.Column<byte>(type: "tinyint", nullable: false),
                    ContactCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeleterUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierUserId = table.Column<long>(type: "bigint", nullable: true),
                    PaymentType = table.Column<byte>(type: "tinyint", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppMarketplaceContactPaymentMethods", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceContactPaymentMethods_AppMarketplaceContacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "AppMarketplaceContacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceContactPaymentMethods_ContactId",
                table: "AppMarketplaceContactPaymentMethods",
                column: "ContactId");
        }
    }
}
