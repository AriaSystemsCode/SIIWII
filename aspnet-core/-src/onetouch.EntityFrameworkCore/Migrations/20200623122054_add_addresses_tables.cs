using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class add_addresses_tables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_AppContacts_PartnerId",
                table: "AppContacts");

            migrationBuilder.DropIndex(
                name: "IX_AppContacts_PartnerId",
                table: "AppContacts");

            migrationBuilder.CreateTable(
                name: "AppAddresses",
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
                    Code = table.Column<string>(nullable: true),
                    Name = table.Column<string>(nullable: true),
                    AddressLine1 = table.Column<string>(nullable: true),
                    AddressLine2 = table.Column<string>(nullable: true),
                    City = table.Column<string>(nullable: true),
                    State = table.Column<string>(nullable: true),
                    PostalCode = table.Column<string>(nullable: true),
                    CountryId = table.Column<long>(nullable: false),
                    CountryIdCode = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppAddresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppAddresses_AppEntities_CountryId",
                        column: x => x.CountryId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AppContactAddresses",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ContactId = table.Column<long>(nullable: false),
                    ContactIdCode = table.Column<string>(nullable: true),
                    AddressTypeId = table.Column<long>(nullable: false),
                    AddressTypeIdCode = table.Column<string>(nullable: true),
                    AddressId = table.Column<long>(nullable: false),
                    AddressIdCode = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppContactAddresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppContactAddresses_AppAddresses_AddressId",
                        column: x => x.AddressId,
                        principalTable: "AppAddresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppContactAddresses_AppEntities_AddressTypeId",
                        column: x => x.AddressTypeId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppAddresses_CountryId",
                table: "AppAddresses",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_AppContactAddresses_AddressId",
                table: "AppContactAddresses",
                column: "AddressId");

            migrationBuilder.CreateIndex(
                name: "IX_AppContactAddresses_AddressTypeId",
                table: "AppContactAddresses",
                column: "AddressTypeId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppContactAddresses");

            migrationBuilder.DropTable(
                name: "AppAddresses");

            migrationBuilder.CreateIndex(
                name: "IX_AppContacts_PartnerId",
                table: "AppContacts",
                column: "PartnerId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_AppContacts_PartnerId",
                table: "AppContacts",
                column: "PartnerId",
                principalTable: "AppContacts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
