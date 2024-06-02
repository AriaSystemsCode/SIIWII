using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abp.Auditing;
using Abp.Runtime.Session;
using Microsoft.EntityFrameworkCore;
using onetouch.Editions;
using onetouch.MultiTenancy.Payments;
using onetouch.Sessions.Dto;
using onetouch.UiCustomization;
using onetouch.Authorization.Delegation;
using onetouch.Helpers;
using onetouch.AppEntities;
using Abp.Domain.Repositories;
using onetouch.Accounts;
using onetouch.AppContacts;
using onetouch.AppSubScriptionPlan;

namespace onetouch.Sessions
{
    public class SessionAppService : onetouchAppServiceBase, ISessionAppService
    {
        private readonly IUiThemeCustomizerFactory _uiThemeCustomizerFactory;
        private readonly ISubscriptionPaymentRepository _subscriptionPaymentRepository;
        private readonly IUserDelegationConfiguration _userDelegationConfiguration;

        //Mariam[Start]
        private readonly Helper _helper;
        private readonly IRepository<AppEntityExtraData, long> _appEntityExtraDataRepository;
        private readonly IRepository<AppContact, long> _appContactRepository;
        //Mariam[End]
        private readonly IAppTenantActivitiesLogAppService _appTenantActivitiesLogAppService;
        public SessionAppService(
            IUiThemeCustomizerFactory uiThemeCustomizerFactory,
            ISubscriptionPaymentRepository subscriptionPaymentRepository,
            IUserDelegationConfiguration userDelegationConfiguration, Helper helper,
            IRepository<AppEntityExtraData, long> appEntityExtraDataRepository,
            IRepository<AppContact, long> appContactRepository, IAppTenantActivitiesLogAppService appTenantActivitiesLogAppService)
        {
            _uiThemeCustomizerFactory = uiThemeCustomizerFactory;
            _subscriptionPaymentRepository = subscriptionPaymentRepository;
            _userDelegationConfiguration = userDelegationConfiguration;
            //Mariam
            _helper = helper;
            _appEntityExtraDataRepository = appEntityExtraDataRepository;
            _appContactRepository = appContactRepository;
            _appTenantActivitiesLogAppService= appTenantActivitiesLogAppService;
        //MAriam
    }

        [DisableAuditing]
        public async Task<GetCurrentLoginInformationsOutput> GetCurrentLoginInformations()
        {
            var version = AppVersionHelper.Version.Replace("DD", (new DateTime(AppVersionHelper.ReleaseDate.Year, AppVersionHelper.ReleaseDate.Month, AppVersionHelper.ReleaseDate.Day) 
                                                            - new DateTime(2021, 1, 1)).TotalDays.ToString());
            version = version.Replace("MM", (new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day, DateTime.Now.Hour, DateTime.Now.Minute,0)
                                                            - new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day, 0, 0, 0)).TotalMinutes.ToString());

            var output = new GetCurrentLoginInformationsOutput
            {
                Application = new ApplicationInfoDto
                {
                    Version = version,
                    ReleaseDate = AppVersionHelper.ReleaseDate,
                    Features = new Dictionary<string, bool>(),
                    Currency = onetouchConsts.Currency,
                    CurrencySign = onetouchConsts.CurrencySign,
                    AllowTenantsToChangeEmailSettings = onetouchConsts.AllowTenantsToChangeEmailSettings,
                    UserDelegationIsEnabled = _userDelegationConfiguration.IsEnabled
                }
            };

            var uiCustomizer = await _uiThemeCustomizerFactory.GetCurrentUiCustomizer();
            output.Theme = await uiCustomizer.GetUiSettings();

            if (AbpSession.TenantId.HasValue)
            {
                output.Tenant = ObjectMapper
                    .Map<TenantLoginInfoDto>(await TenantManager
                        .Tenants
                        .Include(t => t.Edition)
                        .FirstAsync(t => t.Id == AbpSession.GetTenantId()));
            }

            if (AbpSession.UserId.HasValue)
            {
                output.User = ObjectMapper.Map<UserLoginInfoDto>(await GetCurrentUserAsync());
                //Mariam[Start] 
                //var contactEntityExtraData = _appEntityExtraDataRepository.GetAll().FirstOrDefault(x => x.AttributeId == 715 && x.AttributeValue == AbpSession.UserId.ToString());
                var contactEntityExtraData = _appEntityExtraDataRepository.GetAll().FirstOrDefault(x => x.AttributeId == 715 && x.AttributeValue == AbpSession.UserId.ToString() && x.EntityFk.TenantId != null);
                if (contactEntityExtraData != null)
                {
                    var contact = _appContactRepository.GetAll().FirstOrDefault(x => x.TenantId == AbpSession.TenantId && x.EntityId == contactEntityExtraData.EntityId);
                    //T-SII-20231118.0001,1 MMT 12/10/2023 Random error after login[Start]
                    if (contact!=null)
                    //T-SII-20231118.0001,1 MMT 12/10/2023 Random error after login[End]
                    if(contact!=null)
                    output.User.MemberId = contact.Id;
                }
                var contactAccount = _appContactRepository.GetAll().FirstOrDefault(x => x.TenantId == AbpSession.TenantId  && x.ParentId==null && x.PartnerId ==null);//&& x.AccountId == null
                if (contactAccount != null)
                output.User.AccountId = contactAccount.Id;
                if (AbpSession.TenantId != null)
                {
                   //T-SII-20230501.0001,1 MMT 05/02/2023 error in account profile page if account has no assigned currency[Start]
                   output.Tenant.CurrencyInfoDto = new CurrencyInfoDto();
                   //T-SII-20230501.0001,1 MMT 05/02/2023 error in account profile page if account has no assigned currency[End]
                    output.Tenant.CurrencyInfoDto = await TenantManager.GetTenantCurrency();
                }
                //Mariam[End]
            }

            if (output.Tenant == null)
            {
                return output;
            }

            if (output.Tenant.Edition != null)
            {
                var lastPayment = await _subscriptionPaymentRepository.GetLastCompletedPaymentOrDefaultAsync(output.Tenant.Id, null, null);
                if (lastPayment != null)
                {
                    output.Tenant.Edition.IsHighestEdition = IsEditionHighest(output.Tenant.Edition.Id, lastPayment.GetPaymentPeriodType());
                }
            }

            output.Tenant.SubscriptionDateString = GetTenantSubscriptionDateString(output);
            output.Tenant.CreationTimeString = output.Tenant.CreationTime.ToString("d");
            await _appTenantActivitiesLogAppService.AddUsageActivityLog("User Logged in", "User Logged in", 0);
            return output;

        }

        private bool IsEditionHighest(int editionId, PaymentPeriodType paymentPeriodType)
        {
            var topEdition = GetHighestEditionOrNullByPaymentPeriodType(paymentPeriodType);
            if (topEdition == null)
            {
                return false;
            }

            return editionId == topEdition.Id;
        }

        private SubscribableEdition GetHighestEditionOrNullByPaymentPeriodType(PaymentPeriodType paymentPeriodType)
        {
            var editions = TenantManager.EditionManager.Editions;
            if (editions == null || !editions.Any())
            {
                return null;
            }

            var query = editions.Cast<SubscribableEdition>();

            switch (paymentPeriodType)
            {
                case PaymentPeriodType.Daily:
                    query = query.OrderByDescending(e => e.DailyPrice ?? 0); break;
                case PaymentPeriodType.Weekly:
                    query = query.OrderByDescending(e => e.WeeklyPrice ?? 0); break;
                case PaymentPeriodType.Monthly:
                    query = query.OrderByDescending(e => e.MonthlyPrice ?? 0); break;
                case PaymentPeriodType.Annual:
                    query = query.OrderByDescending(e => e.AnnualPrice ?? 0); break;
            }

            return query.FirstOrDefault();
        }

        private string GetTenantSubscriptionDateString(GetCurrentLoginInformationsOutput output)
        {
            return output.Tenant.SubscriptionEndDateUtc == null
                ? L("Unlimited")
                : output.Tenant.SubscriptionEndDateUtc?.ToString("d");
        }

        public async Task<UpdateUserSignInTokenOutput> UpdateUserSignInToken()
        {
            if (AbpSession.UserId <= 0)
            {
                throw new Exception(L("ThereIsNoLoggedInUser"));
            }

            var user = await UserManager.GetUserAsync(AbpSession.ToUserIdentifier());
            user.SetSignInToken();
            return new UpdateUserSignInTokenOutput
            {
                SignInToken = user.SignInToken,
                EncodedUserId = Convert.ToBase64String(Encoding.UTF8.GetBytes(user.Id.ToString())),
                EncodedTenantId = user.TenantId.HasValue
                    ? Convert.ToBase64String(Encoding.UTF8.GetBytes(user.TenantId.Value.ToString()))
                    : ""
            };
        }
    }
}