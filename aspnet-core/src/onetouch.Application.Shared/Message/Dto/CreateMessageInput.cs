using onetouch.AppEntities.Dtos;
using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.Message.Dto
{
    public class CreateMessageInput
    {
        public long? RelatedEntityId { get; set; }

        public string Code { get; set; }

        public long? SenderId { get; set; }

        public virtual string To { get; set; }

        public virtual string CC { get; set; }

        public virtual string BCC { get; set; }

        public virtual string Subject { get; set; }

        public virtual string Body { get; set; }

        public virtual string BodyFormat { get; set; }
        public virtual DateTime SendDate { get; set; }

        public virtual DateTime ReceiveDate { get; set; }

        public int? ParentId { get; set; }

        public int? ThreadId { get; set; }

        public MesasgeObjectType? MesasgeObjectType { get; set;}

        public virtual IList<AppEntityAttachmentDto> EntityAttachments { get; set; }
        public string? MessageCategory { get; set; }
        public List<MentionedUserInfo> MentionedUsers { set; get; }
    }

    public enum MesasgeObjectType
    {
        Message=0,
        Comment=1,
    }
    public class MentionedUserInfo
    { 
        public long UserId { set; get; }
        public long TenantId { set; get; }
    }
}
