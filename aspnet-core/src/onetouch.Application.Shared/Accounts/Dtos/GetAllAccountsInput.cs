using Abp.Application.Services.Dto;
using System;

namespace onetouch.Accounts.Dtos
{    
    public class GetAllAccountsInput : PagedAndSortedResultRequestDto
    {
		public string Filter { get; set; }

        public byte FilterType { get; set; }

        public string Name { get; set; }

        public string Address { get; set; }
        
        public string City { get; set; }

        public string State { get; set; }

        public string Postal { get; set; }

        public long[] AccountTypes { get; set; }
        
        public long[] Status { get; set; }

        public long[] Languages { get; set; }

        public long[] Countries { get; set; }

        public long[] Classifications { get; set; }

        public long[] Categories { get; set; }

        public long[] Curruncies { get; set; }

    }
}