using onetouch.SycSegmentIdentifierDefinitions;

using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.SycCounters.Exporting;
using onetouch.SycCounters.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using Abp.UI;
using onetouch.Storage;

namespace onetouch.SycCounters
{
    [AbpAuthorize(AppPermissions.Pages_Administration_SycCounters)]
    public class SycCountersAppService : onetouchAppServiceBase, ISycCountersAppService
    {
        private readonly IRepository<SycCounter, long> _sycCounterRepository;
        private readonly ISycCountersExcelExporter _sycCountersExcelExporter;
        private readonly IRepository<SycSegmentIdentifierDefinition, long> _lookup_sycSegmentIdentifierDefinitionRepository;

        public SycCountersAppService(IRepository<SycCounter, long> sycCounterRepository, ISycCountersExcelExporter sycCountersExcelExporter, IRepository<SycSegmentIdentifierDefinition, long> lookup_sycSegmentIdentifierDefinitionRepository)
        {
            _sycCounterRepository = sycCounterRepository;
            _sycCountersExcelExporter = sycCountersExcelExporter;
            _lookup_sycSegmentIdentifierDefinitionRepository = lookup_sycSegmentIdentifierDefinitionRepository;

        }

        public async Task<PagedResultDto<GetSycCounterForViewDto>> GetAll(GetAllSycCountersInput input)
        {

            var filteredSycCounters = _sycCounterRepository.GetAll()
                        .Include(e => e.SycSegmentIdentifierDefinitionFk)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false)
                        .WhereIf(input.MinCounterFilter != null, e => e.Counter >= input.MinCounterFilter)
                        .WhereIf(input.MaxCounterFilter != null, e => e.Counter <= input.MaxCounterFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycSegmentIdentifierDefinitionNameFilter), e => e.SycSegmentIdentifierDefinitionFk != null && e.SycSegmentIdentifierDefinitionFk.Name == input.SycSegmentIdentifierDefinitionNameFilter)
                        .WhereIf(input.SycSegmentIdentifierDefinitionIdFilter.HasValue, e => false || e.SycSegmentIdentifierDefinitionId == input.SycSegmentIdentifierDefinitionIdFilter.Value);

            var pagedAndFilteredSycCounters = filteredSycCounters
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

            var sycCounters = from o in pagedAndFilteredSycCounters
                              join o1 in _lookup_sycSegmentIdentifierDefinitionRepository.GetAll() on o.SycSegmentIdentifierDefinitionId equals o1.Id into j1
                              from s1 in j1.DefaultIfEmpty()

                              select new
                              {

                                  o.Counter,
                                  Id = o.Id,
                                  SycSegmentIdentifierDefinitionName = s1 == null || s1.Name == null ? "" : s1.Name.ToString()
                              };

            var totalCount = await filteredSycCounters.CountAsync();

            var dbList = await sycCounters.ToListAsync();
            var results = new List<GetSycCounterForViewDto>();

            foreach (var o in dbList)
            {
                var res = new GetSycCounterForViewDto()
                {
                    SycCounter = new SycCounterDto
                    {

                        Counter = o.Counter,
                        Id = o.Id,
                    },
                    SycSegmentIdentifierDefinitionName = o.SycSegmentIdentifierDefinitionName
                };

                results.Add(res);
            }

            return new PagedResultDto<GetSycCounterForViewDto>(
                totalCount,
                results
            );

        }

        public async Task<GetSycCounterForViewDto> GetSycCounterForView(long id)
        {
            var sycCounter = await _sycCounterRepository.GetAsync(id);

            var output = new GetSycCounterForViewDto { SycCounter = ObjectMapper.Map<SycCounterDto>(sycCounter) };

            if (output.SycCounter.SycSegmentIdentifierDefinitionId != null)
            {
                var _lookupSycSegmentIdentifierDefinition = await _lookup_sycSegmentIdentifierDefinitionRepository.FirstOrDefaultAsync((long)output.SycCounter.SycSegmentIdentifierDefinitionId);
                output.SycSegmentIdentifierDefinitionName = _lookupSycSegmentIdentifierDefinition?.Name?.ToString();
            }

            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycCounters_Edit)]
        public async Task<GetSycCounterForEditOutput> GetSycCounterForEdit(EntityDto<long> input)
        {
            var sycCounter = await _sycCounterRepository.FirstOrDefaultAsync(input.Id);

            var output = new GetSycCounterForEditOutput { SycCounter = ObjectMapper.Map<CreateOrEditSycCounterDto>(sycCounter) };

            if (output.SycCounter.SycSegmentIdentifierDefinitionId != null)
            {
                var _lookupSycSegmentIdentifierDefinition = await _lookup_sycSegmentIdentifierDefinitionRepository.FirstOrDefaultAsync((long)output.SycCounter.SycSegmentIdentifierDefinitionId);
                output.SycSegmentIdentifierDefinitionName = _lookupSycSegmentIdentifierDefinition?.Name?.ToString();
            }

            return output;
        }

        public async Task CreateOrEdit(CreateOrEditSycCounterDto input)
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

        [AbpAuthorize(AppPermissions.Pages_Administration_SycCounters_Create)]
        protected virtual async Task Create(CreateOrEditSycCounterDto input)
        {
            var sycCounter = ObjectMapper.Map<SycCounter>(input);

            if (AbpSession.TenantId != null)
            {
                sycCounter.TenantId = (int?)AbpSession.TenantId;
            }

            await _sycCounterRepository.InsertAsync(sycCounter);

        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycCounters_Edit)]
        protected virtual async Task Update(CreateOrEditSycCounterDto input)
        {
            var sycCounter = await _sycCounterRepository.FirstOrDefaultAsync((long)input.Id);
            ObjectMapper.Map(input, sycCounter);

        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycCounters_Delete)]
        public async Task Delete(EntityDto<long> input)
        {
            await _sycCounterRepository.DeleteAsync(input.Id);
        }

        public async Task<FileDto> GetSycCountersToExcel(GetAllSycCountersForExcelInput input)
        {

            var filteredSycCounters = _sycCounterRepository.GetAll()
                        .Include(e => e.SycSegmentIdentifierDefinitionFk)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false)
                        .WhereIf(input.MinCounterFilter != null, e => e.Counter >= input.MinCounterFilter)
                        .WhereIf(input.MaxCounterFilter != null, e => e.Counter <= input.MaxCounterFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycSegmentIdentifierDefinitionNameFilter), e => e.SycSegmentIdentifierDefinitionFk != null && e.SycSegmentIdentifierDefinitionFk.Name == input.SycSegmentIdentifierDefinitionNameFilter);

            var query = (from o in filteredSycCounters
                         join o1 in _lookup_sycSegmentIdentifierDefinitionRepository.GetAll() on o.SycSegmentIdentifierDefinitionId equals o1.Id into j1
                         from s1 in j1.DefaultIfEmpty()

                         select new GetSycCounterForViewDto()
                         {
                             SycCounter = new SycCounterDto
                             {
                                 Counter = o.Counter,
                                 Id = o.Id
                             },
                             SycSegmentIdentifierDefinitionName = s1 == null || s1.Name == null ? "" : s1.Name.ToString()
                         });

            var sycCounterListDtos = await query.ToListAsync();

            return _sycCountersExcelExporter.ExportToFile(sycCounterListDtos);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycCounters)]
        public async Task<PagedResultDto<SycCounterSycSegmentIdentifierDefinitionLookupTableDto>> GetAllSycSegmentIdentifierDefinitionForLookupTable(GetAllForLookupTableInput input)
        {
            var query = _lookup_sycSegmentIdentifierDefinitionRepository.GetAll().WhereIf(
                   !string.IsNullOrWhiteSpace(input.Filter),
                  e => e.Name != null && e.Name.Contains(input.Filter)
               );

            var totalCount = await query.CountAsync();

            var sycSegmentIdentifierDefinitionList = await query
                .PageBy(input)
                .ToListAsync();

            var lookupTableDtoList = new List<SycCounterSycSegmentIdentifierDefinitionLookupTableDto>();
            foreach (var sycSegmentIdentifierDefinition in sycSegmentIdentifierDefinitionList)
            {
                lookupTableDtoList.Add(new SycCounterSycSegmentIdentifierDefinitionLookupTableDto
                {
                    Id = sycSegmentIdentifierDefinition.Id,
                    DisplayName = sycSegmentIdentifierDefinition.Name?.ToString()
                });
            }

            return new PagedResultDto<SycCounterSycSegmentIdentifierDefinitionLookupTableDto>(
                totalCount,
                lookupTableDtoList
            );
        }

    }
}