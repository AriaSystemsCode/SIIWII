using Abp.Application.Services.Dto;

namespace onetouch.AppPosts.Dtos
{
    public class AppPostAppEntityLookupTableDto
    {
        public long Id { get; set; }

        public string DisplayName { get; set; }
        public string UserName { get; set; }

        public string UserImage { get; set; }

        public System.DateTime CreationDatetime { get; set; }
    }
}