using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.AppSubscriptionPlans.Exporting;
using onetouch.AppSubscriptionPlans.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using Abp.UI;
using onetouch.Storage;
using onetouch.Helpers;
using onetouch.SycSegmentIdentifierDefinitions;
using NPOI.HPSF;
using Microsoft.Extensions.Configuration;
using onetouch.Configuration;
using System.IO;
using Abp.Domain.Uow;

namespace onetouch.AppSubscriptionPlans
{
    [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantInvoices)]
    public class AppTenantInvoicesAppService : onetouchAppServiceBase, 
        IAppTenantInvoicesAppService
    {
        private readonly IConfigurationRoot _appConfiguration;
        private readonly IRepository<AppTenantInvoice, long> _appTenantInvoiceRepository;
        private readonly IAppTenantInvoicesExcelExporter _appTenantInvoicesExcelExporter;
        private readonly Helper _helper;
        public AppTenantInvoicesAppService(IRepository<AppTenantInvoice, long> appTenantInvoiceRepository, IAppConfigurationAccessor appConfigurationAccessor,
        Helper helper, IAppTenantInvoicesExcelExporter appTenantInvoicesExcelExporter)
        {
            _appTenantInvoiceRepository = appTenantInvoiceRepository;
            _appTenantInvoicesExcelExporter = appTenantInvoicesExcelExporter;
            _helper = helper;
            _appConfiguration = appConfigurationAccessor.Configuration;
        }

        public async Task<PagedResultDto<GetAppTenantInvoiceForViewDto>> GetAll(GetAllAppTenantInvoicesInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                // var pathSource = _appConfiguration[$"Attachment:Path"] + @"\" + "-1" + @"\" ;
                string pathSource = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/" + "-1" + @"/";
                var filteredAppTenantInvoices = _appTenantInvoiceRepository.GetAll().Include(z => z.EntityAttachments).ThenInclude(z => z.AttachmentFk)
                            .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.InvoiceNumber.Contains(input.Filter))
                            .WhereIf(!string.IsNullOrWhiteSpace(input.InvoiceNumberFilter), e => e.InvoiceNumber == input.InvoiceNumberFilter)
                            .WhereIf(input.MinInvoiceDateFilter != null, e => e.InvoiceDate >= input.MinInvoiceDateFilter)
                            .WhereIf(input.MaxInvoiceDateFilter != null, e => e.InvoiceDate <= input.MaxInvoiceDateFilter)
                            .WhereIf(input.MinDueDateFilter != null, e => e.DueDate >= input.MinDueDateFilter)
                            .WhereIf(input.MaxDueDateFilter != null, e => e.DueDate <= input.MaxDueDateFilter)
                            .WhereIf(input.MinPayDateFilter != null, e => e.PayDate >= input.MinPayDateFilter)
                            .WhereIf(input.MaxPayDateFilter != null, e => e.PayDate <= input.MaxPayDateFilter)
                            .WhereIf(input.TenantId != null, e => e.TenantId == input.TenantId);
                var pagedAndFilteredAppTenantInvoices = filteredAppTenantInvoices
                    .OrderBy(input.Sorting ?? "id asc")
                    .PageBy(input);

                var appTenantInvoices = from o in pagedAndFilteredAppTenantInvoices
                                        select new
                                        {

                                            o.InvoiceNumber,
                                            o.InvoiceDate,
                                            o.Amount,
                                            o.DueDate,
                                            o.PayDate,
                                            Id = o.Id,
                                            Attachment = ((o.EntityAttachments != null && o.EntityAttachments.Count > 0
                                                           && o.EntityAttachments[0] != null && o.EntityAttachments[0].AttachmentFk != null)
                                            ? o.EntityAttachments[0].AttachmentFk.Attachment : null),
                                            DisplayName = ((o.EntityAttachments != null && o.EntityAttachments.Count > 0
                                                           && o.EntityAttachments[0] != null && o.EntityAttachments[0].AttachmentFk != null)
                                            ? o.EntityAttachments[0].AttachmentFk.Name : null)
                                        };

                var totalCount = await filteredAppTenantInvoices.CountAsync();

                var dbList = await appTenantInvoices.ToListAsync();
                var results = new List<GetAppTenantInvoiceForViewDto>();

                foreach (var o in dbList)
                {
                    var res = new GetAppTenantInvoiceForViewDto()
                    {
                        AppTenantInvoice = new AppTenantInvoiceDto
                        {

                            InvoiceNumber = o.InvoiceNumber,
                            InvoiceDate = o.InvoiceDate,
                            Amount = o.Amount,
                            DueDate = o.DueDate,
                            PayDate = o.PayDate,
                            Id = o.Id,
                            Attachment = !string.IsNullOrEmpty(o.Attachment) ? (pathSource + o.Attachment) : null,
                            DisplayName = o.DisplayName.TrimEnd() + Path.GetExtension(o.Attachment), //Path.GetFileNameWithoutExtension(templateFileName) + DateTime.Now.ToString("yyyyMMddhhmmss") + Path.GetExtension(templateFileName);
                        }
                    };

                    results.Add(res);
                }

                return new PagedResultDto<GetAppTenantInvoiceForViewDto>(
                    totalCount,
                    results
                );
            }
        }

        public async Task<GetAppTenantInvoiceForViewDto> GetAppTenantInvoiceForView(long id)
        {
            var appTenantInvoice = await _appTenantInvoiceRepository.GetAsync(id);

            var output = new GetAppTenantInvoiceForViewDto { AppTenantInvoice = ObjectMapper.Map<AppTenantInvoiceDto>(appTenantInvoice) };

            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantInvoices_Edit)]
        public async Task<GetAppTenantInvoiceForEditOutput> GetAppTenantInvoiceForEdit(EntityDto<long> input)
        {
            var appTenantInvoice = await _appTenantInvoiceRepository.FirstOrDefaultAsync(input.Id);

            var output = new GetAppTenantInvoiceForEditOutput { AppTenantInvoice = ObjectMapper.Map<CreateOrEditAppTenantInvoiceDto>(appTenantInvoice) };

            return output;
        }

        public async Task CreateOrEdit(CreateOrEditAppTenantInvoiceDto input)
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

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantInvoices_Create)]
        protected virtual async Task Create(CreateOrEditAppTenantInvoiceDto input)
        {
            var appTenantInvoice = ObjectMapper.Map<AppTenantInvoice>(input);
            appTenantInvoice.Code = appTenantInvoice.InvoiceNumber;
            appTenantInvoice.Name = appTenantInvoice.InvoiceNumber;
            appTenantInvoice.ObjectId = await _helper.SystemTables.GetObjectTransactionId();
            appTenantInvoice.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeARInvoice();
            await _appTenantInvoiceRepository.InsertAsync(appTenantInvoice);

        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantInvoices_Edit)]
        protected virtual async Task Update(CreateOrEditAppTenantInvoiceDto input)
        {
            var appTenantInvoice = await _appTenantInvoiceRepository.FirstOrDefaultAsync((long)input.Id);
            ObjectMapper.Map(input, appTenantInvoice);
            appTenantInvoice.Code = appTenantInvoice.InvoiceNumber;
            appTenantInvoice.Name = appTenantInvoice.InvoiceNumber;
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantInvoices_Delete)]
        public async Task Delete(EntityDto<long> input)
        {
            await _appTenantInvoiceRepository.DeleteAsync(input.Id);
        }

        public async Task<FileDto> GetAppTenantInvoicesToExcel(GetAllAppTenantInvoicesForExcelInput input)
        {

            var filteredAppTenantInvoices = _appTenantInvoiceRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.InvoiceNumber.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.InvoiceNumberFilter), e => e.InvoiceNumber == input.InvoiceNumberFilter)
                        .WhereIf(input.MinInvoiceDateFilter != null, e => e.InvoiceDate >= input.MinInvoiceDateFilter)
                        .WhereIf(input.MaxInvoiceDateFilter != null, e => e.InvoiceDate <= input.MaxInvoiceDateFilter)
                        .WhereIf(input.MinDueDateFilter != null, e => e.DueDate >= input.MinDueDateFilter)
                        .WhereIf(input.MaxDueDateFilter != null, e => e.DueDate <= input.MaxDueDateFilter)
                        .WhereIf(input.MinPayDateFilter != null, e => e.PayDate >= input.MinPayDateFilter)
                        .WhereIf(input.MaxPayDateFilter != null, e => e.PayDate <= input.MaxPayDateFilter);

            var query = (from o in filteredAppTenantInvoices
                         select new GetAppTenantInvoiceForViewDto()
                         {
                             AppTenantInvoice = new AppTenantInvoiceDto
                             {
                                 InvoiceNumber = o.InvoiceNumber,
                                 InvoiceDate = o.InvoiceDate,
                                 Amount = o.Amount,
                                 DueDate = o.DueDate,
                                 PayDate = o.PayDate,
                                 Id = o.Id
                             }
                         });

            var appTenantInvoiceListDtos = await query.ToListAsync();

            return _appTenantInvoicesExcelExporter.ExportToFile(appTenantInvoiceListDtos);
        }

    }
}