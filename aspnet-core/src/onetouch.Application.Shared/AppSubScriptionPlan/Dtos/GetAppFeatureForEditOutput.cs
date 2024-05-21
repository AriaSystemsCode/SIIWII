using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AppSubScriptionPlan.Dtos
{
    public class GetAppFeatureForEditOutput
    {
        public CreateOrEditAppFeatureDto AppFeature { get; set; }

    }
}