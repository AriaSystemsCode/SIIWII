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
using onetouch.SystemObjects;
using System.Net;
using onetouch.AppContacts;

namespace onetouch.AppSiiwiiTransaction.Dtos
{
    public class AppTransactionsDetailDto : EntityDto<long?>
    {
        [StringLength(AppTransactionConst.MaxItemCodeLength, MinimumLength = AppTransactionConst.MinItemCodeLength)]
        public string TransactionCode { get; set; }

        public virtual int LineNo { set; get; }
        public virtual double Quantity { set; get; }
        [Column(TypeName = "decimal(15, 3)")]
        public virtual decimal GrossPrice { set; get; }
        [Column(TypeName = "decimal(15, 3)")]
        public virtual decimal NetPrice { set; get; }
        [Column(TypeName = "decimal(8, 3)")]
        public virtual decimal Discount { set; get; }
        [Column(TypeName = "decimal(17, 3)")]
        public virtual decimal Amount { set; get; }
        // public virtual long EntityId { set; get; }
        public virtual long ItemId { set; get; }
        //[ForeignKey("ItemId")]
        //public virtual AppItem AppItemIdFk { get; set; }

        public virtual string ItemCode { set; get; }
        public virtual string ItemDescription { set; get; }

        public virtual string Note { set; get; }
        [StringLength(AppItemConsts.SSINLength, MinimumLength = AppItemConsts.SSINLength)]
        public virtual string SSIN { get; set; }
        public virtual string ManufacturerCode {  set; get; }
    }
    public class AppTransactionContactDto : EntityDto<long?>
    {
        public virtual long TransactionId { set; get; }
        [StringLength(AppTransactionConst.MaxSSINLength, MinimumLength = AppTransactionConst.MinSSINLength)]
        public virtual string ContactSSIN { set; get; }
        [StringLength(AppTransactionConst.MaxBuyerNameLength, MinimumLength = AppTransactionConst.MinBuyerNameLength)]
        public virtual string ContactName { set; get; }
        [StringLength(AppTransactionConst.MaxBuyerNameLength, MinimumLength = AppTransactionConst.MinBuyerNameLength)]
        public virtual string CompanyName { set; get; }
        [StringLength(AppTransactionConst.MaxEMailLength, MinimumLength = AppTransactionConst.MinEMailLength)]
        public virtual string ContactEmail { set; get; }
        [StringLength(AppTransactionConst.MaxPhoneNumberLength, MinimumLength = AppTransactionConst.MinPhoneNumberLength)]
        public virtual string ContactPhoneNumber { set; get; }
        public virtual ContactRoleEnum ContactRole { set; get; }
        [StringLength(AppTransactionConst.MaxBuyerNameLength, MinimumLength = AppTransactionConst.MinBuyerNameLength)]
        public virtual string BranchName { set; get; }
        [StringLength(AppTransactionConst.MaxSSINLength, MinimumLength = AppTransactionConst.MinSSINLength)]
        public virtual string CompanySSIN { set; get; }
        [StringLength(AppTransactionConst.MaxSSINLength, MinimumLength = AppTransactionConst.MinSSINLength)]
        public virtual string BranchSSIN { set; get; }
        [StringLength(AppContactConsts.MaxNameLength, MinimumLength = AppContactConsts.MinNameLength)]
        public virtual string ContactPhoneTypeName { get; set; }
        public virtual long? ContactPhoneTypeId { get; set; }
      
        public virtual long? ContactAddressId { set; get; }
     
        [StringLength(AppContactConsts.MaxCodeLength, MinimumLength = AppContactConsts.MinCodeLength)]
        public virtual string ContactAddressCode { set; get; }
        //public virtual AppAddressDto ContactAddressDetail { set; get; }
        public virtual ContactAppAddressDto ContactAddressDetail { set; get; }

        public virtual GetAccountInformationOutputDto selectedCompany { set; get; }
        public virtual GetContactInformationDto selectedContact { set; get; }
        public virtual AccountBranchDto selectedBranch { set; get; }
        public virtual PhoneNumberAndtype selectedPhoneType { set; get; }
        public virtual string selectContactPhoneNumber { set; get; }
        public virtual string selectedContactEmail { set; get; }


        //Iteration37-MMT[Start]
        [StringLength(AppAddressConsts.MaxNameLength, MinimumLength = AppAddressConsts.MinNameLength)]
        public virtual string ContactAddressName { get; set; }

        [StringLength(AppAddressConsts.MaxNameLength, MinimumLength = AppAddressConsts.MinNameLength)]
        public virtual string ContactAddressLine1 { get; set; }

        [StringLength(AppAddressConsts.MaxNameLength, MinimumLength = AppAddressConsts.MinNameLength)]
        public virtual string ContactAddressLine2 { get; set; }

        [StringLength(AppAddressConsts.MaxCodeLength, MinimumLength = AppAddressConsts.MinCodeLength)]
        public virtual string ContactAddressCity { get; set; }

        [StringLength(AppAddressConsts.MaxStateLength, MinimumLength = AppAddressConsts.MinStateLength)]
        public virtual string ContactAddressState { get; set; }

        [StringLength(AppAddressConsts.MaxStateLength, MinimumLength = AppAddressConsts.MinStateLength)]
        public virtual string ContactAddressPostalCode { get; set; }

        public virtual long ContactAddressCountryId { get; set; }

        [StringLength(AppAddressConsts.MaxCodeLength, MinimumLength = AppAddressConsts.MinCodeLength)]
        public virtual string ContactAddressCountryCode { get; set; }
        //Iteration37-MMT[End]

    }
    public class ContactAppAddressDto : AppAddressDto
    {
        //
        public string ContactEmail { set; get; }
        public string ContactPhone{ set; get; }

        //
    }
}
