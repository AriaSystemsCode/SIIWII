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
using onetouch.Attachments;
using onetouch.AppEntities;

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
        private readonly IRepository<AppAttachment, long> _appAttachmentRepository;
        public AppTenantInvoicesAppService(IRepository<AppTenantInvoice, long> appTenantInvoiceRepository, IAppConfigurationAccessor appConfigurationAccessor, 
            IRepository<AppAttachment, long> appAttachmentRepository,
        Helper helper, IAppTenantInvoicesExcelExporter appTenantInvoicesExcelExporter)
        {
            _appTenantInvoiceRepository = appTenantInvoiceRepository;
            _appTenantInvoicesExcelExporter = appTenantInvoicesExcelExporter;
            _helper = helper;
            _appConfiguration = appConfigurationAccessor.Configuration;
            _appAttachmentRepository = appAttachmentRepository;
        }

        public async Task<PagedResultDto<GetAppTenantInvoiceForViewDto>> GetAll(GetAllAppTenantInvoicesInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                // var pathSource = _appConfiguration[$"Attachment:Path"] + @"\" + "-1" + @"\" ;
                string pathSource = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/" + AbpSession.TenantId.ToString() + @"/";
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
                                            ? o.EntityAttachments[0].AttachmentFk.Name : null),
                                            o.TenantId
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
                            DueDate = (o.DueDate == new DateTime(1, 1, 1) ? null : o.DueDate),
                            PayDate = (o.PayDate == new DateTime(1,1,1) ? null:o.PayDate),
                            Id = o.Id,
                            Attachment = !string.IsNullOrEmpty(o.Attachment) ? (pathSource + o.Attachment) : null,
                            DisplayName = !string.IsNullOrEmpty(o.DisplayName) ?(o.DisplayName.TrimEnd() ):"",
                            TenantName = o.TenantId!=null?(TenantManager.GetById(int.Parse(o.TenantId.ToString()))).Name.TrimEnd():""
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
            output.AppTenantInvoice.DueDate = (output.AppTenantInvoice.DueDate == new DateTime(1, 1, 1) ? null : output.AppTenantInvoice.DueDate);
            output.AppTenantInvoice.PayDate = (output.AppTenantInvoice.PayDate == new DateTime(1, 1, 1) ? null : output.AppTenantInvoice.PayDate);
            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantInvoices_Edit)]
        public async Task<GetAppTenantInvoiceForEditOutput> GetAppTenantInvoiceForEdit(EntityDto<long> input)
        {
            var appTenantInvoice = await _appTenantInvoiceRepository.FirstOrDefaultAsync(input.Id);

            var output = new GetAppTenantInvoiceForEditOutput { AppTenantInvoice = ObjectMapper.Map<CreateOrEditAppTenantInvoiceDto>(appTenantInvoice) };

            output.AppTenantInvoice.DueDate = (output.AppTenantInvoice.DueDate == new DateTime(1, 1, 1) ? null : output.AppTenantInvoice.DueDate);
            output.AppTenantInvoice.PayDate= (output.AppTenantInvoice.PayDate == new DateTime(1, 1, 1) ? null : output.AppTenantInvoice.PayDate);
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
            if (input.EntityAttachments != null)
            {
                foreach (var item in input.EntityAttachments)
                {    //

                    if ((input.Id == null || input.Id == 0) && string.IsNullOrEmpty(item.guid))
                    { item.guid = item.FileName; }
                    //
                    string extension = "";
                    string filename = "";
                    if (item.FileName.Split(".").Length > 1)
                    {
                        extension = item.FileName.Split(".")[item.FileName.Split(".").Length - 1];
                    }
                    if (item.guid != null && !item.guid.EndsWith("." + extension))
                    {
                        filename = item.guid + (extension == "" ? "" : "." + extension);
                    }
                    else if (item.guid != null)
                    {
                        filename = item.guid;
                    }
                    else if (item.Id > 0 && string.IsNullOrEmpty(item.Url) && string.IsNullOrEmpty(item.guid))
                    {
                        filename = item.FileName;
                    }
                    else if (item.Id == 0 && !string.IsNullOrEmpty(item.FileName))
                    {
                        filename = item.FileName;
                    }
                    //if (false)
                    //{
                     //   var appEntityAttachment = _appEntityAttachmentRepository.GetAll().Where(r => r.Id == item.Id).FirstOrDefault();

                       // entity.EntityAttachments.Add(new AppEntityAttachment { AttachmentCategoryId = (int)item.AttachmentCategoryId, EntityId = entity.Id, AttachmentId = appEntityAttachment.AttachmentId, IsDefault = item.IsDefault, Attributes = item.Attributes });
                   // }
                   // else
                    {

                        if (!string.IsNullOrEmpty(filename))
                        {
                            bool newRecord = false;
                            if (appTenantInvoice.EntityAttachments != null && appTenantInvoice.EntityAttachments.Count(x => item.Id > 0 && x.Id == item.Id) == 0)
                            {
                                newRecord = true;
                            }

                            if (false)
                            {
                                var att = new AppAttachment  { Name = item.guid == null ? item.DisplayName : item.FileName, Attachment = filename, TenantId =int.Parse(input.TenantId.ToString())};
                                att = await _appAttachmentRepository.InsertAsync(att);
                                await CurrentUnitOfWork.SaveChangesAsync();
                                appTenantInvoice.EntityAttachments.Add(new AppEntityAttachment { AttachmentCategoryId = (int)item.AttachmentCategoryId, EntityId = appTenantInvoice.Id, AttachmentId = att.Id, IsDefault = item.IsDefault, Attributes = item.Attributes });
                                
                            }
                            else
                            {
                                //CASE#1
                                var existed = appTenantInvoice.EntityAttachments.FirstOrDefault();
                                if (existed != null)
                                {
                                    existed.AttachmentFk = new AppAttachment();
                                    existed.AttachmentFk.Name = item.FileName;//.DisplayName;
                                    existed.AttachmentFk.Attachment = filename;
                                    existed.IsDefault = item.IsDefault;
                                    existed.Attributes = item.Attributes;
                                }
                            }
                            
                            MoveFile(filename, AbpSession.TenantId,int.Parse( input.TenantId.ToString()));
                        }
                        else
                        {
                            //temperory code and need to be refactor for CASE#1
                            var existed = appTenantInvoice.EntityAttachments.FirstOrDefault(x => x.Id == item.Id);
                            if (existed != null)
                            {
                                existed.AttachmentFk.Name = item.DisplayName;
                                //existed.AttachmentFk.Attachment = filename;
                                existed.IsDefault = item.IsDefault;
                                existed.Attributes = item.Attributes;
                            }

                        }
                    }
                }
            }
            await _appTenantInvoiceRepository.InsertAsync(appTenantInvoice);

        }
        private void MoveFile(string fileName, int? sourceTenantId, int? distinationTenantId)
        {
            if (sourceTenantId == null) sourceTenantId = -1;
            if (distinationTenantId == null) distinationTenantId = -1;

            var tmpPath = _appConfiguration[$"Attachment:PathTemp"] + @"\" + sourceTenantId + @"\" + fileName;
            var pathSource = _appConfiguration[$"Attachment:Path"] + @"\" + sourceTenantId + @"\" + fileName;
            var path = _appConfiguration[$"Attachment:Path"] + @"\" + distinationTenantId + @"\" + fileName;

            if (!System.IO.Directory.Exists(_appConfiguration[$"Attachment:Path"] + @"\" + distinationTenantId))
            {
                System.IO.Directory.CreateDirectory(_appConfiguration[$"Attachment:Path"] + @"\" + distinationTenantId);
            }

            try
            {
                System.IO.File.Copy(tmpPath.Replace(@"\", @"\"), path.Replace(@"\", @"\"), true);
            }
            catch (Exception ex)
            {
                try
                {
                    System.IO.File.Copy(pathSource.Replace(@"\", @"\"), path.Replace(@"\", @"\"), true);
                }
                catch (Exception ex1)
                {

                }
            }
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
                                 DueDate = (o.DueDate == new DateTime(1,1,1) ? null:o.DueDate),
                                 PayDate = (o.PayDate == new DateTime(1, 1, 1) ? null : o.PayDate),
                                 Id = o.Id
                             }
                         });

            var appTenantInvoiceListDtos = await query.ToListAsync();

            return _appTenantInvoicesExcelExporter.ExportToFile(appTenantInvoiceListDtos);
        }

    }
}