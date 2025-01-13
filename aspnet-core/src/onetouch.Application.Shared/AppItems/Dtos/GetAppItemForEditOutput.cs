using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;
using onetouch.AppEntities.Dtos;
using System.Collections.Generic;

namespace onetouch.AppItems.Dtos
{
    public class GetAppItemForEditOutput
    {
        public AppItemForEditDto AppItem { get; set; }
        //MMT-IT41[Start]
        public IList<LookupLabelDto> NonLookupValues { set; get; }
        //MMT-IT41[End]

    }
}