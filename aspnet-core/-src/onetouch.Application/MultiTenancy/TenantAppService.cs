using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Abp;
using Abp.Application.Features;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Authorization.Users;
using Abp.Domain.Uow;
using Abp.Events.Bus;
using Abp.Extensions;
using Abp.Linq.Extensions;
using Abp.Runtime.Security;
using Microsoft.EntityFrameworkCore;
using onetouch.Authorization;
using onetouch.Editions.Dto;
using onetouch.MultiTenancy.Dto;
using onetouch.Url;

namespace onetouch.MultiTenancy
{
    [AbpAuthorize(AppPermissions.Pages_Tenants)]
    public class TenantAppService : onetouchAppServiceBase, ITenantAppService
    {
        public IAppUrlService AppUrlService { get; set; }
        public IEventBus EventBus { get; set; }

        public TenantAppService()
        {
            AppUrlService = NullAppUrlService.Instance;
            EventBus = NullEventBus.Instance;
        }

        public async Task<PagedResultDto<TenantListDto>> GetTenants(GetTenantsInput input)
        {
            var query = TenantManager.Tenants
                .Include(t => t.Edition)
                .WhereIf(!input.Filter.IsNullOrWhiteSpace(), t => t.Name.Contains(input.Filter) || t.TenancyName.Contains(input.Filter))
                .WhereIf(input.CreationDateStart.HasValue, t => t.CreationTime >= input.CreationDateStart.Value)
                .WhereIf(input.CreationDateEnd.HasValue, t => t.CreationTime <= input.CreationDateEnd.Value)
                .WhereIf(input.SubscriptionEndDateStart.HasValue, t => t.SubscriptionEndDateUtc >= input.SubscriptionEndDateStart.Value.ToUniversalTime())
                .WhereIf(input.SubscriptionEndDateEnd.HasValue, t => t.SubscriptionEndDateUtc <= input.SubscriptionEndDateEnd.Value.ToUniversalTime())
                .WhereIf(input.EditionIdSpecified, t => t.EditionId == input.EditionId);

            var tenantCount = await query.CountAsync();
            var tenants = await query.OrderBy(input.Sorting).PageBy(input).ToListAsync();

            return new PagedResultDto<TenantListDto>(
                tenantCount,
                ObjectMapper.Map<List<TenantListDto>>(tenants)
                );
        }

        [AbpAuthorize(AppPermissions.Pages_Tenants_Create)]
        [UnitOfWork(IsDisabled = true)]
        public async Task CreateTenant(CreateTenantInput input)
        {
            await TenantManager.CreateWithAdminUserAsync(input.TenancyName,
                input.Name,
                input.AdminPassword,
                input.AdminEmailAddress,
                input.ConnectionString,
                input.IsActive,
                input.EditionId,
                input.ShouldChangePasswordOnNextLogin,
                input.SendActivationEmail,
                input.SubscriptionEndDateUtc?.ToUniversalTime(),
                input.IsInTrialPeriod,
                AppUrlService.CreateEmailActivationUrlFormat(input.TenancyName),input.InviterTenantId, input.FirstName,input.LastName
            );
        }

        [AbpAuthorize(AppPermissions.Pages_Tenants_Edit)]
        public async Task<TenantEditDto> GetTenantForEdit(EntityDto input)
        {
            var tenantEditDto = ObjectMapper.Map<TenantEditDto>(await TenantManager.GetByIdAsync(input.Id));
            tenantEditDto.ConnectionString = SimpleStringCipher.Instance.Decrypt(tenantEditDto.ConnectionString);
            return tenantEditDto;
        }

        [AbpAuthorize(AppPermissions.Pages_Tenants_Edit)]
        public async Task UpdateTenant(TenantEditDto input)
        {
            await TenantManager.CheckEditionAsync(input.EditionId, input.IsInTrialPeriod);

            input.ConnectionString = SimpleStringCipher.Instance.Encrypt(input.ConnectionString);
            var tenant = await TenantManager.GetByIdAsync(input.Id);

            if (tenant.EditionId != input.EditionId)
            {
                EventBus.Trigger(new TenantEditionChangedEventData
                {
                    TenantId = input.Id,
                    OldEditionId = tenant.EditionId,
                    NewEditionId = input.EditionId
                });
            }

            ObjectMapper.Map(input, tenant);
            tenant.SubscriptionEndDateUtc = tenant.SubscriptionEndDateUtc?.ToUniversalTime();

            await TenantManager.UpdateAsync(tenant);
        }

        [AbpAuthorize(AppPermissions.Pages_Tenants_Delete)]
        public async Task DeleteTenant(EntityDto input)
        {
            var tenant = await TenantManager.GetByIdAsync(input.Id);
            await TenantManager.DeleteAsync(tenant);
        }

        [AbpAuthorize(AppPermissions.Pages_Tenants_ChangeFeatures)]
        public async Task<GetTenantFeaturesEditOutput> GetTenantFeaturesForEdit(EntityDto input)
        {
            var features = FeatureManager.GetAll()
                .Where(f => f.Scope.HasFlag(FeatureScopes.Tenant));
            var featureValues = await TenantManager.GetFeatureValuesAsync(input.Id);

            return new GetTenantFeaturesEditOutput
            {
                Features = ObjectMapper.Map<List<FlatFeatureDto>>(features).OrderBy(f => f.DisplayName).ToList(),
                FeatureValues = featureValues.Select(fv => new NameValueDto(fv)).ToList()
            };
        }

        [AbpAuthorize(AppPermissions.Pages_Tenants_ChangeFeatures)]
        public async Task UpdateTenantFeatures(UpdateTenantFeaturesInput input)
        {
            await TenantManager.SetFeatureValuesAsync(input.Id, input.FeatureValues.Select(fv => new NameValue(fv.Name, fv.Value)).ToArray());
        }

        [AbpAuthorize(AppPermissions.Pages_Tenants_ChangeFeatures)]
        public async Task ResetTenantSpecificFeatures(EntityDto input)
        {
            await TenantManager.ResetAllFeaturesAsync(input.Id);
        }

        public async Task UnlockTenantAdmin(EntityDto input)
        {
            using (CurrentUnitOfWork.SetTenantId(input.Id))
            {
                var tenantAdmin = await UserManager.GetAdminAsync();
                if (tenantAdmin != null)
                {
                    tenantAdmin.Unlock();
                }
            }
        }
        //Mariam[Start]
        [AbpAllowAnonymous]
        public TenantInfoDto  GetTenantIdByUserName(string userName)
        {
            TenantInfoDto tenantInfoDto = new TenantInfoDto();
            using (UnitOfWorkManager.Current.DisableFilter(Abp.Domain.Uow.AbpDataFilters.MustHaveTenant, Abp.Domain.Uow.AbpDataFilters.MayHaveTenant))
            {
                var user = UserManager.FindByNameOrEmail(userName);
                if (user != null)
                {
                    if (user.TenantId != null)
                    {
                        var tenantObj =  TenantManager.GetById(int.Parse (user.TenantId.ToString ()));
                        if (tenantObj != null)
                        {
                            tenantInfoDto.TenantId = tenantObj.Id;
                            tenantInfoDto.TenancyName = tenantObj.TenancyName;
                        }
                        else
                        {
                            tenantInfoDto.TenantId = null ;
                            tenantInfoDto.TenancyName = tenantObj.TenancyName;
                        }
                                
                    }
                    else
                    {
                        tenantInfoDto.TenantId = null;
                        tenantInfoDto.TenancyName = "";
                    }

                }
                else
                {
                    tenantInfoDto.TenantId = -1;
                    tenantInfoDto.TenancyName = "";
                }
                return tenantInfoDto;
            }
        }
        //Mariam[End]
    }
}