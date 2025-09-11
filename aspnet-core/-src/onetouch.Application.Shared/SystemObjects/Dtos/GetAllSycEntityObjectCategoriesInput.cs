using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;

namespace onetouch.SystemObjects.Dtos
{
    public class GetAllSycEntityObjectCategoriesInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }

        public string CodeFilter { get; set; }

        public string NameFilter { get; set; }

        public string SydObjectNameFilter { get; set; }

        public string SycEntityObjectCategoryNameFilter { get; set; }

        public bool Eagger { get; set; }

        public long ObjectId { get; set; }

        public long ParentId { get; set; }

        public bool DepartmentFlag { get; set; } = true;

        public long EntityId { get; set;  }
        public List<long> ExcludeIds { get; set; }

    }
}