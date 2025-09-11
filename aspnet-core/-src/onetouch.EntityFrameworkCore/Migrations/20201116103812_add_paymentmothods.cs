using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class add_paymentmothods : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppContactPaymentMethods",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreationTime = table.Column<DateTime>(nullable: false),
                    CreatorUserId = table.Column<long>(nullable: true),
                    LastModificationTime = table.Column<DateTime>(nullable: true),
                    LastModifierUserId = table.Column<long>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false),
                    DeleterUserId = table.Column<long>(nullable: true),
                    DeletionTime = table.Column<DateTime>(nullable: true),
                    TenantId = table.Column<int>(nullable: false),
                    ContactId = table.Column<long>(nullable: false),
                    ContactCode = table.Column<string>(maxLength: 50, nullable: true),
                    Description = table.Column<string>(nullable: true),
                    PaymentType = table.Column<byte>(nullable: false),
                    IsDefault = table.Column<bool>(nullable: false),
                    CardNumber = table.Column<string>(maxLength: 50, nullable: true),
                    CardType = table.Column<byte>(nullable: false),
                    CardHolderName = table.Column<string>(maxLength: 250, nullable: true),
                    CardExpirationMonth = table.Column<string>(maxLength: 2, nullable: true),
                    CardExpirationYear = table.Column<string>(maxLength: 4, nullable: true),
                    CardProfileToken = table.Column<string>(nullable: true),
                    CardPaymentToken = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppContactPaymentMethods", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppContactPaymentMethods_AppContacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "AppContacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppContactPaymentMethods_ContactId",
                table: "AppContactPaymentMethods",
                column: "ContactId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppContactPaymentMethods");
        }
    }
}
