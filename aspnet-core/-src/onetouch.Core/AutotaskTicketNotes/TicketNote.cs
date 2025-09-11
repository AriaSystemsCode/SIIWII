using onetouch.AutoTaskTickets;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using System.Collections.Generic;
using onetouch.AutoTaskAttachmentInfo;

namespace onetouch.AutoTaskTicketNotes
{
    [Table("TicketNotes")]
    [Audited]
    public class TicketNote : FullAuditedEntity<long>, IMayHaveTenant
    {
        public int? TenantId { get; set; }

        public virtual long? RefTicketID { get; set; }

        [StringLength(TicketNoteConsts.MaxTitleLength, MinimumLength = TicketNoteConsts.MinTitleLength)]
        public virtual string Title { get; set; }
        
        public virtual int? Publish { get; set; }

        public virtual int? NoteType { get; set; }

        public virtual DateTime? LastActivityDate { get; set; }

        public virtual int? ImpersonatorUpdaterResourceID { get; set; }

        public virtual int? ImpersonatorCreatorResourceID { get; set; }

        public virtual string Description { get; set; }

        public virtual int? CreatorResourceID { get; set; }

        public virtual int? CreatedByContactID { get; set; }

        public virtual DateTime? CreateDateTime { get; set; }

        public virtual long? RefTicketNoteID { get; set; }

        public virtual long? TicketId { get; set; }

        [ForeignKey("TicketId")]
        public Ticket TicketFk { get; set; }

        public virtual IList<AttachmentInfo> EntityAttachments { get; set; }
    }
}