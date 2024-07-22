
using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using onetouch.AppEntities.Dtos;
using onetouch.Common;
using onetouch.AppContacts.Dtos;

namespace onetouch.AccountInfos.Dtos
{
    public enum AccountLevelEnum
    {
        Profile,
        Manual,
        External
    }
    public enum SourceAccountEnum
    {
        Manual,
        External
    }
    public enum TargetAccountEnum
    {
        Manual,
        External,
        NewTenant
    }

    public class CreateOrEditAccountInfoDto : EntityDto<long?>
    {
        private AccountLevelEnum accountLevel= AccountLevelEnum.Profile;

        public string FileToken { get; set; }

        //[Required]
        [StringLength(AccountInfoTempConsts.MaxTradeNameLength, MinimumLength = AccountInfoTempConsts.MinTradeNameLength)]
        public string TradeName { get; set; }


        public string AccountType { get; set; }
        public long AccountTypeId { get; set; }
        public string SSIN { get; set; }
        public string PriceLevel { get; set; }

        public string Notes { get; set; }


        [StringLength(AccountInfoTempConsts.MaxWebsiteLength, MinimumLength = AccountInfoTempConsts.MinWebsiteLength)]
        public string Website { get; set; }


        [Required]
        [StringLength(AccountInfoTempConsts.MaxNameLength, MinimumLength = AccountInfoTempConsts.MinNameLength)]
        public string Name { get; set; }

        public string Code { get; set; }

        //[StringLength(AccountInfoTempConsts.MaxPhone1NumberLength, MinimumLength = AccountInfoTempConsts.MinPhone1NumberLength)]
        public string Phone1Number { get; set; }


        //[StringLength(AccountInfoTempConsts.MaxPhone1ExLength, MinimumLength = AccountInfoTempConsts.MinPhone1ExLength)]
        public string Phone1Ex { get; set; }


        //[StringLength(AccountInfoTempConsts.MaxPhone2NumberLength, MinimumLength = AccountInfoTempConsts.MinPhone2NumberLength)]
        public string Phone2Number { get; set; }


        //[StringLength(AccountInfoTempConsts.MaxPhone2ExLength, MinimumLength = AccountInfoTempConsts.MinPhone2ExLength)]
        public string Phone2Ex { get; set; }


       /// [StringLength(AccountInfoTempConsts.MaxPhone3NumberLength, MinimumLength = AccountInfoTempConsts.MinPhone3NumberLength)]
        public string Phone3Number { get; set; }


       // [StringLength(AccountInfoTempConsts.MaxPhone3ExLength, MinimumLength = AccountInfoTempConsts.MinPhone3ExLength)]
        public string Phone3Ex { get; set; }


        [StringLength(AccountInfoTempConsts.MaxEMailAddressLength, MinimumLength = AccountInfoTempConsts.MinEMailAddressLength)]
        public string EMailAddress { get; set; }


        public long? Phone1TypeId { get; set; }

        public long? Phone2TypeId { get; set; }

        public long? Phone3TypeId { get; set; }

        public long? CurrencyId { get; set; }

        public long? LanguageId { get; set; }
        public long? EntityId { get; set; }
        public int? TenantId { get; set; }
        public int? AttachmentSourceTenantId { get; set; }
        public bool UseDTOTenant { get; set; }
        public bool ReturnId { get; set; }

        public AccountLevelEnum AccountLevel { get => accountLevel; set => accountLevel = value; }

        public virtual IList<AppEntityCategoryDto> EntityCategories { get; set; }
        public virtual IList<AppEntityClassificationDto> EntityClassifications { get; set; }

        public virtual IList<AppEntityAttachmentDto> EntityAttachments { get; set; }

        public virtual IList<TreeNode<BranchForViewDto>> Branches { get; set; }

        public virtual IList<AppContactAddressDto> ContactAddresses { get; set; }

        public virtual IList<AppContactPaymentMethodDto> ContactPaymentMethods { get; set; }

    }
}