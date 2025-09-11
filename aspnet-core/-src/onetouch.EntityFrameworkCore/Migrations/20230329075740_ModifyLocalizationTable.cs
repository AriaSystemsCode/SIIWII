using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class ModifyLocalizationTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SycEntityLocalization",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    String = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ObjectId = table.Column<long>(type: "bigint", nullable: false),
                    Language = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ObjectTypeId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SycEntityLocalization", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SycEntityLocalization_SydObjects_ObjectTypeId",
                        column: x => x.ObjectTypeId,
                        principalTable: "SydObjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SycEntityLocalization_ObjectTypeId",
                table: "SycEntityLocalization",
                column: "ObjectTypeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SycEntityLocalization");
        }
    }
}
