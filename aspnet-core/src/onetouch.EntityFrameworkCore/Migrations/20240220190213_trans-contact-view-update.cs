using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class transcontactviewupdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("CREATE OR ALTER   VIEW [dbo].[vw_contact_address]\r\nAS\r\nSELECT        TOP (1) dbo.AppTransactionContacts.ContactRole, dbo.AppTransactionContacts.TransactionId, dbo.AppTransactionContacts.Id, dbo.AppTransactionContacts.CreationTime, dbo.AppTransactionContacts.CreatorUserId, dbo.AppTransactionContacts.LastModificationTime, \r\n                         dbo.AppTransactionContacts.LastModifierUserId, dbo.AppTransactionContacts.IsDeleted, dbo.AppTransactionContacts.DeleterUserId, dbo.AppTransactionContacts.DeletionTime, 0 as TenantId, dbo.AppTransactionContacts.ContactAddressCode as Code, dbo.AppTransactionContacts.ContactAddressName as Name, \r\n                         dbo.AppTransactionContacts.ContactAddressLine1 as AddressLine1, dbo.AppTransactionContacts.ContactAddressLine2 as AddressLine2, dbo.AppTransactionContacts.ContactAddressCity as City, dbo.AppTransactionContacts.ContactAddressState as State, dbo.AppTransactionContacts.ContactAddressPostalCode as PostalCode, dbo.AppTransactionContacts.ContactAddressCountryId as CountryId, dbo.AppTransactionContacts.ContactAddressCountryCode as CountryCode, \r\n                         dbo.AppTransactionContacts.ContactSSIN as AccountId\r\nFROM  dbo.AppTransactionContacts where dbo.AppTransactionContacts.IsDeleted=0 \r\nGO ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("CREATE OR ALTER VIEW [dbo].[vw_contact_address]\r\nAS\r\nSELECT        TOP (1) dbo.AppTransactionContacts.ContactRole, dbo.AppTransactionContacts.TransactionId, dbo.AppAddresses.Id, dbo.AppAddresses.CreationTime, dbo.AppAddresses.CreatorUserId, dbo.AppAddresses.LastModificationTime, \r\n                         dbo.AppAddresses.LastModifierUserId, dbo.AppAddresses.IsDeleted, dbo.AppAddresses.DeleterUserId, dbo.AppAddresses.DeletionTime, dbo.AppAddresses.TenantId, dbo.AppAddresses.Code, dbo.AppAddresses.Name, \r\n                         dbo.AppAddresses.AddressLine1, dbo.AppAddresses.AddressLine2, dbo.AppAddresses.City, dbo.AppAddresses.State, dbo.AppAddresses.PostalCode, dbo.AppAddresses.CountryId, dbo.AppAddresses.CountryCode, \r\n                         dbo.AppAddresses.AccountId\r\nFROM            dbo.AppTransactionContacts INNER JOIN\r\n                         dbo.AppAddresses ON dbo.AppTransactionContacts.ContactAddressId = dbo.AppAddresses.Id\r\nGO\r\n");
        }
    }
}
