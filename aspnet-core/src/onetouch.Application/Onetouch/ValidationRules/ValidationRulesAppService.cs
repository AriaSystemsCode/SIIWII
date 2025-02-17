using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.Onetouch.ValidationRules.Exporting;
using onetouch.Onetouch.ValidationRules.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using Abp.UI;
using onetouch.Storage;

namespace onetouch.Onetouch.ValidationRules
{
    [AbpAuthorize(AppPermissions.Pages_Administration_ValidationRules)]
    public class ValidationRulesAppService : onetouchAppServiceBase, IValidationRulesAppService
    {
        private readonly IRepository<ValidationRule> _validationRuleRepository;
        private readonly IValidationRulesExcelExporter _validationRulesExcelExporter;

        public ValidationRulesAppService(IRepository<ValidationRule> validationRuleRepository, IValidationRulesExcelExporter validationRulesExcelExporter)
        {
            _validationRuleRepository = validationRuleRepository;
            _validationRulesExcelExporter = validationRulesExcelExporter;

        }

        public async Task<PagedResultDto<GetValidationRuleForViewDto>> GetAll(GetAllValidationRulesInput input)
        {

            var filteredValidationRules = _validationRuleRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.FieldName.Contains(input.Filter) || e.RuleType.Contains(input.Filter) || e.RuleValue.Contains(input.Filter) || e.ErrorMessage.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.FieldNameFilter), e => e.FieldName == input.FieldNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.RuleTypeFilter), e => e.RuleType == input.RuleTypeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.RuleValueFilter), e => e.RuleValue == input.RuleValueFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.ErrorMessageFilter), e => e.ErrorMessage == input.ErrorMessageFilter);

            var pagedAndFilteredValidationRules = filteredValidationRules
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

            var validationRules = from o in pagedAndFilteredValidationRules
                                  select new
                                  {

                                      o.FieldName,
                                      o.RuleType,
                                      o.RuleValue,
                                      o.ErrorMessage,
                                      Id = o.Id
                                  };

            var totalCount = await filteredValidationRules.CountAsync();

            var dbList = await validationRules.ToListAsync();
            var results = new List<GetValidationRuleForViewDto>();

            foreach (var o in dbList)
            {
                var res = new GetValidationRuleForViewDto()
                {
                    ValidationRule = new ValidationRuleDto
                    {

                        FieldName = o.FieldName,
                        RuleType = o.RuleType,
                        RuleValue = o.RuleValue,
                        ErrorMessage = o.ErrorMessage,
                        Id = o.Id,
                    }
                };

                results.Add(res);
            }

            return new PagedResultDto<GetValidationRuleForViewDto>(
                totalCount,
                results
            );

        }

        public async Task<GetValidationRuleForViewDto> GetValidationRuleForView(int id)
        {
            var validationRule = await _validationRuleRepository.GetAsync(id);

            var output = new GetValidationRuleForViewDto { ValidationRule = ObjectMapper.Map<ValidationRuleDto>(validationRule) };

            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_ValidationRules_Edit)]
        public async Task<GetValidationRuleForEditOutput> GetValidationRuleForEdit(EntityDto input)
        {
            var validationRule = await _validationRuleRepository.FirstOrDefaultAsync(input.Id);

            var output = new GetValidationRuleForEditOutput { ValidationRule = ObjectMapper.Map<CreateOrEditValidationRuleDto>(validationRule) };

            return output;
        }

        public async Task CreateOrEdit(CreateOrEditValidationRuleDto input)
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

        [AbpAuthorize(AppPermissions.Pages_Administration_ValidationRules_Create)]
        protected virtual async Task Create(CreateOrEditValidationRuleDto input)
        {
            var validationRule = ObjectMapper.Map<ValidationRule>(input);

            await _validationRuleRepository.InsertAsync(validationRule);

        }

        [AbpAuthorize(AppPermissions.Pages_Administration_ValidationRules_Edit)]
        protected virtual async Task Update(CreateOrEditValidationRuleDto input)
        {
            var validationRule = await _validationRuleRepository.FirstOrDefaultAsync((int)input.Id);
            ObjectMapper.Map(input, validationRule);

        }

        [AbpAuthorize(AppPermissions.Pages_Administration_ValidationRules_Delete)]
        public async Task Delete(EntityDto input)
        {
            await _validationRuleRepository.DeleteAsync(input.Id);
        }

        public async Task<FileDto> GetValidationRulesToExcel(GetAllValidationRulesForExcelInput input)
        {

            var filteredValidationRules = _validationRuleRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.FieldName.Contains(input.Filter) || e.RuleType.Contains(input.Filter) || e.RuleValue.Contains(input.Filter) || e.ErrorMessage.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.FieldNameFilter), e => e.FieldName == input.FieldNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.RuleTypeFilter), e => e.RuleType == input.RuleTypeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.RuleValueFilter), e => e.RuleValue == input.RuleValueFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.ErrorMessageFilter), e => e.ErrorMessage == input.ErrorMessageFilter);

            var query = (from o in filteredValidationRules
                         select new GetValidationRuleForViewDto()
                         {
                             ValidationRule = new ValidationRuleDto
                             {
                                 FieldName = o.FieldName,
                                 RuleType = o.RuleType,
                                 RuleValue = o.RuleValue,
                                 ErrorMessage = o.ErrorMessage,
                                 Id = o.Id
                             }
                         });

            var validationRuleListDtos = await query.ToListAsync();

            return _validationRulesExcelExporter.ExportToFile(validationRuleListDtos);
        }

    }
}