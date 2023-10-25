using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.SycIdentifierDefinitions.Exporting;
using onetouch.SycIdentifierDefinitions.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using Abp.UI;
using onetouch.Storage;
using onetouch.SystemObjects;
using onetouch.SycCounters;
using onetouch.SycSegmentIdentifierDefinitions;
using onetouch.SycSegmentIdentifierDefinitions.Dtos;
using onetouch.SystemObjects.Dtos;
using Abp.Domain.Uow;

namespace onetouch.SycIdentifierDefinitions
{
    [AbpAuthorize(AppPermissions.Pages_Administration_SycIdentifierDefinitions)]
    public class SycIdentifierDefinitionsAppService : onetouchAppServiceBase, ISycIdentifierDefinitionsAppService
    {
        private readonly IRepository<SycIdentifierDefinition, long> _sycIdentifierDefinitionRepository;
        private readonly IRepository<SycSegmentIdentifierDefinition, long> _sycSegmentIdentifierDefinition;
        private readonly IRepository<SycCounter, long> _sycCounter;
        private readonly IRepository<SycEntityObjectType, long> _sycEntityObjectTypeRepository;
        private readonly ISycIdentifierDefinitionsExcelExporter _sycIdentifierDefinitionsExcelExporter;

        public SycIdentifierDefinitionsAppService(
            IRepository<SycIdentifierDefinition, long> sycIdentifierDefinitionRepository,
            ISycIdentifierDefinitionsExcelExporter sycIdentifierDefinitionsExcelExporter,
            IRepository<SycEntityObjectType, long> SycEntityObjectTypeRepository,
            IRepository<SycSegmentIdentifierDefinition, long> SycSegmentIdentifierDefinition,
            IRepository<SycCounter, long> SycCounter
            )
        {
            _sycIdentifierDefinitionRepository = sycIdentifierDefinitionRepository;
            _sycIdentifierDefinitionsExcelExporter = sycIdentifierDefinitionsExcelExporter;
            _sycEntityObjectTypeRepository = SycEntityObjectTypeRepository;
            _sycSegmentIdentifierDefinition = SycSegmentIdentifierDefinition;
            _sycCounter = SycCounter;
        }

        public async Task<PagedResultDto<GetSycIdentifierDefinitionForViewDto>> GetAll(GetAllSycIdentifierDefinitionsInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var filteredSycIdentifierDefinitions = _sycIdentifierDefinitionRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                        .WhereIf(input.IsTenantLevelFilter.HasValue && input.IsTenantLevelFilter > -1, e => (input.IsTenantLevelFilter == 1 && e.IsTenantLevel) || (input.IsTenantLevelFilter == 0 && !e.IsTenantLevel))
                        .WhereIf(input.MinNumberOfSegmentsFilter != null, e => e.NumberOfSegments >= input.MinNumberOfSegmentsFilter)
                        .WhereIf(input.MaxNumberOfSegmentsFilter != null, e => e.NumberOfSegments <= input.MaxNumberOfSegmentsFilter)
                        .WhereIf(input.MinMaxLengthFilter != null, e => e.MaxLength >= input.MinMaxLengthFilter)
                        .WhereIf(input.MaxMaxLengthFilter != null, e => e.MaxLength <= input.MaxMaxLengthFilter)
                        .WhereIf(input.MinMinSegmentLengthFilter != null, e => e.MinSegmentLength >= input.MinMinSegmentLengthFilter)
                        .WhereIf(input.MaxMinSegmentLengthFilter != null, e => e.MinSegmentLength <= input.MaxMinSegmentLengthFilter)
                        .WhereIf(input.MinMaxSegmentLengthFilter != null, e => e.MaxSegmentLength >= input.MinMaxSegmentLengthFilter)
                        .WhereIf(input.MaxMaxSegmentLengthFilter != null, e => e.MaxSegmentLength <= input.MaxMaxSegmentLengthFilter);

                var pagedAndFilteredSycIdentifierDefinitions = filteredSycIdentifierDefinitions
                    .OrderBy(input.Sorting ?? "id asc")
                    .PageBy(input);

                var sycIdentifierDefinitions = from o in pagedAndFilteredSycIdentifierDefinitions
                                               select new
                                               {

                                                   o.Code,
                                                   o.IsTenantLevel,
                                                   o.NumberOfSegments,
                                                   o.MaxLength,
                                                   o.MinSegmentLength,
                                                   o.MaxSegmentLength,
                                                   Id = o.Id
                                               };

                var totalCount = await filteredSycIdentifierDefinitions.CountAsync();

                var dbList = await sycIdentifierDefinitions.ToListAsync();
                var results = new List<GetSycIdentifierDefinitionForViewDto>();

                foreach (var o in dbList)
                {
                    var res = new GetSycIdentifierDefinitionForViewDto()
                    {
                        SycIdentifierDefinition = new SycIdentifierDefinitionDto
                        {

                            Code = o.Code,
                            IsTenantLevel = o.IsTenantLevel,
                            NumberOfSegments = o.NumberOfSegments,
                            MaxLength = o.MaxLength,
                            MinSegmentLength = o.MinSegmentLength,
                            MaxSegmentLength = o.MaxSegmentLength,
                            Id = o.Id,
                        }
                    };

                    results.Add(res);
                }

                return new PagedResultDto<GetSycIdentifierDefinitionForViewDto>(
                    totalCount,
                    results
                );
            }
        }
        [AbpAllowAnonymous] 
        public async Task<GetSycIdentifierDefinitionForViewDto> GetSycIdentifierDefinitionForView(long id)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var sycIdentifierDefinition = await _sycIdentifierDefinitionRepository.GetAsync(id);

                var output = new GetSycIdentifierDefinitionForViewDto { SycIdentifierDefinition = ObjectMapper.Map<SycIdentifierDefinitionDto>(sycIdentifierDefinition) };

                return output;
            }
        }
        [AbpAllowAnonymous]
        public SycIdentifierDefinition GetSycIdentifierDefinitionByCodeForCurrentTenant(string code)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                SycIdentifierDefinition output = new SycIdentifierDefinition();
                var sycIdentifierDefinitionList = _sycIdentifierDefinitionRepository.GetAll().Where(e => e.Code == code && e.TenantId == (int?)AbpSession.TenantId).ToList();

                if (sycIdentifierDefinitionList != null && sycIdentifierDefinitionList.Count > 0)
                {
                    output = sycIdentifierDefinitionList[0];
                }

                return output;
            }
        }

        [AbpAllowAnonymous]
        public async Task<GetSycIdentifierDefinitionForViewDto> GetSycIdentifierDefinitionByTypeForView(string code)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                var sycEntityObjectType = _sycEntityObjectTypeRepository.GetAll().Where(e => e.Code == code)
                    .Include(e=> e.ParentFk)
                    .FirstOrDefault();
                var output = new GetSycIdentifierDefinitionForViewDto { };

                if (sycEntityObjectType != null && sycEntityObjectType.SycIdentifierDefinitionId > 0)
                {
                    var sycIdentifierDefinition = await _sycIdentifierDefinitionRepository.GetAsync((long)sycEntityObjectType.SycIdentifierDefinitionId);
                    if (sycIdentifierDefinition != null && sycIdentifierDefinition.Id > 0)
                    {
                        // custom identifier should be with the same default identifier code, as per Mr Hesham requirments and design.
                        var sycIdentifierDefinitionForTenant = GetSycIdentifierDefinitionByCodeForCurrentTenant(sycIdentifierDefinition.Code);
                        if (sycIdentifierDefinitionForTenant != null && sycIdentifierDefinitionForTenant.Id > 0)
                        {
                            sycIdentifierDefinition = sycIdentifierDefinitionForTenant;
                        }
                        output = new GetSycIdentifierDefinitionForViewDto { SycIdentifierDefinition = ObjectMapper.Map<SycIdentifierDefinitionDto>(sycIdentifierDefinition) };
                        var sycSegmentIdentifierDefinitions = _sycSegmentIdentifierDefinition.GetAll().Where(e => e.SycIdentifierDefinitionId == sycIdentifierDefinition.Id).ToList();
                        output.SycSegmentIdentifierDefinitions = ObjectMapper.Map<List<SycSegmentIdentifierDefinitionDto>>(sycSegmentIdentifierDefinitions);
                    }
                    else
                    {
                        // try to find using the entity type parent
                        if(sycEntityObjectType.ParentId !=null && sycEntityObjectType.ParentId > 0)
                        {
                            output = await GetSycIdentifierDefinitionByTypeForView(sycEntityObjectType.ParentFk.Code);
                        }
                    }
                }

                return output;
            }
        }
        [AbpAllowAnonymous]
        public async Task<string> GetNextEntityCode(string code)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                string output = "";
                var sycIdentifierDefinitionForViewDto = await GetSycIdentifierDefinitionByTypeForView(code);
                if (sycIdentifierDefinitionForViewDto != null && sycIdentifierDefinitionForViewDto.SycSegmentIdentifierDefinitions.Count > 0)
                {
                    foreach (var segment in sycIdentifierDefinitionForViewDto.SycSegmentIdentifierDefinitions)
                    {
                        if (segment.IsAutoGenerated)
                        {
                            var sycCounter = _sycCounter.GetAll().Where(e => e.SycSegmentIdentifierDefinitionId == segment.Id && e.TenantId == AbpSession.TenantId).FirstOrDefault();
                            if (sycCounter == null)
                            {
                                sycCounter = new SycCounter();
                                sycCounter.SycSegmentIdentifierDefinitionId = segment.Id;
                                sycCounter.Counter = segment.CodeStartingValue;
                                if (AbpSession.TenantId != null)
                                {
                                    sycCounter.TenantId = (int?)AbpSession.TenantId;
                                }
                                await _sycCounter.InsertAsync(sycCounter);
                                await CurrentUnitOfWork.SaveChangesAsync();
                            }

                            sycCounter = _sycCounter.GetAll().Where(e => e.SycSegmentIdentifierDefinitionId == segment.Id && e.TenantId == AbpSession.TenantId).FirstOrDefault();
                            if (sycCounter != null)
                            {
                                sycCounter.Counter = sycCounter.Counter + 1;
                                output = sycCounter.Counter.ToString();
                                await _sycCounter.UpdateAsync(sycCounter);
                            }
                        }
                    }
                }
                return output;
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycIdentifierDefinitions_Edit)]
        public async Task<GetSycIdentifierDefinitionForEditOutput> GetSycIdentifierDefinitionForEdit(EntityDto<long> input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var sycIdentifierDefinition = await _sycIdentifierDefinitionRepository.FirstOrDefaultAsync(input.Id);

                var output = new GetSycIdentifierDefinitionForEditOutput { SycIdentifierDefinition = ObjectMapper.Map<CreateOrEditSycIdentifierDefinitionDto>(sycIdentifierDefinition) };

                return output;
            }
        }

        public async Task CreateOrEdit(CreateOrEditSycIdentifierDefinitionDto input)
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

        [AbpAuthorize(AppPermissions.Pages_Administration_SycIdentifierDefinitions_Create)]
        protected virtual async Task Create(CreateOrEditSycIdentifierDefinitionDto input)
        {
            var sycIdentifierDefinition = ObjectMapper.Map<SycIdentifierDefinition>(input);

            if (AbpSession.TenantId != null)
            {
                sycIdentifierDefinition.TenantId = (int?)AbpSession.TenantId;
            }

            await _sycIdentifierDefinitionRepository.InsertAsync(sycIdentifierDefinition);

        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycIdentifierDefinitions_Edit)]
        protected virtual async Task Update(CreateOrEditSycIdentifierDefinitionDto input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var sycIdentifierDefinition = await _sycIdentifierDefinitionRepository.FirstOrDefaultAsync((long)input.Id);
                ObjectMapper.Map(input, sycIdentifierDefinition);
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycIdentifierDefinitions_Delete)]
        public async Task Delete(EntityDto<long> input)
        {
            //await _sycIdentifierDefinitionRepository.DeleteAsync(input.Id);
        }

        [AbpAuthorize(AppPermissions.Pages_SycEntityObjectTypes)]
        public async Task<PagedResultDto<SycEntityObjectTypeSycIdentifierDefinitionLookupTableDto>> GetAllSycIdentifierDefinitionForLookupTable(onetouch.SycIdentifierDefinitions.Dtos.GetAllForLookupTableInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var query = _sycIdentifierDefinitionRepository.GetAll().WhereIf(
                   !string.IsNullOrWhiteSpace(input.Filter),
                  e => e.Code != null && e.Code.Contains(input.Filter)
               );

                var totalCount = await query.CountAsync();

                var sycIdentifierDefinitionList = await query
                    .PageBy(input)
                    .ToListAsync();

                var lookupTableDtoList = new List<SycEntityObjectTypeSycIdentifierDefinitionLookupTableDto>();
                foreach (var sycIdentifierDefinition in sycIdentifierDefinitionList)
                {
                    lookupTableDtoList.Add(new SycEntityObjectTypeSycIdentifierDefinitionLookupTableDto
                    {
                        Id = sycIdentifierDefinition.Id,
                        DisplayName = sycIdentifierDefinition.Code?.ToString()
                    });
                }

                return new PagedResultDto<SycEntityObjectTypeSycIdentifierDefinitionLookupTableDto>(
                    totalCount,
                    lookupTableDtoList
                );
            }
        }

        public async Task<FileDto> GetSycIdentifierDefinitionsToExcel(GetAllSycIdentifierDefinitionsForExcelInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                var filteredSycIdentifierDefinitions = _sycIdentifierDefinitionRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                        .WhereIf(input.IsTenantLevelFilter.HasValue && input.IsTenantLevelFilter > -1, e => (input.IsTenantLevelFilter == 1 && e.IsTenantLevel) || (input.IsTenantLevelFilter == 0 && !e.IsTenantLevel))
                        .WhereIf(input.MinNumberOfSegmentsFilter != null, e => e.NumberOfSegments >= input.MinNumberOfSegmentsFilter)
                        .WhereIf(input.MaxNumberOfSegmentsFilter != null, e => e.NumberOfSegments <= input.MaxNumberOfSegmentsFilter)
                        .WhereIf(input.MinMaxLengthFilter != null, e => e.MaxLength >= input.MinMaxLengthFilter)
                        .WhereIf(input.MaxMaxLengthFilter != null, e => e.MaxLength <= input.MaxMaxLengthFilter)
                        .WhereIf(input.MinMinSegmentLengthFilter != null, e => e.MinSegmentLength >= input.MinMinSegmentLengthFilter)
                        .WhereIf(input.MaxMinSegmentLengthFilter != null, e => e.MinSegmentLength <= input.MaxMinSegmentLengthFilter)
                        .WhereIf(input.MinMaxSegmentLengthFilter != null, e => e.MaxSegmentLength >= input.MinMaxSegmentLengthFilter)
                        .WhereIf(input.MaxMaxSegmentLengthFilter != null, e => e.MaxSegmentLength <= input.MaxMaxSegmentLengthFilter);

                var query = (from o in filteredSycIdentifierDefinitions
                             select new GetSycIdentifierDefinitionForViewDto()
                             {
                                 SycIdentifierDefinition = new SycIdentifierDefinitionDto
                                 {
                                     Code = o.Code,
                                     IsTenantLevel = o.IsTenantLevel,
                                     NumberOfSegments = o.NumberOfSegments,
                                     MaxLength = o.MaxLength,
                                     MinSegmentLength = o.MinSegmentLength,
                                     MaxSegmentLength = o.MaxSegmentLength,
                                     Id = o.Id
                                 }
                             });

                var sycIdentifierDefinitionListDtos = await query.ToListAsync();

                return _sycIdentifierDefinitionsExcelExporter.ExportToFile(sycIdentifierDefinitionListDtos);
            }
        }
    }
}