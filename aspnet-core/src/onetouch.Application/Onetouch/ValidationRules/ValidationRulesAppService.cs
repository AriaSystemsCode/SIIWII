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
using FluentValidation;
using System.Reflection;
using Z.Expressions;

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
    public class DynamicValidator<T> : AbstractValidator<T>
    {

        public DynamicValidator(IRepository<ValidationRule> validationRuleRepo, Type callingClass)
        {

            var entityName = typeof(T).Name;
            var rules = validationRuleRepo.GetAll().ToList();

            //foreach (var rule in rules)
            //{
            //    var property = typeof(T).GetProperty(rule.FieldName.TrimEnd());

            //    if (property == null)
            //        throw new InvalidOperationException($"Property '{rule.FieldName}' not found on entity ");

            //    var expression = CreateExpression(property);
            //    ApplyRule(expression, rule, property);
            //}
            foreach (var rule in rules)
            {
                var property = typeof(T).GetProperty(rule.FieldName.TrimEnd());
                if (property == null)
                    continue;
                //throw new InvalidOperationException($"Property '{rule.FieldName.TrimEnd()}' not found.");

                if (property.PropertyType == typeof(int))
                {
                    var expression = CreateExpression<int>(property);
                    ApplyRule(expression, rule, callingClass);
                }
                else if (property.PropertyType == typeof(string))
                {
                    var expression = CreateExpression<string>(property);
                    ApplyRule(expression, rule, callingClass);
                }
                else if (property.PropertyType == typeof(decimal))
                {
                    var obj = this;
                    var expression = CreateExpression<decimal>(property);
                    ApplyRule(expression, rule, callingClass);
                    //var rulev = rule.RuleValue.Replace(rule.FieldName.TrimEnd(), "x." + rule.FieldName.TrimEnd());
                    //var rList = Eval.Execute("{0}.Where(x => {1})", "x", rulev);
                    // var expressionv = CreateExpression<TProperty>(rulev);
                    //RuleFor<TProperty>(expression).Must(expressionv).WithMessage(rule.ErrorMessage);
                }
                // Add more type checks as needed
            }
        }
        private System.Linq.Expressions.Expression<Func<T, TProperty>> CreateExpression<TProperty>(PropertyInfo property)
        {
            var parameter = System.Linq.Expressions.Expression.Parameter(typeof(T), "x");
            var propertyAccess = System.Linq.Expressions.Expression.Property(parameter, property);
            var lambda = System.Linq.Expressions.Expression.Lambda<Func<T, TProperty>>(propertyAccess, parameter);
            return lambda;//.Compile();
        }
        private bool TryConvertValue(string value, Type targetType, out object convertedValue)
        {
            convertedValue = null;
            try
            {
                if (targetType == typeof(int))
                    convertedValue = int.Parse(value);
                else if (targetType == typeof(double))
                    convertedValue = double.Parse(value);
                else if (targetType == typeof(decimal))
                    convertedValue = decimal.Parse(value);
                else if (targetType == typeof(DateTime))
                    convertedValue = DateTime.Parse(value);
                else
                    return false;

                return true;
            }
            catch
            {
                return false;
            }
        }
        private void ApplyRule<TProperty>(System.Linq.Expressions.Expression<Func<T, TProperty>> expression, ValidationRule rule, Type callingClass)
        {
            switch (rule.RuleType)
            {
                case "Nullable":
                    RuleFor<TProperty>(expression).NotNull().WithMessage(rule.ErrorMessage);
                    break;
                case "NotEmpty":
                    RuleFor<TProperty>(expression).NotEmpty().WithMessage(rule.ErrorMessage);
                    break;

                case "MaxLength":
                    if (typeof(TProperty) == typeof(string) && int.TryParse(rule.RuleValue, out var maxLength))
                        RuleFor<TProperty>(expression).Must(x => x.ToString().Length <= maxLength).WithMessage(rule.ErrorMessage);
                    break;
                case "MinLength":
                    if (typeof(TProperty) == typeof(string) && int.TryParse(rule.RuleValue, out var minLength))
                        RuleFor<TProperty>(expression).Must(x => x.ToString().Length >= minLength).WithMessage(rule.ErrorMessage);
                    break;
                case "GreaterThan":
                    if (TryConvertValue(rule.RuleValue, typeof(TProperty), out var minValue))
                    {
                        var greaterThanMethod = typeof(DefaultValidatorOptions)
                            .GetMethods()
                            .First(m => m.Name == "GreaterThan" && m.GetParameters().Length == 1)
                            .MakeGenericMethod(typeof(TProperty));

                        var ruleBuilder = RuleFor(expression);
                        greaterThanMethod.Invoke(ruleBuilder, new[] { minValue });
                        // ruleBuilder;//.WithMessage(rule.ErrorMessage);
                    }
                    break;
                case "Custom":
                    RuleFor(expression).Custom((z, context) =>
                    {
                        //var i = z;
                        //  var c = context.InstanceToValidate;
                        var x = context.InstanceToValidate;
                        var rulev = rule.RuleValue.Replace(rule.FieldName.TrimEnd(), "x." + rule.FieldName.TrimEnd());
                        var returnVal = Eval.Execute(rulev, new { x = context.InstanceToValidate });
                        if (!bool.Parse(returnVal.ToString()))
                        {
                            context.AddFailure(rule.ErrorMessage);
                        }
                    });
                    // if (typeof(TProperty) == typeof(string))
                    // {
                    // var rulev = rule.RuleValue.Replace(rule.FieldName.TrimEnd(), "x." + rule.FieldName.TrimEnd());
                    //var rList = Eval.Execute("{0}.Where(x => {1})", expression, rulev);
                    //var expressionv = CreateExpression<TProperty>(rulev);
                    //RuleFor<TProperty>(expression).Must(expressionv).WithMessage(rule.ErrorMessage);
                    // }
                    break;
                case "Function":
                    RuleFor(expression).Custom((z, contextt) =>
                    {
                        var context = new EvalContext();
                        // Clear all existing registrations to start fresh
                        context.UnregisterAll();
                        // Limit iterations to prevent infinite loops
                        context.MaxLoopIteration = 5;
                        // Enable safe mode for restricted code execution
                        // context.SafeMode = true;
                        // Register default aliases and the necessary types
                        context.RegisterDefaultAliasSafe();
                        context.ForceCharAsString = true;
                        context.UseCache = false;
                        context.UseTypeBeforeDynamic = true;
                        context.RegisterStaticMethod(callingClass.GetTypeInfo().AsType());
                        //context.RegisterType(typeof(AppItemsAppService));
                        var rulev = rule.RuleValue.Replace(rule.FieldName.TrimEnd(), "x." + rule.FieldName.TrimEnd());
                        var returnVal = context.Execute(rulev, new { x = contextt.InstanceToValidate });



                        // var x = context.InstanceToValidate;

                        //var returnVal = Eval.Execute<bool>("onetouch.AppItems.AppItemsAppService." + rulev, new { x = context.InstanceToValidate });
                        if (!bool.Parse(returnVal.ToString()))
                        {
                            contextt.AddFailure(rule.ErrorMessage);
                        }
                    });
                    break;

                default:
                    throw new NotSupportedException($"Rule type '{rule.RuleType}' is not supported.");
            }
        }
    }
}