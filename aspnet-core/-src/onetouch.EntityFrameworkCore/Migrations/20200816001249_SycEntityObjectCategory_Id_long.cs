using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class SycEntityObjectCategory_Id_long : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey("FK_SycEntityObjectCategories_SycEntityObjectCategories_ParentId", "SycEntityObjectCategories");
            migrationBuilder.DropForeignKey("FK_AppEntityCategories_SycEntityObjectCategories_EntityObjectCategoryId", "AppEntityCategories");
            migrationBuilder.DropPrimaryKey("PK_SycEntityObjectCategories", "SycEntityObjectCategories");

            migrationBuilder.AlterColumn<long>(
                name: "ParentId",
                table: "SycEntityObjectCategories",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "Id",
                table: "SycEntityObjectCategories",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("SqlServer:Identity", "1, 1")
                .OldAnnotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<int>(
                name: "TenantId",
                table: "SycEntityObjectCategories",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<long>(
                name: "EntityObjectCategoryId",
                table: "AppEntityCategories",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddPrimaryKey("PK_SycEntityObjectCategories", "SycEntityObjectCategories", "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SycEntityObjectCategories_SycEntityObjectCategories_ParentId",
                table: "SycEntityObjectCategories",
                column: "ParentId",
                principalTable: "SycEntityObjectCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppEntityCategories_SycEntityObjectCategories_EntityObjectCategoryId",
                table: "AppEntityCategories",
                column: "EntityObjectCategoryId",
                principalTable: "SycEntityObjectCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "SycEntityObjectCategories");

            migrationBuilder.AlterColumn<int>(
                name: "ParentId",
                table: "SycEntityObjectCategories",
                type: "int",
                nullable: true,
                oldClrType: typeof(long),
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "SycEntityObjectCategories",
                type: "int",
                nullable: false,
                oldClrType: typeof(long))
                .Annotation("SqlServer:Identity", "1, 1")
                .OldAnnotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AlterColumn<int>(
                name: "EntityObjectCategoryId",
                table: "AppEntityCategories",
                type: "int",
                nullable: false,
                oldClrType: typeof(long));
        }
    }
}
