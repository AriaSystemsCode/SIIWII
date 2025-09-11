using Abp.Application.Services.Dto;
using System;

namespace onetouch.SycServices.Dtos
{
    public class GetAllSycServicesForExcelInput
    {
        public string Filter { get; set; }

        public string CodeFilter { get; set; }

        public string DescriptionFilter { get; set; }

        public string UnitOfMeasureFilter { get; set; }

        public decimal? MaxUnitPriceFilter { get; set; }
        public decimal? MinUnitPriceFilter { get; set; }

        public string NotesFilter { get; set; }

    }
}