using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.Onetouch.ValidationRules.Dtos;
using onetouch.Dto;

namespace onetouch.Onetouch.ValidationRules
{
    public interface IValidationRulesAppService : IApplicationService
    {
        Task<PagedResultDto<GetValidationRuleForViewDto>> GetAll(GetAllValidationRulesInput input);

        Task<GetValidationRuleForViewDto> GetValidationRuleForView(int id);

        Task<GetValidationRuleForEditOutput> GetValidationRuleForEdit(EntityDto input);

        Task CreateOrEdit(CreateOrEditValidationRuleDto input);

        Task Delete(EntityDto input);

        Task<FileDto> GetValidationRulesToExcel(GetAllValidationRulesForExcelInput input);

    }
}