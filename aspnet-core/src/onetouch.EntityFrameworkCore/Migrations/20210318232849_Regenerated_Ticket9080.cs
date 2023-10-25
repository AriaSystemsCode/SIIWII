using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Regenerated_Ticket9080 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AEMAlertID",
                table: "Tickets",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AccountID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "AccountPhysicalLocationID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "AllocationCodeID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ApiVendorID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "AssignedResourceID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "AssignedResourceRoleID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "BusinessDivisionSubdivisionID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ChangeApprovalBoard",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ChangeApprovalStatus",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ChangeApprovalType",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ChangeInfoField1",
                table: "Tickets",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ChangeInfoField2",
                table: "Tickets",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ChangeInfoField3",
                table: "Tickets",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ChangeInfoField4",
                table: "Tickets",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ChangeInfoField5",
                table: "Tickets",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CompletedByResourceID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedDate",
                table: "Tickets",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "ContactID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ContractID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<long>(
                name: "ContractServiceBundleID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "ContractServiceID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<int>(
                name: "CreateDate",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CreatedByContactID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CreatorResourceID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CreatorType",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CurrentServiceThermometerRating",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Tickets",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DueDateTime",
                table: "Tickets",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<double>(
                name: "EstimatedHours",
                table: "Tickets",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "ExternalID",
                table: "Tickets",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FirstResponseAssignedResourceID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "FirstResponseDateTime",
                table: "Tickets",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "FirstResponseDueDateTime",
                table: "Tickets",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "FirstResponseInitiatingResourceID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "HoursToBeScheduled",
                table: "Tickets",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "ImpersonatorCreatorResourceID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "InstalledProductID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "IssueType",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastActivityDate",
                table: "Tickets",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "LastActivityPersonType",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "LastActivityResourceID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastCustomerNotificationDateTime",
                table: "Tickets",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "LastCustomerVisibleActivityDateTime",
                table: "Tickets",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "LastTrackedModificationDateTime",
                table: "Tickets",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "MonitorID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MonitorTypeID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "OpportunityId",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PreviousServiceThermometerRating",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Priority",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ProblemTicketId",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ProjectID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PurchaseOrderNumber",
                table: "Tickets",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "QueueID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RefTicketID",
                table: "Tickets",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AEMAlertID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "AccountID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "AccountPhysicalLocationID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "AllocationCodeID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "ApiVendorID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "AssignedResourceID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "AssignedResourceRoleID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "BusinessDivisionSubdivisionID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "ChangeApprovalBoard",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "ChangeApprovalStatus",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "ChangeApprovalType",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "ChangeInfoField1",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "ChangeInfoField2",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "ChangeInfoField3",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "ChangeInfoField4",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "ChangeInfoField5",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "CompletedByResourceID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "CompletedDate",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "ContactID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "ContractID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "ContractServiceBundleID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "ContractServiceID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "CreateDate",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "CreatedByContactID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "CreatorResourceID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "CreatorType",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "CurrentServiceThermometerRating",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "DueDateTime",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "EstimatedHours",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "ExternalID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "FirstResponseAssignedResourceID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "FirstResponseDateTime",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "FirstResponseDueDateTime",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "FirstResponseInitiatingResourceID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "HoursToBeScheduled",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "ImpersonatorCreatorResourceID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "InstalledProductID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "IssueType",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "LastActivityDate",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "LastActivityPersonType",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "LastActivityResourceID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "LastCustomerNotificationDateTime",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "LastCustomerVisibleActivityDateTime",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "LastTrackedModificationDateTime",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "MonitorID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "MonitorTypeID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "OpportunityId",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "PreviousServiceThermometerRating",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "ProblemTicketId",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "ProjectID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "PurchaseOrderNumber",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "QueueID",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "RefTicketID",
                table: "Tickets");
        }
    }
}
