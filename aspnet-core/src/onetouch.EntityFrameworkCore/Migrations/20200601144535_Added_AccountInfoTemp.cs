using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Added_AccountInfoTemp : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AccountInfoTemps",
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
                    Code = table.Column<string>(maxLength: 20, nullable: false),
                    TradeName = table.Column<string>(maxLength: 100, nullable: false),
                    AccountType = table.Column<byte>(nullable: false),
                    Notes = table.Column<string>(nullable: true),
                    Website = table.Column<string>(maxLength: 100, nullable: true),
                    Name = table.Column<string>(maxLength: 250, nullable: false),
                    Phone1Number = table.Column<string>(maxLength: 20, nullable: true),
                    Phone1Ex = table.Column<string>(maxLength: 10, nullable: true),
                    Phone2Number = table.Column<string>(maxLength: 20, nullable: true),
                    Phone2Ex = table.Column<string>(maxLength: 10, nullable: true),
                    Phone3Number = table.Column<string>(maxLength: 20, nullable: true),
                    Phone3Ex = table.Column<string>(maxLength: 10, nullable: true),
                    EMailAddress = table.Column<string>(maxLength: 100, nullable: true),
                    Phone1TypeId = table.Column<long>(nullable: true),
                    Phone2TypeId = table.Column<long>(nullable: true),
                    Phone3TypeId = table.Column<long>(nullable: true),
                    CurrencyId = table.Column<long>(nullable: false),
                    LanguageId = table.Column<long>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountInfoTemps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AccountInfoTemps_AppEntities_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AccountInfoTemps_AppEntities_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
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

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccountInfoTemps");
        }
    }
}
