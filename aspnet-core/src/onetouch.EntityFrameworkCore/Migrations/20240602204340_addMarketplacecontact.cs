using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class addMarketplacecontact : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppMarketplaceAddresses",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccountId = table.Column<long>(type: "bigint", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: true),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    AddressLine1 = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    AddressLine2 = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    City = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    State = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    PostalCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CountryId = table.Column<long>(type: "bigint", nullable: false),
                    CountryCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierUserId = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeleterUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppMarketplaceAddresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceAddresses_AppEntities_CountryId",
                        column: x => x.CountryId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "AppMarketplaceContacts",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    OwnerId = table.Column<int>(type: "int", nullable: true),
                    TradeName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    LanguageId = table.Column<long>(type: "bigint", nullable: true),
                    LanguageCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CurrencyId = table.Column<long>(type: "bigint", nullable: true),
                    CurrencyCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    EMailAddress = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Website = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ParentId = table.Column<long>(type: "bigint", maxLength: 50, nullable: true),
                    ParentCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AccountType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AccountTypeId = table.Column<long>(type: "bigint", nullable: false),
                    PriceLevel = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsProfileData = table.Column<bool>(type: "bit", nullable: false),
                    Phone1TypeId = table.Column<long>(type: "bigint", nullable: true),
                    Phone1TypeName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Phone1CountryKey = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Phone1Number = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Phone1Ext = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Phone2TypeId = table.Column<long>(type: "bigint", nullable: true),
                    Phone2TypeName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Phone2CountryKey = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Phone2Number = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Phone2Ext = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Phone3TypeId = table.Column<long>(type: "bigint", nullable: true),
                    Phone3TypeName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Phone3CountryKey = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Phone3Number = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Phone3Ext = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    PartnerFkId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppMarketplaceContacts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceContacts_AppEntities_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "AppEntities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppMarketplaceContacts_AppEntities_Id",
                        column: x => x.Id,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceContacts_AppEntities_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "AppEntities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppMarketplaceContacts_AppEntities_Phone1TypeId",
                        column: x => x.Phone1TypeId,
                        principalTable: "AppEntities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppMarketplaceContacts_AppEntities_Phone2TypeId",
                        column: x => x.Phone2TypeId,
                        principalTable: "AppEntities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppMarketplaceContacts_AppEntities_Phone3TypeId",
                        column: x => x.Phone3TypeId,
                        principalTable: "AppEntities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppMarketplaceContacts_AppMarketplaceContacts_ParentId",
                        column: x => x.ParentId,
                        principalTable: "AppMarketplaceContacts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppMarketplaceContacts_AppMarketplaceContacts_PartnerFkId",
                        column: x => x.PartnerFkId,
                        principalTable: "AppMarketplaceContacts",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "AppMarketplaceContactAddresses",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ContactId = table.Column<long>(type: "bigint", nullable: false),
                    ContactCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AddressTypeId = table.Column<long>(type: "bigint", nullable: false),
                    AddressTypeCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AddressId = table.Column<long>(type: "bigint", nullable: false),
                    AddressCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppMarketplaceContactAddresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceContactAddresses_AppEntities_AddressTypeId",
                        column: x => x.AddressTypeId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceContactAddresses_AppMarketplaceAddresses_AddressId",
                        column: x => x.AddressId,
                        principalTable: "AppMarketplaceAddresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceContactAddresses_AppMarketplaceContacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "AppMarketplaceContacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "AppMarketplaceContactPaymentMethods",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    ContactId = table.Column<long>(type: "bigint", nullable: false),
                    ContactCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PaymentType = table.Column<byte>(type: "tinyint", nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    CardNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CardType = table.Column<byte>(type: "tinyint", nullable: false),
                    CardHolderName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    CardExpirationMonth = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: true),
                    CardExpirationYear = table.Column<string>(type: "nvarchar(4)", maxLength: 4, nullable: true),
                    CardProfileToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CardPaymentToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierUserId = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeleterUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
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
                name: "IX_AppMarketplaceAddresses_CountryId",
                table: "AppMarketplaceAddresses",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceContactAddresses_AddressId",
                table: "AppMarketplaceContactAddresses",
                column: "AddressId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceContactAddresses_AddressTypeId",
                table: "AppMarketplaceContactAddresses",
                column: "AddressTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceContactAddresses_ContactId",
                table: "AppMarketplaceContactAddresses",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceContactPaymentMethods_ContactId",
                table: "AppMarketplaceContactPaymentMethods",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceContacts_CurrencyId",
                table: "AppMarketplaceContacts",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceContacts_LanguageId",
                table: "AppMarketplaceContacts",
                column: "LanguageId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceContacts_ParentId",
                table: "AppMarketplaceContacts",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceContacts_PartnerFkId",
                table: "AppMarketplaceContacts",
                column: "PartnerFkId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceContacts_Phone1TypeId",
                table: "AppMarketplaceContacts",
                column: "Phone1TypeId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceContacts_Phone2TypeId",
                table: "AppMarketplaceContacts",
                column: "Phone2TypeId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceContacts_Phone3TypeId",
                table: "AppMarketplaceContacts",
                column: "Phone3TypeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppMarketplaceContactAddresses");

            migrationBuilder.DropTable(
                name: "AppMarketplaceContactPaymentMethods");

            migrationBuilder.DropTable(
                name: "AppMarketplaceAddresses");

            migrationBuilder.DropTable(
                name: "AppMarketplaceContacts");
        }
    }
}
