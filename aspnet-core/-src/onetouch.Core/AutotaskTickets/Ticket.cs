using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using System.Collections.Generic;
using onetouch.AutoTaskAttachmentInfo;

namespace onetouch.AutoTaskTickets
{
    [Table("Tickets")]
    [Audited]
    public class Ticket : FullAuditedEntity<long>, IMayHaveTenant
    {
        public int? TenantId { get; set; }

        [StringLength(TicketConsts.MaxTitleLength, MinimumLength = TicketConsts.MinTitleLength)]
        public virtual string Title { get; set; }

        public virtual int? TicketType { get; set; }

        [StringLength(TicketConsts.MaxTicketNumberLength, MinimumLength = TicketConsts.MinTicketNumberLength)]
        public virtual string TicketNumber { get; set; }

        public virtual int? TicketCategory { get; set; }

        public virtual int? SubIssueType { get; set; }

        public virtual int? Status { get; set; }

        public virtual int? Source { get; set; }

        public virtual int? ServiceThermometerTemperature { get; set; }

        public virtual decimal? ServiceLevelAgreementPausedNextEventHours { get; set; }

        public virtual int? ServiceLevelAgreementID { get; set; }

        public virtual bool? ServiceLevelAgreementHasBeenMet { get; set; }

        [StringLength(TicketConsts.MaxRMMAlertIDLength, MinimumLength = TicketConsts.MinRMMAlertIDLength)]
        public virtual string RMMAlertID { get; set; }

        public virtual int? RMAType { get; set; }

        public virtual int? RMAStatus { get; set; }

        public virtual DateTime? ResolvedDueDateTime { get; set; }

        public virtual DateTime? ResolvedDateTime { get; set; }

        public virtual DateTime? ResolutionPlanDueDateTime { get; set; }

        public virtual DateTime? ResolutionPlanDateTime { get; set; }

        public virtual string? Resolution { get; set; }

        public virtual long? RefTicketID { get; set; }

        public virtual int? AccountID { get; set; }

        public virtual int? AccountPhysicalLocationID { get; set; }

        [StringLength(TicketConsts.MaxAEMAlertIDLength, MinimumLength = TicketConsts.MinAEMAlertIDLength)]
        public virtual string AEMAlertID { get; set; }

        public virtual int? AllocationCodeID { get; set; }

        public virtual int? ApiVendorID { get; set; }

        public virtual int? AssignedResourceID { get; set; }

        public virtual int? AssignedResourceRoleID { get; set; }

        public virtual int? BusinessDivisionSubdivisionID { get; set; }

        public virtual int? ChangeApprovalBoard { get; set; }

        public virtual int? ChangeApprovalStatus { get; set; }

        public virtual int? ChangeApprovalType { get; set; }

        public virtual string ChangeInfoField1 { get; set; }

        public virtual string ChangeInfoField2 { get; set; }

        public virtual string ChangeInfoField3 { get; set; }

        public virtual string ChangeInfoField4 { get; set; }

        public virtual string ChangeInfoField5 { get; set; }

        public virtual int? CompletedByResourceID { get; set; }

        public virtual DateTime? CompletedDate { get; set; }

        public virtual int? ContactID { get; set; }

        public virtual int? ContractID { get; set; }

        public virtual long? ContractServiceBundleID { get; set; }

        public virtual long? ContractServiceID { get; set; }

        public virtual DateTime? CreateDate { get; set; }

        public virtual int? CreatedByContactID { get; set; }

        public virtual int? CreatorResourceID { get; set; }

        public virtual int? CreatorType { get; set; }

        public virtual int? CurrentServiceThermometerRating { get; set; }

        public virtual string Description { get; set; }

        public virtual DateTime? DueDateTime { get; set; }

        public virtual double? EstimatedHours { get; set; }

        public virtual string ExternalID { get; set; }

        public virtual int? FirstResponseAssignedResourceID { get; set; }

        public virtual DateTime? FirstResponseDateTime { get; set; }

        public virtual DateTime? FirstResponseDueDateTime { get; set; }

        public virtual int? FirstResponseInitiatingResourceID { get; set; }

        public virtual decimal? HoursToBeScheduled { get; set; }

        public virtual int? ImpersonatorCreatorResourceID { get; set; }

        public virtual int? InstalledProductID { get; set; }

        public virtual int? IssueType { get; set; }

        public virtual DateTime? LastActivityDate { get; set; }

        public virtual int? LastActivityPersonType { get; set; }

        public virtual int? LastActivityResourceID { get; set; }

        public virtual DateTime? LastCustomerNotificationDateTime { get; set; }

        public virtual DateTime? LastCustomerVisibleActivityDateTime { get; set; }

        public virtual DateTime? LastTrackedModificationDateTime { get; set; }

        public virtual int? MonitorID { get; set; }

        public virtual int? MonitorTypeID { get; set; }

        public virtual int? OpportunityId { get; set; }

        public virtual int? PreviousServiceThermometerRating { get; set; }

        public virtual int? Priority { get; set; }

        public virtual int? ProblemTicketId { get; set; }

        public virtual int? ProjectID { get; set; }

        [StringLength(TicketConsts.MaxPurchaseOrderNumberLength, MinimumLength = TicketConsts.MinPurchaseOrderNumberLength)]
        public virtual string PurchaseOrderNumber { get; set; }

        public virtual long? QueueID { get; set; }
        public virtual IList<AttachmentInfo> EntityAttachments { get; set; }
    }
}