using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AppTransactions.Dtos
{
    public class GetAppTransactionForEditOutput
    {
        public CreateOrEditAppTransactionDto AppTransaction { get; set; }

    }
}