using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AppItemsLists.Dtos
{
    public class GetAppItemsListForEditOutput
    {
        public CreateOrEditAppItemsListDto AppItemsList { get; set; }
        public long? TenantId { get; set; }
        //MMT33-2
        public virtual bool ShowSync { set; get; }
        public virtual DateTime LastModifiedDate { set; get; }
        public virtual long NumberOfSubscribers { set; get; }
        //MMT33-2
    }
}