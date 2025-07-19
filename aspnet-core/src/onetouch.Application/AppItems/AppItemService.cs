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

                #region delete old files
                //string[] listFiles = System.IO.Directory.GetFiles(directory);

                //foreach (string file in listFiles)
                //{

                //    try
                //    {
                //        TimeSpan createdSince = (DateTime.Now - System.IO.File.GetCreationTime(file));
                //        if (createdSince.TotalHours >= 1)
                //        {
                //            System.IO.File.Delete(file);
                //        }
                //    }
                //    catch (Exception ex)
                //    {

                //    }
                //}

                #endregion delete old files

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
        public async Task<ImportItemInputDto> ValidateExcelV2(string guidFile, string[] imagesList)
        {
           var x  = await ValidateExcel(guidFile, imagesList);

            return x;
        }

    }

 }
