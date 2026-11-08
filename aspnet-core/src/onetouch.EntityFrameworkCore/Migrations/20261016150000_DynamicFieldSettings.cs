using System;
using System.IO;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20261016150000_DynamicFieldSettings")]
    public class DynamicFieldSettings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            const string resourceName = "onetouch.Migrations.Seed.20261016_DynamicFieldSettings.sql";
            using var stream = typeof(DynamicFieldSettings).Assembly.GetManifestResourceStream(resourceName)
                ?? throw new InvalidOperationException("Field Manager dynamic settings migration SQL was not embedded.");
            using var reader = new StreamReader(stream);
            migrationBuilder.Sql(reader.ReadToEnd());
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            throw new NotSupportedException("Dynamic field setting values require a database backup for rollback.");
        }
    }
}
