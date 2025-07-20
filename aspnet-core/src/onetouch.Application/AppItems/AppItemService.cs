using onetouch.Globals.Dtos;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Collections.Extensions;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.EntityFrameworkCore.Uow;
using Abp.Linq.Extensions;
using Abp.UI;
using AutoMapper;
using Bytescout.Spreadsheet;
using Humanizer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using NPOI.OpenXmlFormats.Wordprocessing;
using NPOI.SS.Formula.Functions;
using NUglify.Helpers;
using onetouch.AccountInfos.Dtos;
using onetouch.AppContacts;
using onetouch.AppEntities;
using onetouch.AppEntities.Dtos;
using onetouch.AppItems.Dtos;
using onetouch.AppItems.Exporting;
using onetouch.AppItemSelectors;
using onetouch.AppItemsLists;
using onetouch.AppSizeScales;
using onetouch.AppSizeScales.Dtos;
using onetouch.Authorization;
using onetouch.Common;
using onetouch.Configuration;
using onetouch.Dto;
using onetouch.EntityFrameworkCore;
using onetouch.Globals;
using onetouch.Globals.Dtos;
using onetouch.Helpers;
using onetouch.Notifications;
using onetouch.Sessions;
using onetouch.Sessions.Dto;
using onetouch.SycCounters;
using onetouch.SycIdentifierDefinitions;
using onetouch.SycSegmentIdentifierDefinitions;
using onetouch.SycSegmentIdentifierDefinitions.Dtos;
using onetouch.SystemObjects;
using onetouch.SystemObjects.Dtos;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using System.Timers;
using System.Xml.Serialization;
//using Z.EntityFramework.Plus;
using ExtraAttribute = onetouch.AppItems.Dtos.ExtraAttribute;
using onetouch.AppMarketplaceItems;
using Z.EntityFramework.Plus;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using onetouch.AppMarketplaceItemLists;
using Abp.Extensions;
using onetouch.Attachments;
using Microsoft.AspNetCore.Mvc.TagHelpers;
using Org.BouncyCastle.Utilities.Encoders;
using onetouch.AppSiiwiiTransaction;
using NPOI.HPSF;
using NPOI.POIFS.NIO;
using System.Dynamic;
using NPOI.OpenXmlFormats.Vml;
using onetouch.AppSubScriptionPlan;
using onetouch.Accounts.Dtos;
using System.Management.Automation.Language;
using Microsoft.AspNetCore.Http;
using PayPalCheckoutSdk.Orders;
using NPOI.HSSF.Util;

namespace onetouch.AppItems
{
    [AbpAuthorize(AppPermissions.Pages_AppItems)]
    public partial class AppItemsAppService : onetouchAppServiceBase, IAppItemsAppService, IAppItemsAppImportService, IExcelImporter<AppItemExcelResultsDTO>
    {

        public async Task<ExcelTemplateDto> GetImportVideo()
        {
            ExcelTemplateDto itemExcelTemplateDto = new ExcelTemplateDto();
            itemExcelTemplateDto.ExcelTemplatePath = "";
            try
            {

                string directory = _appConfiguration[$"Templates:ImportVideo"];
                if (!System.IO.Directory.Exists(directory))
                { System.IO.Directory.CreateDirectory(directory); }
 
                #region get new file name
                string templateFileName = _appConfiguration[$"Templates:ImportVideoAssets"];
                string newFileName = Path.GetFileName(templateFileName);
                #endregion get new file name

                string newFilePath = directory + @"\" + newFileName;
                if (!System.IO.File.Exists(newFilePath))
                {
                    System.IO.File.Copy(System.IO.Directory.GetCurrentDirectory() + _appConfiguration[$"Templates:ImportVideoAssets"], newFilePath);
                }

                itemExcelTemplateDto.ExcelTemplatePath = directory.Replace(_appConfiguration[$"ItemTemplates:ExcelTemplateOmitt"], "").Replace(@"\", "/");
                itemExcelTemplateDto.ExcelTemplateFile = newFileName;
                itemExcelTemplateDto.ExcelTemplateFullPath = itemExcelTemplateDto.ExcelTemplatePath + @"/" + itemExcelTemplateDto.ExcelTemplateFile;


            }
            catch (Exception ex)
            {
                string xx = ex.Message;
            }

            return itemExcelTemplateDto;
        }
        public async Task<PagedResultDto<LookupAccountOrTenantDto>> GetAllLookUp(GetAllAppItemsInput input)
        {
            var GetAllRet = await GetAll( input);
            List<LookupAccountOrTenantDto> lookupAccountOrTenantDtoList = new List<LookupAccountOrTenantDto>();
            foreach(var x in GetAllRet.Items)
            {
                lookupAccountOrTenantDtoList.Add(new LookupAccountOrTenantDto { DisplayName=x.AppItem.Code,Id=x.AppItem.Id});

            }
            return new PagedResultDto<LookupAccountOrTenantDto>(
                   GetAllRet.TotalCount,
                   lookupAccountOrTenantDtoList
               );

        }
        public async Task<AppItemtExcelRecordDTO> GetAppItemForEditData(GetAppItemWithPagedAttributesForEditInput input, AppItemtExcelRecordDTO appItemtExcelRecordDTO)
        {
            var y = await GetAppItemForEdit( input);
            appItemtExcelRecordDTO.Name = y.AppItem.Name;
            appItemtExcelRecordDTO.ExcelDto.Price = y.AppItem.Price.ToString();
            appItemtExcelRecordDTO.ExcelDto.ProductDescription = y.AppItem.Description;

            if(y.AppItem.AppItemPriceInfos.Count > 0)
            {
                appItemtExcelRecordDTO.ExcelDto.Currency = y.AppItem.AppItemPriceInfos[0].CurrencyCode;
            }
            if ( y.AppItem.AppItemSizesScaleInfo.Count > 0)
            {
                appItemtExcelRecordDTO.ExcelDto.SizeScaleName = y.AppItem.AppItemSizesScaleInfo[0].Code;
                 
            }
            if (y.AppItem.VariationItems.Count > 0)
            {
                var attributeValuesString = string.Join(",",
                    y.AppItem.VariationItems
                        .SelectMany(item => item.EntityExtraData)
                        .Where(data => data.EntityObjectTypeId == 18 && data.EntityObjectTypeCode == "SIZE")
                        .Select(data => data.AttributeValue)
                        .Where(value => !string.IsNullOrWhiteSpace(value))
                    );

                appItemtExcelRecordDTO.ExcelDto.SizeScaleOrder = attributeValuesString;
            }
            if (y.AppItem.EntityExtraData.Count > 0)
            {
                var result = y.AppItem.EntityExtraData
                    .Where(x => x.AttributeId == 662 && !string.IsNullOrWhiteSpace(x.AttributeValue))
                    .Select(x => x.AttributeValue)
                    .FirstOrDefault();
                appItemtExcelRecordDTO.ExcelDto.MaterialContent = result;

                var BrandName = y.AppItem.EntityExtraData
                   .Where(x => x.EntityId == 86 && x.EntityObjectTypeId == 108 && !string.IsNullOrWhiteSpace(x.AttributeValueFkName))
                   .Select(x => x.AttributeValueFkName)
                   .FirstOrDefault();
                appItemtExcelRecordDTO.ExcelDto.BrandName = BrandName;

                var BrandCode = y.AppItem.EntityExtraData
                 .Where(x => x.EntityId == 86 && x.EntityObjectTypeId == 108 && !string.IsNullOrWhiteSpace(x.AttributeValueFkName))
                 .Select(x => x.AttributeValueFkName)
                 .FirstOrDefault();
                appItemtExcelRecordDTO.ExcelDto.BrancdCode = BrandCode;

                var SoldOut = y.AppItem.EntityExtraData
                 .Where(x => x.AttributeId == 661 && !string.IsNullOrWhiteSpace(x.AttributeValue))
                 .Select(x => x.AttributeValue)
                 .FirstOrDefault();
                if (DateOnly.TryParse(SoldOut, out DateOnly date))
                {
                    appItemtExcelRecordDTO.ExcelDto.SoldOutDate = date;
                }

                var StartShipDate = y.AppItem.EntityExtraData
                 .Where(x => x.AttributeId == 660 && !string.IsNullOrWhiteSpace(x.AttributeValue))
                 .Select(x => x.AttributeValue)
                 .FirstOrDefault();
                if (DateOnly.TryParse(StartShipDate, out DateOnly StartShipDateOut))
                {
                    appItemtExcelRecordDTO.ExcelDto.SoldOutDate = StartShipDateOut;
                }


            }
            if (y.AppItem.EntityClassifications.Items.Count > 0)
            {
                appItemtExcelRecordDTO.ExcelDto.ProductClassificationCode= y.AppItem.EntityClassifications.Items[0].EntityObjectClassificationCode;
                appItemtExcelRecordDTO.ExcelDto.EntityObjectClassificaionID = y.AppItem.EntityClassifications.Items[0].EntityObjectClassificationId;
                appItemtExcelRecordDTO.ExcelDto.ProductClassificationDescription = y.AppItem.EntityClassifications.Items[0].EntityObjectClassificationName;
            }

            if (y.AppItem.EntityCategories.Items.Count > 0)
            {
                appItemtExcelRecordDTO.ExcelDto.EntityObjectCategoryID = y.AppItem.EntityCategories.Items[0].EntityObjectCategoryId;
                appItemtExcelRecordDTO.ExcelDto.ProductCategoryCode = y.AppItem.EntityCategories.Items[0].EntityObjectCategoryCode;
                appItemtExcelRecordDTO.ExcelDto.ProductCategoryDescription = y.AppItem.EntityCategories.Items[0].EntityObjectCategoryName;
            }


            appItemtExcelRecordDTO.ExcelDto.PriceA = y.AppItem.AppItemPriceInfos != null && y.AppItem.AppItemPriceInfos.Any()
                        ? y.AppItem.AppItemPriceInfos.FirstOrDefault(p => p.Code == "A")?.Price.ToString()
                        : null;
            appItemtExcelRecordDTO.ExcelDto.PriceB = y.AppItem.AppItemPriceInfos != null && y.AppItem.AppItemPriceInfos.Any()
                      ? y.AppItem.AppItemPriceInfos.FirstOrDefault(p => p.Code == "B")?.Price.ToString()
                      : null;
            appItemtExcelRecordDTO.ExcelDto.PriceC = y.AppItem.AppItemPriceInfos != null && y.AppItem.AppItemPriceInfos.Any()
                      ? y.AppItem.AppItemPriceInfos.FirstOrDefault(p => p.Code == "C")?.Price.ToString()
                      : null;
            appItemtExcelRecordDTO.ExcelDto.PriceD = y.AppItem.AppItemPriceInfos != null && y.AppItem.AppItemPriceInfos.Any()
                      ? y.AppItem.AppItemPriceInfos.FirstOrDefault(p => p.Code == "D")?.Price.ToString()
                      : null;

            return appItemtExcelRecordDTO;
        }

        /* 
         7- when click final import >> create new API saveFromExcelImages, to [4H] 

         7.2 update exisitng item with new added imge 

         >> create new function save only rows of type images to parent items ( input id) 

         call getItemforEdit(id) >> GetAppItemForEditOutput 

         convert from GetAppItemForEditOutput.AppItemForEditDto to AppItem 

         convert from AppItem to CreateOrEditAppItemDto 

         update attachments array with the new linked image 

         Call CreateOrEditAppItemDto  
         
         */

        public async Task<long> Create(GetAppItemWithPagedAttributesForEditInput input, AppItemtExcelRecordDTO appItemtExcelRecordDTO)
        {
            var y = await GetAppItemForEdit(input);
            var tenantId = AbpSession.TenantId == null ? -1 : AbpSession.TenantId;
            var path = _appConfiguration[$"Attachment:PathTemp"] + @"\" + tenantId + @"\";
            // add the image to the parent
            if (y.AppItem.EntityAttachments.Count == 0) { y.AppItem.EntityAttachments = new List<AppEntityAttachmentDto>();   }
            var z = new AppEntityAttachmentDto { AttachmentCategoryId = 3, FileName = appItemtExcelRecordDTO.ExcelDto.Images[0].ImageFileName, guid = appItemtExcelRecordDTO.ExcelDto.Images[0].ImageGuid, Index = y.AppItem.EntityAttachments.Count };

            //if (!System.IO.Directory.Exists(_appConfiguration[$"Attachment:Path"] + @"\" + tenantId.ToString()))
            //{
            //    System.IO.Directory.CreateDirectory(_appConfiguration[$"Attachment:Path"] + @"\" + tenantId.ToString());
            //}

            //try
            //{
            //    System.IO.File.Copy(path + @"\" + z.guid + "." + guid.ImageFileName.Split('.')[1], _appConfiguration[$"Attachment:Path"] + @"\" + tenantId.ToString() + @"\" + img.ImageGuid + "." + img.ImageFileName.Split('.')[1], true);
            //}
            //catch { }

            y.AppItem.EntityAttachments.Add(z);



            var item = new GetAppItemForEditOutput { AppItem = ObjectMapper.Map<AppItemForEditDto>(y.AppItem) };
            CreateOrEditAppItemDto itemUpdate = ObjectMapper.Map<CreateOrEditAppItemDto>(item);

            var x = await DoCreateOrEdit(itemUpdate);


            return x;
        }

    }

}
