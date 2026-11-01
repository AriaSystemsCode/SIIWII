using System;
using System.IO;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20261028130000_MoveFieldSettingSections")]
    public class MoveFieldSettingSections : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            const string resourceName = "onetouch.Migrations.Seed.20261028_MoveFieldSettingSections.sql";
            using var stream = typeof(MoveFieldSettingSections).Assembly.GetManifestResourceStream(resourceName)
                ?? throw new InvalidOperationException("Field Manager section migration SQL was not embedded.");
            using var reader = new StreamReader(stream);
            migrationBuilder.Sql(reader.ReadToEnd());
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            throw new NotSupportedException("Restoring earlier Field Manager setting sections requires a database backup.");
        }
    }
}
