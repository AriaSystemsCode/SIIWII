using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.SycServices.Exporting;
using onetouch.SycServices.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;

namespace onetouch.SycServices
{
    [AbpAuthorize(AppPermissions.Pages_Administration_SycServices)]
    public class SycServicesAppService : onetouchAppServiceBase, ISycServicesAppService
    {
        private readonly IRepository<SycService> _sycServiceRepository;
        private readonly ISycServicesExcelExporter _sycServicesExcelExporter;

        public SycServicesAppService(IRepository<SycService> sycServiceRepository, ISycServicesExcelExporter sycServicesExcelExporter)
        {
            _sycServiceRepository = sycServiceRepository;
            _sycServicesExcelExporter = sycServicesExcelExporter;

        }

        public async Task<PagedResultDto<GetSycServiceForViewDto>> GetAll(GetAllSycServicesInput input)
        {

            var filteredSycServices = _sycServiceRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter) || e.Description.Contains(input.Filter) || e.UnitOfMeasure.Contains(input.Filter) || e.Notes.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.DescriptionFilter), e => e.Description == input.DescriptionFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.UnitOfMeasureFilter), e => e.UnitOfMeasure == input.UnitOfMeasureFilter)
                        .WhereIf(input.MinUnitPriceFilter != null, e => e.UnitPrice >= input.MinUnitPriceFilter)
                        .WhereIf(input.MaxUnitPriceFilter != null, e => e.UnitPrice <= input.MaxUnitPriceFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NotesFilter), e => e.Notes == input.NotesFilter);

            var pagedAndFilteredSycServices = filteredSycServices
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

            var sycServices = from o in pagedAndFilteredSycServices
                              select new GetSycServiceForViewDto()
                              {
                                  SycService = new SycServiceDto
                                  {
                                      Code = o.Code,
                                      Description = o.Description,
                                      UnitOfMeasure = o.UnitOfMeasure,
                                      UnitPrice = o.UnitPrice,
                                      Notes = o.Notes,
                                      Id = o.Id
                                  }
                              };

            var totalCount = await filteredSycServices.CountAsync();

            return new PagedResultDto<GetSycServiceForViewDto>(
                totalCount,
                await sycServices.ToListAsync()
            );
        }

        public async Task<GetSycServiceForViewDto> GetSycServiceForView(int id)
        {
            var sycService = await _sycServiceRepository.GetAsync(id);

            var output = new GetSycServiceForViewDto { SycService = ObjectMapper.Map<SycServiceDto>(sycService) };

            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycServices_Edit)]
        public async Task<GetSycServiceForEditOutput> GetSycServiceForEdit(EntityDto input)
        {
            var sycService = await _sycServiceRepository.FirstOrDefaultAsync(input.Id);

            var output = new GetSycServiceForEditOutput { SycService = ObjectMapper.Map<CreateOrEditSycServiceDto>(sycService) };

            return output;
        }

        public async Task CreateOrEdit(CreateOrEditSycServiceDto input)
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

        [AbpAuthorize(AppPermissions.Pages_Administration_SycServices_Create)]
        protected virtual async Task Create(CreateOrEditSycServiceDto input)
        {
            var sycService = ObjectMapper.Map<SycService>(input);

            await _sycServiceRepository.InsertAsync(sycService);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycServices_Edit)]
        protected virtual async Task Update(CreateOrEditSycServiceDto input)
        {
            var sycService = await _sycServiceRepository.FirstOrDefaultAsync((int)input.Id);
            ObjectMapper.Map(input, sycService);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycServices_Delete)]
        public async Task Delete(EntityDto input)
        {
            await _sycServiceRepository.DeleteAsync(input.Id);
        }

        public async Task<FileDto> GetSycServicesToExcel(GetAllSycServicesForExcelInput input)
        {

            var filteredSycServices = _sycServiceRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter) || e.Description.Contains(input.Filter) || e.UnitOfMeasure.Contains(input.Filter) || e.Notes.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.DescriptionFilter), e => e.Description == input.DescriptionFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.UnitOfMeasureFilter), e => e.UnitOfMeasure == input.UnitOfMeasureFilter)
                        .WhereIf(input.MinUnitPriceFilter != null, e => e.UnitPrice >= input.MinUnitPriceFilter)
                        .WhereIf(input.MaxUnitPriceFilter != null, e => e.UnitPrice <= input.MaxUnitPriceFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NotesFilter), e => e.Notes == input.NotesFilter);

            var query = (from o in filteredSycServices
                         select new GetSycServiceForViewDto()
                         {
                             SycService = new SycServiceDto
                             {
                                 Code = o.Code,
                                 Description = o.Description,
                                 UnitOfMeasure = o.UnitOfMeasure,
                                 UnitPrice = o.UnitPrice,
                                 Notes = o.Notes,
                                 Id = o.Id
                             }
                         });

            var sycServiceListDtos = await query.ToListAsync();

            return _sycServicesExcelExporter.ExportToFile(sycServiceListDtos);
        }

    }
}