using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.Maintainances.Exporting;
using onetouch.Maintainances.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using Abp.UI;
using onetouch.Storage;
using Microsoft.AspNetCore.SignalR;
using onetouch.Build;
using Abp.Domain.Entities;
using Microsoft.CodeAnalysis.Operations;

namespace onetouch.Maintainances
{
    //[AbpAuthorize(AppPermissions.Pages_Administration_Maintainances)]
    public class MaintainancesAppService : onetouchAppServiceBase, IMaintainancesAppService
    {
        private readonly IRepository<Maintainance, long> _maintainanceRepository;
        private readonly IMaintainancesExcelExporter _maintainancesExcelExporter;
        private readonly IHubContext<BuildHub> _build;

        public MaintainancesAppService(IRepository<Maintainance, long> maintainanceRepository, IMaintainancesExcelExporter maintainancesExcelExporter, IHubContext<BuildHub> build)
        {
            _build = build;
            _maintainanceRepository = maintainanceRepository;
            _maintainancesExcelExporter = maintainancesExcelExporter;

        }

        public async Task<PagedResultDto<GetMaintainanceForViewDto>> GetAll(GetAllMaintainancesInput input)
        {

            var filteredMaintainances = _maintainanceRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Name.Contains(input.Filter) || e.Description.Contains(input.Filter) || e.DismissIds.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name.Contains(input.NameFilter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.DescriptionFilter), e => e.Description.Contains(input.DescriptionFilter))
                        .WhereIf(input.MinFromFilter != null, e => e.From >= input.MinFromFilter)
                        .WhereIf(input.MaxFromFilter != null, e => e.From <= input.MaxFromFilter)
                        .WhereIf(input.MinToFilter != null, e => e.To >= input.MinToFilter)
                        .WhereIf(input.MaxToFilter != null, e => e.To <= input.MaxToFilter)
                        .WhereIf(input.PublishedFilter.HasValue && input.PublishedFilter > -1, e => (input.PublishedFilter == 1 && e.Published) || (input.PublishedFilter == 0 && !e.Published))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.DismissIdsFilter), e => e.DismissIds.Contains(input.DismissIdsFilter));

            var pagedAndFilteredMaintainances = filteredMaintainances
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

            var maintainances = from o in pagedAndFilteredMaintainances
                                select new
                                {

                                    o.Name,
                                    o.Description,
                                    o.From,
                                    o.To,
                                    o.Published,
                                    o.DismissIds,
                                    Id = o.Id
                                };

            var totalCount = await filteredMaintainances.CountAsync();

            var dbList = await maintainances.ToListAsync();
            var results = new List<GetMaintainanceForViewDto>();

            foreach (var o in dbList)
            {
                var res = new GetMaintainanceForViewDto()
                {
                    Maintainance = new MaintainanceDto
                    {

                        Name = o.Name,
                        Description = o.Description,
                        From = o.From,
                        To = o.To,
                        Published = o.Published,
                        DismissIds = o.DismissIds,
                        Id = o.Id,
                    }
                };

                results.Add(res);
            }

            return new PagedResultDto<GetMaintainanceForViewDto>(
                totalCount,
                results
            );

        }

        public async Task<GetMaintainanceForViewDto> GetMaintainanceForView(long id)
        {
            var maintainance = await _maintainanceRepository.GetAsync(id);

            var output = new GetMaintainanceForViewDto { Maintainance = ObjectMapper.Map<MaintainanceDto>(maintainance) };

            return output;
        }

        //[AbpAuthorize(AppPermissions.Pages_Administration_Maintainances_Edit)]
        public async Task<GetMaintainanceForEditOutput> GetMaintainanceForEdit(EntityDto<long> input)
        {
            var maintainance = await _maintainanceRepository.FirstOrDefaultAsync(input.Id);

            var output = new GetMaintainanceForEditOutput { Maintainance = ObjectMapper.Map<CreateOrEditMaintainanceDto>(maintainance) };

            return output;
        }

        public async Task CreateOrEdit(CreateOrEditMaintainanceDto input)
        {
            var maintenances =  _maintainanceRepository.GetAll().Where(e => e.Published==false && (input.Id==null || input.Id!=e.Id)).ToList();
            if (maintenances.Count() > 0 && input.Published ==false)
            {
                throw new UserFriendlyException(L("OpenMaintainanceAlarm"));
            }
            if (input.Id == null)
            {
                await Create(input);
            }
            else
            {
                await Update(input);
            }
            await CurrentUnitOfWork.SaveChangesAsync();
            if (input.Published == false)
            { await SendAlarm(); }
        }

        public async Task<GetMaintainanceForViewDto> GetOpenBuild()
        {
            var maintenance = _maintainanceRepository.GetAll().Where(r => r.Published == false).FirstOrDefault();

            var output = new GetMaintainanceForViewDto { Maintainance = ObjectMapper.Map<MaintainanceDto>(maintenance) };

            if (output != null && output.Maintainance != null)
            {
                output.Maintainance.From = output.Maintainance.From.ToUniversalTime();
                output.Maintainance.To = output.Maintainance.To.ToUniversalTime();
            }
            return output;

        }

        public async Task UpdateOpenBuildWithUserId(long userId)
        {
            var maintenance = _maintainanceRepository.GetAll().Where(r => r.Published == false).FirstOrDefault();
            if (maintenance != null && maintenance.Id > 0)
            {
                if (string.IsNullOrEmpty(maintenance.DismissIds))
                { maintenance.DismissIds = userId.ToString() + '|'; }
                else
                { if (!maintenance.DismissIds.Contains(userId.ToString() + '|')) { maintenance.DismissIds = maintenance.DismissIds + userId.ToString() + '|'; } }
            }

        }

        private async Task SendAlarm()
        {
            var maintenance = await GetOpenBuild();
            //if (maintenance != null && maintenance.Maintainance !=null && maintenance.Maintainance.Id > 0)
            { await _build.Clients.All.SendAsync("SendBuildMessage", maintenance); }
        }



       // [AbpAuthorize(AppPermissions.Pages_Administration_Maintainances_Create)]
        protected virtual async Task Create(CreateOrEditMaintainanceDto input)
        {
            
            var maintainance = ObjectMapper.Map<Maintainance>(input);

            await _maintainanceRepository.InsertAsync(maintainance);

        }



        //[AbpAuthorize(AppPermissions.Pages_Administration_Maintainances_Edit)]
        protected virtual async Task Update(CreateOrEditMaintainanceDto input)
        {

            var maintainance = await _maintainanceRepository.FirstOrDefaultAsync((long)input.Id);
            ObjectMapper.Map(input, maintainance);

        }

        //[AbpAuthorize(AppPermissions.Pages_Administration_Maintainances_Delete)]
        public async Task Delete(EntityDto<long> input)
        {
            await _maintainanceRepository.DeleteAsync(input.Id);
        }

        public async Task<FileDto> GetMaintainancesToExcel(GetAllMaintainancesForExcelInput input)
        {

            var filteredMaintainances = _maintainanceRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Name.Contains(input.Filter) || e.Description.Contains(input.Filter) || e.DismissIds.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name.Contains(input.NameFilter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.DescriptionFilter), e => e.Description.Contains(input.DescriptionFilter))
                        .WhereIf(input.MinFromFilter != null, e => e.From >= input.MinFromFilter)
                        .WhereIf(input.MaxFromFilter != null, e => e.From <= input.MaxFromFilter)
                        .WhereIf(input.MinToFilter != null, e => e.To >= input.MinToFilter)
                        .WhereIf(input.MaxToFilter != null, e => e.To <= input.MaxToFilter)
                        .WhereIf(input.PublishedFilter.HasValue && input.PublishedFilter > -1, e => (input.PublishedFilter == 1 && e.Published) || (input.PublishedFilter == 0 && !e.Published))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.DismissIdsFilter), e => e.DismissIds.Contains(input.DismissIdsFilter));

            var query = (from o in filteredMaintainances
                         select new GetMaintainanceForViewDto()
                         {
                             Maintainance = new MaintainanceDto
                             {
                                 Name = o.Name,
                                 Description = o.Description,
                                 From = o.From,
                                 To = o.To,
                                 Published = o.Published,
                                 DismissIds = o.DismissIds,
                                 Id = o.Id
                             }
                         });

            var maintainanceListDtos = await query.ToListAsync();

            return _maintainancesExcelExporter.ExportToFile(maintainanceListDtos);
        }

    }
}