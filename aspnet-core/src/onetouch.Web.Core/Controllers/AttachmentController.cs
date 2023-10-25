using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.AspNetCore.Mvc.Authorization;
using Abp.IO.Extensions;
using Abp.UI;
using Abp.Web.Models;
using Microsoft.AspNetCore.Mvc;
using onetouch.DemoUiComponents.Dto;
using onetouch.Storage;
using System.IO;
using System;
using Microsoft.Extensions.Configuration;
using onetouch.Configuration;

namespace onetouch.Web.Controllers
{
    [AbpMvcAuthorize]
    public class AttachmentController : onetouchControllerBase
    {
        private readonly IBinaryObjectManager _binaryObjectManager;
        private readonly IConfigurationRoot _appConfiguration;

        public AttachmentController(IBinaryObjectManager binaryObjectManager, IAppConfigurationAccessor appConfigurationAccessor)
        {
            _binaryObjectManager = binaryObjectManager;
            _appConfiguration = appConfigurationAccessor.Configuration;
        }

        [DisableRequestSizeLimit]
        [HttpPost]
        public async Task<JsonResult> UploadFiles()
        {
            try
            {
                var files = Request.Form.Files;

                //Check input
                if (files == null)
                {
                    throw new UserFriendlyException(L("File_Empty_Error"));
                }

                List<UploadFileOutput> filesOutput = new List<UploadFileOutput>();
                int iFiles = -1;
                foreach (var file in files)
                {
                    var maxSizeSetting = _appConfiguration[$"Attachment:MaxFileSize"];
                    var maxSize = int.Parse(maxSizeSetting);
                    if (maxSize!=0 && file.Length > maxSize)
                    {
                        throw new UserFriendlyException(L("File_SizeLimit_Error"));
                    }

                    byte[] fileBytes;
                    using (var stream = file.OpenReadStream())
                    {
                        fileBytes = stream.GetAllBytes();
                    }

                    //var fileObject = new BinaryObject(AbpSession.TenantId, fileBytes);
                    //await _binaryObjectManager.SaveAsync(fileObject);

                    //filesOutput.Add(new UploadFileOutput
                    //{
                    //    Id = fileObject.Id,
                    //    FileName = file.FileName
                    //});

                    //var guid = Guid.NewGuid();

                    //var path = _appConfiguration[$"Attachment:PathTemp"]+ @"\" + AbpSession.TenantId + @"\";
                    //var path = _appConfiguration[$"Attachment:PathTemp"] + @"\" + AbpSession.TenantId + @"\";
                    var tenantId = AbpSession.TenantId == null ? -1 : AbpSession.TenantId;
                    var path = _appConfiguration[$"Attachment:PathTemp"] + @"\" + tenantId + @"\";

                   // if (string.IsNullOrEmpty(AbpSession.TenantId.ToString()))
                    //{ path = _appConfiguration[$"Attachment:PathTemp"] + @"\"; }
                    var guid = "";
                    if (files.Count > 1)
                    { iFiles = iFiles + 1;
                        guid = Request.Form["guid"+iFiles.ToString()][0];
                    }
                    else
                    {
                        guid = Request.Form["guid"][0];
                    }

                    string extension="";
                    if (file.FileName.Split(".").Length > 1)
                    {
                        extension = file.FileName.Split(".")[file.FileName.Split(".").Length - 1];
                    }
                    var filePath = path + guid + (extension==""?"":"." + extension);
                    System.IO.Directory.CreateDirectory(path);
                    if (System.IO.File.Exists(filePath))
                        System.IO.File.Delete(filePath);
                    System.IO.File.WriteAllBytes(filePath, fileBytes);
                }

                return Json(new AjaxResponse(filesOutput));
            }
            catch (Exception ex)
            {
                return Json(new AjaxResponse(new ErrorInfo(ex.Message)));
            }
        }

        [HttpPost]
        public async Task<JsonResult> UploadFolder()
        {
            try
            {
                var files = Request.Form.Files;

                //Check input
                if (files == null)
                {
                    throw new UserFriendlyException(L("File_Empty_Error"));
                }

                List<UploadFileOutput> filesOutput = new List<UploadFileOutput>();

                var guid = Guid.NewGuid().ToString();
                var path = _appConfiguration[$"Attachment:PathTemp"] + @"\" + AbpSession.TenantId + @"\" + guid + @"\";


                foreach (var file in files)
                {
                    var maxSizeSetting = _appConfiguration[$"Attachment:MaxFileSize"];
                    var maxSize = int.Parse(maxSizeSetting);
                    if (maxSize != 0 && file.Length > maxSize)
                    {
                        throw new UserFriendlyException(L("File_SizeLimit_Error"));
                    }

                    byte[] fileBytes;
                    using (var stream = file.OpenReadStream())
                    {
                        fileBytes = stream.GetAllBytes();
                    }

                    string extension = "";
                    if (file.FileName.Split(".").Length > 1)
                    {
                        extension = file.FileName.Split(".")[file.FileName.Split(".").Length - 1];
                    }
                    //var filePath = path + guid + (extension == "" ? "" : "." + extension);
                    var filePath = path + file.FileName;
                    System.IO.Directory.CreateDirectory(path);
                    if (System.IO.File.Exists(filePath))
                        throw new UserFriendlyException(L("Dublicated_File_Name_Error"));
                    System.IO.File.WriteAllBytes(filePath, fileBytes);


                }

                return Json(new AjaxResponse(guid));
            }
            catch (Exception ex)
            {
                return Json(new AjaxResponse(new ErrorInfo(ex.Message)));
            }
        }
        public async Task<List<DeleteFilesOutput>> DeleteFiles(string[] files)
        {
            var filesActionSummary = new List<DeleteFilesOutput>();
            var tenantId = AbpSession.TenantId == null ? -1 : AbpSession.TenantId;
            var rootFolder = _appConfiguration[$"Attachment:PathTemp"] + @"\" + tenantId + @"\";
            // Files to be deleted    
            foreach (var file in files)
            {
                var path = rootFolder + file;
                DeleteFilesOutput fileInfo = new DeleteFilesOutput();
                fileInfo.FileName = file;
                try
                {
                    // Check if file exists with its full path    
                    if (System.IO.File.Exists(path))
                    {
                        // If file found, delete it    
                        System.IO.File.Delete(path);
                        fileInfo.IsDeleted = true;
                    } else
                    {
                        // If file not found    
                        fileInfo.IsDeleted = false;
                        fileInfo.ErrorMessage = "File Doesn't Exist";
                    }
                }
                catch (IOException ioExp)
                {
                    fileInfo.IsDeleted = false;
                    fileInfo.ErrorMessage = ioExp.Message;
                }
                filesActionSummary.Add(fileInfo);
            }
            return filesActionSummary;
        }
    }
    public class DeleteFilesOutput
    {
        public string FileName { get; set; }
        public bool IsDeleted { get; set; }
        public string ErrorMessage { get; set; }
    }
}