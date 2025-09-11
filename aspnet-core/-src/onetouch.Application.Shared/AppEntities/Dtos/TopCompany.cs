using System;
using System.Collections.Generic;
using System.Text;
using Abp.Application.Services.Dto;

namespace onetouch.AppEntities.Dtos
{
    public class TopCompany
    {
        public long AccountId { get; set; }
        public long TenantId { get; set; }
        public string AccountName { get; set; }
        public string LogoUrl { get; set; }
    }
}
