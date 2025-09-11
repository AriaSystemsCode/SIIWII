using Abp.Application.Services.Dto;
using onetouch.AppPosts.Dtos;
using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.AppEntities.Dtos
{
    public class TopPostDto : EntityDto<long>
    {
        public long UserId { get; set; }
        public AppPostDto AppPost { get; set; }
        public string UserName { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public string CreatedOn { get; set; }

        public string Type { get; set; }
    }
}