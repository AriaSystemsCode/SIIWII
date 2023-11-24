using Abp.Application.Services.Dto;
using onetouch.AppEntities.Dtos;
using onetouch.AppItemsLists.Dtos;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace onetouch.AppItems.Dtos
{
    public class AppItemVariationDto : EntityDto<long>
    {
        public virtual long ItemId { get; set; }

        [StringLength(AppItemConsts.MaxCodeLength, MinimumLength = AppItemConsts.MinCodeLength)]
        public virtual string ItemCode { get; set; }

        [StringLength(AppItemConsts.MaxNameLength, MinimumLength = AppItemConsts.MinNameLength)]
        public virtual string ItemName { get; set; }

        public virtual decimal Price { get; set; }

        public virtual string ImgURL { get; set; }

        public virtual StateEnum State { get; set; }

        public IList<AppEntityExtraDataDto> EntityExtraData { get; set; }

        public virtual IList<AppEntityAttachmentDto> EntityAttachments { get; set; }
    }

}
