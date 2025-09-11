using onetouch.SycApplications;

using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.SycPlans.Exporting;
using onetouch.SycPlans.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;

namespace onetouch.SycPlans
{
    [AbpAuthorize(AppPermissions.Pages_Administration_SycPlans)]
    public class SycPlansAppService : onetouchAppServiceBase, ISycPlansAppService
    {
        private readonly IRepository<SycPlan> _sycPlanRepository;
        private readonly ISycPlansExcelExporter _sycPlansExcelExporter;
        private readonly IRepository<SycApplication, int> _lookup_sycApplicationRepository;

        public SycPlansAppService(IRepository<SycPlan> sycPlanRepository, ISycPlansExcelExporter sycPlansExcelExporter, IRepository<SycApplication, int> lookup_sycApplicationRepository)
        {
            _sycPlanRepository = sycPlanRepository;
            _sycPlansExcelExporter = sycPlansExcelExporter;
            _lookup_sycApplicationRepository = lookup_sycApplicationRepository;

        }

        public async Task<PagedResultDto<GetSycPlanForViewDto>> GetAll(GetAllSycPlansInput input)
        {

            var filteredSycPlans = _sycPlanRepository.GetAll()
                        .Include(e => e.ApplicationFk)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter) || e.Name.Contains(input.Filter) || e.Notes.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name == input.NameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NotesFilter), e => e.Notes == input.NotesFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycApplicationNameFilter), e => e.ApplicationFk != null && e.ApplicationFk.Name == input.SycApplicationNameFilter);

            var pagedAndFilteredSycPlans = filteredSycPlans
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

            var sycPlans = from o in pagedAndFilteredSycPlans
                           join o1 in _lookup_sycApplicationRepository.GetAll() on o.ApplicationId equals o1.Id into j1
                           from s1 in j1.DefaultIfEmpty()

                           select new GetSycPlanForViewDto()
                           {
                               SycPlan = new SycPlanDto
                               {
                                   Code = o.Code,
                                   Name = o.Name,
                                   Notes = o.Notes,
                                   Id = o.Id
                               },
                               SycApplicationName = s1 == null || s1.Name == null ? "" : s1.Name.ToString()
                           };

            var totalCount = await filteredSycPlans.CountAsync();

            return new PagedResultDto<GetSycPlanForViewDto>(
                totalCount,
                await sycPlans.ToListAsync()
            );
        }

        public async Task<GetSycPlanForViewDto> GetSycPlanForView(int id)
        {
            var sycPlan = await _sycPlanRepository.GetAsync(id);

            var output = new GetSycPlanForViewDto { SycPlan = ObjectMapper.Map<SycPlanDto>(sycPlan) };

            if (output.SycPlan.ApplicationId != null)
            {
                var _lookupSycApplication = await _lookup_sycApplicationRepository.FirstOrDefaultAsync((int)output.SycPlan.ApplicationId);
                output.SycApplicationName = _lookupSycApplication?.Name?.ToString();
            }

            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycPlans_Edit)]
        public async Task<GetSycPlanForEditOutput> GetSycPlanForEdit(EntityDto input)
        {
            var sycPlan = await _sycPlanRepository.FirstOrDefaultAsync(input.Id);

            var output = new GetSycPlanForEditOutput { SycPlan = ObjectMapper.Map<CreateOrEditSycPlanDto>(sycPlan) };

            if (output.SycPlan.ApplicationId != null)
            {
                var _lookupSycApplication = await _lookup_sycApplicationRepository.FirstOrDefaultAsync((int)output.SycPlan.ApplicationId);
                output.SycApplicationName = _lookupSycApplication?.Name?.ToString();
            }

            return output;
        }

        public async Task CreateOrEdit(CreateOrEditSycPlanDto input)
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

        [AbpAuthorize(AppPermissions.Pages_Administration_SycPlans_Create)]
        protected virtual async Task Create(CreateOrEditSycPlanDto input)
        {
            var sycPlan = ObjectMapper.Map<SycPlan>(input);

            await _sycPlanRepository.InsertAsync(sycPlan);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycPlans_Edit)]
        protected virtual async Task Update(CreateOrEditSycPlanDto input)
        {
            var sycPlan = await _sycPlanRepository.FirstOrDefaultAsync((int)input.Id);
            ObjectMapper.Map(input, sycPlan);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycPlans_Delete)]
        public async Task Delete(EntityDto input)
        {
            await _sycPlanRepository.DeleteAsync(input.Id);
        }

        public async Task<FileDto> GetSycPlansToExcel(GetAllSycPlansForExcelInput input)
        {

            var filteredSycPlans = _sycPlanRepository.GetAll()
                        .Include(e => e.ApplicationFk)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter) || e.Name.Contains(input.Filter) || e.Notes.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name == input.NameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NotesFilter), e => e.Notes == input.NotesFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycApplicationNameFilter), e => e.ApplicationFk != null && e.ApplicationFk.Name == input.SycApplicationNameFilter);

            var query = (from o in filteredSycPlans
                         join o1 in _lookup_sycApplicationRepository.GetAll() on o.ApplicationId equals o1.Id into j1
                         from s1 in j1.DefaultIfEmpty()

                         select new GetSycPlanForViewDto()
                         {
                             SycPlan = new SycPlanDto
                             {
                                 Code = o.Code,
                                 Name = o.Name,
                                 Notes = o.Notes,
                                 Id = o.Id
                             },
                             SycApplicationName = s1 == null || s1.Name == null ? "" : s1.Name.ToString()
                         });

            var sycPlanListDtos = await query.ToListAsync();

            return _sycPlansExcelExporter.ExportToFile(sycPlanListDtos);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycPlans)]
        public async Task<List<SycPlanSycApplicationLookupTableDto>> GetAllSycApplicationForTableDropdown()
        {
            return await _lookup_sycApplicationRepository.GetAll()
                .Select(sycApplication => new SycPlanSycApplicationLookupTableDto
                {
                    Id = sycApplication.Id,
                    DisplayName = sycApplication == null || sycApplication.Name == null ? "" : sycApplication.Name.ToString()
                }).ToListAsync();
        }

    }
}