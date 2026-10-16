using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Abp.Authorization;
using Abp.Domain.Uow;
using Abp.EntityFrameworkCore.Uow;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using onetouch.AppFields.Dto;
using onetouch.Authorization;
using onetouch.EntityFrameworkCore;

namespace onetouch.AppFields
{
    public partial class AppFieldManagerAppService
    {
        [AbpAuthorize(AppPermissions.Pages_Administration_FieldManager)]
        public async Task<List<FieldSettingDefinitionDto>> GetFieldTypeSettings(long fieldTypeId)
        {
            await ValidateFieldType(fieldTypeId);
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MayHaveTenant))
            {
                var definitions = await GetSettingDefinitions(fieldTypeId);
                var ids = definitions.Select(x => x.Id).ToList();
                var context = CurrentUnitOfWork.GetDbContext<onetouchDbContext>();
                var options = await context.Set<AppFieldsOption>().Where(x => ids.Contains(x.SettingFieldId) && x.IsActive)
                    .OrderBy(x => x.SortOrder).ThenBy(x => x.Id).AsNoTracking().ToListAsync();
                var typeIds = definitions.Select(x => x.FieldTypeId).Distinct().ToList();
                var typeCodes = await _objectTypes.GetAll().Where(x => typeIds.Contains(x.Id))
                    .ToDictionaryAsync(x => x.Id, x => x.Code);
                return definitions.Select(x => new FieldSettingDefinitionDto
                {
                    SettingFieldId = x.Id,
                    FieldCode = x.FieldCode,
                    FieldName = x.FieldName,
                    ValueTypeId = x.FieldTypeId,
                    ValueTypeCode = typeCodes.TryGetValue(x.FieldTypeId, out var code) ? code : null,
                    DefaultValue = x.DefaultValue,
                    Required = x.Required,
                    AllowMultiSelect = x.AllowMultiSelect,
                    Options = options.Where(o => o.SettingFieldId == x.Id).Select(ToOptionDto).ToList()
                }).ToList();
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_FieldManager_Edit)]
        [UnitOfWork(System.Transactions.IsolationLevel.Serializable)]
        public async Task<List<FieldSettingOptionDto>> SaveFieldSettingOptions(SaveFieldSettingOptionsInput input)
        {
            if (AbpSession.TenantId.HasValue)
                throw new AbpAuthorizationException("Only the host can maintain field type setting options.");
            if (input?.Options == null || input.SettingFieldId <= 0)
                throw new UserFriendlyException("Select a setting and its options.");
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MayHaveTenant))
            {
                var setting = await _fields.GetAll().SingleOrDefaultAsync(x => x.Id == input.SettingFieldId &&
                    x.SycObjectId.HasValue && x.EntitySycObjectId.HasValue && !x.IsDeleted && x.TenantId == null);
                if (setting == null) throw new UserFriendlyException("Field type setting was not found.");
                await ValidateFieldType(setting.EntitySycObjectId.Value);
                if (!await _objects.GetAll().AnyAsync(x => x.Id == setting.SycObjectId.Value &&
                    x.Code == "FIELD" && !x.IsDeleted))
                    throw new UserFriendlyException("Only Field type settings can have these options.");
                if (input.Options.Any(x => x == null || string.IsNullOrWhiteSpace(x.Code) ||
                    string.IsNullOrWhiteSpace(x.Name) || x.Code.Length > 100 || x.Name.Length > 500 || x.SortOrder < 0) ||
                    input.Options.Select(x => x.Code.Trim()).Distinct(StringComparer.OrdinalIgnoreCase).Count() != input.Options.Count ||
                    input.Options.Where(x => x.Id > 0).Select(x => x.Id).Distinct().Count() != input.Options.Count(x => x.Id > 0))
                    throw new UserFriendlyException("Setting options must have distinct, valid codes and names.");

                var context = CurrentUnitOfWork.GetDbContext<onetouchDbContext>();
                var existing = await context.Set<AppFieldsOption>()
                    .Where(x => x.SettingFieldId == setting.Id).ToListAsync();
                var suppliedIds = input.Options.Where(x => x.Id > 0).Select(x => x.Id).ToHashSet();
                if (suppliedIds.Any(id => existing.All(x => x.Id != id)))
                    throw new UserFriendlyException("An option does not belong to the selected setting.");
                if (input.Options.Any(x => existing.Any(old => old.Id != x.Id &&
                    string.Equals(old.Code, x.Code.Trim(), StringComparison.OrdinalIgnoreCase))))
                    throw new UserFriendlyException("An option code already exists for this setting.");
                foreach (var option in existing) option.IsActive = suppliedIds.Contains(option.Id);
                foreach (var option in input.Options)
                {
                    var row = option.Id > 0 ? existing.Single(x => x.Id == option.Id) : new AppFieldsOption
                    {
                        TenantId = null, SettingFieldId = setting.Id
                    };
                    if (option.Id > 0 && (row.Code != option.Code.Trim() || row.Name != option.Name.Trim()) &&
                        await context.Set<AppFieldSettingValue>().AnyAsync(x => x.AppFieldsOptionId == row.Id))
                        throw new UserFriendlyException("An option already selected by fields cannot be renamed. Inactivate it and add a new option.");
                    row.Code = option.Code.Trim();
                    row.Name = option.Name.Trim();
                    row.SortOrder = option.SortOrder;
                    row.IsActive = true;
                    if (option.Id <= 0) await context.Set<AppFieldsOption>().AddAsync(row);
                }
                await CurrentUnitOfWork.SaveChangesAsync();
                return await context.Set<AppFieldsOption>().Where(x => x.SettingFieldId == setting.Id && x.IsActive)
                    .OrderBy(x => x.SortOrder).ThenBy(x => x.Id).Select(x => new FieldSettingOptionDto
                    {
                        Id = x.Id, Code = x.Code, Name = x.Name, SortOrder = x.SortOrder
                    }).ToListAsync();
            }
        }

        private static FieldSettingOptionDto ToOptionDto(AppFieldsOption x) => new FieldSettingOptionDto
        {
            Id = x.Id, Code = x.Code, Name = x.Name, SortOrder = x.SortOrder
        };

        private Task<List<AppField>> GetSettingDefinitions(long fieldTypeId)
        {
            return _fields.GetAll().Where(x => x.EntitySycObjectId == fieldTypeId && x.SycObjectId.HasValue &&
                x.TenantId == null && !x.IsDeleted).OrderBy(x => x.Id).AsNoTracking().ToListAsync();
        }

        private async Task ApplySettingValues(CreateOrEditFieldInput input, AppField field,
            long? sourceFieldId = null, bool useLegacy = false)
        {
            if (input.SettingValues == null && sourceFieldId.HasValue)
            {
                var source = await _fields.GetAll().Include(x => x.SettingValues)
                    .SingleAsync(x => x.Id == sourceFieldId.Value);
                input.SettingValues = source.SettingValues.Select(ToSettingDto).ToList();
            }
            if (input.SettingValues == null && field.Id != 0 && !useLegacy) return;

            var definitions = await GetSettingDefinitions(field.FieldTypeId);
            var definitionIds = definitions.Select(x => x.Id).ToList();
            var context = CurrentUnitOfWork.GetDbContext<onetouchDbContext>();
            var options = await context.Set<AppFieldsOption>().Where(x => definitionIds.Contains(x.SettingFieldId))
                .AsNoTracking().ToListAsync();
            var typeIds = definitions.Select(x => x.FieldTypeId).Distinct().ToList();
            var typeCodes = await _objectTypes.GetAll().Where(x => typeIds.Contains(x.Id))
                .ToDictionaryAsync(x => x.Id, x => x.Code);
            var supplied = input.SettingValues ?? LegacySettingValues(input, definitions, typeCodes);
            if (input.SettingValues == null)
            {
                foreach (var legacy in supplied)
                {
                    var available = options.Where(x => x.SettingFieldId == legacy.SettingFieldId && x.IsActive).ToList();
                    if (available.Count == 0) continue;
                    var legacyCode = legacy.ValueText ?? legacy.ValueNumber?.ToString(CultureInfo.InvariantCulture) ??
                        legacy.ValueBoolean?.ToString().ToLowerInvariant() ??
                        legacy.ValueDateTime?.ToString("O", CultureInfo.InvariantCulture);
                    var choice = available.SingleOrDefault(x => string.Equals(x.Code, legacyCode, StringComparison.OrdinalIgnoreCase));
                    if (choice == null) throw new UserFriendlyException("A legacy setting value is not an available option.");
                    legacy.AppFieldsOptionId = choice.Id;
                    legacy.ValueText = null;
                    legacy.ValueNumber = null;
                    legacy.ValueBoolean = null;
                    legacy.ValueDateTime = null;
                }
            }
            if (supplied.Any(x => x == null)) throw new UserFriendlyException("A setting value is missing.");
            var replacement = new List<AppFieldSettingValue>();
            foreach (var group in supplied.GroupBy(x => x.SettingFieldId))
            {
                var definition = definitions.SingleOrDefault(x => x.Id == group.Key);
                if (definition == null) throw new UserFriendlyException("A setting does not belong to the selected field type.");
                var rows = group.ToList();
                var settingOptions = options.Where(x => x.SettingFieldId == definition.Id).ToList();
                if (rows.Count > 1 && (!definition.AllowMultiSelect || settingOptions.Count == 0))
                    throw new UserFriendlyException("The setting permits only one value.");
                if (rows.Where(x => x.AppFieldsOptionId.HasValue).Select(x => x.AppFieldsOptionId.Value).Distinct().Count() !=
                    rows.Count(x => x.AppFieldsOptionId.HasValue))
                    throw new UserFriendlyException("A setting option was selected more than once.");
                foreach (var row in rows)
                {
                    var selected = row.AppFieldsOptionId.HasValue
                        ? settingOptions.SingleOrDefault(x => x.Id == row.AppFieldsOptionId.Value &&
                            (x.IsActive || field.SettingValues.Any(old => old.SettingFieldId == definition.Id &&
                                old.AppFieldsOptionId == x.Id))) : null;
                    var unchangedScalar = !row.AppFieldsOptionId.HasValue &&
                        field.SettingValues.Any(old => old.SettingFieldId == definition.Id &&
                            !old.AppFieldsOptionId.HasValue && old.ValueText == row.ValueText &&
                            old.ValueNumber == row.ValueNumber && old.ValueBoolean == row.ValueBoolean &&
                            old.ValueDateTime == row.ValueDateTime);
                    if (settingOptions.Count > 0 && selected == null && !unchangedScalar)
                        throw new UserFriendlyException("Select an option belonging to this setting.");
                    if (settingOptions.Count == 0 && row.AppFieldsOptionId.HasValue)
                        throw new UserFriendlyException("This setting has no selectable options.");
                    var filledCount = (row.ValueText != null ? 1 : 0) + (row.ValueNumber.HasValue ? 1 : 0) +
                        (row.ValueBoolean.HasValue ? 1 : 0) + (row.ValueDateTime.HasValue ? 1 : 0) +
                        (row.AppFieldsOptionId.HasValue ? 1 : 0);
                    if (filledCount != 1) throw new UserFriendlyException("Provide exactly one value for each setting row.");
                    if (selected == null)
                    {
                        var code = typeCodes[definition.FieldTypeId];
                        var valid = definition.FieldName == "DefaultValue" ?
                            (row.ValueText != null && IsValidDefaultValue(row.ValueText, code)) ||
                            (code == "BOOLEAN" && row.ValueBoolean.HasValue) ||
                            ((code == "IN" || code == "IC") && row.ValueNumber.HasValue) ||
                            (code == "DP" && row.ValueDateTime.HasValue) :
                            code == "BOOLEAN" ? row.ValueBoolean.HasValue :
                            code == "IN" || code == "IC" ? row.ValueNumber.HasValue :
                            code == "DP" ? row.ValueDateTime.HasValue : row.ValueText != null;
                        if (!valid) throw new UserFriendlyException("The setting value has the wrong data type.");
                        if (row.ValueNumber.HasValue && definition.FieldName == "Length" &&
                            (row.ValueNumber.Value <= 0 || decimal.Truncate(row.ValueNumber.Value) != row.ValueNumber.Value))
                            throw new UserFriendlyException("Length must be a positive whole number.");
                        if (row.ValueNumber.HasValue && definition.FieldName == "Decimals" &&
                            (row.ValueNumber.Value < 0 || decimal.Truncate(row.ValueNumber.Value) != row.ValueNumber.Value))
                            throw new UserFriendlyException("Decimals must be a nonnegative whole number.");
                    }
                    replacement.Add(new AppFieldSettingValue
                    {
                        TenantId = field.TenantId,
                        SettingFieldId = definition.Id,
                        SettingFieldCode = definition.FieldCode,
                        SettingFieldName = definition.FieldName,
                        AppFieldsOptionId = selected?.Id,
                        OptionCode = selected?.Code,
                        OptionName = selected?.Name,
                        ValueText = row.ValueText,
                        ValueNumber = row.ValueNumber,
                        ValueBoolean = row.ValueBoolean,
                        ValueDateTime = row.ValueDateTime
                    });
                }
            }
            foreach (var required in definitions.Where(x => x.Required &&
                !replacement.Any(v => v.SettingFieldId == x.Id)))
            {
                if (input.SettingValues != null || required.DefaultValue == null)
                    throw new UserFriendlyException("A required field setting is missing: " + required.FieldName);
                var legacy = LegacySettingValues(input, new List<AppField> { required }, typeCodes).SingleOrDefault();
                if (legacy == null) throw new UserFriendlyException("A required field setting is missing: " + required.FieldName);
                replacement.Add(new AppFieldSettingValue
                {
                    TenantId = field.TenantId, SettingFieldId = required.Id,
                    SettingFieldCode = required.FieldCode, SettingFieldName = required.FieldName,
                    ValueText = legacy.ValueText, ValueNumber = legacy.ValueNumber,
                    ValueBoolean = legacy.ValueBoolean, ValueDateTime = legacy.ValueDateTime
                });
            }
            field.SettingValues.Clear();
            foreach (var row in replacement) field.SettingValues.Add(row);
            SyncLegacySettingColumns(field, definitions);
        }

        private static bool IsValidDefaultValue(string text, string typeCode) => typeCode switch
        {
            "BOOLEAN" => bool.TryParse(text, out _),
            "IN" or "IC" => decimal.TryParse(text, NumberStyles.Number,
                CultureInfo.InvariantCulture, out _),
            "DP" => DateTime.TryParse(text, CultureInfo.InvariantCulture,
                DateTimeStyles.RoundtripKind, out _),
            _ => true
        };

        private static void SyncLegacySettingColumns(AppField field, List<AppField> definitions)
        {
            foreach (var definition in definitions)
            {
                var setting = field.SettingValues.FirstOrDefault(x => x.SettingFieldId == definition.Id);
                var text = setting?.AppFieldsOptionId.HasValue == true ? setting.OptionCode :
                    setting?.ValueText ?? setting?.ValueNumber?.ToString(CultureInfo.InvariantCulture) ??
                    setting?.ValueBoolean?.ToString().ToLowerInvariant() ??
                    setting?.ValueDateTime?.ToString("O", CultureInfo.InvariantCulture);
                switch (definition.FieldName)
                {
                    case "AllowNull": field.AllowNull = setting?.ValueBoolean ?? false; break;
                    case "Length": field.Length = setting?.ValueNumber is decimal length ? (int)length : null; break;
                    case "Decimals": field.Decimals = setting?.ValueNumber is decimal decimals ? (int)decimals : null; break;
                    case "DefaultValue": field.DefaultValue = text; break;
                    case "DateFormat": field.DateFormat = text; break;
                    case "TimeFormat": field.TimeFormat = text; break;
                    case "AllowMultiSelect": field.AllowMultiSelect = setting?.ValueBoolean ?? false; break;
                    case "Required": field.Required = setting?.ValueBoolean ?? false; break;
                    case "Visible": field.Visible = setting?.ValueBoolean ?? false; break;
                    case "Editable": field.Editable = setting?.ValueBoolean ?? false; break;
                }
            }
        }

        private static List<FieldSettingValueDto> LegacySettingValues(CreateOrEditFieldInput input,
            List<AppField> definitions, Dictionary<long, string> typeCodes)
        {
            var result = new List<FieldSettingValueDto>();
            foreach (var definition in definitions)
            {
                object value = definition.FieldName switch
                {
                    "AllowNull" => input.AllowNull,
                    "Length" => input.Length,
                    "Decimals" => input.Decimals,
                    "DefaultValue" => input.DefaultValue,
                    "DateFormat" => input.DateFormat,
                    "TimeFormat" => input.TimeFormat,
                    "AllowMultiSelect" => input.AllowMultiSelect,
                    "Required" => input.Required,
                    "Visible" => input.Visible,
                    "Editable" => input.Editable,
                    _ => null
                };
                value ??= definition.DefaultValue;
                if (value == null) continue;
                var dto = new FieldSettingValueDto { SettingFieldId = definition.Id };
                var code = typeCodes[definition.FieldTypeId];
                if (definition.FieldName == "DefaultValue") dto.ValueText = Convert.ToString(value, CultureInfo.InvariantCulture);
                else if (code == "BOOLEAN") dto.ValueBoolean = Convert.ToBoolean(value, CultureInfo.InvariantCulture);
                else if (code == "IN" || code == "IC") dto.ValueNumber = Convert.ToDecimal(value, CultureInfo.InvariantCulture);
                else if (code == "DP") dto.ValueDateTime = Convert.ToDateTime(value, CultureInfo.InvariantCulture);
                else dto.ValueText = Convert.ToString(value, CultureInfo.InvariantCulture);
                result.Add(dto);
            }
            return result;
        }

        private static bool LegacySettingsChanged(CreateOrEditFieldInput input, AppField field) =>
            input.AllowNull != field.AllowNull || input.Length != field.Length ||
            input.Decimals != field.Decimals || input.DefaultValue != field.DefaultValue ||
            input.DateFormat != field.DateFormat || input.TimeFormat != field.TimeFormat ||
            input.AllowMultiSelect != field.AllowMultiSelect || input.Required != field.Required ||
            input.Visible != field.Visible || input.Editable != field.Editable;

        private static AppFieldDto OverlayLegacySettings(AppFieldDto dto)
        {
            foreach (var setting in dto.SettingValues ?? Enumerable.Empty<FieldSettingValueDto>())
            {
                var text = setting.AppFieldsOptionId.HasValue ? setting.OptionCode : setting.ValueText;
                switch (setting.SettingFieldName)
                {
                    case "AllowNull": dto.AllowNull = setting.ValueBoolean ?? dto.AllowNull; break;
                    case "Length": dto.Length = setting.ValueNumber.HasValue ? (int)setting.ValueNumber.Value : dto.Length; break;
                    case "Decimals": dto.Decimals = setting.ValueNumber.HasValue ? (int)setting.ValueNumber.Value : dto.Decimals; break;
                    case "DefaultValue": dto.DefaultValue = text; break;
                    case "DateFormat": dto.DateFormat = text; break;
                    case "TimeFormat": dto.TimeFormat = text; break;
                    case "AllowMultiSelect": dto.AllowMultiSelect = setting.ValueBoolean ?? dto.AllowMultiSelect; break;
                    case "Required": dto.Required = setting.ValueBoolean ?? dto.Required; break;
                    case "Visible": dto.Visible = setting.ValueBoolean ?? dto.Visible; break;
                    case "Editable": dto.Editable = setting.ValueBoolean ?? dto.Editable; break;
                }
            }
            return dto;
        }

        private static FieldSettingValueDto ToSettingDto(AppFieldSettingValue value) => new FieldSettingValueDto
        {
            SettingFieldId = value.SettingFieldId, SettingFieldCode = value.SettingFieldCode,
            SettingFieldName = value.SettingFieldName, AppFieldsOptionId = value.AppFieldsOptionId,
            OptionCode = value.OptionCode, OptionName = value.OptionName,
            ValueText = value.ValueText, ValueNumber = value.ValueNumber,
            ValueBoolean = value.ValueBoolean, ValueDateTime = value.ValueDateTime
        };

        private static FieldSettingValueDto ToSettingDto(AppFieldHistorySettingValue value) => new FieldSettingValueDto
        {
            SettingFieldId = value.SettingFieldId, SettingFieldCode = value.SettingFieldCode,
            SettingFieldName = value.SettingFieldName, AppFieldsOptionId = value.AppFieldsOptionId,
            OptionCode = value.OptionCode, OptionName = value.OptionName,
            ValueText = value.ValueText, ValueNumber = value.ValueNumber,
            ValueBoolean = value.ValueBoolean, ValueDateTime = value.ValueDateTime
        };

        private static AppFieldSettingValue CopyCurrentSettingValue(AppFieldHistorySettingValue x, int? tenantId) =>
            new AppFieldSettingValue
            {
                TenantId = tenantId, SettingFieldId = x.SettingFieldId,
                SettingFieldCode = x.SettingFieldCode, SettingFieldName = x.SettingFieldName,
                AppFieldsOptionId = x.AppFieldsOptionId, OptionCode = x.OptionCode, OptionName = x.OptionName,
                ValueText = x.ValueText, ValueNumber = x.ValueNumber,
                ValueBoolean = x.ValueBoolean, ValueDateTime = x.ValueDateTime
            };

        private static AppFieldHistorySettingValue CopyHistorySettingValue(AppFieldSettingValue x) =>
            new AppFieldHistorySettingValue
            {
                SettingFieldId = x.SettingFieldId, SettingFieldCode = x.SettingFieldCode,
                SettingFieldName = x.SettingFieldName, AppFieldsOptionId = x.AppFieldsOptionId,
                OptionCode = x.OptionCode, OptionName = x.OptionName,
                ValueText = x.ValueText, ValueNumber = x.ValueNumber,
                ValueBoolean = x.ValueBoolean, ValueDateTime = x.ValueDateTime
            };
    }
}
