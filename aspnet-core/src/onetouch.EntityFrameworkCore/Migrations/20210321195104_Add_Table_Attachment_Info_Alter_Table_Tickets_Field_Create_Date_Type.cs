using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Add_Table_Attachment_Info_Alter_Table_Tickets_Field_Create_Date_Type : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        { 
            //migrationBuilder.AlterColumn<DateTime>(
            //    name: "CreateDate",
            //    table: "Tickets",
            //    nullable: true,
            //    oldClrType: typeof(int),
            //    oldType: "int",
            //    oldNullable: true);
            
            migrationBuilder.DropColumn(
                name: "CreateDate",
                table: "Tickets" );
            migrationBuilder.AddColumn<DateTime>(
               name: "CreateDate",
               table: "Tickets",
                nullable: true);


        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            
            //migrationBuilder.AlterColumn<int>(
            //    name: "CreateDate",
            //    table: "Tickets",
            //    type: "int",
            //    nullable: true,
            //    oldClrType: typeof(DateTime),
            //    oldNullable: true);
            
            migrationBuilder.DropColumn(
            name: "CreateDate",
            table: "Tickets");

            migrationBuilder.AddColumn<int>(
               name: "CreateDate",
               table: "Tickets",
                nullable: true);
        }
    }
}
