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
using onetouch.SycIdentifierDefinitions;
using onetouch.Test.Base;
using Shouldly;
using Xunit;

namespace onetouch.Tests.Features
{
   // [TestClass()]
    public class AppSycIdentifierDefinitionsAppServiceTests : AppTestBase
    {
        private readonly onetouch.Helpers.ExcelHelper _excelHelper;
        private readonly onetouch.Helpers.Helper _ihelper;
        private readonly ISycIdentifierDefinitionsAppService _iAppSycIdentifierDefinitionsService;
        //private readonly IAppEventsAppService _iAppEventsAppService;
        private long EventId = 0;
        private string EventName = "Event name";

        public AppSycIdentifierDefinitionsAppServiceTests()
        {
            LoginAsHostAdmin();
            _excelHelper = Resolve<onetouch.Helpers.ExcelHelper>();
            _ihelper = Resolve<onetouch.Helpers.Helper>();
        
            _iAppSycIdentifierDefinitionsService = Resolve<ISycIdentifierDefinitionsAppService>();
        }

        [MultiTenantFact]
        public async Task CheckSeedingSycIdentifierDefinitionsTest()
        {
            var obj = await _iAppSycIdentifierDefinitionsService.GetSycIdentifierDefinitionByTypeForView("CLASSIFICATION");
           obj.SycIdentifierDefinition.Code.ShouldNotBeEmpty();
           
        }

        [MultiTenantFact]
        public async Task CheckSycIdentifierDefinitionsNextSeqTest()
        {
            var obj = await _iAppSycIdentifierDefinitionsService.GetSycIdentifierDefinitionByTypeForView("CLASSIFICATION");
            var value = await _iAppSycIdentifierDefinitionsService.GetNextEntityCode("CLASSIFICATION");
            int.Parse(value).ShouldBeGreaterThan(0);

        }

    }
}