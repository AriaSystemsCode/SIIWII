using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Add_table_AppContacts : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccountInfoTemps");

            migrationBuilder.DropIndex(
                name: "IX_AppEntities_TenantId",
                table: "AppEntities");

            migrationBuilder.CreateTable(
                name: "AppContacts",
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
                    TenantId = table.Column<int>(nullable: true),
                    Name = table.Column<string>(nullable: false),
                    Code = table.Column<string>(nullable: false),
                    LanguageId = table.Column<long>(nullable: false),
                    LanguageIdCode = table.Column<string>(nullable: true),
                    CurrencyId = table.Column<long>(nullable: false),
                    CurrencyIdCode = table.Column<string>(nullable: true),
                    EMailAddress = table.Column<string>(nullable: true),
                    Website = table.Column<string>(nullable: true),
                    EntityId = table.Column<long>(nullable: false),
                    EntityIdCode = table.Column<string>(nullable: true),
                    ParentId = table.Column<long>(nullable: false),
                    ParentIdCode = table.Column<string>(nullable: true),
                    PartnerId = table.Column<int>(nullable: false),
                    PartnerIdCode = table.Column<string>(nullable: true),
                    AccountType = table.Column<byte>(nullable: false),
                    IsProfileData = table.Column<bool>(nullable: false),
                    Phone1TypeId = table.Column<long>(nullable: false),
                    Phone1TypeIdName = table.Column<string>(nullable: true),
                    Phone1Number = table.Column<string>(nullable: true),
                    Phone1Ext = table.Column<string>(nullable: true),
                    Phone2TypeId = table.Column<long>(nullable: false),
                    Phone2TypeIdName = table.Column<string>(nullable: true),
                    Phone2Number = table.Column<string>(nullable: true),
                    Phone2Ext = table.Column<string>(nullable: true),
                    Phone3TypeId = table.Column<long>(nullable: false),
                    Phone3TypeIdName = table.Column<string>(nullable: true),
                    Phone3Number = table.Column<string>(nullable: true),
                    Phone3Ext = table.Column<string>(nullable: true),
                    SycEntityObjectTypeId = table.Column<int>(nullable: false),
                    SycEntityObjectStatusId = table.Column<int>(nullable: true),
                    SydObjectId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppContacts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppContacts_AppEntities_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppContacts_AppEntities_EntityId",
                        column: x => x.EntityId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppContacts_AppEntities_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppContacts_AppEntities_ParentId",
                        column: x => x.ParentId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppContacts_SycEntityObjectTypes_PartnerId",
                        column: x => x.PartnerId,
                        principalTable: "SycEntityObjectTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppContacts_AppEntities_Phone1TypeId",
                        column: x => x.Phone1TypeId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppContacts_AppEntities_Phone2TypeId",
                        column: x => x.Phone2TypeId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppContacts_AppEntities_Phone3TypeId",
                        column: x => x.Phone3TypeId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppContacts_SycEntityObjectStatuses_SycEntityObjectStatusId",
                        column: x => x.SycEntityObjectStatusId,
                        principalTable: "SycEntityObjectStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppContacts_SycEntityObjectTypes_SycEntityObjectTypeId",
                        column: x => x.SycEntityObjectTypeId,
                        principalTable: "SycEntityObjectTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppContacts_SydObjects_SydObjectId",
                        column: x => x.SydObjectId,
                        principalTable: "SydObjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppContacts_CurrencyId",
                table: "AppContacts",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_AppContacts_EntityId",
                table: "AppContacts",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_AppContacts_LanguageId",
                table: "AppContacts",
                column: "LanguageId");

            migrationBuilder.CreateIndex(
                name: "IX_AppContacts_ParentId",
                table: "AppContacts",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_AppContacts_PartnerId",
                table: "AppContacts",
                column: "PartnerId");

            migrationBuilder.CreateIndex(
                name: "IX_AppContacts_Phone1TypeId",
                table: "AppContacts",
                column: "Phone1TypeId");

            migrationBuilder.CreateIndex(
                name: "IX_AppContacts_Phone2TypeId",
                table: "AppContacts",
                column: "Phone2TypeId");

            migrationBuilder.CreateIndex(
                name: "IX_AppContacts_Phone3TypeId",
                table: "AppContacts",
                column: "Phone3TypeId");

            migrationBuilder.CreateIndex(
                name: "IX_AppContacts_SycEntityObjectStatusId",
                table: "AppContacts",
                column: "SycEntityObjectStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_AppContacts_SycEntityObjectTypeId",
                table: "AppContacts",
                column: "SycEntityObjectTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_AppContacts_SydObjectId",
                table: "AppContacts",
                column: "SydObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_AppContacts_TenantId",
                table: "AppContacts",
                column: "TenantId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppContacts");

            migrationBuilder.CreateTable(
                name: "AccountInfoTemps",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccountType = table.Column<byte>(type: "tinyint", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true),
                    CurrencyId = table.Column<long>(type: "bigint", nullable: false),
                    DeleterUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EMailAddress = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LanguageId = table.Column<long>(type: "bigint", nullable: false),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierUserId = table.Column<long>(type: "bigint", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone1Ex = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Phone1Number = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Phone1TypeId = table.Column<long>(type: "bigint", nullable: true),
                    Phone2Ex = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Phone2Number = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Phone2TypeId = table.Column<long>(type: "bigint", nullable: true),
                    Phone3Ex = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Phone3Number = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Phone3TypeId = table.Column<long>(type: "bigint", nullable: true),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    TradeName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Website = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountInfoTemps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AccountInfoTemps_AppEntities_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AccountInfoTemps_AppEntities_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AccountInfoTemps_AppEntities_Phone1TypeId",
                        column: x => x.Phone1TypeId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AccountInfoTemps_AppEntities_Phone2TypeId",
                        column: x => x.Phone2TypeId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AccountInfoTemps_AppEntities_Phone3TypeId",
                        column: x => x.Phone3TypeId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppEntities_TenantId",
                table: "AppEntities",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountInfoTemps_CurrencyId",
                table: "AccountInfoTemps",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountInfoTemps_LanguageId",
                table: "AccountInfoTemps",
                column: "LanguageId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountInfoTemps_Phone1TypeId",
                table: "AccountInfoTemps",
                column: "Phone1TypeId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountInfoTemps_Phone2TypeId",
                table: "AccountInfoTemps",
                column: "Phone2TypeId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountInfoTemps_Phone3TypeId",
                table: "AccountInfoTemps",
                column: "Phone3TypeId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountInfoTemps_TenantId",
                table: "AccountInfoTemps",
                column: "TenantId");
        }
    }
}
