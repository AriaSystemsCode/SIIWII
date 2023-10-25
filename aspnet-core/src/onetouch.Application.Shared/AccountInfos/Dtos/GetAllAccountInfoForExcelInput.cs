using Abp.Application.Services.Dto;
using System;

namespace onetouch.AccountInfos.Dtos
{
    public class GetAllAccountInfoForExcelInput
    {
		public string Filter { get; set; }

		public string CodeFilter { get; set; }

		public string TradeNameFilter { get; set; }

		public byte? MaxAccountTypeFilter { get; set; }
		public byte? MinAccountTypeFilter { get; set; }

		public string NotesFilter { get; set; }

		public string WebsiteFilter { get; set; }

		public string NameFilter { get; set; }

		public string Phone1NumberFilter { get; set; }

		public string Phone1ExFilter { get; set; }

		public string Phone2NumberFilter { get; set; }

		public string Phone2ExFilter { get; set; }

		public string Phone3NumberFilter { get; set; }

		public string Phone3ExFilter { get; set; }

		public string EMailAddressFilter { get; set; }


		 public string AppEntityNameFilter { get; set; }

		 		 public string AppEntityName2Filter { get; set; }

		 		 public string AppEntityName3Filter { get; set; }

		 		 public string AppEntityName4Filter { get; set; }

		 		 public string AppEntityName5Filter { get; set; }

		 
    }
}