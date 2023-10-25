using Abp.Application.Services.Dto;
using onetouch.AppEntities.Dtos;
using System;
using System.Collections.Generic;
using System.Text;
using onetouch.Authorization.Users.Profile.Dto;

namespace onetouch.Message.Dto
{
   public  class MessagesDto : EntityDto<long>
    {
        public List<MessagesDto> ParentFKList { get; set; }
        public bool HasChildren { get; set; }
        public int? TenantId { get; set; }
        public long? SenderId { get; set; }
        public string EntityObjectTypeCode { get; set; }
        public virtual string To { get; set; }

        public virtual string CC { get; set; }

        public virtual string BCC { get; set; }

        public virtual string Subject { get; set; }

        public virtual string Body { get; set; }

        public virtual string BodyFormat { get; set; }

        public virtual DateTime SendDate { get; set; }

        public virtual DateTime ReceiveDate { get; set; }

        public int? EntityId { get; set; }

        public virtual string EntityCode { get; set; }

        public long? ParentId { get; set; }
        public virtual string ParentCode { get; set; }
        public long? ThreadId { get; set; }
        public long? UserId { get; set; }

        public  string SenderName { get; set; }
        public string ToName { get; set; }

        public bool IsFavorite { get; set; }
        public virtual string EntityObjectStatusCode { get; set; }
        public virtual IList<AppEntityAttachmentDto> EntityAttachments { get; set; }

        public  string RecipientsName { get; set; }

        public MesasgeObjectType MesasgeObjectType { get; set; }

        public long? RelatedEntityId { get; set; }
        public Guid ProfilePictureId { get; set; }
        public GetProfilePictureOutput UserImage { get; set; }

        public string ProfilePictureUrl { get; set; }

    }

}
