using System;
using Abp.Application.Services.Dto;
using onetouch.Authorization.Users.Profile.Dto;

namespace onetouch.AppPosts.Dtos
{
    public class AppPostDto : EntityDto<long>
    {
        public string Code { get; set; }

        public string Description { get; set; }

        public long? TenantId { get; set; }

        public long? AppContactId { get; set; }

        public long? AppEntityId { get; set; }

        public long? CreatorUserId { get; set; }

        public string UserName { get; set; }
        public string AccountName { get; set; }
        public long AccountId { get; set; }

        public Guid ProfilePictureId { get; set; }
        public GetProfilePictureOutput UserImage { get; set; }

        public System.DateTime CreationDatetime { get; set; }
        public string EmbeddedLink { get; set; }
        public string ProfilePictureUrl { get; set; }

    }
}