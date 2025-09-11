using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class SycEntityObjectClassification_Id_long : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey("FK_SycEntityObjectClassifications_SycEntityObjectClassifications_ParentId", "SycEntityObjectClassifications");
            migrationBuilder.DropForeignKey("FK_AppEntityClassifications_SycEntityObjectClassifications_EntityObjectClassificationId", "AppEntityClassifications");
            migrationBuilder.DropPrimaryKey("PK_SycEntityObjectClassifications", "SycEntityObjectClassifications");

            migrationBuilder.AlterColumn<long>(
                name: "ParentId",
                table: "SycEntityObjectClassifications",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "Id",
                table: "SycEntityObjectClassifications",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("SqlServer:Identity", "1, 1")
                .OldAnnotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<int>(
                name: "TenantId",
                table: "SycEntityObjectClassifications",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<long>(
                name: "EntityObjectClassificationId",
                table: "AppEntityClassifications",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");


            migrationBuilder.AddPrimaryKey("PK_SycEntityObjectClassifications", "SycEntityObjectClassifications", "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SycEntityObjectClassifications_SycEntityObjectClassifications_ParentId",
                table: "SycEntityObjectClassifications",
                column: "ParentId",
                principalTable: "SycEntityObjectClassifications",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppEntityClassifications_SycEntityObjectClassifications_EntityObjectClassificationId",
                table: "AppEntityClassifications",
                column: "EntityObjectClassificationId",
                principalTable: "SycEntityObjectClassifications",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "SycEntityObjectClassifications");

            migrationBuilder.AlterColumn<int>(
                name: "ParentId",
                table: "SycEntityObjectClassifications",
                type: "int",
                nullable: true,
                oldClrType: typeof(long),
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "SycEntityObjectClassifications",
                type: "int",
                nullable: false,
                oldClrType: typeof(long))
                .Annotation("SqlServer:Identity", "1, 1")
                .OldAnnotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AlterColumn<int>(
                name: "EntityObjectClassificationId",
                table: "AppEntityClassifications",
                type: "int",
                nullable: false,
                oldClrType: typeof(long));
        }
    }
}
