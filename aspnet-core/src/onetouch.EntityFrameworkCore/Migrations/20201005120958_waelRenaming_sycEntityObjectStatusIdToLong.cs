using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class waelRenaming_sycEntityObjectStatusIdToLong : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.DropForeignKey(
            name: "FK_AppEntities_SycEntityObjectStatuses_EntityObjectStatusId",
            table: "AppEntities");

            migrationBuilder.DropPrimaryKey("PK_SycEntityObjectStatuses", "SycEntityObjectStatuses");
        

            migrationBuilder.AlterColumn<long>(
                name: "Id",
                table: "SycEntityObjectStatuses",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("SqlServer:Identity", "1, 1")
                .OldAnnotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AlterColumn<long>(
                name: "EntityObjectStatusId",
                table: "AppEntities",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);



            migrationBuilder.AddPrimaryKey("PK_SycEntityObjectStatuses", "SycEntityObjectStatuses", "Id");

            migrationBuilder.AddForeignKey(
    name: "FK_AppEntities_SycEntityObjectStatuses_EntityObjectStatusId",
    table: "AppEntities",
    column: "EntityObjectStatusId",
    principalTable: "SycEntityObjectStatuses",
    principalColumn: "Id",
    onDelete: ReferentialAction.Restrict);

        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "SycEntityObjectStatuses",
                type: "int",
                nullable: false,
                oldClrType: typeof(long))
                .Annotation("SqlServer:Identity", "1, 1")
                .OldAnnotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AlterColumn<int>(
                name: "EntityObjectStatusId",
                table: "AppEntities",
                type: "int",
                nullable: true,
                oldClrType: typeof(long),
                oldNullable: true);
        }
    }
}
