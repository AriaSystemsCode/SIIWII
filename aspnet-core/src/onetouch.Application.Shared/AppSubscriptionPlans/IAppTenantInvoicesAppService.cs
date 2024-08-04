using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppSubscriptionPlans.Dtos;
using onetouch.Dto;

namespace onetouch.AppSubscriptionPlans
{
    public interface IAppTenantInvoicesAppService : IApplicationService
    {
        Task<PagedResultDto<GetAppTenantInvoiceForViewDto>> GetAll(GetAllAppTenantInvoicesInput input);

        Task<GetAppTenantInvoiceForViewDto> GetAppTenantInvoiceForView(long id);

        Task<GetAppTenantInvoiceForEditOutput> GetAppTenantInvoiceForEdit(EntityDto<long> input);

        Task CreateOrEdit(CreateOrEditAppTenantInvoiceDto input);

        Task Delete(EntityDto<long> input);

        Task<FileDto> GetAppTenantInvoicesToExcel(GetAllAppTenantInvoicesForExcelInput input);

    }
}