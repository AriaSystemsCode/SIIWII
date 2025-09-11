using System;
using Abp.Application.Services.Dto;

namespace onetouch.AppTransactions.Dtos
{
    public class AppTransactionDto : EntityDto
    {
        public string Code { get; set; }

        public DateTime Date { get; set; }

        public DateTime AddDate { get; set; }

        public DateTime EndDate { get; set; }

    }
}