using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class objectProperties : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.CreateTable(
            //    name: "SydObjectRevisions",
            //    columns: table => new
            //    {
            //        Id = table.Column<long>(nullable: false)
            //            .Annotation("SqlServer:Identity", "1, 1"),
            //        CreationTime = table.Column<DateTime>(nullable: false),
            //        CreatorUserId = table.Column<long>(nullable: true),
            //        LastModificationTime = table.Column<DateTime>(nullable: true),
            //        LastModifierUserId = table.Column<long>(nullable: true),
            //        IsDeleted = table.Column<bool>(nullable: false),
            //        DeleterUserId = table.Column<long>(nullable: true),
            //        DeletionTime = table.Column<DateTime>(nullable: true),
            //        ObjectId = table.Column<long>(nullable: false),
            //        ObjectCode = table.Column<string>(maxLength: 50, nullable: true),
            //        RevisionCode = table.Column<string>(maxLength: 50, nullable: true),
            //        Settings = table.Column<string>(nullable: true)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_SydObjectRevisions", x => x.Id);
            //        table.ForeignKey(
            //            name: "FK_SydObjectRevisions_SydObjects_ObjectId",
            //            column: x => x.ObjectId,
            //            principalTable: "SydObjects",
            //            principalColumn: "Id",
            //            onDelete: ReferentialAction.Cascade);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "SysPropertyTypes",
            //    columns: table => new
            //    {
            //        Id = table.Column<long>(nullable: false)
            //            .Annotation("SqlServer:Identity", "1, 1"),
            //        CreationTime = table.Column<DateTime>(nullable: false),
            //        CreatorUserId = table.Column<long>(nullable: true),
            //        LastModificationTime = table.Column<DateTime>(nullable: true),
            //        LastModifierUserId = table.Column<long>(nullable: true),
            //        IsDeleted = table.Column<bool>(nullable: false),
            //        DeleterUserId = table.Column<long>(nullable: true),
            //        DeletionTime = table.Column<DateTime>(nullable: true),
            //        Code = table.Column<string>(maxLength: 50, nullable: true),
            //        Name = table.Column<string>(maxLength: 250, nullable: true)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_SysPropertyTypes", x => x.Id);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "SysObjectTypeProperties",
            //    columns: table => new
            //    {
            //        Id = table.Column<long>(nullable: false)
            //            .Annotation("SqlServer:Identity", "1, 1"),
            //        CreationTime = table.Column<DateTime>(nullable: false),
            //        CreatorUserId = table.Column<long>(nullable: true),
            //        LastModificationTime = table.Column<DateTime>(nullable: true),
            //        LastModifierUserId = table.Column<long>(nullable: true),
            //        IsDeleted = table.Column<bool>(nullable: false),
            //        DeleterUserId = table.Column<long>(nullable: true),
            //        DeletionTime = table.Column<DateTime>(nullable: true),
            //        ObjectTypeId = table.Column<long>(nullable: false),
            //        PropertyTypeId = table.Column<long>(nullable: false)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_SysObjectTypeProperties", x => x.Id);
            //        table.ForeignKey(
            //            name: "FK_SysObjectTypeProperties_SysObjectTypes_ObjectTypeId",
            //            column: x => x.ObjectTypeId,
            //            principalTable: "SysObjectTypes",
            //            principalColumn: "Id",
            //            onDelete: ReferentialAction.Cascade);
            //        table.ForeignKey(
            //            name: "FK_SysObjectTypeProperties_SysPropertyTypes_PropertyTypeId",
            //            column: x => x.PropertyTypeId,
            //            principalTable: "SysPropertyTypes",
            //            principalColumn: "Id",
            //            onDelete: ReferentialAction.Cascade);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "SydObjectProperties",
            //    columns: table => new
            //    {
            //        Id = table.Column<long>(nullable: false)
            //            .Annotation("SqlServer:Identity", "1, 1"),
            //        CreationTime = table.Column<DateTime>(nullable: false),
            //        CreatorUserId = table.Column<long>(nullable: true),
            //        LastModificationTime = table.Column<DateTime>(nullable: true),
            //        LastModifierUserId = table.Column<long>(nullable: true),
            //        IsDeleted = table.Column<bool>(nullable: false),
            //        DeleterUserId = table.Column<long>(nullable: true),
            //        DeletionTime = table.Column<DateTime>(nullable: true),
            //        ObjectId = table.Column<long>(nullable: false),
            //        ObjectCode = table.Column<string>(maxLength: 50, nullable: true),
            //        ObjectRevisionId = table.Column<long>(nullable: false),
            //        PropertyId = table.Column<long>(nullable: false),
            //        PropertyCode = table.Column<string>(maxLength: 50, nullable: true),
            //        PropertyName = table.Column<string>(maxLength: 250, nullable: true),
            //        PropertyTypeId = table.Column<long>(nullable: false),
            //        PropertyTypeCode = table.Column<string>(maxLength: 50, nullable: true),
            //        PropertySettings = table.Column<string>(nullable: true)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_SydObjectProperties", x => x.Id);
            //        table.ForeignKey(
            //            name: "FK_SydObjectProperties_SydObjects_ObjectId",
            //            column: x => x.ObjectId,
            //            principalTable: "SydObjects",
            //            principalColumn: "Id",
            //            onDelete: ReferentialAction.Cascade);
            //        table.ForeignKey(
            //            name: "FK_SydObjectProperties_SydObjectRevisions_ObjectRevisionId",
            //            column: x => x.ObjectRevisionId,
            //            principalTable: "SydObjectRevisions",
            //            principalColumn: "Id",
            //            onDelete: ReferentialAction.Cascade);
            //        table.ForeignKey(
            //            name: "FK_SydObjectProperties_SysObjectTypeProperties_PropertyId",
            //            column: x => x.PropertyId,
            //            principalTable: "SysObjectTypeProperties",
            //            principalColumn: "Id",
            //            onDelete: ReferentialAction.Cascade);
            //        table.ForeignKey(
            //            name: "FK_SydObjectProperties_SysPropertyTypes_PropertyTypeId",
            //            column: x => x.PropertyTypeId,
            //            principalTable: "SysPropertyTypes",
            //            principalColumn: "Id",
            //            onDelete: ReferentialAction.Cascade);
            //    });

            //migrationBuilder.CreateIndex(
            //    name: "IX_SydObjectProperties_ObjectId",
            //    table: "SydObjectProperties",
            //    column: "ObjectId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_SydObjectProperties_ObjectRevisionId",
            //    table: "SydObjectProperties",
            //    column: "ObjectRevisionId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_SydObjectProperties_PropertyId",
            //    table: "SydObjectProperties",
            //    column: "PropertyId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_SydObjectProperties_PropertyTypeId",
            //    table: "SydObjectProperties",
            //    column: "PropertyTypeId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_SydObjectRevisions_ObjectId",
            //    table: "SydObjectRevisions",
            //    column: "ObjectId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_SysObjectTypeProperties_ObjectTypeId",
            //    table: "SysObjectTypeProperties",
            //    column: "ObjectTypeId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_SysObjectTypeProperties_PropertyTypeId",
            //    table: "SysObjectTypeProperties",
            //    column: "PropertyTypeId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.DropTable(
            //    name: "SydObjectProperties");

            //migrationBuilder.DropTable(
            //    name: "SydObjectRevisions");

            //migrationBuilder.DropTable(
            //    name: "SysObjectTypeProperties");

            //migrationBuilder.DropTable(
            //    name: "SysPropertyTypes");
        }
    }
}
