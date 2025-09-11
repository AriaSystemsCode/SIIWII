 
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
 
using Abp.Domain.Entities;
using Abp.Auditing;
using onetouch.AutoTaskTicketNotes;
using onetouch.AutoTaskTickets;

namespace onetouch.AutoTaskAttachmentInfo{
    [Table("AttachmentInfo")]
    [Audited]
    public class AttachmentInfo : Entity<long>, IMayHaveTenant
    {
        public int? TenantId { get; set; }

        public virtual long? RefID { get; set; }
        public virtual DateTime? AttachDate { get; set; }
        public virtual long? AttachedByContactID { get; set; }
        public virtual long? AttachedByResourceID { get; set; }
        [StringLength(AttachmentInfoConsts.MaxContentTypeLength, MinimumLength = AttachmentInfoConsts.MinContentTypeLength)]
        public virtual string? ContentType { get; set; }
        public virtual int? CreatorType { get; set; }
        public virtual long? FileSize { get; set; }
        [StringLength(AttachmentInfoConsts.MaxFullPathLength, MinimumLength = AttachmentInfoConsts.MinFullPathLength)]
        public virtual string? FullPath { get; set; }
        public virtual int? ImpersonatorCreatorResourceID { get; set; }
        public virtual long? OpportunityID { get; set; }
        public virtual long? ParentID { get; set; }
        public virtual int? ParentType { get; set; }
        public virtual int? Publish { get; set; }
        [StringLength(AttachmentInfoConsts.MaxTitleLength, MinimumLength = AttachmentInfoConsts.MinTitleLength)]
        public virtual string Title { get; set; }
        [StringLength(AttachmentInfoConsts.MaxTitleLength, MinimumLength = AttachmentInfoConsts.MinTitleLength)]
        public virtual string Type { get; set; }
        public virtual long? TicketId { get; set; }
        
        [ForeignKey("TicketId")]
        public Ticket TicketFk { get; set; }

        public virtual long? TicketNoteId { get; set; }

        [ForeignKey("TicketNoteId")]
        public TicketNote TicketNoteFk { get; set; }


    }
}