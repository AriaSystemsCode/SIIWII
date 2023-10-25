
using System;
using Abp.Application.Services.Dto;
using onetouch.Accounts.Dtos;

namespace onetouch.AccountInfos.Dtos
{
    public class BranchForViewDto : EntityDto<long>
    {

		public BranchDto Branch { get; set; }

		public int SubTotal { get; set; }

    }

    public class ContactForViewDto : EntityDto<long>
    {
        public ContactDto Contact { get; set; }

        public int SubTotal { get; set; }

    }
    //Mariam[Start]
    public class ContactForEditDto : EntityDto<long>
    {
        public ContactDto Contact { get; set; }
        public string BranchName { get; set; }

        public string City { get; set; }

        public string State { get; set; }

        public string ZipCode { get; set; }

        public string AddressLine1 { get; set; }

        public string AddressLine2 { get; set; }

        public long CountryId { get; set; }

        public string CountryName { get; set; }
        public string ImageUrl { get; set; }

        public string CoverUrl { get; set; }
    }
    //Mariam[End]
}