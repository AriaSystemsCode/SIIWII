using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.AppItemSelectors.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using Abp.UI;
using onetouch.Storage;
using onetouch.AppItems.Dtos;
using onetouch.AppItems;

namespace onetouch.AppItemSelectors
{
    [AbpAuthorize(AppPermissions.Pages_AppItemSelectors)]
    public class AppItemSelectorsAppService : onetouchAppServiceBase, IAppItemSelectorsAppService
    {
        private readonly IRepository<AppItemSelector, long> _appItemSelectorRepository;
        private readonly AppItemsAppService _appItemAppService;
        private readonly IRepository<AppItem, long> _appItemRepository;

        public AppItemSelectorsAppService(IRepository<AppItemSelector, long> appItemSelectorRepository
            , IRepository<AppItem, long> appItemRepository
            , AppItemsAppService appItemAppService)
        {
            _appItemSelectorRepository = appItemSelectorRepository;
            _appItemRepository = appItemRepository;
            _appItemAppService = appItemAppService;
        }

        public async Task<PagedResultDto<GetAppItemSelectorForViewDto>> GetAll(GetAllAppItemSelectorsInput input)
        {

            var filteredAppItemSelectors = _appItemSelectorRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.KeyFilter.ToString()), e => e.Key.ToString() == input.KeyFilter.ToString())
                        .WhereIf(input.MinSelectedIdFilter != null, e => e.SelectedId >= input.MinSelectedIdFilter)
                        .WhereIf(input.MaxSelectedIdFilter != null, e => e.SelectedId <= input.MaxSelectedIdFilter);

            var pagedAndFilteredAppItemSelectors = filteredAppItemSelectors
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

            var appItemSelectors = from o in pagedAndFilteredAppItemSelectors
                                   select new
                                   {

                                       o.Key,
                                       o.SelectedId,
                                       Id = o.Id
                                   };

            var totalCount = await filteredAppItemSelectors.CountAsync();

            var dbList = await appItemSelectors.ToListAsync();
            var results = new List<GetAppItemSelectorForViewDto>();

            foreach (var o in dbList)
            {
                var res = new GetAppItemSelectorForViewDto()
                {
                    AppItemSelector = new AppItemSelectorDto
                    {

                        Key = o.Key,
                        SelectedId = o.SelectedId,
                        Id = o.Id,
                    }
                };

                results.Add(res);
            }

            return new PagedResultDto<GetAppItemSelectorForViewDto>(
                totalCount,
                results
            );

        }

        [AbpAuthorize(AppPermissions.Pages_AppItemSelectors_Edit)]
        public async Task<GetAppItemSelectorForEditOutput> GetAppItemSelectorForEdit(EntityDto<long> input)
        {
            var appItemSelector = await _appItemSelectorRepository.FirstOrDefaultAsync(input.Id);

            var output = new GetAppItemSelectorForEditOutput { AppItemSelector = ObjectMapper.Map<CreateOrEditAppItemSelectorDto>(appItemSelector) };

            return output;
        }

        public async Task<Int32> CreateOrEdit(CreateOrEditAppItemSelectorDto input)
        {
            // check if the temp record exists
            var appItemSelector = await _appItemSelectorRepository.FirstOrDefaultAsync(e=> e.Key==input.Key && e.SelectedId== input.SelectedId);
            if (appItemSelector != null && appItemSelector.Id > 0)
            {
                return await Update(input);
            }
            else
            {
                return await Create(input); 
            }
        }

        [AbpAuthorize(AppPermissions.Pages_AppItemSelectors_Create)]
        protected virtual async Task<Int32> Create(CreateOrEditAppItemSelectorDto input)
        {
            var appItemSelector = ObjectMapper.Map<AppItemSelector>(input);

            if (AbpSession.TenantId != null)
            {
                appItemSelector.TenantId = (int?)AbpSession.TenantId;
            }

            await _appItemSelectorRepository.InsertAsync(appItemSelector);
            await CurrentUnitOfWork.SaveChangesAsync();
            var appItemSelectorCount = await _appItemSelectorRepository.CountAsync(e => e.Key == input.Key);
            appItemSelectorCount = appItemSelectorCount == null ? 0 : appItemSelectorCount;
            return appItemSelectorCount;

        }

        [AbpAuthorize(AppPermissions.Pages_AppItemSelectors_Edit)]
        protected virtual async Task<Int32> Update(CreateOrEditAppItemSelectorDto input)
        {
            var appItemSelector = await _appItemSelectorRepository.FirstOrDefaultAsync((long)input.Id);
            ObjectMapper.Map(input, appItemSelector);
            await CurrentUnitOfWork.SaveChangesAsync();
            var appItemSelectorCount = await _appItemSelectorRepository.CountAsync(e=> e.Key == input.Key);
            appItemSelectorCount = appItemSelectorCount == null ? 0 : appItemSelectorCount;
            return appItemSelectorCount;

        }

        [AbpAuthorize(AppPermissions.Pages_AppItemSelectors_Delete)]
        public async Task DeleteAllTempWithKey(CreateOrEditAppItemSelectorDto input)
        {
            await _appItemSelectorRepository.HardDeleteAsync(e => e.Key == input.Key);
        }

        [AbpAuthorize(AppPermissions.Pages_AppItemSelectors_Delete)]
        public async Task<Int32> Delete(CreateOrEditAppItemSelectorDto input)
        {   
            await _appItemSelectorRepository.HardDeleteAsync(e => e.Key == input.Key && e.SelectedId == input.SelectedId);
            await CurrentUnitOfWork.SaveChangesAsync();
            var appItemSelectorCount = await _appItemSelectorRepository.CountAsync(e => e.Key == input.Key);
            appItemSelectorCount = appItemSelectorCount == null ? 0 : appItemSelectorCount;
            return appItemSelectorCount;
        }

        [AbpAuthorize(AppPermissions.Pages_AppItemSelectors_Create)]
        public async Task<int> SelectAll(Guid key, GetAllAppItemsInput input)
        {
            int appItemSelectorCount = 0;
            await _appItemSelectorRepository.HardDeleteAsync(e => e.Key == key);
            
            var items = await _appItemAppService.GetAll(input);
            if (items!=null && items.Items != null && items.Items.Count>0)
            {
                appItemSelectorCount = items.Items.Count;

                var itemsIds = items.Items.Select(e => e.AppItem.Id).ToList();
                foreach (var id in itemsIds)
                {
                    var appItemSelector = new AppItemSelector();
                    appItemSelector.Key = key;
                    if (AbpSession.TenantId != null)
                    { appItemSelector.TenantId = (int?)AbpSession.TenantId; }
                    appItemSelector.SelectedId = id;

                    await _appItemSelectorRepository.InsertAsync(appItemSelector);
                }
            }
            await CurrentUnitOfWork.SaveChangesAsync();
            return appItemSelectorCount;
        }

        [AbpAuthorize(AppPermissions.Pages_AppItemSelectors_Create)]
        public async Task<int> Invert(Guid key, GetAllAppItemsInput input)
        {
            int appItemSelectorCount = 0;
            var appItemSelectorOldCount = await _appItemSelectorRepository.CountAsync(e => e.Key == key);
            List<long> appOldItemSelector = new List<long>();
            if (appItemSelectorOldCount > 0)
            { appOldItemSelector = _appItemSelectorRepository.GetAll().Where(e => e.Key == key).Select(e=> e.SelectedId).ToList(); }
            await _appItemSelectorRepository.HardDeleteAsync(e => e.Key == key);

            var items = await _appItemAppService.GetAll(input);
            if (items != null && items.Items != null && items.Items.Count > 0)
            {
                appItemSelectorCount = items.Items.Count;

                var itemsIds = items.Items.Select(e => e.AppItem.Id).Where(e=> !appOldItemSelector.Contains(e)).ToList();
                //T-SII-20231218.0001,1 MMT 01/03/2024 Invert button displays incorrect selected Items count[Start]
                appItemSelectorCount = itemsIds.Count;
                //T-SII-20231218.0001,1 MMT 01/03/2024 Invert button displays incorrect selected Items count[End]
                foreach (var id in itemsIds)
                {
                    var appItemSelector = new AppItemSelector();
                    appItemSelector.Key = key;
                    if (AbpSession.TenantId != null)
                    { appItemSelector.TenantId = (int?)AbpSession.TenantId; }
                    appItemSelector.SelectedId = id;

                    await _appItemSelectorRepository.InsertAsync(appItemSelector);
                }
            }
            await CurrentUnitOfWork.SaveChangesAsync();
            return appItemSelectorCount;
        }

    }
}