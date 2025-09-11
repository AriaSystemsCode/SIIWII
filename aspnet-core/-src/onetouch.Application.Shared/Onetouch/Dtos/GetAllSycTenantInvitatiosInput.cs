using Abp.Application.Services.Dto;
using System;

namespace onetouch.Onetouch.Dtos
{
    public class GetAllSycTenantInvitatiosInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }

    }
}