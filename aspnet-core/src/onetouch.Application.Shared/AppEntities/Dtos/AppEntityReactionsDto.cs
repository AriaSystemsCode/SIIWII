using onetouch.SystemObjects;
using onetouch.SystemObjects;
using onetouch.SystemObjects;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using Abp.Application.Services.Dto;

namespace onetouch.AppEntities.Dtos
{
    public class AppEntityReactionsDto : EntityDto<long>
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