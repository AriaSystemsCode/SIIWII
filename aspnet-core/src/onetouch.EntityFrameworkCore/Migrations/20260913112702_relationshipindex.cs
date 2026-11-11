using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class relationshipindex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "RequesterContactSSIN",
                table: "AppContactRelationshipInfo",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RecipientContactSSIN",
                table: "AppContactRelationshipInfo",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppContactRelationshipInfo_RecipientContactSSIN",
                table: "AppContactRelationshipInfo",
                column: "RecipientContactSSIN");

            migrationBuilder.CreateIndex(
                name: "IX_AppContactRelationshipInfo_RequesterContactSSIN",
                table: "AppContactRelationshipInfo",
                column: "RequesterContactSSIN");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AppContactRelationshipInfo_RecipientContactSSIN",
                table: "AppContactRelationshipInfo");

            migrationBuilder.DropIndex(
                name: "IX_AppContactRelationshipInfo_RequesterContactSSIN",
                table: "AppContactRelationshipInfo");

            migrationBuilder.AlterColumn<string>(
                name: "RequesterContactSSIN",
                table: "AppContactRelationshipInfo",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RecipientContactSSIN",
                table: "AppContactRelationshipInfo",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);
        }
    }
}
