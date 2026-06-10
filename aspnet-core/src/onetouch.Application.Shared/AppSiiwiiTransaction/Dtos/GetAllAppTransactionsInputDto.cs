using Abp.Application.Services.Dto;
using onetouch.AppPosts.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppSiiwiiTransaction.Dtos
{
    public class GetAllAppTransactionsInputDto : PagedAndSortedResultRequestDto
    {
        public Boolean WithDetails { get; set; }
        public long Since_Id { get; set; }
        public string At_Id { get; set; }

        public string Filter { get; set; }
        public string CodeFilter { get; set; }
        public string DescriptionFilter { get; set; }
        public long? EntityTypeIdFilter { get; set; } = null;
        public DateTime? FromCreationDateFilter { set; get; } = DateTime.MinValue;
        public DateTime? ToCreationDateFilter { set; get; } = DateTime.MinValue;
        public DateTime? FromCompleteDateFilter { set; get; } = DateTime.MinValue;
        public DateTime? ToCompleteDateFilter { set; get; } = DateTime.MinValue;
        public string SellerName { get; set; }
        public string SellerSSIN { get; set; }
        public string BuyerName { get; set; }
        public string BuyerSSIN { get; set; }
        public long StatusId { get; set; }
        public bool fromExport { set; get; } = false;
        public bool hasParentItems { set; get; } = false;
        public string? TimeZoneValue { get; set; }
        //I45
        public string? ReferenceFilter { get; set; }
        //I45
    }
  
}
