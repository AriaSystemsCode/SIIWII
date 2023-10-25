using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AppAdvertisements.Dtos
{
    public class GetAppAdvertisementForEditOutput
    {
        public CreateOrEditAppAdvertisementDto AppAdvertisement { get; set; }

        public string AppEntityName { get; set; }

        public string UserName { get; set; }
    }
}