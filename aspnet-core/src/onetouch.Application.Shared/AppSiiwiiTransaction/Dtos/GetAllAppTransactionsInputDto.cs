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
        public string Filter { get; set; }
        public string CodeFilter { get; set; }
        public string DescriptionFilter { get; set; }
        public long? EntityTypeIdFilter { get; set; } = null;
        public DateTime? FromCreationDateFilter { set; get; } = null;
        public DateTime? ToCreationDateFilter { set; get; } = null;
        public DateTime? FromCompleteDateFilter { set; get; } = null;
        public DateTime? ToCompleteDateFilter { set; get; } = null;
        public string SellerName { get; set; }
        public string SellerSSIN { get; set; }
        public string BuyerName { get; set; }
        public string BuyerSSIN { get; set; }
        public long StatusId { get; set; }
    }
  
}
