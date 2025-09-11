using System;
using System.Diagnostics;
using Abp.Configuration;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Threading;
using Abp.Threading.BackgroundWorkers;
using Abp.Threading.Timers;
using Abp.Timing;
using onetouch.Authorization.Users;
using onetouch.Configuration;

namespace onetouch.MultiTenancy
{
    public class SubscriptionExpireEmailNotifierWorker : PeriodicBackgroundWorkerBase, ISingletonDependency
    {
        private const int CheckPeriodAsMilliseconds = 1 * 60 * 60 * 1000 * 24; //1 day
        
        private readonly IRepository<Tenant> _tenantRepository;
        private readonly UserEmailer _userEmailer;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public SubscriptionExpireEmailNotifierWorker(
            AbpTimer timer,
            IRepository<Tenant> tenantRepository,
            UserEmailer userEmailer,
            IUnitOfWorkManager unitOfWorkManager) : base(timer)
        {
            _tenantRepository = tenantRepository;
            _userEmailer = userEmailer;

            Timer.Period = CheckPeriodAsMilliseconds;
            Timer.RunOnStart = true;

            LocalizationSourceName = onetouchConsts.LocalizationSourceName;
            _unitOfWorkManager = unitOfWorkManager;
        }

        protected override void DoWork()
        {
            var subscriptionRemainingDayCount = Convert.ToInt32(SettingManager.GetSettingValueForApplication(AppSettings.TenantManagement.SubscriptionExpireNotifyDayCount));
            var dateToCheckRemainingDayCount = Clock.Now.AddDays(subscriptionRemainingDayCount).ToUniversalTime();
            using (var uow = _unitOfWorkManager.Begin())
            {
                var subscriptionExpiredTenants = _tenantRepository.GetAllList(
                tenant => tenant.SubscriptionEndDateUtc != null &&
                          tenant.SubscriptionEndDateUtc.Value.Date == dateToCheckRemainingDayCount.Date &&
                          tenant.IsActive &&
                          tenant.EditionId != null
            );
                uow.Complete();


                foreach (var tenant in subscriptionExpiredTenants)
                {
                    Debug.Assert(tenant.EditionId.HasValue);
                    try
                    {
                        AsyncHelper.RunSync(() => _userEmailer.TryToSendSubscriptionExpiringSoonEmail(tenant.Id, dateToCheckRemainingDayCount));
                    }
                    catch (Exception exception)
                    {
                        Logger.Error(exception.Message, exception);
                    }
                }
            }
        }
    }
}
