using System;
using Abp.Application.Services.Dto;

namespace onetouch.AppEventGuests.Dtos
{
    public class AppEventGuestDto : EntityDto<long>
    {
        public long EntityId { get; set; }
        public int ResponceId { get; set; }
        public ResponceType UserResponceType { get; set; }
        public long? UserId { get; set; }
        public long EventId { get; set; }
    }
    public enum ResponceType
    {
        OTHER,
        INTEREST,
        GOING,
        MAYBE,
        CANNOTGO,
        INVITE,
        NOTINTEREST
    }
}
