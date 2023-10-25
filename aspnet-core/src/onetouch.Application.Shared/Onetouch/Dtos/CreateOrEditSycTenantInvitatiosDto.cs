using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.Onetouch.Dtos
{
    public class CreateOrEditSycTenantInvitatiosDto : EntityDto<long?>
    {
        public int Id { set; get; }
        public  long TenantId { get; set; }

        public  long PartnerId { get; set; }

        public  DateTime CreateDate { get; set; }
    }
}