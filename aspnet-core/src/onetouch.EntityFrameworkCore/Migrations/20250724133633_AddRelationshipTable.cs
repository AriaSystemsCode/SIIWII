using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddRelationshipTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.AddColumn<string>(
            //    name: "BranchCode",
            //    table: "AppTransactionContacts",
            //    type: "nvarchar(50)",
            //    maxLength: 50,
            //    nullable: true);

            //migrationBuilder.AddColumn<string>(
            //    name: "CompanyCode",
            //    table: "AppTransactionContacts",
            //    type: "nvarchar(50)",
            //    maxLength: 50,
            //    nullable: true);

            //migrationBuilder.AddColumn<string>(
            //    name: "ContactCode",
            //    table: "AppTransactionContacts",
            //    type: "nvarchar(50)",
            //    maxLength: 50,
            //    nullable: true);

            //migrationBuilder.AlterColumn<string>(
            //    name: "Reference",
            //    table: "AppTenantActivitiesLog",
            //    type: "nvarchar(100)",
            //    maxLength: 100,
            //    nullable: true,
            //    oldClrType: typeof(string),
            //    oldType: "nvarchar(50)",
            //    oldMaxLength: 50,
            //    oldNullable: true);

            //migrationBuilder.AddColumn<string>(
            //    name: "BranchCode",
            //    table: "AppMarketplaceTransactionContacts",
            //    type: "nvarchar(50)",
            //    maxLength: 50,
            //    nullable: true);

            //migrationBuilder.AddColumn<string>(
            //    name: "CompanyCode",
            //    table: "AppMarketplaceTransactionContacts",
            //    type: "nvarchar(50)",
            //    maxLength: 50,
            //    nullable: true);

            //migrationBuilder.AddColumn<string>(
            //    name: "ContactCode",
            //    table: "AppMarketplaceTransactionContacts",
            //    type: "nvarchar(50)",
            //    maxLength: 50,
            //    nullable: true);

            //migrationBuilder.AddColumn<bool>(
            //    name: "IsDefault",
            //    table: "AppEntities",
            //    type: "bit",
            //    nullable: false,
            //    defaultValue: false);

            //migrationBuilder.AddColumn<bool>(
            //    name: "PaymentTermsCashOnDelivery",
            //    table: "AppContacts",
            //    type: "bit",
            //    nullable: false,
            //    defaultValue: false);

            //migrationBuilder.AddColumn<string>(
            //    name: "PaymentTermsCode",
            //    table: "AppContacts",
            //    type: "nvarchar(50)",
            //    maxLength: 50,
            //    nullable: true);

            //migrationBuilder.AddColumn<decimal>(
            //    name: "PaymentTermsDiscount",
            //    table: "AppContacts",
            //    type: "decimal(18,2)",
            //    nullable: false,
            //    defaultValue: 0m);

            //migrationBuilder.AddColumn<decimal>(
            //    name: "PaymentTermsDiscount2",
            //    table: "AppContacts",
            //    type: "decimal(18,2)",
            //    nullable: false,
            //    defaultValue: 0m);

            //migrationBuilder.AddColumn<int>(
            //    name: "PaymentTermsDiscount2Days",
            //    table: "AppContacts",
            //    type: "int",
            //    nullable: false,
            //    defaultValue: 0);

            //migrationBuilder.AddColumn<int>(
            //    name: "PaymentTermsDiscountDays",
            //    table: "AppContacts",
            //    type: "int",
            //    nullable: false,
            //    defaultValue: 0);

            //migrationBuilder.AddColumn<bool>(
            //    name: "PaymentTermsEndOfMonth",
            //    table: "AppContacts",
            //    type: "bit",
            //    nullable: false,
            //    defaultValue: false);

            //migrationBuilder.AddColumn<int>(
            //    name: "PaymentTermsEndOfMonthDays",
            //    table: "AppContacts",
            //    type: "int",
            //    nullable: false,
            //    defaultValue: 0);

            //migrationBuilder.AddColumn<long>(
            //    name: "PaymentTermsId",
            //    table: "AppContacts",
            //    type: "bigint",
            //    nullable: true);

            //migrationBuilder.AddColumn<string>(
            //    name: "PaymentTermsName",
            //    table: "AppContacts",
            //    type: "nvarchar(max)",
            //    nullable: true);

            //migrationBuilder.AddColumn<int>(
            //    name: "PaymentTermsNetDueDays",
            //    table: "AppContacts",
            //    type: "int",
            //    nullable: false,
            //    defaultValue: 0);

            //migrationBuilder.AddColumn<int>(
            //    name: "PaymentTermsNextMonthDay",
            //    table: "AppContacts",
            //    type: "int",
            //    nullable: false,
            //    defaultValue: 0);

            //migrationBuilder.AddColumn<string>(
            //    name: "PaymentTermsPaymentType",
            //    table: "AppContacts",
            //    type: "nvarchar(max)",
            //    nullable: true);

            //migrationBuilder.AddColumn<bool>(
            //    name: "PaymentTermsUseInstallments",
            //    table: "AppContacts",
            //    type: "bit",
            //    nullable: false,
            //    defaultValue: false);

            //migrationBuilder.AddColumn<string>(
            //    name: "ShipViaCode",
            //    table: "AppContacts",
            //    type: "nvarchar(50)",
            //    maxLength: 50,
            //    nullable: true);

            //migrationBuilder.AddColumn<long>(
            //    name: "ShipViaId",
            //    table: "AppContacts",
            //    type: "bigint",
            //    nullable: true);

            //migrationBuilder.AddColumn<string>(
            //    name: "ShipViaName",
            //    table: "AppContacts",
            //    type: "nvarchar(max)",
            //    nullable: true);

            migrationBuilder.CreateTable(
                name: "AppContactRelationshipInfo",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    RequesterContactSSIN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequesterContactName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RecipientContactSSIN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RecipientContactName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SharingLevel = table.Column<int>(type: "int", nullable: false),
                    RecipientContactTypeId = table.Column<long>(type: "bigint", nullable: false),
                    RequesterContactTypeCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RecipientContactTypeCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RelationshipCreationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RelationshipStartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RelationshipEndDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppContactRelationshipInfo", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppContactRelationshipInfo_AppEntities_Id",
                        column: x => x.Id,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            //migrationBuilder.CreateTable(
            //    name: "AppEntityRatings",
            //    columns: table => new
            //    {
            //        Id = table.Column<long>(type: "bigint", nullable: false)
            //            .Annotation("SqlServer:Identity", "1, 1"),
            //        EntityId = table.Column<long>(type: "bigint", nullable: false),
            //        UserSSIN = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
            //        EntitySSIN = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
            //        Rating = table.Column<int>(type: "int", nullable: false),
            //        EntityObjectTypeId = table.Column<long>(type: "bigint", nullable: false),
            //        EntityObjectTypeCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //        ObjectCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //        ObjectId = table.Column<long>(type: "bigint", nullable: false)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_AppEntityRatings", x => x.Id);
            //        table.ForeignKey(
            //            name: "FK_AppEntityRatings_AppEntities_EntityId",
            //            column: x => x.EntityId,
            //            principalTable: "AppEntities",
            //            principalColumn: "Id",
            //            onDelete: ReferentialAction.Cascade);
            //        table.ForeignKey(
            //            name: "FK_AppEntityRatings_SycEntityObjectTypes_EntityObjectTypeId",
            //            column: x => x.EntityObjectTypeId,
            //            principalTable: "SycEntityObjectTypes",
            //            principalColumn: "Id",
            //            onDelete: ReferentialAction.Cascade);
            //        table.ForeignKey(
            //            name: "FK_AppEntityRatings_SydObjects_ObjectId",
            //            column: x => x.ObjectId,
            //            principalTable: "SydObjects",
            //            principalColumn: "Id",
            //            onDelete: ReferentialAction.Cascade);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "AppMarketplaceAddresses",
            //    columns: table => new
            //    {
            //        Id = table.Column<long>(type: "bigint", nullable: false)
            //            .Annotation("SqlServer:Identity", "1, 1"),
            //        AccountId = table.Column<long>(type: "bigint", nullable: false),
            //        TenantId = table.Column<int>(type: "int", nullable: true),
            //        Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
            //        Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
            //        AddressLine1 = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
            //        AddressLine2 = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
            //        City = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
            //        State = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
            //        PostalCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
            //        CountryId = table.Column<long>(type: "bigint", nullable: false),
            //        CountryCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
            //        TimeStamp = table.Column<DateTime>(type: "datetime2", nullable: false),
            //        CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
            //        CreatorUserId = table.Column<long>(type: "bigint", nullable: true),
            //        LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
            //        LastModifierUserId = table.Column<long>(type: "bigint", nullable: true),
            //        IsDeleted = table.Column<bool>(type: "bit", nullable: false),
            //        DeleterUserId = table.Column<long>(type: "bigint", nullable: true),
            //        DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_AppMarketplaceAddresses", x => x.Id);
            //        table.ForeignKey(
            //            name: "FK_AppMarketplaceAddresses_AppEntities_CountryId",
            //            column: x => x.CountryId,
            //            principalTable: "AppEntities",
            //            principalColumn: "Id",
            //            onDelete: ReferentialAction.Cascade);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "AppMarketplaceContacts",
            //    columns: table => new
            //    {
            //        Id = table.Column<long>(type: "bigint", nullable: false),
            //        OwnerId = table.Column<int>(type: "int", nullable: true),
            //        TradeName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
            //        LanguageId = table.Column<long>(type: "bigint", maxLength: 50, nullable: true),
            //        LanguageCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
            //        CurrencyId = table.Column<long>(type: "bigint", nullable: true),
            //        CurrencyCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
            //        EMailAddress = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
            //        Website = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
            //        AccountId = table.Column<long>(type: "bigint", maxLength: 50, nullable: true),
            //        ParentId = table.Column<long>(type: "bigint", nullable: true),
            //        ParentCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
            //        AccountType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
            //        AccountTypeId = table.Column<long>(type: "bigint", nullable: false),
            //        IsProfileData = table.Column<bool>(type: "bit", nullable: false),
            //        IsHidden = table.Column<bool>(type: "bit", nullable: false),
            //        Phone1TypeId = table.Column<long>(type: "bigint", nullable: true),
            //        Phone1TypeName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
            //        Phone1CountryKey = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
            //        Phone1Number = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
            //        Phone1Ext = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
            //        Phone2TypeId = table.Column<long>(type: "bigint", nullable: true),
            //        Phone2TypeName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
            //        Phone2CountryKey = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
            //        Phone2Number = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
            //        Phone2Ext = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
            //        Phone3TypeId = table.Column<long>(type: "bigint", nullable: true),
            //        Phone3TypeName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
            //        Phone3CountryKey = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
            //        Phone3Number = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
            //        Phone3Ext = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
            //        AppMarketplaceContactId = table.Column<long>(type: "bigint", nullable: true)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_AppMarketplaceContacts", x => x.Id);
            //        table.ForeignKey(
            //            name: "FK_AppMarketplaceContacts_AppEntities_CurrencyId",
            //            column: x => x.CurrencyId,
            //            principalTable: "AppEntities",
            //            principalColumn: "Id");
            //        table.ForeignKey(
            //            name: "FK_AppMarketplaceContacts_AppEntities_Id",
            //            column: x => x.Id,
            //            principalTable: "AppEntities",
            //            principalColumn: "Id",
            //            onDelete: ReferentialAction.Cascade);
            //        table.ForeignKey(
            //            name: "FK_AppMarketplaceContacts_AppEntities_LanguageId",
            //            column: x => x.LanguageId,
            //            principalTable: "AppEntities",
            //            principalColumn: "Id");
            //        table.ForeignKey(
            //            name: "FK_AppMarketplaceContacts_AppEntities_Phone1TypeId",
            //            column: x => x.Phone1TypeId,
            //            principalTable: "AppEntities",
            //            principalColumn: "Id");
            //        table.ForeignKey(
            //            name: "FK_AppMarketplaceContacts_AppEntities_Phone2TypeId",
            //            column: x => x.Phone2TypeId,
            //            principalTable: "AppEntities",
            //            principalColumn: "Id");
            //        table.ForeignKey(
            //            name: "FK_AppMarketplaceContacts_AppEntities_Phone3TypeId",
            //            column: x => x.Phone3TypeId,
            //            principalTable: "AppEntities",
            //            principalColumn: "Id");
            //        table.ForeignKey(
            //            name: "FK_AppMarketplaceContacts_AppMarketplaceContacts_AppMarketplaceContactId",
            //            column: x => x.AppMarketplaceContactId,
            //            principalTable: "AppMarketplaceContacts",
            //            principalColumn: "Id");
            //        table.ForeignKey(
            //            name: "FK_AppMarketplaceContacts_AppMarketplaceContacts_ParentId",
            //            column: x => x.ParentId,
            //            principalTable: "AppMarketplaceContacts",
            //            principalColumn: "Id");
            //    });

            //migrationBuilder.CreateTable(
            //    name: "ValidationRules",
            //    columns: table => new
            //    {
            //        Id = table.Column<int>(type: "int", nullable: false)
            //            .Annotation("SqlServer:Identity", "1, 1"),
            //        FieldName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
            //        RuleType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
            //        RuleValue = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
            //        ErrorMessage = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: false)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_ValidationRules", x => x.Id);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "AppMarketplaceContactAddresses",
            //    columns: table => new
            //    {
            //        Id = table.Column<long>(type: "bigint", nullable: false)
            //            .Annotation("SqlServer:Identity", "1, 1"),
            //        ContactId = table.Column<long>(type: "bigint", nullable: false),
            //        ContactCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
            //        AddressTypeId = table.Column<long>(type: "bigint", nullable: false),
            //        AddressTypeCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
            //        AddressId = table.Column<long>(type: "bigint", nullable: false),
            //        AddressCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
            //        TimeStamp = table.Column<DateTime>(type: "datetime2", nullable: false)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_AppMarketplaceContactAddresses", x => x.Id);
            //        table.ForeignKey(
            //            name: "FK_AppMarketplaceContactAddresses_AppEntities_AddressTypeId",
            //            column: x => x.AddressTypeId,
            //            principalTable: "AppEntities",
            //            principalColumn: "Id",
            //            onDelete: ReferentialAction.Cascade);
            //        table.ForeignKey(
            //            name: "FK_AppMarketplaceContactAddresses_AppMarketplaceAddresses_AddressId",
            //            column: x => x.AddressId,
            //            principalTable: "AppMarketplaceAddresses",
            //            principalColumn: "Id",
            //            onDelete: ReferentialAction.Cascade);
            //        table.ForeignKey(
            //            name: "FK_AppMarketplaceContactAddresses_AppMarketplaceContacts_ContactId",
            //            column: x => x.ContactId,
            //            principalTable: "AppMarketplaceContacts",
            //            principalColumn: "Id",
            //            onDelete: ReferentialAction.Cascade);
            //    });

            //migrationBuilder.CreateIndex(
            //    name: "IX_AppContacts_PaymentTermsId",
            //    table: "AppContacts",
            //    column: "PaymentTermsId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_AppContacts_ShipViaId",
            //    table: "AppContacts",
            //    column: "ShipViaId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_AppEntityRatings_EntityId",
            //    table: "AppEntityRatings",
            //    column: "EntityId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_AppEntityRatings_EntityObjectTypeId",
            //    table: "AppEntityRatings",
            //    column: "EntityObjectTypeId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_AppEntityRatings_ObjectId",
            //    table: "AppEntityRatings",
            //    column: "ObjectId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_AppMarketplaceAddresses_CountryId",
            //    table: "AppMarketplaceAddresses",
            //    column: "CountryId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_AppMarketplaceContactAddresses_AddressId",
            //    table: "AppMarketplaceContactAddresses",
            //    column: "AddressId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_AppMarketplaceContactAddresses_AddressTypeId",
            //    table: "AppMarketplaceContactAddresses",
            //    column: "AddressTypeId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_AppMarketplaceContactAddresses_ContactId",
            //    table: "AppMarketplaceContactAddresses",
            //    column: "ContactId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_AppMarketplaceContacts_AppMarketplaceContactId",
            //    table: "AppMarketplaceContacts",
            //    column: "AppMarketplaceContactId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_AppMarketplaceContacts_CurrencyId",
            //    table: "AppMarketplaceContacts",
            //    column: "CurrencyId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_AppMarketplaceContacts_LanguageId",
            //    table: "AppMarketplaceContacts",
            //    column: "LanguageId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_AppMarketplaceContacts_ParentId",
            //    table: "AppMarketplaceContacts",
            //    column: "ParentId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_AppMarketplaceContacts_Phone1TypeId",
            //    table: "AppMarketplaceContacts",
            //    column: "Phone1TypeId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_AppMarketplaceContacts_Phone2TypeId",
            //    table: "AppMarketplaceContacts",
            //    column: "Phone2TypeId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_AppMarketplaceContacts_Phone3TypeId",
            //    table: "AppMarketplaceContacts",
            //    column: "Phone3TypeId");

            //migrationBuilder.AddForeignKey(
            //    name: "FK_AppContacts_AppEntities_PaymentTermsId",
            //    table: "AppContacts",
            //    column: "PaymentTermsId",
            //    principalTable: "AppEntities",
            //    principalColumn: "Id");

            //migrationBuilder.AddForeignKey(
            //    name: "FK_AppContacts_AppEntities_ShipViaId",
            //    table: "AppContacts",
            //    column: "ShipViaId",
            //    principalTable: "AppEntities",
            //    principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.DropForeignKey(
            //    name: "FK_AppContacts_AppEntities_PaymentTermsId",
            //    table: "AppContacts");

            //migrationBuilder.DropForeignKey(
            //    name: "FK_AppContacts_AppEntities_ShipViaId",
            //    table: "AppContacts");

            migrationBuilder.DropTable(
                name: "AppContactRelationshipInfo");

            //migrationBuilder.DropTable(
            //    name: "AppEntityRatings");

            //migrationBuilder.DropTable(
            //    name: "AppMarketplaceContactAddresses");

            //migrationBuilder.DropTable(
            //    name: "ValidationRules");

            //migrationBuilder.DropTable(
            //    name: "AppMarketplaceAddresses");

            //migrationBuilder.DropTable(
            //    name: "AppMarketplaceContacts");

            //migrationBuilder.DropIndex(
            //    name: "IX_AppContacts_PaymentTermsId",
            //    table: "AppContacts");

            //migrationBuilder.DropIndex(
            //    name: "IX_AppContacts_ShipViaId",
            //    table: "AppContacts");

            //migrationBuilder.DropColumn(
            //    name: "BranchCode",
            //    table: "AppTransactionContacts");

            //migrationBuilder.DropColumn(
            //    name: "CompanyCode",
            //    table: "AppTransactionContacts");

            //migrationBuilder.DropColumn(
            //    name: "ContactCode",
            //    table: "AppTransactionContacts");

            //migrationBuilder.DropColumn(
            //    name: "BranchCode",
            //    table: "AppMarketplaceTransactionContacts");

            //migrationBuilder.DropColumn(
            //    name: "CompanyCode",
            //    table: "AppMarketplaceTransactionContacts");

            //migrationBuilder.DropColumn(
            //    name: "ContactCode",
            //    table: "AppMarketplaceTransactionContacts");

            //migrationBuilder.DropColumn(
            //    name: "IsDefault",
            //    table: "AppEntities");

            //migrationBuilder.DropColumn(
            //    name: "PaymentTermsCashOnDelivery",
            //    table: "AppContacts");

            //migrationBuilder.DropColumn(
            //    name: "PaymentTermsCode",
            //    table: "AppContacts");

            //migrationBuilder.DropColumn(
            //    name: "PaymentTermsDiscount",
            //    table: "AppContacts");

            //migrationBuilder.DropColumn(
            //    name: "PaymentTermsDiscount2",
            //    table: "AppContacts");

            //migrationBuilder.DropColumn(
            //    name: "PaymentTermsDiscount2Days",
            //    table: "AppContacts");

            //migrationBuilder.DropColumn(
            //    name: "PaymentTermsDiscountDays",
            //    table: "AppContacts");

            //migrationBuilder.DropColumn(
            //    name: "PaymentTermsEndOfMonth",
            //    table: "AppContacts");

            //migrationBuilder.DropColumn(
            //    name: "PaymentTermsEndOfMonthDays",
            //    table: "AppContacts");

            //migrationBuilder.DropColumn(
            //    name: "PaymentTermsId",
            //    table: "AppContacts");

            //migrationBuilder.DropColumn(
            //    name: "PaymentTermsName",
            //    table: "AppContacts");

            //migrationBuilder.DropColumn(
            //    name: "PaymentTermsNetDueDays",
            //    table: "AppContacts");

            //migrationBuilder.DropColumn(
            //    name: "PaymentTermsNextMonthDay",
            //    table: "AppContacts");

            //migrationBuilder.DropColumn(
            //    name: "PaymentTermsPaymentType",
            //    table: "AppContacts");

            //migrationBuilder.DropColumn(
            //    name: "PaymentTermsUseInstallments",
            //    table: "AppContacts");

            //migrationBuilder.DropColumn(
            //    name: "ShipViaCode",
            //    table: "AppContacts");

            //migrationBuilder.DropColumn(
            //    name: "ShipViaId",
            //    table: "AppContacts");

            //migrationBuilder.DropColumn(
            //    name: "ShipViaName",
            //    table: "AppContacts");

            //migrationBuilder.AlterColumn<string>(
            //    name: "Reference",
            //    table: "AppTenantActivitiesLog",
            //    type: "nvarchar(50)",
            //    maxLength: 50,
            //    nullable: true,
            //    oldClrType: typeof(string),
            //    oldType: "nvarchar(100)",
            //    oldMaxLength: 100,
            //    oldNullable: true);
        }
    }
}
