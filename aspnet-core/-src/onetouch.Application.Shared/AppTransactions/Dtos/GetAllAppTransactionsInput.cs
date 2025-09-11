using Abp.Application.Services.Dto;
using System;

namespace onetouch.AppTransactions.Dtos
{
    public class GetAllAppTransactionsInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }

        public string CodeFilter { get; set; }

        public DateTime? MaxDateFilter { get; set; }
        public DateTime? MinDateFilter { get; set; }

        public DateTime? MaxAddDateFilter { get; set; }
        public DateTime? MinAddDateFilter { get; set; }

        public DateTime? MaxEndDateFilter { get; set; }
        public DateTime? MinEndDateFilter { get; set; }

    }
}