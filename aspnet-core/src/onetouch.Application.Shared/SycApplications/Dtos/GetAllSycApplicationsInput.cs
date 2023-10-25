using Abp.Application.Services.Dto;
using System;

namespace onetouch.SycApplications.Dtos
{
    public class GetAllSycApplicationsInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }

        public string CodeFilter { get; set; }

        public string NameFilter { get; set; }

        public string NotesFilter { get; set; }

    }
}