using Castle.MicroKernel.SubSystems.Conversion;
using onetouch.AppItems;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;

namespace onetouch.AppSiiwiiTransaction.Dtos
{
    //public class AppTransactionsDetailDto : EntityDto<long?>
    //{
    //    [StringLength(AppTransactionConst.MaxItemCodeLength, MinimumLength = AppTransactionConst.MinItemCodeLength)]
    //    public string TransactionCode { get; set; }

    //    public virtual int LineNo { set; get; }
    //    public virtual double Quantity { set; get; }
    //    [Column(TypeName = "decimal(15, 3)")]
    //    public virtual decimal GrossPrice { set; get; }
    //    [Column(TypeName = "decimal(15, 3)")]
    //    public virtual decimal NetPrice { set; get; }
    //    [Column(TypeName = "decimal(8, 3)")]
    //    public virtual decimal Discount { set; get; }
    //    [Column(TypeName = "decimal(17, 3)")]
    //    public virtual decimal Amount { set; get; }
    //    // public virtual long EntityId { set; get; }
    //    public virtual long ItemId { set; get; }
    //    //[ForeignKey("ItemId")]
    //    //public virtual AppItem AppItemIdFk { get; set; }

    //    public virtual string ItemCode { set; get; }
    //    public virtual string ItemDescription { set; get; }

    //    public virtual string Note { set; get; }
    //    [StringLength(AppItemConsts.SSINLength, MinimumLength = AppItemConsts.SSINLength)]
    //    public virtual string SSIN { get; set; }
    //}
}
