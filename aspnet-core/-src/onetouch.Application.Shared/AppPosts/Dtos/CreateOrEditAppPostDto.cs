using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using onetouch.AutoTaskTicketNotes.Dtos;
using onetouch.AppEntities.Dtos;

namespace onetouch.AppPosts.Dtos
{
    public class CreateOrEditAppPostDto : EntityDto<long?>
    {

        [StringLength(AppPostConsts.MaxCodeLength, MinimumLength = AppPostConsts.MinCodeLength)]
        public string Code { get; set; }

        [StringLength(AppPostConsts.MaxDescriptionLength, MinimumLength = AppPostConsts.MinDescriptionLength)]
        public string Description { get; set; }
        
        public long? RelatedEntityId { get; set; }

        public string UrlTitle { get; set; }
        public PostType Type { get; set; }

        public long? AppContactId { get; set; }

        public long? AppEntityId { get; set; }
        
        public long? CreatorUserId { get; set; }
        public long? TenantId { get; set; }
        public string UserName { get; set; }
        public string TenantName { get; set; }
        
        public Guid ProfilePictureId { get; set; }
        public string UserImage { get; set; }

        public System.DateTime CreationDatetime { get; set; }

        public bool CanEdit { get; set; }

        public IList<AppEntityAttachmentDto> Attachments { get; set; }

    }

}