using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.AppMarketplaceContact.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using Abp.UI;
using onetouch.Storage;

namespace onetouch.AppMarketplaceContact
{
    [AbpAuthorize(AppPermissions.Pages_AppMarketplaceAppContacts)]
    public class AppMarketplaceAppContactsAppService : onetouchAppServiceBase, IAppMarketplaceAppContactsAppService
    {
        private readonly IRepository<AppMarketplaceAppContact, long> _appMarketplaceAppContactRepository;

        public AppMarketplaceAppContactsAppService(IRepository<AppMarketplaceAppContact, long> appMarketplaceAppContactRepository)
        {
            _appMarketplaceAppContactRepository = appMarketplaceAppContactRepository;

        }

        public async Task<PagedResultDto<GetAppMarketplaceAppContactForViewDto>> GetAll(GetAllAppMarketplaceAppContactsInput input)
        {

            var filteredAppMarketplaceAppContacts = _appMarketplaceAppContactRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Name.Contains(input.Filter) || e.TradeName.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name.Contains(input.NameFilter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.TradeNameFilter), e => e.TradeName.Contains(input.TradeNameFilter));

            var pagedAndFilteredAppMarketplaceAppContacts = filteredAppMarketplaceAppContacts
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

            var appMarketplaceAppContacts = from o in pagedAndFilteredAppMarketplaceAppContacts
                                            select new
                                            {

                                                o.Name,
                                                o.TradeName,
                                                Id = o.Id
                                            };

            var totalCount = await filteredAppMarketplaceAppContacts.CountAsync();

            var dbList = await appMarketplaceAppContacts.ToListAsync();
            var results = new List<GetAppMarketplaceAppContactForViewDto>();

            foreach (var o in dbList)
            {
                var res = new GetAppMarketplaceAppContactForViewDto()
                {
                    AppMarketplaceAppContact = new AppMarketplaceAppContactDto
                    {

                        Name = o.Name,
                        TradeName = o.TradeName,
                        Id = o.Id,
                    }
                };

                results.Add(res);
            }

            return new PagedResultDto<GetAppMarketplaceAppContactForViewDto>(
                totalCount,
                results
            );

        }

        [AbpAuthorize(AppPermissions.Pages_AppMarketplaceAppContacts_Edit)]
        public async Task<GetAppMarketplaceAppContactForEditOutput> GetAppMarketplaceAppContactForEdit(EntityDto<long> input)
        {
            var appMarketplaceAppContact = await _appMarketplaceAppContactRepository.FirstOrDefaultAsync(input.Id);

            var output = new GetAppMarketplaceAppContactForEditOutput { AppMarketplaceAppContact = ObjectMapper.Map<CreateOrEditAppMarketplaceAppContactDto>(appMarketplaceAppContact) };

            return output;
        }

        public async Task CreateOrEdit(CreateOrEditAppMarketplaceAppContactDto input)
        {
            if (input.Id == null)
            {
                await Create(input);
            }
            else
            {
                await Update(input);
            }
        }

        [AbpAuthorize(AppPermissions.Pages_AppMarketplaceAppContacts_Create)]
        protected virtual async Task Create(CreateOrEditAppMarketplaceAppContactDto input)
        {
            var appMarketplaceAppContact = ObjectMapper.Map<AppMarketplaceAppContact>(input);

            if (AbpSession.TenantId != null)
            {
                appMarketplaceAppContact.TenantId = (int)AbpSession.TenantId;
            }

            await _appMarketplaceAppContactRepository.InsertAsync(appMarketplaceAppContact);

        }

        [AbpAuthorize(AppPermissions.Pages_AppMarketplaceAppContacts_Edit)]
        protected virtual async Task Update(CreateOrEditAppMarketplaceAppContactDto input)
        {
            var appMarketplaceAppContact = await _appMarketplaceAppContactRepository.FirstOrDefaultAsync((long)input.Id);
            ObjectMapper.Map(input, appMarketplaceAppContact);

        }

        [AbpAuthorize(AppPermissions.Pages_AppMarketplaceAppContacts_Delete)]
        public async Task Delete(EntityDto<long> input)
        {
            await _appMarketplaceAppContactRepository.DeleteAsync(input.Id);
        }

    }
}