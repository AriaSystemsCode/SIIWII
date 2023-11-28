using Abp.Authorization;
using onetouch.Authorization;
using onetouch.Globals;
using System;
using System.Collections.Generic;
using System.Text;
using onetouch.AppItems.Dtos;
using System.Threading.Tasks;
using onetouch.Globals.Dtos;
using Abp.Application.Services;
using Microsoft.Extensions.Configuration;
using onetouch.AppEntities;
using onetouch.Configuration;
using System.IO;
using Bytescout.Spreadsheet;
using onetouch.Helpers;
using AutoMapper;
using Abp.UI;
using System.Data;
using System.Linq;
using Abp.Collections.Extensions;
using onetouch.SystemObjects.Dtos;
using Microsoft.EntityFrameworkCore;
using onetouch.EntityFrameworkCore;
using Abp.EntityFrameworkCore.Uow;
using Abp.Domain.Repositories;

namespace onetouch.AppItems
{
    [AbpAuthorize(AppPermissions.Pages_AppItems)]
    public class AppItemStockAvailabilityAppService : onetouchAppServiceBase, IAppItemStockAvailabilityAppService, IExcelImporter<AppItemStockAvailabilityExcelResultsDTO>
    {
        private readonly IConfigurationRoot _appConfiguration;
        private readonly Helper _helper;
        //private readonly IAppItemRepository _appItemRepository;
        private readonly IRepository<AppItem, long> _appItemRepository;
        public AppItemStockAvailabilityAppService(IAppConfigurationAccessor appConfigurationAccessor, IRepository<AppItem, long> appItemRepository, Helper helper)
        {
            _appConfiguration = appConfigurationAccessor.Configuration;
            _helper = helper;
            _appItemRepository = appItemRepository;
        }
        public async Task<ExcelTemplateDto> GetExcelTemplate(long? TypeId)
        {
            ExcelTemplateDto ItemStockAvailabilityExcelTemplateDto = new ExcelTemplateDto();
            ItemStockAvailabilityExcelTemplateDto.ExcelTemplatePath = "";
            try
            {

                string directory = _appConfiguration[$"ItemStockAvailabilityTemplates:ExcelTemplate"];
                if (!System.IO.Directory.Exists(directory))
                { System.IO.Directory.CreateDirectory(directory); }

                #region delete old files
                string[] listFiles = System.IO.Directory.GetFiles(directory);

                foreach (string file in listFiles)
                {

                    try
                    {
                        TimeSpan createdSince = (DateTime.Now - System.IO.File.GetCreationTime(file));
                        if (createdSince.TotalHours >= 1)
                        {
                            System.IO.File.Delete(file);
                        }
                    }
                    catch (Exception ex)
                    {

                    }
                }
                #endregion delete old files

                #region get new file name
                string templateFileName = _appConfiguration[$"ItemStockAvailabilityTemplates:ItemStockAvailabilityExcelTemplate"];
                string newFileName = Path.GetFileNameWithoutExtension(templateFileName) + DateTime.Now.ToString("yyyyMMddhhmmss") + Path.GetExtension(templateFileName);
                #endregion get new file name

                string newFilePath = directory + @"\" + newFileName;
                if (!System.IO.File.Exists(newFilePath))
                {
                    System.IO.File.Copy(System.IO.Directory.GetCurrentDirectory() + _appConfiguration[$"ItemStockAvailabilityTemplates:ExcelTemplatesAssets"], newFilePath);
                }

                ItemStockAvailabilityExcelTemplateDto.ExcelTemplatePath = directory.Replace(_appConfiguration[$"ItemStockAvailabilityTemplates:ExcelTemplateOmitt"], "").Replace(@"\", "/");
                ItemStockAvailabilityExcelTemplateDto.ExcelTemplateFile = newFileName;
                ItemStockAvailabilityExcelTemplateDto.ExcelTemplateFullPath = ItemStockAvailabilityExcelTemplateDto.ExcelTemplatePath + @"/" + ItemStockAvailabilityExcelTemplateDto.ExcelTemplateFile;
                ItemStockAvailabilityExcelTemplateDto.ExcelTemplateVersion = _appConfiguration[$"ItemStockAvailabilityTemplates:ItemStockAvailabilityExcelTemplateVersion:CurrentVersion"];
                ItemStockAvailabilityExcelTemplateDto.ExcelTemplateDate = _appConfiguration[$"ItemStockAvailabilityTemplates:ItemStockAvailabilityExcelTemplateDate"];


                
                // Create new Spreadsheet
                Spreadsheet document = new Spreadsheet();
                document.LoadFromFile(newFilePath);
                //Validation Rules
                Worksheet ValidRuleSheet = document.Workbook.Worksheets.ByName("Validation Rules");
                ValidRuleSheet.Cell("C2").Value = ItemStockAvailabilityExcelTemplateDto.ExcelTemplateVersion;
               
                // Get worksheet by name [Products]
               // Worksheet Sheet = document.Workbook.Worksheets.ByName("Products");

                // Save and Close document
                document.SaveAsXLSX(newFilePath);
                document.Close();

               
            }
            catch (Exception ex)
            {
                string xx = ex.Message;
            }

            return ItemStockAvailabilityExcelTemplateDto;
        }

        public async Task<ExcelLogDto> SaveFromExcel(AppItemStockAvailabilityExcelResultsDTO excelResultsDTO)
        {
            List<AppItemStockAvailabilityExcelDto> result = excelResultsDTO.ExcelRecords.Where(r => r.Status !=
                   ExcelRecordStatus.Failed.ToString()).Select(r => r.ExcelDto).ToList<AppItemStockAvailabilityExcelDto>();

                   
            DateTime start = DateTime.Now;
            var tenantId = AbpSession.TenantId == null ? -1 : AbpSession.TenantId;
            
            List<AppItem> appItemModifyList = new List<AppItem>();

            foreach (var excelDto in result)
            {
                AppItem appItem = new AppItem();
                appItem = _appItemRepository.GetAll().Where(c => c.Id == excelDto.Id && c.ListingItemId == null)
                               //.Include(x => x.EntityFk).ThenInclude(x => x.EntityCategories)
                               //.Include(x => x.EntityFk).ThenInclude(x => x.EntityClassifications)
                               //.Include(x => x.EntityFk).ThenInclude(x => x.EntityAttachments)
                               //.Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData)
                               //.Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityExtraData)
                               //.Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityCategories)
                               //.Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityClassifications)
                               //.Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                               .FirstOrDefault();
                           
                appItem.StockAvailability = long.Parse(excelDto.StockAvailable);
            
                appItemModifyList.Add(appItem);

            }

            var x = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);
            if (appItemModifyList.Count > 0)
            {
                x.AppItems.UpdateRange(appItemModifyList);
                await x.SaveChangesAsync();
            }
            return excelResultsDTO.ExcelLogDTO;
        }

        public async Task<AppItemStockAvailabilityExcelResultsDTO> ValidateExcel(string guidFile, string[] imagesList)
        {
            string currentExcelTemplateVersion = _appConfiguration[$"ItemStockAvailabilityTemplates:ItemStockAvailabilityExcelTemplateVersion:CurrentVersion"];
            string validExcelTemplates = _appConfiguration[$"ItemStockAvailabilityTemplates:ItemStockAvailabilityExcelTemplateVersion:SupportedVersions"];

            AppItemStockAvailabilityExcelResultsDTO itemExcelResultsDTO = new AppItemStockAvailabilityExcelResultsDTO();
            itemExcelResultsDTO.TotalRecords = 0;
            itemExcelResultsDTO.TotalPassedRecords = 0;
            itemExcelResultsDTO.TotalFailedRecords = 0;
            itemExcelResultsDTO.FilePath = "";
            itemExcelResultsDTO.ExcelRecords = new List<AppItemStockAvailabilityExcelRecordDTO>() { };
            try
            {

                #region open the excel
                var tenantId = AbpSession.TenantId == null ? -1 : AbpSession.TenantId;
                var path = _appConfiguration[$"Attachment:PathTemp"] + @"\" + tenantId + @"\" + guidFile + ".xlsx";
                var ds = _helper.ExcelHelper.GetExcelDataSet(path);
                //Validation Rules
                string version = ds.Tables["Validation Rules"].Rows[1].ItemArray[2].ToString();

                if (version.ToString() != currentExcelTemplateVersion && !validExcelTemplates.Contains(version.ToString()))
                {
                    throw new UserFriendlyException("This Excel version does not match any of the supported Excel versions");
                }


                //rename columns
                for (int icounter = 0; icounter < ds.Tables[0].Columns.Count; icounter++)
                {
                    string fieldName = ds.Tables[0].Rows[0][icounter].ToString().Trim().Replace(" ", "").Replace(".", "");
                    if (!string.IsNullOrEmpty(fieldName))
                        ds.Tables[0].Columns[icounter].ColumnName = fieldName;
                }
                

                var codeColumn = ds.Tables["Update Available Inventory"].Columns["Code"];
                if (codeColumn == null)
                    throw new UserFriendlyException("Code column is missing.");

                var parentCodeColumn = ds.Tables["Update Available Inventory"].Columns["ParentCode"];
                if (parentCodeColumn == null)
                    throw new UserFriendlyException("Parent Code column is missing.");

                var availableQtyColumn = ds.Tables["Update Available Inventory"].Columns["AvailableQty"];
                if (availableQtyColumn == null)
                    throw new UserFriendlyException("Available Qty column is missing.");

                #endregion
                #region create mapper to middle layer AppItemExcelDto list of objects
                MapperConfiguration configuration;
                configuration = new MapperConfiguration(a => { a.AddProfile(new AppItemStockAvailabilityExcelDtoProfile()); });
                IMapper mapper;
                mapper = configuration.CreateMapper();
                List<AppItemStockAvailabilityExcelDto> result;
                result = mapper.Map<List<DataRow>, List<AppItemStockAvailabilityExcelDto>>(new List<DataRow>(ds.Tables[0].Rows.OfType<DataRow>()));
                #endregion create mapper to middle layer AccountExcelDto list of objects
                #region Excel validateion rules only.
                
                Int32 rowNumber = 1;
                itemExcelResultsDTO.TotalRecords = result.Count();
                itemExcelResultsDTO.TotalPassedRecords = 0;
                itemExcelResultsDTO.TotalFailedRecords = 0;
                itemExcelResultsDTO.FilePath = path;
                itemExcelResultsDTO.ExcelRecords = new List<AppItemStockAvailabilityExcelRecordDTO>() { };
                #region Excel validation rules only.
                List<string> RecordsCodes = result.Select(r => r.Code).ToList();
                List<string> RecordsParentCodes = result.Select(r => r.ParentCode).ToList();
                foreach (AppItemStockAvailabilityExcelDto itemExcelDto in result)
                {
                    if (itemExcelDto.Code  == "Code")
                    {
                        continue;
                    }

                    AppItemStockAvailabilityExcelRecordDTO itemExcelRecordErrorDTO = new AppItemStockAvailabilityExcelRecordDTO();
                    itemExcelRecordErrorDTO.ParentCode = itemExcelDto.ParentCode;
                    itemExcelRecordErrorDTO.Code = itemExcelDto.Code;
                    itemExcelRecordErrorDTO.Status = ExcelRecordStatus.Passed.ToString();
                    itemExcelRecordErrorDTO.ErrorMessage = "";
                    itemExcelRecordErrorDTO.FieldsErrors = new List<string>() { };

                    string recordErrorMEssage = "Wrong data in this " + itemExcelRecordErrorDTO.Code + ". check this record in the sheet and update";
                    bool hasError = false;
                    bool hasWarning = false;
                    rowNumber++;
                    itemExcelDto.rowNumber = rowNumber;
                    if (!string.IsNullOrEmpty(itemExcelDto.ParentCode))
                    {
                        var itemExists = _appItemRepository.GetAll().FirstOrDefault(x => x.Code == itemExcelDto.Code && x.ParentId != null && x.ListingItemId == null);
                        if (itemExists != null)
                        {
                            itemExcelDto.Id = itemExists.Id;
                            var itemParentObj = _appItemRepository.GetAll().FirstOrDefault(x => x.Id == itemExists.ParentId);
                            if (itemParentObj != null && itemParentObj.Code != itemExcelDto.ParentCode)
                            {
                                itemExcelRecordErrorDTO.FieldsErrors.Add("Code :" + itemExcelDto.Code + " Parent code does not match application item parent code.");
                                recordErrorMEssage = "Code :" + itemExcelDto.Code + " Parent code does not match application item parent code.";
                                hasError = true;
                            }
                        }
                        else
                        {
                            itemExcelRecordErrorDTO.FieldsErrors.Add("Code :" + itemExcelDto.Code + " is not found");
                            recordErrorMEssage = "Code :" + itemExcelDto.Code + " is not found";
                            hasError = true;
                        }
                    }
                    else
                    {
                        var itemExists = _appItemRepository.GetAll().FirstOrDefault(x => x.Code == itemExcelDto.Code && x.ParentId == null && x.ListingItemId == null);
                        if (itemExists != null)
                        {
                            itemExcelDto.Id = itemExists.Id;

                        }
                        else {
                            itemExcelRecordErrorDTO.FieldsErrors.Add("Code :" + itemExcelDto.Code + " is not found");
                            recordErrorMEssage = "Code :" + itemExcelDto.Code + " is not found";
                            hasError = true;
                        }
                    }

                    if (long.Parse(itemExcelDto.StockAvailable.ToString()) < 0)
                    {
                        itemExcelRecordErrorDTO.FieldsErrors.Add("Code :" + itemExcelDto.Code + ", Stock available quantity is less than zero.");
                        recordErrorMEssage = "Code :" + itemExcelDto.Code + ", Stock available quantity is less than zero.";
                        hasError = true;
                    }

                    itemExcelRecordErrorDTO.ExcelDto = itemExcelDto;
                    
                    #region code, name, email and website validation    
                    if (RecordsCodes.Where(r => r == itemExcelDto.Code).ToList().Count() > 1)
                    {
                        itemExcelRecordErrorDTO.FieldsErrors.Add("Code: must be used Once."); hasWarning = true;
                        recordErrorMEssage = "Duplicated " + itemExcelRecordErrorDTO.Code;
                    }
                    
                    #endregion code, name validation 
                    if (hasError)
                    {
                        itemExcelRecordErrorDTO.Status = ExcelRecordStatus.Failed.ToString();
                        itemExcelRecordErrorDTO.ErrorMessage = recordErrorMEssage;
                    }
                    else
                    {
                        if (hasWarning)
                        {
                            itemExcelRecordErrorDTO.Status = ExcelRecordStatus.Warning.ToString();
                            itemExcelRecordErrorDTO.ErrorMessage = recordErrorMEssage;
                        }

                    }

                    itemExcelResultsDTO.ExcelRecords.Add(itemExcelRecordErrorDTO);
                }
                #endregion
                #region if parent failed then children are failed
                List<AppItemStockAvailabilityExcelRecordDTO> resultSorted = itemExcelResultsDTO.ExcelRecords.OrderBy(r => r.ParentCode).ThenBy(r => r.Code).ToList();
                foreach (AppItemStockAvailabilityExcelRecordDTO itemExcelRecord in resultSorted)
                {
                    if (itemExcelRecord.Status == ExcelRecordStatus.Failed.ToString())
                    {
                        itemExcelResultsDTO.ExcelRecords.Where(r => r.ParentCode ==
                        itemExcelRecord.Code).ToList()
                        .ForEach(r => r.Status = ExcelRecordStatus.Failed.ToString());
                    }
                }
                #endregion if parent failed then children are failed

                itemExcelResultsDTO.TotalPassedRecords = itemExcelResultsDTO.ExcelRecords.Where(r => r.Status == ExcelRecordStatus.Passed.ToString() || r.Status == ExcelRecordStatus.Warning.ToString()).Count();
                itemExcelResultsDTO.TotalFailedRecords = itemExcelResultsDTO.ExcelRecords.Where(r => r.Status == ExcelRecordStatus.Failed.ToString()).Count();
                #endregion Excel validateion rules only.

                #region update the excel sheet with errors
                // Create new Spreadsheet
                itemExcelResultsDTO.CodesFromList = new List<string>();
                itemExcelResultsDTO.FromList = new List<Int32>();
                itemExcelResultsDTO.ToList = new List<Int32>();
                Spreadsheet document = new Spreadsheet();
                document.LoadFromFile(itemExcelResultsDTO.FilePath);

                // Get worksheet by name
                Worksheet Sheet = document.Workbook.Worksheets[0];
                // Set current cell
                //T-SII-20230407.0006,1 MMT 05/02/2023 Adjust the error log columns in the Excel log file[Start]
                //Sheet.Cell("AA1").Value = "Processing Status";
                //Sheet.Cell("AB1").Value = "Processing Error Message";
                //Sheet.Cell("AC1").Value = "Processing Error Details";
                Sheet.Cell("F1").Value = "Processing Status";
                Sheet.Cell("G1").Value = "Processing Error Message";
                Sheet.Cell("H1").Value = "Processing Error Details";
                //T-SII-20230407.0006,1 MMT 05/02/2023 Adjust the error log columns in the Excel log file[Start]
                rowNumber = 1;
                //accountExcelResultsDTO.FromList.Add(1);
                foreach (AppItemStockAvailabilityExcelRecordDTO logRecord in itemExcelResultsDTO.ExcelRecords)
                {
                    rowNumber++;
                    //if (Sheet.Cell("B" + rowNumber.ToString()).Value.ToString() == "Item")
                   // {
                        if (rowNumber > 2)
                        { itemExcelResultsDTO.ToList.Add(rowNumber - 1); }
                        itemExcelResultsDTO.FromList.Add(rowNumber);
                        itemExcelResultsDTO.CodesFromList.Add(Sheet.Cell("A" + rowNumber.ToString()).Value.ToString());
                    //}
                    //T-SII-20230407.0006,1 MMT 05/02/2023 Adjust the error log columns in the Excel log file[Start]
                    //Sheet.Cell("AA" + rowNumber.ToString()).Value = logRecord.Status;
                    //Sheet.Cell("AB" + rowNumber.ToString()).Value = logRecord.ErrorMessage;
                    //Sheet.Cell("AC" + rowNumber.ToString()).Value = logRecord.FieldsErrors.ToList().JoinAsString(",");
                    Sheet.Cell("F" + rowNumber.ToString()).Value = logRecord.Status;
                    Sheet.Cell("G" + rowNumber.ToString()).Value = logRecord.ErrorMessage;
                    Sheet.Cell("H" + rowNumber.ToString()).Value = logRecord.FieldsErrors.ToList().JoinAsString(",");
                    //T-SII-20230407.0006,1 MMT 05/02/2023 Adjust the error log columns in the Excel log file[End]
                }
                itemExcelResultsDTO.ToList.Add(rowNumber);
                //move to attachment folder and save
                itemExcelResultsDTO.FilePath = itemExcelResultsDTO.FilePath.Replace(_appConfiguration[$"Attachment:PathTemp"], _appConfiguration[$"Attachment:Path"]);
                //accountExcelResultsDTO.FilePath = accountExcelResultsDTO.FilePath.ToString().ToUpper().Replace("XLSX", "XLS");

                document.SaveAsXLSX(itemExcelResultsDTO.FilePath);

                // Close document
                document.Close();

                itemExcelResultsDTO.ExcelLogDTO = new ExcelLogDto();

                itemExcelResultsDTO.ExcelLogDTO.ExcelLogPath = itemExcelResultsDTO.FilePath.Replace(_appConfiguration[$"Attachment:Omitt"].ToString(), "");
               
                itemExcelResultsDTO.ExcelLogDTO.ExcelLogPath = itemExcelResultsDTO.ExcelLogDTO.ExcelLogPath.ToLower();
                itemExcelResultsDTO.ExcelLogDTO.ExcelLogFileName = _appConfiguration[$"ItemStockAvailabilityTemplates:ItemStockAvailabilityExcelLogFileName"];
                #endregion
            }
            catch (Exception ex)
            {
                throw new UserFriendlyException(ex.Message);
            }

          //  ExcelLogDto exceld =await SaveFromExcel(itemExcelResultsDTO);
            return itemExcelResultsDTO;
        }
    }
    public sealed class AppItemStockAvailabilityExcelDtoProfile : Profile
    {

        public AppItemStockAvailabilityExcelDtoProfile()
        {
            IMappingExpression<DataRow, AppItemStockAvailabilityExcelDto> mappingExpression;

            mappingExpression = CreateMap<DataRow, AppItemStockAvailabilityExcelDto>();
            mappingExpression.ForMember(dest => dest.Id, act => act.MapFrom(src => 0));
            mappingExpression.ForMember(dest => dest.ParentCode, act => act.MapFrom(src => src["ParentCode"].ToString().TrimEnd()));
            mappingExpression.ForMember(dest => dest.Code, act => act.MapFrom(src => src["Code"].ToString().TrimEnd()));
            mappingExpression.ForMember(dest => dest.StockAvailable, act => act.MapFrom(src => src["AvailableQty"].ToString().TrimEnd()));

          

        }
    }
    }
