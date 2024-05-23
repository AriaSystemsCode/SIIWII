using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.MarketplaceAccounts.Dtos
{
    public enum MemberFilterTypeEnum
    {
        Profile,
        View,
        MarketPlace
    }

    public class GetAllMembersInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
        public long? AccountId { get; set; }
        public MemberFilterTypeEnum FilterType { get; set; }
    }
}
