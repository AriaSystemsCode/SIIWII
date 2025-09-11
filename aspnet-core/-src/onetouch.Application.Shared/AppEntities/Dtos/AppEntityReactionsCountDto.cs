using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.AppEntities.Dtos
{
    public class AppEntityReactionsCountDto : EntityDto<long>
    {
        
        public long ReactionsCount { get; set; }
        public long EntityCommentsCount { get; set; }
        public long ViewersCount { get; set; }
        public int LikeCount { get; set; }
        public int CelebrateCount { get; set; }
        public int LoverCount { get; set; }
        public int InsightfulCount { get; set; }
        public int CuriousCount { get; set; }
    }
}
