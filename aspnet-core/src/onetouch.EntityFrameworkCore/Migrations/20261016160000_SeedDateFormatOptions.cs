using System;
using System.IO;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20261016160000_SeedDateFormatOptions")]
    public class SeedDateFormatOptions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            const string resourceName = "onetouch.Migrations.Seed.20261016_SeedDateFormatOptions.sql";
            using var stream = typeof(SeedDateFormatOptions).Assembly.GetManifestResourceStream(resourceName)
                ?? throw new InvalidOperationException("DateFormat option seed SQL was not embedded.");
            using var reader = new StreamReader(stream);
            migrationBuilder.Sql(reader.ReadToEnd());
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            throw new NotSupportedException("DateFormat selections require a database backup for rollback.");
        }
    }
}
