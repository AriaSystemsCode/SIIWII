using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AppEventGuests.Dtos
{
    public class GetAppEventGuestForEditOutput
    {
        public CreateOrEditAppEventGuestDto AppEventGuest { get; set; }

    }
}