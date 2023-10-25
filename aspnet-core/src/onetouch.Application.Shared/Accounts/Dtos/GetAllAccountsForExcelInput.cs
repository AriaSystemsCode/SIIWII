using Abp.Application.Services.Dto;
using System;

namespace onetouch.Accounts.Dtos
{
    public class GetAllAccountsForExcelInput
    {
		public string Filter { get; set; }


		 public string AppEntityNameFilter { get; set; }

		 
    }
}