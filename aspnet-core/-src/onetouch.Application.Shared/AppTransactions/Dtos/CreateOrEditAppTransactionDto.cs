using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AppTransactions.Dtos
{
    public class CreateOrEditAppTransactionDto : EntityDto<int?>
    {

        [Required]
        [StringLength(AppTransactionConsts.MaxCodeLength, MinimumLength = AppTransactionConsts.MinCodeLength)]
        public string Code { get; set; }

        public DateTime Date { get; set; }

        public DateTime AddDate { get; set; }

        public DateTime EndDate { get; set; }

    }
}