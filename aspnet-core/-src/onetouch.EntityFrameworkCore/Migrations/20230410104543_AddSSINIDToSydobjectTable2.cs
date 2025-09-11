using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddSSINIDToSydobjectTable2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "SSINIdentifier",
                table: "SydObjects",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "SycIdentifierDefinitionId",
                table: "SydObjects",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SSIN",
                table: "AppEntities",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TenantOwner",
                table: "AppEntities",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_SydObjects_SSINIdentifier",
                table: "SydObjects",
                column: "SSINIdentifier");

            migrationBuilder.CreateIndex(
                name: "IX_SydObjects_SycIdentifierDefinitionId",
                table: "SydObjects",
                column: "SycIdentifierDefinitionId");

            migrationBuilder.AddForeignKey(
                name: "FK_SydObjects_SycIdentifierDefinitions_SSINIdentifier",
                table: "SydObjects",
                column: "SSINIdentifier",
                principalTable: "SycIdentifierDefinitions",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SydObjects_SycIdentifierDefinitions_SycIdentifierDefinitionId",
                table: "SydObjects",
                column: "SycIdentifierDefinitionId",
                principalTable: "SycIdentifierDefinitions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SydObjects_SycIdentifierDefinitions_SSINIdentifier",
                table: "SydObjects");

            migrationBuilder.DropForeignKey(
                name: "FK_SydObjects_SycIdentifierDefinitions_SycIdentifierDefinitionId",
                table: "SydObjects");

            migrationBuilder.DropIndex(
                name: "IX_SydObjects_SSINIdentifier",
                table: "SydObjects");

            migrationBuilder.DropIndex(
                name: "IX_SydObjects_SycIdentifierDefinitionId",
                table: "SydObjects");

            migrationBuilder.DropColumn(
                name: "SSINIdentifier",
                table: "SydObjects");

            migrationBuilder.DropColumn(
                name: "SycIdentifierDefinitionId",
                table: "SydObjects");

            migrationBuilder.DropColumn(
                name: "SSIN",
                table: "AppEntities");

            migrationBuilder.DropColumn(
                name: "TenantOwner",
                table: "AppEntities");
        }
    }
}
