using Abp.Application.Services.Dto;
using System;

namespace onetouch.AppItemsLists.Dtos
{
    public class GetDetailsInput : PagedAndSortedResultRequestDto
    {
        public long ItemListId { get; set; }
        public long ItemId { get; set; }
    }
}