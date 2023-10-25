using System;
using System.Collections.Generic;
using System.Text;
using Abp.Application.Services.Dto;

namespace onetouch.AppEntities.Dtos
{
    public class TopContributor : EntityDto<long>
    {
        public long MemberId { get; set; }
        public string UserName { get; set; }
        public string ProfileImageUrl { get; set; }
        public string JobTitle { get; set; }
    }
}
