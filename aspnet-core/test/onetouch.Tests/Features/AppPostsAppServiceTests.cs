using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.Localization;
using Abp.MultiTenancy;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using onetouch.AppEntities.Dtos;
using onetouch.AppEvents;
using onetouch.AppPosts;
using onetouch.Authorization.Users;
using onetouch.Authorization.Users.Dto;
using onetouch.Editions;
using onetouch.Editions.Dto;
using onetouch.Features;
using onetouch.Test.Base;
using Shouldly;
using Xunit;

namespace onetouch.Tests.Features
{
   // [TestClass()]
    public class AppPostsAppServiceTests : AppTestBase
    {
        private readonly onetouch.Helpers.ExcelHelper _excelHelper;
        private readonly onetouch.Helpers.Helper _ihelper;
        private readonly IAppPostsAppService _iAppPostsAppService;
        private readonly IAppEventsAppService _iAppEventsAppService;
        private long EventId = 0;
        private string EventName = "Event name";

        public AppPostsAppServiceTests()
        {
            LoginAsHostAdmin();
            _excelHelper = Resolve<onetouch.Helpers.ExcelHelper>();
            _ihelper = Resolve<onetouch.Helpers.Helper>();
            _iAppEventsAppService = Resolve<IAppEventsAppService>();
            _iAppPostsAppService = Resolve<IAppPostsAppService>();
        }

        [MultiTenantFact]
        public async Task CreatePostForEventTest()
        {
            var appEvent = await _iAppEventsAppService.CreateOrEdit(new onetouch.AppEvents.Dtos.CreateOrEditAppEventDto()
            {
                EntityId = 0,
                Code = EventName.ToUpper().Trim(),
                IsOnLine = true,
                Name = EventName,
                TimeZone = "Alpha Time Zone",
                FromDate = System.DateTime.Now,
                ToDate = System.DateTime.Now,
                FromTime = System.DateTime.Now,
                ToTime = System.DateTime.Now,
                Privacy = true,
                GuestCanInviteFriends = true,
                Description = EventName,
                RegistrationLink = "string",
                UTCToDateTime = System.DateTime.Now,
                Id = 0,
            });

            await _iAppPostsAppService.CreateOrEdit(new AppPosts.Dtos.CreateOrEditAppPostDto()
            {
                RelatedEntityId = appEvent,
                Code = this.EventName.ToUpper().Trim(),
                Description = this.EventName,
                UrlTitle= "string",
                Type=  AppPosts.Dtos.PostType.SINGLEIMAGE,
                CreatorUserId= 1,
                TenantId= null,
                UserName= "string",
                TenantName= "string",
                UserImage= "string",
                CreationDatetime= System.DateTime.Now,
                CanEdit= true,
                Attachments= new List<AppEntityAttachmentDto>(),
                Id = 0
            });
            
            //appEvent.Result.ShouldNotBeNull();
            //appEvent.Result.ShouldBeGreaterThan(0);
            //this.EventId = appEvent.Result;
        }

    }
}