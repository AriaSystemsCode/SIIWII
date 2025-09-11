using Abp.Application.Services.Dto;
using System;

namespace onetouch.SycPlans.Dtos
{
    public class GetAllSycPlansForExcelInput
    {
        public string Filter { get; set; }

        public string CodeFilter { get; set; }

        public string NameFilter { get; set; }

        public string NotesFilter { get; set; }

        public string SycApplicationNameFilter { get; set; }

    }
}