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
                    DataType = x.SourceDataType ?? (typeCodes.TryGetValue(x.FieldTypeId, out var dataTypeCode)
                        ? SettingDataType(dataTypeCode) : null),
                    DefaultValue = x.DefaultValue,
                    Required = x.Required,
                    AllowMultiSelect = x.AllowMultiSelect,
                    ValidEntries = x.ValidEntries,
                    Options = ParseValidEntries(x.ValidEntries)
                }).ToList();
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_FieldManager_Edit)]
        [UnitOfWork(System.Transactions.IsolationLevel.Serializable)]
        public async Task<string> SaveFieldValidEntries(SaveFieldValidEntriesInput input)
        {
            if (AbpSession.TenantId.HasValue)
                throw new AbpAuthorizationException("Only the host can maintain field type valid entries.");
            if (input == null || input.SettingFieldId <= 0)
                throw new UserFriendlyException("Select a setting.");
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MayHaveTenant))
            {
                var setting = await _fields.GetAll().Include(x => x.SettingValues).SingleOrDefaultAsync(x => x.Id == input.SettingFieldId &&
                    x.SycObjectId.HasValue && x.EntitySycObjectId.HasValue && !x.IsDeleted && x.TenantId == null);
                if (setting == null) throw new UserFriendlyException("Field type setting was not found.");
                await ValidateFieldType(setting.EntitySycObjectId.Value);
                if (!await _objects.GetAll().AnyAsync(x => x.Id == setting.SycObjectId.Value &&
                    x.Code == "FIELD" && !x.IsDeleted))
                    throw new UserFriendlyException("Only Field type settings can have these options.");
                var validEntries = NormalizeValidEntries(input.ValidEntries);
                if (setting.ValidEntries == validEntries) return validEntries;
                setting.ValidEntries = validEntries;
                setting.CurrentRevisionNo = NextRevision(setting.CurrentRevisionNo);
                await RecordHistory(setting, "Edit");
                await CurrentUnitOfWork.SaveChangesAsync();
                return validEntries;
            }
        }

        private static List<string> ParseValidEntries(string text) =>
            string.IsNullOrEmpty(text) ? new List<string>() : text.Split('|').ToList();

        private static string SettingDataType(string typeCode) => typeCode switch
        {
            "BOOLEAN" => "boolean",
            "DP" => "Datetime",
            "IN" or "IC" => "Numeric",
            "LD" or "SD" => "dropDownList",
            "SC" => "chips",
            _ => "string"
        };

        private static string NormalizeValidEntries(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return null;
            var entries = text.Split('|').Select(x => x.Trim()).ToList();
            if (entries.Any(x => x.Length == 0 || x.Length > 2000) ||
                entries.Distinct(StringComparer.OrdinalIgnoreCase).Count() != entries.Count)
                throw new UserFriendlyException("Valid entries must be nonempty and unique, separated by |.");
            return string.Join("|", entries);
        }

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
            var typeIds = definitions.Select(x => x.FieldTypeId).Distinct().ToList();
            var typeCodes = await _objectTypes.GetAll().Where(x => typeIds.Contains(x.Id))
                .ToDictionaryAsync(x => x.Id, x => x.Code);
            var supplied = input.SettingValues ?? LegacySettingValues(input, definitions);
            if (supplied.Any(x => x == null)) throw new UserFriendlyException("A setting value is missing.");
            var replacement = new List<AppFieldSettingValue>();
            foreach (var group in supplied.GroupBy(x => x.SettingFieldId))
            {
                var definition = definitions.SingleOrDefault(x => x.Id == group.Key);
                if (definition == null) throw new UserFriendlyException("A setting does not belong to the selected field type.");
                var rows = group.ToList();
                var settingOptions = ParseValidEntries(definition.ValidEntries);
                if (rows.Count > 1 && (!definition.AllowMultiSelect || settingOptions.Count == 0))
                    throw new UserFriendlyException("The setting permits only one value.");
                if (rows.Count > 1 && rows.Select(x => x.Value).Distinct(StringComparer.OrdinalIgnoreCase).Count() != rows.Count)
                    throw new UserFriendlyException("A setting entry was selected more than once.");
                foreach (var row in rows)
                {
                    if (row.Value == null)
                        throw new UserFriendlyException("Provide a value for each setting row.");
                    var selected = settingOptions.FirstOrDefault(x =>
                        string.Equals(x, row.Value, StringComparison.OrdinalIgnoreCase));
                    var unchanged = field.SettingValues.Any(old => old.SettingFieldId == definition.Id &&
                        string.Equals(old.Value, row.Value, StringComparison.OrdinalIgnoreCase));
                    if (settingOptions.Count > 0 && selected == null && !unchanged)
                        throw new UserFriendlyException("Select a valid entry for this setting.");
                    if (settingOptions.Count == 0)
                    {
                        var code = typeCodes[definition.FieldTypeId];
                        if (!IsValidDefaultValue(row.Value, code))
                            throw new UserFriendlyException("The setting value has the wrong data type.");
                        if (definition.FieldName == "Length" &&
                            (!TryWholeNumber(row.Value, out var length) || length <= 0))
                            throw new UserFriendlyException("Length must be a positive whole number.");
                        if (definition.FieldName == "Decimals" &&
                            (!TryWholeNumber(row.Value, out var decimals) || decimals < 0))
                            throw new UserFriendlyException("Decimals must be a nonnegative whole number.");
                    }
                    replacement.Add(new AppFieldSettingValue
                    {
                        TenantId = field.TenantId,
                        SettingFieldId = definition.Id,
                        SettingFieldCode = definition.FieldCode,
                        SettingFieldName = definition.FieldName,
                        Value = settingOptions.Count > 0 ? selected ?? row.Value :
                            NormalizeValue(row.Value, typeCodes[definition.FieldTypeId])
                    });
                }
            }
            foreach (var required in definitions.Where(x => x.Required &&
                !replacement.Any(v => v.SettingFieldId == x.Id)))
            {
                if (input.SettingValues != null || required.DefaultValue == null)
                    throw new UserFriendlyException("A required field setting is missing: " + required.FieldName);
                var legacy = LegacySettingValues(input, new List<AppField> { required }).SingleOrDefault();
                if (legacy == null) throw new UserFriendlyException("A required field setting is missing: " + required.FieldName);
                var requiredOptions = ParseValidEntries(required.ValidEntries);
                var requiredValue = requiredOptions.Count == 0 ?
                    NormalizeValue(legacy.Value, typeCodes[required.FieldTypeId]) :
                    requiredOptions.FirstOrDefault(x => string.Equals(x, legacy.Value, StringComparison.OrdinalIgnoreCase));
                if (requiredValue == null)
                    throw new UserFriendlyException("The default is not a valid entry for " + required.FieldName);
                replacement.Add(new AppFieldSettingValue
                {
                    TenantId = field.TenantId, SettingFieldId = required.Id,
                    SettingFieldCode = required.FieldCode, SettingFieldName = required.FieldName,
                    Value = requiredValue
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

        private static string NormalizeValue(string text, string typeCode) => typeCode switch
        {
            "BOOLEAN" => bool.Parse(text).ToString().ToLowerInvariant(),
            "IN" or "IC" => decimal.Parse(text, NumberStyles.Number, CultureInfo.InvariantCulture)
                .ToString(CultureInfo.InvariantCulture),
            "DP" => DateTime.Parse(text, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind)
                .ToString("O", CultureInfo.InvariantCulture),
            _ => text
        };

        private static bool TryWholeNumber(string text, out int value)
        {
            value = 0;
            if (!decimal.TryParse(text, NumberStyles.Number, CultureInfo.InvariantCulture, out var number) ||
                number != decimal.Truncate(number) || number < int.MinValue || number > int.MaxValue)
                return false;
            value = (int)number;
            return true;
        }

        private static void SyncLegacySettingColumns(AppField field, List<AppField> definitions)
        {
            foreach (var definition in definitions)
            {
                var setting = field.SettingValues.FirstOrDefault(x => x.SettingFieldId == definition.Id);
                var text = setting?.Value;
                switch (definition.FieldName)
                {
                    case "AllowNull": field.AllowNull = bool.TryParse(text, out var allowNull) && allowNull; break;
                    case "Length": field.Length = TryWholeNumber(text, out var length) ? length : null; break;
                    case "Decimals": field.Decimals = TryWholeNumber(text, out var decimals) ? decimals : null; break;
                    case "DefaultValue": field.DefaultValue = text; break;
                    case "DateFormat": field.DateFormat = text; break;
                    case "TimeFormat": field.TimeFormat = text; break;
                    case "AllowMultiSelect": field.AllowMultiSelect = bool.TryParse(text, out var multiSelect) && multiSelect; break;
                    case "Required": field.Required = bool.TryParse(text, out var required) && required; break;
                    case "Visible": field.Visible = bool.TryParse(text, out var visible) && visible; break;
                    case "Editable": field.Editable = bool.TryParse(text, out var editable) && editable; break;
                }
            }
        }

        private static List<FieldSettingValueDto> LegacySettingValues(CreateOrEditFieldInput input,
            List<AppField> definitions)
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
                var dto = new FieldSettingValueDto
                {
                    SettingFieldId = definition.Id,
                    Value = Convert.ToString(value, CultureInfo.InvariantCulture)
                };
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
                var text = setting.Value;
                switch (setting.SettingFieldName)
                {
                    case "AllowNull": dto.AllowNull = bool.TryParse(text, out var allowNull) ? allowNull : dto.AllowNull; break;
                    case "Length": dto.Length = TryWholeNumber(text, out var length) ? length : dto.Length; break;
                    case "Decimals": dto.Decimals = TryWholeNumber(text, out var decimals) ? decimals : dto.Decimals; break;
                    case "DefaultValue": dto.DefaultValue = text; break;
                    case "DateFormat": dto.DateFormat = text; break;
                    case "TimeFormat": dto.TimeFormat = text; break;
                    case "AllowMultiSelect": dto.AllowMultiSelect = bool.TryParse(text, out var multiSelect) ? multiSelect : dto.AllowMultiSelect; break;
                    case "Required": dto.Required = bool.TryParse(text, out var required) ? required : dto.Required; break;
                    case "Visible": dto.Visible = bool.TryParse(text, out var visible) ? visible : dto.Visible; break;
                    case "Editable": dto.Editable = bool.TryParse(text, out var editable) ? editable : dto.Editable; break;
                }
            }
            return dto;
        }

        private static FieldSettingValueDto ToSettingDto(AppFieldSettingValue value) => new FieldSettingValueDto
        {
            SettingFieldId = value.SettingFieldId, SettingFieldCode = value.SettingFieldCode,
            SettingFieldName = value.SettingFieldName,
            Value = value.Value
        };

        private static FieldSettingValueDto ToSettingDto(AppFieldHistorySettingValue value) => new FieldSettingValueDto
        {
            SettingFieldId = value.SettingFieldId, SettingFieldCode = value.SettingFieldCode,
            SettingFieldName = value.SettingFieldName,
            Value = value.Value
        };

        private static AppFieldSettingValue CopyCurrentSettingValue(AppFieldHistorySettingValue x, int? tenantId) =>
            new AppFieldSettingValue
            {
                TenantId = tenantId, SettingFieldId = x.SettingFieldId,
                SettingFieldCode = x.SettingFieldCode, SettingFieldName = x.SettingFieldName,
                Value = x.Value
            };

        private static AppFieldHistorySettingValue CopyHistorySettingValue(AppFieldSettingValue x) =>
            new AppFieldHistorySettingValue
            {
                SettingFieldId = x.SettingFieldId, SettingFieldCode = x.SettingFieldCode,
                SettingFieldName = x.SettingFieldName,
                Value = x.Value
            };
    }
}
