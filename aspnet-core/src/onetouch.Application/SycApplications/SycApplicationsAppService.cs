using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.SycApplications.Exporting;
using onetouch.SycApplications.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;

namespace onetouch.SycApplications
{
    [AbpAuthorize(AppPermissions.Pages_Administration_SycApplications)]
    public class SycApplicationsAppService : onetouchAppServiceBase, ISycApplicationsAppService
    {
        private readonly IRepository<SycApplication> _sycApplicationRepository;
        private readonly ISycApplicationsExcelExporter _sycApplicationsExcelExporter;

        public SycApplicationsAppService(IRepository<SycApplication> sycApplicationRepository, ISycApplicationsExcelExporter sycApplicationsExcelExporter)
        {
            _sycApplicationRepository = sycApplicationRepository;
            _sycApplicationsExcelExporter = sycApplicationsExcelExporter;

        }

        public async Task<PagedResultDto<GetSycApplicationForViewDto>> GetAll(GetAllSycApplicationsInput input)
        {

            var filteredSycApplications = _sycApplicationRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter) || e.Name.Contains(input.Filter) || e.Notes.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name == input.NameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NotesFilter), e => e.Notes == input.NotesFilter);

            var pagedAndFilteredSycApplications = filteredSycApplications
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

            var sycApplications = from o in pagedAndFilteredSycApplications
                                  select new GetSycApplicationForViewDto()
                                  {
                                      SycApplication = new SycApplicationDto
                                      {
                                          Code = o.Code,
                                          Name = o.Name,
                                          Notes = o.Notes,
                                          Id = o.Id
                                      }
                                  };

            var totalCount = await filteredSycApplications.CountAsync();

            return new PagedResultDto<GetSycApplicationForViewDto>(
                totalCount,
                await sycApplications.ToListAsync()
            );
        }

        public async Task<GetSycApplicationForViewDto> GetSycApplicationForView(int id)
        {
            var sycApplication = await _sycApplicationRepository.GetAsync(id);

            var output = new GetSycApplicationForViewDto { SycApplication = ObjectMapper.Map<SycApplicationDto>(sycApplication) };

            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycApplications_Edit)]
        public async Task<GetSycApplicationForEditOutput> GetSycApplicationForEdit(EntityDto input)
        {
            var sycApplication = await _sycApplicationRepository.FirstOrDefaultAsync(input.Id);

            var output = new GetSycApplicationForEditOutput { SycApplication = ObjectMapper.Map<CreateOrEditSycApplicationDto>(sycApplication) };

            return output;
        }

        public async Task CreateOrEdit(CreateOrEditSycApplicationDto input)
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

        [AbpAuthorize(AppPermissions.Pages_Administration_SycApplications_Create)]
        protected virtual async Task Create(CreateOrEditSycApplicationDto input)
        {
            var sycApplication = ObjectMapper.Map<SycApplication>(input);

            await _sycApplicationRepository.InsertAsync(sycApplication);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycApplications_Edit)]
        protected virtual async Task Update(CreateOrEditSycApplicationDto input)
        {
            var sycApplication = await _sycApplicationRepository.FirstOrDefaultAsync((int)input.Id);
            ObjectMapper.Map(input, sycApplication);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycApplications_Delete)]
        public async Task Delete(EntityDto input)
        {
            await _sycApplicationRepository.DeleteAsync(input.Id);
        }

        public async Task<FileDto> GetSycApplicationsToExcel(GetAllSycApplicationsForExcelInput input)
        {

            var filteredSycApplications = _sycApplicationRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter) || e.Name.Contains(input.Filter) || e.Notes.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name == input.NameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NotesFilter), e => e.Notes == input.NotesFilter);

            var query = (from o in filteredSycApplications
                         select new GetSycApplicationForViewDto()
                         {
                             SycApplication = new SycApplicationDto
                             {
                                 Code = o.Code,
                                 Name = o.Name,
                                 Notes = o.Notes,
                                 Id = o.Id
                             }
                         });

            var sycApplicationListDtos = await query.ToListAsync();

            return _sycApplicationsExcelExporter.ExportToFile(sycApplicationListDtos);
        }

    }
}