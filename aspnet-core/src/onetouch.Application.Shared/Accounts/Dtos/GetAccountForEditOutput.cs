using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.Accounts.Dtos
{
    public class GetAccountForEditOutput
    {
		public CreateOrEditAccountDto Account { get; set; }

		public string AppEntityName { get; set;}


    }
}