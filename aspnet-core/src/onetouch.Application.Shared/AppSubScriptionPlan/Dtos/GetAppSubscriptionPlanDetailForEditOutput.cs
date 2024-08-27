using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AppSubScriptionPlan.Dtos
{
    public class GetAppSubscriptionPlanDetailForEditOutput
    {
        public CreateOrEditAppSubscriptionPlanDetailDto AppSubscriptionPlanDetail { get; set; }

        public string AppSubscriptionPlanHeader { get; set; }

        public string AppFeatureDescription { get; set; }

    }
}