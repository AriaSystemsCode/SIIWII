using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddAppFieldsFieldManager : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "APPFields",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: true),
                    SourceFieldId = table.Column<long>(type: "bigint", nullable: true),
                    SycObjectId = table.Column<long>(type: "bigint", nullable: false),
                    EntitySycObjectId = table.Column<long>(type: "bigint", nullable: true),
                    FieldCode = table.Column<string>(type: "nvarchar(11)", maxLength: 11, nullable: false),
                    FieldName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    FieldTypeId = table.Column<long>(type: "bigint", nullable: false),
                    WidgetTypeId = table.Column<long>(type: "bigint", nullable: true),
                    FieldLevelId = table.Column<long>(type: "bigint", nullable: true),
                    FieldStatusId = table.Column<long>(type: "bigint", nullable: true),
                    FieldLevelCode = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false, defaultValue: "Application"),
                    FieldStatusCode = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false, defaultValue: "Proposed"),
                    TrackingNo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CurrentRevisionNo = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false, defaultValue: "00"),
                    IsStandard = table.Column<bool>(type: "bit", nullable: false),
                    IsCustom = table.Column<bool>(type: "bit", nullable: false),
                    IsExtraField = table.Column<bool>(type: "bit", nullable: false),
                    IsHidden = table.Column<bool>(type: "bit", nullable: false),
                    AllowNull = table.Column<bool>(type: "bit", nullable: false),
                    Length = table.Column<int>(type: "int", nullable: true),
                    Decimals = table.Column<int>(type: "int", nullable: true),
                    DefaultValue = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    DateFormat = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TimeFormat = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AllowMultiSelect = table.Column<bool>(type: "bit", nullable: false),
                    Required = table.Column<bool>(type: "bit", nullable: false),
                    Visible = table.Column<bool>(type: "bit", nullable: false),
                    Editable = table.Column<bool>(type: "bit", nullable: false),
                    ExtraAttributes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierUserId = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeleterUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_APPFields", x => x.Id);
                    table.ForeignKey(
                        name: "FK_APPFields_APPFields_SourceFieldId",
                        column: x => x.SourceFieldId,
                        principalTable: "APPFields",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_APPFields_SycEntityObjectTypes_FieldTypeId",
                        column: x => x.FieldTypeId,
                        principalTable: "SycEntityObjectTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_APPFields_SycEntityObjectTypes_WidgetTypeId",
                        column: x => x.WidgetTypeId,
                        principalTable: "SycEntityObjectTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_APPFields_SydObjects_EntitySycObjectId",
                        column: x => x.EntitySycObjectId,
                        principalTable: "SydObjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_APPFields_SydObjects_SycObjectId",
                        column: x => x.SycObjectId,
                        principalTable: "SydObjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AppFieldsHistory",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: true),
                    AppFieldId = table.Column<long>(type: "bigint", nullable: false),
                    RevisionNo = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ChangeType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    SnapshotJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ChangedBy = table.Column<long>(type: "bigint", nullable: true),
                    RestoredFromRevisionNo = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppFieldsHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppFieldsHistory_APPFields_AppFieldId",
                        column: x => x.AppFieldId,
                        principalTable: "APPFields",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_APPFields_EntitySycObjectId",
                table: "APPFields",
                column: "EntitySycObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_APPFields_FieldTypeId",
                table: "APPFields",
                column: "FieldTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_APPFields_SourceFieldId",
                table: "APPFields",
                column: "SourceFieldId");

            migrationBuilder.CreateIndex(
                name: "IX_APPFields_SycObjectId",
                table: "APPFields",
                column: "SycObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_APPFields_TenantId_FieldCode",
                table: "APPFields",
                columns: new[] { "TenantId", "FieldCode" },
                unique: true,
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_APPFields_TenantId_SourceFieldId",
                table: "APPFields",
                columns: new[] { "TenantId", "SourceFieldId" });

            migrationBuilder.CreateIndex(
                name: "IX_APPFields_TenantId_SycObjectId",
                table: "APPFields",
                columns: new[] { "TenantId", "SycObjectId" });

            migrationBuilder.CreateIndex(
                name: "IX_APPFields_WidgetTypeId",
                table: "APPFields",
                column: "WidgetTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_AppFieldsHistory_AppFieldId_RevisionNo",
                table: "AppFieldsHistory",
                columns: new[] { "AppFieldId", "RevisionNo" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppFieldsHistory_TenantId",
                table: "AppFieldsHistory",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppFieldsHistory");

            migrationBuilder.DropTable(
                name: "APPFields");
        }
    }
}
