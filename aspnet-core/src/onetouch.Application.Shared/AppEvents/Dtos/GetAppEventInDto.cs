using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AppEvents.Dtos
{ 
    public class GetAppEventInDto : EntityDto<long>
    {
        public virtual long? IdFilter { get; set; }
        public virtual long? EntityIdFilter { get; set; }
    }

}