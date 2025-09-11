using Abp.Application.Services.Dto;
using System;

namespace onetouch.AppItemsLists.Dtos
{
    public class GetAllAppItemsListsInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }

        public ItemsListFilterTypesEnum FilterType { get; set; }

        public bool NoLimit { get; set; }
    }

    public enum ItemsListFilterTypesEnum
    {
        MyItemsList,
        SharedWithMe,
        Public
    }
}