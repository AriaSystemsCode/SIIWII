using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using Abp.UI;

namespace onetouch.AppFields
{
    // Keep the existing Field Manager API contract while storing definitions as columns and child rows.
    internal static class FieldExtraAttributesCodec
    {
        private static readonly JsonSerializerOptions JsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        private static readonly HashSet<string> SupportedKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "sourceAttributeId", "sourceDataType", "sourceEntityObjectTypeId",
            "entityObjectTypeCode", "usage", "isLookup", "isVariation",
            "isAdvancedSearch", "acceptMultipleValues", "allowAddNew", "dropdownOptions"
        };

        internal sealed class Data
        {
            public long? SourceAttributeId { get; set; }
            public string SourceDataType { get; set; }
            public long? SourceEntityObjectTypeId { get; set; }
            public string EntityObjectTypeCode { get; set; }
            public string Usage { get; set; }
            public bool? IsLookup { get; set; }
            public bool? IsVariation { get; set; }
            public bool? IsAdvancedSearch { get; set; }
            public bool? AcceptMultipleValues { get; set; }
            public bool? AllowAddNew { get; set; }
            public List<DropdownOptionData> DropdownOptions { get; set; } = new List<DropdownOptionData>();
        }

        internal sealed class DropdownOptionData
        {
            public string Option { get; set; }
            public string Value { get; set; }
        }

        public static Data Parse(string json)
        {
            if (string.IsNullOrWhiteSpace(json)) return new Data();
            try
            {
                using (var document = JsonDocument.Parse(json))
                {
                    if (document.RootElement.ValueKind != JsonValueKind.Object ||
                        document.RootElement.EnumerateObject().Any(x => !SupportedKeys.Contains(x.Name)))
                        throw new UserFriendlyException("Extra attributes contain an unsupported setting.");
                }
                var data = JsonSerializer.Deserialize<Data>(json, JsonOptions) ?? new Data();
                if ((data.SourceDataType?.Length ?? 0) > 100 ||
                    (data.EntityObjectTypeCode?.Length ?? 0) > 100 ||
                    (data.Usage?.Length ?? 0) > 500 ||
                    data.DropdownOptions?.Any(x => x == null || string.IsNullOrWhiteSpace(x.Option) ||
                        x.Value == null || x.Option.Length > 500 || x.Value.Length > 500) == true)
                    throw new UserFriendlyException("Extra attributes exceed the allowed field lengths.");
                data.DropdownOptions ??= new List<DropdownOptionData>();
                if (data.DropdownOptions.Count > 0)
                    throw new UserFriendlyException("Save selectable options through field settings and AppFieldsOptionId.");
                return data;
            }
            catch (JsonException)
            {
                throw new UserFriendlyException("Extra attributes must be valid Field Manager JSON.");
            }
        }

        public static void Apply(Data data, AppField field)
        {
            field.SourceAttributeId = data.SourceAttributeId;
            field.SourceDataType = data.SourceDataType;
            field.SourceEntityObjectTypeId = data.SourceEntityObjectTypeId;
            field.EntityObjectTypeCode = data.EntityObjectTypeCode;
            field.Usage = data.Usage;
            field.IsLookup = data.IsLookup;
            field.IsVariation = data.IsVariation;
            field.IsAdvancedSearch = data.IsAdvancedSearch;
            field.AcceptMultipleValues = data.AcceptMultipleValues;
            field.AllowAddNew = data.AllowAddNew;
        }

        public static string Serialize(AppField field) => JsonSerializer.Serialize(new Data
        {
            SourceAttributeId = field.SourceAttributeId,
            SourceDataType = field.SourceDataType,
            SourceEntityObjectTypeId = field.SourceEntityObjectTypeId,
            EntityObjectTypeCode = field.EntityObjectTypeCode,
            Usage = field.Usage,
            IsLookup = field.IsLookup,
            IsVariation = field.IsVariation,
            IsAdvancedSearch = field.IsAdvancedSearch,
            AcceptMultipleValues = field.AcceptMultipleValues,
            AllowAddNew = field.AllowAddNew,
            DropdownOptions = new List<DropdownOptionData>()
        }, JsonOptions);

        public static string Serialize(AppFieldHistory field) => JsonSerializer.Serialize(new Data
        {
            SourceAttributeId = field.SourceAttributeId,
            SourceDataType = field.SourceDataType,
            SourceEntityObjectTypeId = field.SourceEntityObjectTypeId,
            EntityObjectTypeCode = field.EntityObjectTypeCode,
            Usage = field.Usage,
            IsLookup = field.IsLookup,
            IsVariation = field.IsVariation,
            IsAdvancedSearch = field.IsAdvancedSearch,
            AcceptMultipleValues = field.AcceptMultipleValues,
            AllowAddNew = field.AllowAddNew,
            DropdownOptions = new List<DropdownOptionData>()
        }, JsonOptions);
    }
}
