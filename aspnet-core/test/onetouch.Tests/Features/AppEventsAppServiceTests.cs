using System;
using System.Linq;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.Localization;
using Abp.MultiTenancy;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using onetouch.AppEvents;
using onetouch.Authorization.Users;
using onetouch.Authorization.Users.Dto;
using onetouch.Editions;
using onetouch.Editions.Dto;
using onetouch.Features;
using onetouch.Test.Base;
using Shouldly;
using Xunit;
using onetouch.AppEntities.Dtos;


namespace onetouch.Tests.Features
{
   // [TestClass()]
    public class AppEventsAppServiceTests : AppTestBase
    {
        private readonly onetouch.Helpers.ExcelHelper _excelHelper;
        private readonly onetouch.Helpers.Helper _ihelper;
        private readonly IAppEventsAppService _iAppEventsAppService;
        private long EventId = 0;
        private long EntityId = 0;
        private string EventName = "Event name";

        public AppEventsAppServiceTests()
        {
            LoginAsHostAdmin();
            _excelHelper = Resolve<onetouch.Helpers.ExcelHelper>();
            _ihelper = Resolve<onetouch.Helpers.Helper>();
            _iAppEventsAppService = Resolve<IAppEventsAppService>();
        }

        //[TestMethod()]
        [MultiTenantFact]
        public async Task GetAllTest()
        {
            if (this.EventId == 0)
            { await CreateOrEditTest(); }

            var appEvent = _iAppEventsAppService.GetAll(new onetouch.AppEvents.Dtos.GetAllAppEventsInput() { EntityIdFilter = EventId, IncludeAttachments = true });

            string xx = ";";
            appEvent.Result.Items.Count.ShouldBe(1);

        }

        [MultiTenantFact]
        public async Task GetAppEventForEditTest()
        {
            if (this.EventId == 0)
            { await CreateOrEditTest(); }

            var appEvent = _iAppEventsAppService.GetAppEventForEdit( EventId);
            appEvent.Result.AppEvent.ShouldNotBeNull();
            appEvent.Result.AppEvent.Name.ShouldBe(this.EventName);
        }

        [MultiTenantFact]
        public async Task GetAppEventForViewTest()
        {
            if (this.EventId == 0)
            { await CreateOrEditTest(); }

            var appEvent = _iAppEventsAppService.GetAppEventForView(EventId,0);
            appEvent.Result.AppEvent.ShouldNotBeNull();
            appEvent.Result.AppEvent.Name.ShouldBe(this.EventName);
        }

        [MultiTenantFact]
        public async Task CreateOrEditTest()
        {
            var appEvent = _iAppEventsAppService.CreateOrEdit(new onetouch.AppEvents.Dtos.CreateOrEditAppEventDto()
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
                Address = new AppEntityAddressDto() { AddressId = 0, AddressTypeId = 0},
                Description = EventName,
                RegistrationLink = "string",
                Status = 0,
                IsPublished = true,
                UTCFromDateTime = System.DateTime.Now,
                UTCToDateTime = System.DateTime.Now,
                Id = 0,
            });

            appEvent.Result.ShouldNotBeNull();
            appEvent.Result.ShouldBeGreaterThan(0);
            this.EventId = appEvent.Result;
        }

        [MultiTenantFact]
        public async Task DeleteTest()
        {
            if (this.EventId == 0)
            { await CreateOrEditTest(); }
            var appEvent = await _iAppEventsAppService.GetAppEventForEdit( EventId );
            await _iAppEventsAppService.Delete(new Abp.Application.Services.Dto.EntityDto<long>() {  Id= appEvent.AppEvent.Id });
            var xappEvent = await _iAppEventsAppService.GetAll(new onetouch.AppEvents.Dtos.GetAllAppEventsInput() { IdFilter = appEvent.AppEvent.Id, IncludeAttachments = false });
            xappEvent.Items.Count.ShouldBe(0);
        }

    }
}