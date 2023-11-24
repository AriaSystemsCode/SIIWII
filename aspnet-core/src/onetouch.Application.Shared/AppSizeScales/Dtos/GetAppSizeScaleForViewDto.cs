using Abp.Application.Services.Dto;
using onetouch.AccountInfos.Dtos;
using onetouch.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace onetouch.AppSizeScales.Dtos
{
    public class GetAppSizeScaleForViewDto : EntityDto<long?>
    {
        public virtual string Code { get; set; }
        public virtual string Name { get; set; }

    }
    public class AppSizeScalesHeaderDto : EntityDto<long?>
    {
        public long? ParentId { get; set; }
        public virtual string Code { get; set; }
        public virtual int NoOfDimensions { get; set; }
        public virtual bool IsDefault { get; set; }
        public virtual string Name { get; set; }
        public virtual string Dimesion1Name { get; set; }
        public virtual string Dimesion2Name { get; set; }
        public virtual string Dimesion3Name { get; set; }
        public virtual ICollection<AppSizeScalesDetailDto> AppSizeScalesDetails { get; set; }
    }
    public class AppSizeScalesDetailDto : EntityDto<long?>
    {

        public virtual string SizeCode { get; set; }
        public virtual int SizeRatio { get; set; }
        public virtual string D1Position { get; set; }
        public virtual string D2Position { get; set; }
        public virtual string D3Position { get; set; }
        public virtual long? SizeId { get; set; }
        public virtual string DimensionName { get; set; }

    }
    public class AppSizeScaleForEditDto : AppSizeScaleDto
    {
        [Required]
        public virtual string Name { get; set; }
    }
    public class AppSizeScaleDto : EntityDto<long?>
    {
        public virtual long? ParentId { set; get; }
        public virtual string Code { get; set; }
        public virtual int NoOfDimensions { get; set; }
        public virtual bool IsDefault { get; set; }
        [Required]
        public virtual string Dimesion1Name { get; set; }
        public virtual string Dimesion2Name { get; set; }
        public virtual string Dimesion3Name { get; set; }

        public virtual IList<AppSizeScalesDetailDto> AppSizeScalesDetails { get; set; }
    }
}
