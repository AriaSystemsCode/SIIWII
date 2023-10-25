using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class _2022_02_14_AppEvents : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppEntityAddresses",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EntityId = table.Column<long>(nullable: false),
                    EntityCode = table.Column<string>(maxLength: 50, nullable: true),
                    AddressTypeId = table.Column<long>(nullable: false),
                    AddressTypeCode = table.Column<string>(maxLength: 50, nullable: true),
                    AddressId = table.Column<long>(nullable: false),
                    AddressCode = table.Column<string>(maxLength: 50, nullable: true),
                    ContactId = table.Column<long>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppEntityAddresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppEntityAddresses_AppAddresses_AddressId",
                        column: x => x.AddressId,
                        principalTable: "AppAddresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppEntityAddresses_AppEntities_AddressTypeId",
                        column: x => x.AddressTypeId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppEntityAddresses_AppContacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "AppContacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AppEventGuests",
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
                    Code = table.Column<string>(maxLength: 50, nullable: true),
                    UserResponce = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppEventGuests", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppEvents",
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
                    IsOnLine = table.Column<bool>(nullable: false),
                    IsPublished = table.Column<bool>(nullable: false),
                    FromDate = table.Column<DateTime>(nullable: false),
                    UTCFromDateTime = table.Column<DateTime>(nullable: false),
                    UTCToDateTime = table.Column<DateTime>(nullable: false),
                    ToDate = table.Column<DateTime>(nullable: false),
                    FromTime = table.Column<DateTime>(nullable: false),
                    ToTime = table.Column<DateTime>(nullable: false),
                    Privacy = table.Column<bool>(nullable: false),
                    GuestCanInviteFriends = table.Column<bool>(nullable: false),
                    Name = table.Column<string>(maxLength: 100, nullable: true),
                    Code = table.Column<string>(maxLength: 50, nullable: true),
                    Description = table.Column<string>(nullable: true),
                    TimeZone = table.Column<string>(maxLength: 40, nullable: true),
                    RegistrationLink = table.Column<string>(maxLength: 250, nullable: true),
                    EntityId = table.Column<long>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppEvents_AppEntities_EntityId",
                        column: x => x.EntityId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityAddresses_AddressId",
                table: "AppEntityAddresses",
                column: "AddressId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityAddresses_AddressTypeId",
                table: "AppEntityAddresses",
                column: "AddressTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityAddresses_ContactId",
                table: "AppEntityAddresses",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEventGuests_TenantId",
                table: "AppEventGuests",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEvents_EntityId",
                table: "AppEvents",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEvents_TenantId",
                table: "AppEvents",
                column: "TenantId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppEntityAddresses");

            migrationBuilder.DropTable(
                name: "AppEventGuests");

            migrationBuilder.DropTable(
                name: "AppEvents");
        }
    }
}
