using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AppEventGuests.Dtos
{
    public class CreateOrEditAppEventGuestDto : EntityDto<long?>
    {
        public virtual long EventId { get; set; }
        public virtual string Code { get; set; }

        public virtual ResponceType UserResponce { get; set; }

    }
}