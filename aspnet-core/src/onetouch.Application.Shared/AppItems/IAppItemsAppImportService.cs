using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.Accounts.Dtos;
using onetouch.AppEntities.Dtos;
using onetouch.AppItems.Dtos;
using onetouch.Dto;
using onetouch.Globals.Dtos;

namespace onetouch.AppItems
{
    public interface IAppItemsAppImportService : IApplicationService
    {
        Task<ExcelTemplateDto> GetImportVideo();
        Task<PagedResultDto<LookupAccountOrTenantDto>> GetAllLookUp(GetAllAppItemsInput input);
        Task<PagedResultDto<LookupAccountOrTenantDto>> GetAllLookUpWithColors(GetAllAppItemsInput input);
        Task<AppItemtExcelRecordDTO> GetAppItemForEditData(long input, AppItemtExcelRecordDTO appItemtExcelRecordDTO);
        Task<long> SaveImageToItem(long input, AppItemtExcelRecordDTO appItemtExcelRecordDTO);
        Task<long> SaveImageToItemColor(long input, AppItemtExcelRecordDTO appItemtExcelRecordDTO);
        Task<PagedResultDto<LookupAccountOrTenantDto>> GetAllColorsLookUp(GetAllAppEntitiesInput input);
        Task<AppItemtExcelRecordDTO> GetAppItemColorForEditData(long input, AppItemtExcelRecordDTO appItemtExcelRecordDTO);

        Task<long> SaveImageToColor(long colorEntityId, AppItemtExcelRecordDTO appItemtExcelRecordDTO);
    }
}