using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using System.Transactions;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.EntityFrameworkCore.Uow;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using onetouch.AppFields.Dto;
using onetouch.Authorization;
using onetouch.Authorization.Users;
using onetouch.EntityFrameworkCore;
using onetouch.SystemObjects;

namespace onetouch.AppFields
{
    public partial class AppFieldManagerAppService : onetouchAppServiceBase, IAppFieldManagerAppService
    {
        private readonly IRepository<AppField, long> _fields;
        private readonly IRepository<AppFieldHistory, long> _history;
        private readonly IRepository<AppTableField, long> _tableFields;
        private readonly IRepository<SydObject, long> _objects;
        private readonly IRepository<SycEntityObjectType, long> _objectTypes;
        private readonly IRepository<User, long> _users;

        public AppFieldManagerAppService(
            IRepository<AppField, long> fields,
            IRepository<AppFieldHistory, long> history,
            IRepository<AppTableField, long> tableFields,
            IRepository<SydObject, long> objects,
            IRepository<SycEntityObjectType, long> objectTypes,
            IRepository<User, long> users)
        {
            _fields = fields;
            _history = history;
            _tableFields = tableFields;
            _objects = objects;
            _objectTypes = objectTypes;
            _users = users;
        }

        [AbpAuthorize]
        public Task<FieldManagerPermissionDto> GetPagePermissions()
        {
            return Task.FromResult(new FieldManagerPermissionDto
            {
                CanViewPage = PermissionChecker.IsGranted(AppPermissions.Pages_Administration_FieldManager),
                CanCreateField = PermissionChecker.IsGranted(AppPermissions.Pages_Administration_FieldManager_Create),
                CanEditField = PermissionChecker.IsGranted(AppPermissions.Pages_Administration_FieldManager_Edit),
                CanDeleteField = PermissionChecker.IsGranted(AppPermissions.Pages_Administration_FieldManager_Delete),
                CanDuplicateField = PermissionChecker.IsGranted(AppPermissions.Pages_Administration_FieldManager_Duplicate),
                CanRestoreRevision = PermissionChecker.IsGranted(AppPermissions.Pages_Administration_FieldManager_RestoreRevision),
                CanAddExistingField = PermissionChecker.IsGranted(AppPermissions.Pages_Administration_FieldManager_AddExistingField),
                IsHost = !AbpSession.TenantId.HasValue,
                IsTenant = AbpSession.TenantId.HasValue
            });
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_FieldManager)]
        public async Task<List<ObjectTypeTreeNodeDto>> GetObjectTypeTree()
        {
            var objects = await _objects.GetAll()
                .Where(x => !x.IsDeleted && (x.ObjectTypeCode == "ENTITY" || x.ObjectTypeCode == "DATA"))
                .Select(x => new { x.Id, x.ParentId, x.Code, x.Name, x.ObjectTypeCode })
                .AsNoTracking().ToListAsync();

            var objectIds = objects.Select(x => x.Id).ToList();
            var tenantId = AbpSession.TenantId;
            var typeQuery = _objectTypes.GetAll()
                .Where(x => !x.IsDeleted && objectIds.Contains(x.ObjectId));
            typeQuery = tenantId.HasValue
                ? typeQuery.Where(x => x.TenantId == null || x.TenantId == tenantId.Value)
                : typeQuery.Where(x => x.TenantId == null);
            var types = await typeQuery
                .Select(x => new { x.Id, x.ParentId, x.ObjectId, x.Code, x.Name })
                .AsNoTracking().ToListAsync();

            // These roots identify the entity behind existing field definitions;
            // the entity object itself already occupies their place in the tree.
            var syntheticEntityIds = objects.Where(x => x.ObjectTypeCode == "ENTITY" &&
                    (x.Code == "TRANSACTION" || x.Code == "BASEENTITY"))
                .Select(x => x.Id).ToHashSet();
            types.RemoveAll(x => x.ParentId == null && syntheticEntityIds.Contains(x.ObjectId) &&
                (x.Code == "TRANSACTION" || x.Code == "BASEENTITY"));

            // Older metadata has both generic order types and header-specific aliases.
            // The generic codes are the IDs used by transaction records and the field manager.
            var headerObjectId = objects.Where(x => x.Code == "TRANSACTION-HEADER-DATA")
                .Select(x => (long?)x.Id).FirstOrDefault();
            if (headerObjectId.HasValue && types.Any(x => x.ObjectId == headerObjectId.Value && x.Code == "SALESORDER"))
                types.RemoveAll(x => x.ObjectId == headerObjectId.Value && x.Code == "SALESORDERHEADER");
            if (headerObjectId.HasValue && types.Any(x => x.ObjectId == headerObjectId.Value && x.Code == "PURCHASEORDER"))
                types.RemoveAll(x => x.ObjectId == headerObjectId.Value && x.Code == "PURCHASEORDERHEADER");

            var objectNodes = objects.ToDictionary(x => x.Id, x => new ObjectTypeTreeNodeDto
            {
                Id = x.Id,
                Key = (x.ObjectTypeCode == "ENTITY" ? "Entity:" : "DataObject:") + x.Id,
                Code = x.Code,
                Name = x.Name,
                NodeType = x.ObjectTypeCode == "ENTITY" ? "Entity" : "DataObject",
                SycObjectId = x.Id
            });
            var objectParents = objects.ToDictionary(x => x.Id, x => x.ParentId);
            var roots = new List<ObjectTypeTreeNodeDto>();
            foreach (var item in objects)
            {
                var node = objectNodes[item.Id];
                if (item.ParentId.HasValue && objectNodes.TryGetValue(item.ParentId.Value, out var parent) &&
                    !WouldCreateCycle(item.Id, item.ParentId.Value, objectParents))
                {
                    node.ParentId = parent.Id;
                    node.ParentKey = parent.Key;
                    parent.Children.Add(node);
                }
                else
                {
                    roots.Add(node);
                }
            }

            var typeNodes = types.ToDictionary(x => x.Id, x => new ObjectTypeTreeNodeDto
            {
                Id = x.Id,
                Key = "ObjectType:" + x.Id,
                Code = x.Code,
                Name = x.Name,
                NodeType = "ObjectType",
                SycObjectId = x.ObjectId
            });
            var typeParents = types.ToDictionary(x => x.Id, x => x.ParentId);
            foreach (var item in types)
            {
                var node = typeNodes[item.Id];
                ObjectTypeTreeNodeDto parent = null;
                if (item.ParentId.HasValue && typeNodes.TryGetValue(item.ParentId.Value, out var parentType) &&
                    !WouldCreateCycle(item.Id, item.ParentId.Value, typeParents))
                    parent = parentType;
                else
                    objectNodes.TryGetValue(item.ObjectId, out parent);

                if (parent == null) continue;
                node.ParentId = parent.Id;
                node.ParentKey = parent.Key;
                parent.Children.Add(node);
            }

            SortObjectTypeTree(roots);
            return roots;
        }

        private static bool WouldCreateCycle(long childId, long parentId, Dictionary<long, long?> parents)
        {
            var seen = new HashSet<long>();
            var current = (long?)parentId;
            while (current.HasValue)
            {
                if (current.Value == childId || !seen.Add(current.Value)) return true;
                current = parents.TryGetValue(current.Value, out var next) ? next : null;
            }
            return false;
        }

        private static void SortObjectTypeTree(List<ObjectTypeTreeNodeDto> nodes)
        {
            nodes.Sort((left, right) =>
            {
                var leftOrder = left.NodeType == "Entity" ? 0 : left.NodeType == "DataObject" ? 1 : 2;
                var rightOrder = right.NodeType == "Entity" ? 0 : right.NodeType == "DataObject" ? 1 : 2;
                var result = leftOrder.CompareTo(rightOrder);
                if (result != 0) return result;
                result = StringComparer.OrdinalIgnoreCase.Compare(left.Name, right.Name);
                return result != 0 ? result : left.Id.CompareTo(right.Id);
            });
            foreach (var node in nodes) SortObjectTypeTree(node.Children);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_FieldManager)]
        public async Task<FieldCreateOrEditMetadataDto> GetFieldCreateOrEditMetadata()
        {
            var fieldObject = await _objects.GetAll().SingleAsync(x => x.Code == "FIELD" && !x.IsDeleted);
            var roots = await _objectTypes.GetAll()
                .Where(x => x.ObjectId == fieldObject.Id && (x.Code == "FIELD" || x.Code == "WIDGET"))
                .ToListAsync();
            var fieldRootId = roots.Single(x => x.Code == "FIELD").Id;
            var widgetRootId = roots.SingleOrDefault(x => x.Code == "WIDGET")?.Id;
            var types = await _objectTypes.GetAll()
                .Where(x => x.ObjectId == fieldObject.Id &&
                    (x.ParentId == fieldRootId || (widgetRootId.HasValue && x.ParentId == widgetRootId.Value)))
                .OrderBy(x => x.Name).ToListAsync();
            var objects = await _objects.GetAll()
                .Where(x => x.ObjectTypeCode == "ENTITY" || x.ObjectTypeCode == "DATA")
                .OrderBy(x => x.Name).ToListAsync();

            return new FieldCreateOrEditMetadataDto
            {
                FieldTypes = types.Where(x => x.ParentId == fieldRootId)
                    .Select(x => new FieldLookupDto { Id = x.Id, Code = x.Code, Name = x.Name }).ToList(),
                WidgetTypes = types.Where(x => widgetRootId.HasValue && x.ParentId == widgetRootId.Value)
                    .Select(x => new FieldLookupDto { Id = x.Id, Code = x.Code, Name = x.Name }).ToList(),
                FieldLevels = new List<FieldLookupDto>
                {
                    new FieldLookupDto { Code = "System", Name = "System" },
                    new FieldLookupDto { Code = "Application", Name = "Application" },
                    new FieldLookupDto { Code = "Tenant", Name = "Tenant" }
                },
                FieldStatuses = new List<FieldLookupDto>
                {
                    new FieldLookupDto { Code = "Proposed", Name = "Proposed" },
                    new FieldLookupDto { Code = "Active", Name = "Active" },
                    new FieldLookupDto { Code = "Discontinued", Name = "Discontinued" }
                },
                Entities = objects.Select(x => new FieldLookupDto { Id = x.Id, Code = x.Code, Name = x.Name }).ToList()
            };
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_FieldManager_Create)]
        public async Task<FieldCodePreviewDto> PreviewFieldCode(PreviewFieldCodeInput input)
        {
            if (input == null) throw new UserFriendlyException("Field data is required.");
            await ValidateFieldType(input.FieldTypeId);
            return new FieldCodePreviewDto { Sequence = await NextFieldSequence(input.FieldTypeId, acquireLock: false) };
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_FieldManager)]
        public async Task<PagedResultDto<AppFieldListDto>> GetFields(GetFieldsInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MayHaveTenant))
            {
                var tenantId = AbpSession.TenantId;
                var assignments = _tableFields.GetAll().Where(x => x.TenantId == null || x.TenantId == tenantId);
                List<AppField> page;
                int count;
                var suppressedHostKeys = input.SelectedObjectId.HasValue || input.SelectedObjectTypeId.HasValue
                    ? await GetSuppressedHostKeys(tenantId) : new HashSet<Guid>();
                if (input.SelectedObjectTypeId.HasValue)
                {
                    var selectedType = await _objectTypes.GetAll().Where(x => x.Id == input.SelectedObjectTypeId.Value && !x.IsDeleted)
                        .Select(x => new { x.Id, x.ObjectId }).SingleOrDefaultAsync();
                    if (selectedType == null) throw new UserFriendlyException("Select a valid object type.");
                    var objectIds = await GetEffectiveObjectIds(selectedType.ObjectId);
                    var baseObjectIds = objectIds.Skip(1).ToList();
                    var rows = await assignments.Where(x =>
                        (x.SycObjectId == selectedType.ObjectId &&
                            (x.SycEntityObjectTypeId == null || x.SycEntityObjectTypeId == selectedType.Id)) ||
                        (baseObjectIds.Contains(x.SycObjectId) && x.SycEntityObjectTypeId == null))
                        .AsNoTracking().ToListAsync();
                    var filtered = FilterFields(SelectAppliedDefinitions(rows.Where(x =>
                        !suppressedHostKeys.Contains(x.FieldDefinitionKey)), tenantId, objectIds).AsQueryable(), input);
                    count = filtered.Count();
                    page = SortFields(filtered, input.Sorting).Skip(input.SkipCount).Take(input.MaxResultCount).ToList();
                }
                else if (input.SelectedObjectId.HasValue)
                {
                    var objectIds = await GetEffectiveObjectIds(input.SelectedObjectId.Value);
                    var rows = await assignments.Where(x => objectIds.Contains(x.SycObjectId) &&
                        x.SycEntityObjectTypeId == null).AsNoTracking().ToListAsync();
                    var filtered = FilterFields(SelectAppliedDefinitions(rows.Where(x =>
                        !suppressedHostKeys.Contains(x.FieldDefinitionKey)), tenantId, objectIds).AsQueryable(), input);
                    count = filtered.Count();
                    page = SortFields(filtered, input.Sorting).Skip(input.SkipCount).Take(input.MaxResultCount).ToList();
                }
                else
                {
                    using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
                    {
                        var usedKeys = assignments.Select(x => x.FieldDefinitionKey);
                        var query = FilterFields(VisibleFields()
                            .Where(x => !x.IsDeleted || usedKeys.Contains(x.FieldDefinitionKey)), input);
                        count = await query.CountAsync();
                        page = await SortFields(query, input.Sorting).Skip(input.SkipCount)
                            .Take(input.MaxResultCount).AsNoTracking().ToListAsync();
                    }
                }
                var pageKeys = page.Select(x => x.FieldDefinitionKey).Distinct().ToList();
                Dictionary<Guid, bool> archived;
                using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
                {
                    var catalog = await _fields.GetAll().Where(x => pageKeys.Contains(x.FieldDefinitionKey))
                        .Select(x => new { x.FieldDefinitionKey, x.IsDeleted }).AsNoTracking().ToListAsync();
                    archived = catalog.ToDictionary(x => x.FieldDefinitionKey, x => x.IsDeleted);
                }
                var creatorIds = page.Where(x => x.CreatorUserId.HasValue)
                    .Select(x => x.CreatorUserId.Value).Distinct().ToList();
                var creators = await _users.GetAll()
                    .Where(x => creatorIds.Contains(x.Id) && (x.TenantId == null || x.TenantId == tenantId))
                    .Select(x => new { x.Id, x.Name, x.Surname })
                    .AsNoTracking().ToListAsync();
                var creatorNames = creators.ToDictionary(x => x.Id,
                    x => string.Join(" ", new[] { x.Name, x.Surname }.Where(name => !string.IsNullOrWhiteSpace(name))));
                var typeIds = page.SelectMany(x => new long?[] { x.FieldTypeId, x.WidgetTypeId })
                    .Where(x => x.HasValue).Select(x => x.Value).Distinct().ToList();
                var typeNames = await _objectTypes.GetAll().Where(x => typeIds.Contains(x.Id))
                    .ToDictionaryAsync(x => x.Id, x => x.Name);
                var pageAssignments = await assignments.Where(x => pageKeys.Contains(x.FieldDefinitionKey))
                    .Select(x => new { x.FieldDefinitionKey, x.SycObjectId, x.SycEntityObjectTypeId })
                    .AsNoTracking().ToListAsync();
                var objectsWithBase = await _objects.GetAll().Where(x => !x.IsDeleted)
                    .Select(x => new { x.Id, x.BaseEntityId, x.Name }).AsNoTracking().ToListAsync();
                var baseEntityIds = objectsWithBase.ToDictionary(x => x.Id, x => x.BaseEntityId);
                var objectNames = objectsWithBase.ToDictionary(x => x.Id, x => x.Name);
                var inheritedTableNames = pageAssignments.Where(x => !x.SycEntityObjectTypeId.HasValue)
                    .Select(x => x.SycObjectId).Distinct().ToDictionary(id => id,
                        id => objectsWithBase.Where(child => child.Id != id &&
                            GetEffectiveObjectIds(child.Id, baseEntityIds).Contains(id))
                            .Select(child => child.Name).ToList());
                var assignmentTypeIds = pageAssignments.Where(x => x.SycEntityObjectTypeId.HasValue)
                    .Select(x => x.SycEntityObjectTypeId.Value).Distinct().ToList();
                var assignmentTypeNames = await _objectTypes.GetAll().Where(x => assignmentTypeIds.Contains(x.Id))
                    .ToDictionaryAsync(x => x.Id, x => x.Name);
                var canEdit = PermissionChecker.IsGranted(AppPermissions.Pages_Administration_FieldManager_Edit);
                var canDelete = PermissionChecker.IsGranted(AppPermissions.Pages_Administration_FieldManager_Delete);
                var result = page.Select(x => new AppFieldListDto
                {
                    Id = x.Id,
                    FieldDefinitionKey = x.FieldDefinitionKey,
                    FieldCode = x.FieldCode,
                    FieldName = x.FieldName,
                    Description = x.Description,
                    FieldTypeName = typeNames.TryGetValue(x.FieldTypeId, out var typeName) ? typeName : null,
                    WidgetTypeName = x.WidgetTypeId.HasValue && typeNames.TryGetValue(x.WidgetTypeId.Value, out var widgetName) ? widgetName : null,
                    FieldLevelName = x.FieldLevelCode,
                    StatusName = !archived.TryGetValue(x.FieldDefinitionKey, out var isArchived) || isArchived
                        ? "Archived" : x.FieldStatusCode,
                    RevisionNo = x.CurrentRevisionNo,
                    TrackingNo = x.TrackingNo,
                    StandardOrCustom = x.IsStandard ? "Standard" : "Custom",
                    IsStandard = x.IsStandard,
                    IsCustom = !x.IsStandard,
                    IsExtraField = x.IsExtraField,
                    IsHidden = x.IsHidden,
                    CanEdit = canEdit && archived.TryGetValue(x.FieldDefinitionKey, out var editableArchived) && !editableArchived,
                    CanDelete = canDelete && archived.TryGetValue(x.FieldDefinitionKey, out var deletableArchived) && !deletableArchived &&
                        (!AbpSession.TenantId.HasValue || x.TenantId == AbpSession.TenantId),
                    CanHide = AbpSession.TenantId.HasValue && x.TenantId == null &&
                        archived.TryGetValue(x.FieldDefinitionKey, out var hideArchived) && !hideArchived,
                    SycObjectId = x.SycObjectId,
                    EntitySycObjectId = x.EntitySycObjectId,
                    CreatorUserId = x.CreatorUserId,
                    CreatorUserName = x.CreatorUserId.HasValue && creatorNames.TryGetValue(x.CreatorUserId.Value, out var creatorName)
                        ? creatorName : null,
                    CreationTime = x.CreationTime,
                    Tables = pageAssignments.Where(a => a.FieldDefinitionKey == x.FieldDefinitionKey)
                        .SelectMany(a => a.SycEntityObjectTypeId.HasValue
                            ? assignmentTypeNames.TryGetValue(a.SycEntityObjectTypeId.Value, out var assignedTypeName)
                                ? new[] { assignedTypeName } : Array.Empty<string>()
                            : (objectNames.TryGetValue(a.SycObjectId, out var tableName)
                                ? new[] { tableName } : Array.Empty<string>())
                                .Concat(inheritedTableNames.TryGetValue(a.SycObjectId, out var inheritedNames)
                                    ? inheritedNames : Enumerable.Empty<string>()))
                        .Distinct().ToList()
                }).ToList();
                return new PagedResultDto<AppFieldListDto>(count, result);
            }
        }

        private static IEnumerable<AppField> SelectAppliedDefinitions(IEnumerable<AppTableField> rows, int? tenantId,
            List<long> objectIds = null)
        {
            return rows.OrderBy(x => objectIds == null ? 0 : objectIds.IndexOf(x.SycObjectId))
                .ThenByDescending(x => tenantId.HasValue && x.TenantId == tenantId)
                .ThenByDescending(x => x.SycEntityObjectTypeId.HasValue)
                .GroupBy(x => x.FieldDefinitionKey)
                .Select(group =>
                {
                    var assignment = group.First();
                    return assignment.ToAppField();
                });
        }

        private async Task<List<long>> GetEffectiveObjectIds(long objectId)
        {
            var objects = await _objects.GetAll().Where(x => !x.IsDeleted)
                .Select(x => new { x.Id, x.BaseEntityId }).AsNoTracking().ToListAsync();
            return GetEffectiveObjectIds(objectId, objects.ToDictionary(x => x.Id, x => x.BaseEntityId));
        }

        private static List<long> GetEffectiveObjectIds(long objectId, Dictionary<long, long?> baseEntityIds)
        {
            var ids = new List<long>();
            var seen = new HashSet<long>();
            var current = (long?)objectId;
            while (current.HasValue && seen.Add(current.Value) && baseEntityIds.ContainsKey(current.Value))
            {
                ids.Add(current.Value);
                current = baseEntityIds[current.Value];
            }
            return ids;
        }

        private async Task<HashSet<Guid>> GetSuppressedHostKeys(int? tenantId)
        {
            if (!tenantId.HasValue) return new HashSet<Guid>();
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
            {
                var sourceIds = await _fields.GetAll().Where(x => x.TenantId == tenantId && x.SourceFieldId.HasValue)
                    .Select(x => x.SourceFieldId.Value).Distinct().ToListAsync();
                var keys = await _fields.GetAll().Where(x => sourceIds.Contains(x.Id))
                    .Select(x => x.FieldDefinitionKey).ToListAsync();
                return new HashSet<Guid>(keys);
            }
        }

        private static IQueryable<AppField> FilterFields(IQueryable<AppField> query, GetFieldsInput input)
        {
            if (!input.AllFields) query = query.Where(x => x.IsExtraField);
            if (!string.IsNullOrWhiteSpace(input.SearchText))
            {
                var search = input.SearchText.Trim();
                query = query.Where(x => x.FieldCode.Contains(search) || x.FieldName.Contains(search) ||
                    (x.Description != null && x.Description.Contains(search)) ||
                    (x.TrackingNo != null && x.TrackingNo.Contains(search)));
            }
            if (input.FieldTypeId.HasValue) query = query.Where(x => x.FieldTypeId == input.FieldTypeId.Value);
            if (input.FieldStatusId.HasValue) query = query.Where(x => x.FieldStatusId == input.FieldStatusId.Value);
            if (input.FieldLevelId.HasValue) query = query.Where(x => x.FieldLevelId == input.FieldLevelId.Value);
            if (!string.IsNullOrWhiteSpace(input.FieldStatusCode)) query = query.Where(x => x.FieldStatusCode == input.FieldStatusCode);
            if (!string.IsNullOrWhiteSpace(input.FieldLevelCode)) query = query.Where(x => x.FieldLevelCode == input.FieldLevelCode);
            if (!string.IsNullOrWhiteSpace(input.TrackingNo)) query = query.Where(x => x.TrackingNo == input.TrackingNo);
            if (input.IsStandard.HasValue) query = query.Where(x => x.IsStandard == input.IsStandard.Value);
            if (input.CreatedByUserId.HasValue) query = query.Where(x => x.CreatorUserId == input.CreatedByUserId.Value);
            if (input.CreatedFrom.HasValue) query = query.Where(x => x.CreationTime >= input.CreatedFrom.Value);
            if (input.CreatedTo.HasValue) query = query.Where(x => x.CreationTime <= input.CreatedTo.Value);
            return query;
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_FieldManager)]
        public async Task<AppFieldDto> GetAppliedField(GetAppliedFieldInput input)
        {
            if (input == null || input.FieldDefinitionKey == Guid.Empty)
                throw new UserFriendlyException("Select a valid applied field.");
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MayHaveTenant))
            {
                if (input.SycEntityObjectTypeId.HasValue && !await _objectTypes.GetAll().AnyAsync(x =>
                    x.Id == input.SycEntityObjectTypeId.Value && x.ObjectId == input.SycObjectId && !x.IsDeleted))
                    throw new UserFriendlyException("The selected object type does not belong to this object.");
                var tenantId = AbpSession.TenantId;
                if ((await GetSuppressedHostKeys(tenantId)).Contains(input.FieldDefinitionKey))
                    throw new UserFriendlyException("Field was not found.");
                var objectIds = await GetEffectiveObjectIds(input.SycObjectId);
                var rows = await _tableFields.GetAll().Include(x => x.DropdownOptions).Include(x => x.SettingValues).Where(x =>
                    x.FieldDefinitionKey == input.FieldDefinitionKey && objectIds.Contains(x.SycObjectId) &&
                    (x.TenantId == null || x.TenantId == tenantId) &&
                    (x.SycEntityObjectTypeId == null ||
                        (x.SycObjectId == input.SycObjectId && x.SycEntityObjectTypeId == input.SycEntityObjectTypeId)))
                    .AsNoTracking().ToListAsync();
                var field = SelectAppliedDefinitions(rows, tenantId, objectIds).SingleOrDefault();
                if (field == null || field.IsHidden) throw new UserFriendlyException("Field was not found.");
                return await ToDtoForResponse(field);
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_FieldManager_AddExistingField)]
        public async Task<FieldActionResultDto> AssignExistingField(AssignExistingFieldInput input)
        {
            if (input == null) throw new UserFriendlyException("Field assignment is required.");
            await ValidateFieldAssignmentTarget(input.SycObjectId, input.SycEntityObjectTypeId);

            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MayHaveTenant))
            {
                var field = await VisibleFields().Include(x => x.DropdownOptions).Include(x => x.SettingValues).FirstOrDefaultAsync(x => x.Id == input.AppFieldId &&
                    x.SycObjectId == null && !x.IsHidden && x.FieldStatusCode != "Discontinued");
                if (field == null) throw new UserFriendlyException("Field was not found.");
                var objectIds = await GetEffectiveObjectIds(input.SycObjectId);
                var exists = await _tableFields.GetAll().AnyAsync(x => x.FieldDefinitionKey == field.FieldDefinitionKey &&
                    objectIds.Contains(x.SycObjectId) &&
                    (x.SycEntityObjectTypeId == null ||
                        (x.SycObjectId == input.SycObjectId && x.SycEntityObjectTypeId == input.SycEntityObjectTypeId)) &&
                    (x.TenantId == null || x.TenantId == AbpSession.TenantId));
                if (exists) return new FieldActionResultDto { Success = true, Message = "Field is already assigned." };
                await _tableFields.InsertAsync(CreateTableSnapshot(field, AbpSession.TenantId,
                    input.SycObjectId, input.SycEntityObjectTypeId));
                return new FieldActionResultDto { Success = true, Message = "Field assigned." };
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_FieldManager_AddExistingField)]
        public async Task<PagedResultDto<AppFieldDto>> GetUnlinkedFields(GetUnlinkedFieldsInput input)
        {
            if (input == null) throw new UserFriendlyException("Select a table.");
            await ValidateFieldAssignmentTarget(input.TableId, input.SycEntityObjectTypeId);
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MayHaveTenant))
            {
                var objectIds = await GetEffectiveObjectIds(input.TableId);
                var linkedKeys = EffectiveTableAssignments(input.TableId, input.SycEntityObjectTypeId, objectIds)
                    .Select(x => x.FieldDefinitionKey);
                var query = VisibleFields().Where(x => x.SycObjectId == null && !x.IsHidden &&
                    x.FieldStatusCode != "Discontinued" && !linkedKeys.Contains(x.FieldDefinitionKey));
                if (!string.IsNullOrWhiteSpace(input.SearchText))
                {
                    var search = input.SearchText.Trim();
                    query = query.Where(x => x.FieldCode.Contains(search) || x.FieldName.Contains(search) ||
                        (x.Description != null && x.Description.Contains(search)));
                }
                var count = await query.CountAsync();
                var page = await SortFields(query.Include(x => x.DropdownOptions).Include(x => x.SettingValues), input.Sorting).Skip(input.SkipCount)
                    .Take(input.MaxResultCount).AsNoTracking().ToListAsync();
                return new PagedResultDto<AppFieldDto>(count, page.Select(ToDto).ToList());
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_FieldManager_AddExistingField)]
        [UnitOfWork(IsolationLevel.Serializable)]
        public async Task<LinkExistingFieldsResultDto> LinkExistingFields(LinkExistingFieldsInput input)
        {
            if (input?.AppFieldIds == null || input.AppFieldIds.Count == 0 ||
                input.AppFieldIds.Any(id => id <= 0))
                throw new UserFriendlyException("Select at least one valid field.");
            await ValidateFieldAssignmentTarget(input.TableId, input.SycEntityObjectTypeId);
            var ids = input.AppFieldIds.Distinct().ToList();
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MayHaveTenant))
            {
                var fields = await VisibleFields().Include(x => x.DropdownOptions).Include(x => x.SettingValues).Where(x => ids.Contains(x.Id) &&
                    x.SycObjectId == null && !x.IsHidden &&
                    x.FieldStatusCode != "Discontinued").AsNoTracking().ToListAsync();
                if (fields.Count != ids.Count)
                    throw new UserFriendlyException("One or more selected fields are unavailable.");

                var keys = fields.Select(x => x.FieldDefinitionKey).ToList();
                var objectIds = await GetEffectiveObjectIds(input.TableId);
                var linkedKeys = (await EffectiveTableAssignments(input.TableId, input.SycEntityObjectTypeId, objectIds)
                    .Where(x => keys.Contains(x.FieldDefinitionKey))
                    .Select(x => x.FieldDefinitionKey).Distinct().ToListAsync()).ToHashSet();
                var linkedCount = 0;
                foreach (var field in fields)
                {
                    if (!linkedKeys.Add(field.FieldDefinitionKey)) continue;
                    await _tableFields.InsertAsync(CreateTableSnapshot(field, AbpSession.TenantId,
                        input.TableId, input.SycEntityObjectTypeId));
                    linkedCount++;
                }
                return new LinkExistingFieldsResultDto
                {
                    LinkedCount = linkedCount,
                    AlreadyLinkedCount = ids.Count - linkedCount
                };
            }
        }

        private async Task ValidateFieldAssignmentTarget(long tableId, long? objectTypeId)
        {
            if (tableId <= 0 || !await _objects.GetAll().AnyAsync(x => x.Id == tableId &&
                !x.IsDeleted && (x.ObjectTypeCode == "DATA" || x.ObjectTypeCode == "ENTITY")))
                throw new UserFriendlyException("Select a valid data table or entity.");
            var tenantId = AbpSession.TenantId;
            if (objectTypeId.HasValue && (objectTypeId.Value <= 0 ||
                !await _objectTypes.GetAll().AnyAsync(x => x.Id == objectTypeId.Value &&
                    x.ObjectId == tableId && !x.IsDeleted &&
                    (x.TenantId == null || x.TenantId == tenantId))))
                throw new UserFriendlyException("The selected object type does not belong to this table or entity.");
        }

        private IQueryable<AppTableField> EffectiveTableAssignments(long tableId, long? objectTypeId,
            List<long> objectIds)
        {
            var tenantId = AbpSession.TenantId;
            return _tableFields.GetAll().Where(x => objectIds.Contains(x.SycObjectId) &&
                (x.TenantId == null || x.TenantId == tenantId) &&
                (x.SycEntityObjectTypeId == null ||
                    (x.SycObjectId == tableId && x.SycEntityObjectTypeId == objectTypeId)));
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_FieldManager)]
        public async Task<GetFieldForEditOutput> GetFieldForEdit(long id)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MayHaveTenant))
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
            {
                var field = await VisibleFields().Include(x => x.DropdownOptions).Include(x => x.SettingValues).FirstOrDefaultAsync(x => x.Id == id);
                if (field == null || (field.IsDeleted && !await _tableFields.GetAll().AnyAsync(x =>
                    x.FieldDefinitionKey == field.FieldDefinitionKey &&
                    (x.TenantId == null || x.TenantId == AbpSession.TenantId))))
                    throw new UserFriendlyException("Field was not found.");
                var canEdit = !field.IsDeleted && PermissionChecker.IsGranted(AppPermissions.Pages_Administration_FieldManager_Edit);
                var own = field.TenantId == AbpSession.TenantId;
                return new GetFieldForEditOutput
                {
                    Field = await ToDtoForResponse(field),
                    Permissions = new FieldEditPermissionDto
                    {
                        CanEditCoreInfo = canEdit,
                        CanEditAttributes = canEdit,
                        CanDelete = !field.IsDeleted && own && PermissionChecker.IsGranted(AppPermissions.Pages_Administration_FieldManager_Delete),
                        CanHide = !field.IsDeleted && AbpSession.TenantId.HasValue && field.TenantId == null,
                        IsTenantCustomCopyRequired = AbpSession.TenantId.HasValue && field.TenantId == null
                    }
                };
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_FieldManager)]
        public async Task<List<AppFieldHistoryDto>> GetFieldHistory(long appFieldId)
        {
            var field = (await GetFieldForEdit(appFieldId)).Field;
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MayHaveTenant))
            {
                var revisions = await _history.GetAll().Include(x => x.DropdownOptions).Include(x => x.SettingValues)
                    .Where(x => x.AppFieldId == appFieldId && x.TenantId == field.TenantId)
                    .OrderByDescending(x => x.ChangedAt)
                    .ThenByDescending(x => x.Id)
                    .AsNoTracking().ToListAsync();
                var userNames = await GetUserNames(revisions.SelectMany(x => new[] { x.CreatorUserId, x.ChangedBy }), field.TenantId);
                return revisions.Select(x =>
                {
                    var revisionField = ToDto(x);
                    revisionField.CreatorUserName = revisionField.CreatorUserId.HasValue &&
                        userNames.TryGetValue(revisionField.CreatorUserId.Value, out var creatorName)
                        ? creatorName : null;
                    return new AppFieldHistoryDto
                    {
                        Id = x.Id,
                        AppFieldId = x.AppFieldId,
                        FieldDefinitionKey = x.FieldDefinitionKey,
                        RevisionNo = x.RevisionNo,
                        ChangeType = x.ChangeType,
                        Field = revisionField,
                        ChangedAt = x.ChangedAt,
                        ChangedBy = x.ChangedBy,
                        ChangedByName = x.ChangedBy.HasValue && userNames.TryGetValue(x.ChangedBy.Value, out var changedByName)
                            ? changedByName : null,
                        RestoredFromRevisionNo = x.RestoredFromRevisionNo
                    };
                }).ToList();
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_FieldManager)]
        [UnitOfWork(IsolationLevel.Serializable)]
        public async Task<AppFieldDto> RestoreFieldRevision(RestoreFieldRevisionInput input)
        {
            if (input == null || input.AppFieldId <= 0 || input.HistoryId <= 0 ||
                string.IsNullOrWhiteSpace(input.ExpectedCurrentRevisionNo))
                throw new UserFriendlyException("Select a field revision to restore.");
            await RequirePermission(AppPermissions.Pages_Administration_FieldManager_RestoreRevision);

            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MayHaveTenant))
            {
                var field = await VisibleFields().Include(x => x.DropdownOptions).Include(x => x.SettingValues)
                    .SingleOrDefaultAsync(x => x.Id == input.AppFieldId && !x.IsDeleted && !x.IsHidden);
                if (field == null) throw new UserFriendlyException("Field was not found.");
                if (field.TenantId != AbpSession.TenantId)
                    throw new UserFriendlyException("A tenant cannot restore a host field.");
                if (field.CurrentRevisionNo != input.ExpectedCurrentRevisionNo)
                    throw new UserFriendlyException("The field changed. Refresh its history before restoring.");

                var revision = await _history.GetAll().Include(x => x.DropdownOptions).Include(x => x.SettingValues)
                    .SingleOrDefaultAsync(x => x.Id == input.HistoryId && x.AppFieldId == field.Id &&
                        x.TenantId == field.TenantId && x.FieldDefinitionKey == field.FieldDefinitionKey);
                if (revision == null) throw new UserFriendlyException("Field revision was not found.");
                if (revision.FieldCode != field.FieldCode || revision.SycObjectId != field.SycObjectId)
                    throw new UserFriendlyException("The selected revision does not match this field.");

                await ArchiveCurrentRevision(field);
                ApplyHistoryRevision(revision, field);
                field.CurrentRevisionNo = NextRevision(field.CurrentRevisionNo);
                await _fields.UpdateAsync(field);
                try
                {
                    await CurrentUnitOfWork.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    throw new UserFriendlyException("The field changed while you were restoring it. Refresh its history before saving.");
                }
                await RecordHistory(field, "Restore", revision.RevisionNo);
                return await ToDtoForResponse(field);
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_FieldManager)]
        [UnitOfWork(IsolationLevel.Serializable)]
        public async Task<AppFieldDto> CreateOrEditField(CreateOrEditFieldInput input)
        {
            if (input == null) throw new UserFriendlyException("Field data is required.");
            await ValidateFieldInput(input);
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MayHaveTenant))
            {
                if (!input.Id.HasValue)
                {
                    await RequirePermission(AppPermissions.Pages_Administration_FieldManager_Create);
                    return await CreateField(input, null);
                }

                await RequirePermission(AppPermissions.Pages_Administration_FieldManager_Edit);
                var field = await VisibleFields().Include(x => x.DropdownOptions).Include(x => x.SettingValues).FirstOrDefaultAsync(x => x.Id == input.Id.Value);
                if (field == null) throw new UserFriendlyException("Field was not found.");
                if (string.IsNullOrWhiteSpace(input.ExpectedCurrentRevisionNo))
                    throw new UserFriendlyException("The current revision is required. Refresh the field before editing.");
                if (field.CurrentRevisionNo != input.ExpectedCurrentRevisionNo)
                    throw new UserFriendlyException("The field changed. Refresh it before saving.");
                if (AbpSession.TenantId.HasValue && field.TenantId == null)
                {
                    var copy = await CreateField(input, field.Id);
                    return copy;
                }

                if (!string.IsNullOrWhiteSpace(input.FieldCode) && input.FieldCode.Trim() != field.FieldCode)
                    throw new UserFriendlyException("Field code cannot be changed after creation.");
                if (input.FieldTypeId != field.FieldTypeId && input.SettingValues == null)
                    throw new UserFriendlyException("Provide the settings for the new field type.");
                await ArchiveCurrentRevision(field);
                Apply(input, field);
                await ApplySettingValues(input, field);
                field.CurrentRevisionNo = NextRevision(field.CurrentRevisionNo);
                await _fields.UpdateAsync(field);
                try
                {
                    await CurrentUnitOfWork.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    throw new UserFriendlyException("The field changed while you were editing. Refresh it before saving.");
                }
                await RecordHistory(field, "Edit");
                return await ToDtoForResponse(field);
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_FieldManager)]
        [UnitOfWork(IsolationLevel.Serializable)]
        public async Task<FieldActionResultDto> DeleteField(EntityDto<long> input)
        {
            await RequirePermission(AppPermissions.Pages_Administration_FieldManager_Delete);
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MayHaveTenant))
            {
                var field = await VisibleFields().Include(x => x.DropdownOptions).Include(x => x.SettingValues).FirstOrDefaultAsync(x => x.Id == input.Id);
                if (field == null) throw new UserFriendlyException("Field was not found.");
                if (field.TenantId != AbpSession.TenantId)
                    throw new UserFriendlyException("A tenant cannot delete a host field.");
                await ArchiveCurrentRevision(field);
                field.CurrentRevisionNo = NextRevision(field.CurrentRevisionNo);
                await RecordHistory(field, "Delete");
                await _fields.DeleteAsync(field);
                try
                {
                    await CurrentUnitOfWork.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    throw new UserFriendlyException("The field changed while you were deleting it. Refresh it before saving.");
                }
                return new FieldActionResultDto { Success = true, Message = "Field deleted." };
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_FieldManager)]
        [UnitOfWork(IsolationLevel.Serializable)]
        public async Task<AppFieldDto> DuplicateField(EntityDto<long> input)
        {
            await RequirePermission(AppPermissions.Pages_Administration_FieldManager_Duplicate);
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MayHaveTenant))
            {
                var source = await VisibleFields().Include(x => x.DropdownOptions).Include(x => x.SettingValues).FirstOrDefaultAsync(x => x.Id == input.Id);
                if (source == null) throw new UserFriendlyException("Field was not found.");
                if (source.SycObjectId.HasValue)
                    throw new UserFriendlyException("Field type settings cannot be duplicated as ordinary fields.");
                var copyInput = ToInput(source);
                copyInput.Id = null;
                copyInput.FieldStatusCode = "Proposed";
                copyInput.FieldStatusId = null;
                copyInput.FieldCode = null;
                return await CreateField(copyInput, null, assignmentSourceFieldId: source.Id);
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_FieldManager)]
        [UnitOfWork(IsolationLevel.Serializable)]
        public async Task HideField(EntityDto<long> input)
        {
            await RequirePermission(AppPermissions.Pages_Administration_FieldManager_Edit);
            if (!AbpSession.TenantId.HasValue) throw new UserFriendlyException("Only a tenant can hide a host field.");
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MayHaveTenant))
            {
                var field = await VisibleFields().Include(x => x.DropdownOptions).Include(x => x.SettingValues)
                    .FirstOrDefaultAsync(x => x.Id == input.Id && x.TenantId == null);
                if (field == null) throw new UserFriendlyException("Host field was not found.");
                await CreateField(ToInput(field), field.Id, isHidden: true);
            }
        }

        private IQueryable<AppField> VisibleFields()
        {
            var tenantId = AbpSession.TenantId;
            var query = _fields.GetAll();
            if (!tenantId.HasValue) return query.Where(x => x.TenantId == null);
            return query.Where(x => x.TenantId == tenantId ||
                (x.TenantId == null && !_fields.GetAll().Any(copy =>
                    copy.TenantId == tenantId && copy.SourceFieldId == x.Id)));
        }

        private async Task<AppFieldDto> CreateField(CreateOrEditFieldInput input, long? sourceFieldId,
            bool isHidden = false, long? assignmentSourceFieldId = null)
        {
            var field = new AppField
            {
                TenantId = AbpSession.TenantId,
                SourceFieldId = sourceFieldId,
                CurrentRevisionNo = "00",
                IsStandard = !AbpSession.TenantId.HasValue,
                IsHidden = isHidden
            };
            Apply(input, field);
            await ApplySettingValues(input, field, sourceFieldId);
            if (sourceFieldId.HasValue)
            {
                var source = await _fields.GetAll().Where(x => x.Id == sourceFieldId.Value)
                    .Select(x => new { x.SycObjectId, x.EntitySycObjectId }).SingleAsync();
                field.SycObjectId = source.SycObjectId;
                field.EntitySycObjectId = source.EntitySycObjectId;
            }
            field.FieldCode = await NextFieldCode(field);
            if (!sourceFieldId.HasValue && !string.IsNullOrWhiteSpace(input.FieldCode) &&
                !string.Equals(input.FieldCode.Trim(), field.FieldCode, StringComparison.Ordinal))
                throw new UserFriendlyException("Field code has changed. Refresh the preview and try again.");
            await _fields.InsertAndGetIdAsync(field);
            await CurrentUnitOfWork.SaveChangesAsync();
            if (sourceFieldId.HasValue || assignmentSourceFieldId.HasValue)
            {
                var sourceAssignmentId = assignmentSourceFieldId ?? sourceFieldId.Value;
                var sourceKey = await _fields.GetAll().Where(x => x.Id == sourceAssignmentId)
                    .Select(x => x.FieldDefinitionKey).SingleAsync();
                var sourceAssignments = await _tableFields.GetAll().Where(x => x.FieldDefinitionKey == sourceKey &&
                    (x.TenantId == null || x.TenantId == AbpSession.TenantId))
                    .AsNoTracking().ToListAsync();
                foreach (var assignment in sourceAssignments
                    .OrderByDescending(x => x.TenantId == AbpSession.TenantId)
                    .GroupBy(x => new { x.SycObjectId, x.SycEntityObjectTypeId })
                    .Select(group => group.First()))
                    await _tableFields.InsertAsync(CreateTableSnapshot(field, AbpSession.TenantId,
                        assignment.SycObjectId, assignment.SycEntityObjectTypeId));
            }
            else if (input.SycObjectId.HasValue)
                await _tableFields.InsertAsync(CreateTableSnapshot(field, AbpSession.TenantId,
                    input.SycObjectId.Value, input.SelectedObjectTypeId));
            await RecordHistory(field, "Create");
            return await ToDtoForResponse(field);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_FieldManager_Edit)]
        public async Task<FieldActionResultDto> SyncFieldSnapshots(SyncFieldSnapshotsInput input)
        {
            if (input == null) throw new UserFriendlyException("Field data is required.");
            if (input.SycEntityObjectTypeId.HasValue && !input.SycObjectId.HasValue)
                throw new UserFriendlyException("Select the table for this object type.");
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MayHaveTenant))
            {
                var field = await VisibleFields().Include(x => x.DropdownOptions).Include(x => x.SettingValues)
                    .SingleOrDefaultAsync(x => x.Id == input.AppFieldId && !x.IsHidden);
                if (field == null) throw new UserFriendlyException("Field was not found.");
                if (field.TenantId != AbpSession.TenantId)
                    throw new UserFriendlyException("A tenant cannot sync a host field.");

                var query = _tableFields.GetAll().Where(x => x.FieldDefinitionKey == field.FieldDefinitionKey &&
                    x.TenantId == AbpSession.TenantId);
                if (input.SycObjectId.HasValue)
                    query = query.Where(x => x.SycObjectId == input.SycObjectId.Value &&
                        x.SycEntityObjectTypeId == input.SycEntityObjectTypeId);
                var snapshots = await query.Include(x => x.DropdownOptions).Include(x => x.SettingValues).ToListAsync();
                if (snapshots.Count == 0) throw new UserFriendlyException("No table snapshot was found.");
                foreach (var snapshot in snapshots)
                {
                    snapshot.CopyDefinitionFrom(field);
                    await _tableFields.UpdateAsync(snapshot);
                }
                return new FieldActionResultDto { Success = true,
                    Message = snapshots.Count + " table snapshot(s) synced." };
            }
        }

        private static AppTableField CreateTableSnapshot(AppField field, int? tenantId,
            long sycObjectId, long? sycEntityObjectTypeId)
        {
            var snapshot = new AppTableField
            {
                TenantId = tenantId,
                SycObjectId = sycObjectId,
                SycEntityObjectTypeId = sycEntityObjectTypeId
            };
            snapshot.CopyDefinitionFrom(field);
            return snapshot;
        }

        private async Task ArchiveCurrentRevision(AppField field)
        {
            // Older releases recorded every new revision immediately. Keep those rows immutable.
            if (!await _history.GetAll().AnyAsync(x => x.AppFieldId == field.Id &&
                x.RevisionNo == field.CurrentRevisionNo))
                await RecordHistory(field, "Edit");
        }

        private async Task ValidateFieldInput(CreateOrEditFieldInput input)
        {
            if (input.SycObjectId.HasValue && (input.SycObjectId.Value <= 0 ||
                !await _objects.GetAll().AnyAsync(x => x.Id == input.SycObjectId.Value && !x.IsDeleted &&
                    (input.Id.HasValue || x.ObjectTypeCode == "DATA"))))
                throw new UserFriendlyException("Select a valid data object.");
            if (input.EntitySycObjectId.HasValue && !await _objectTypes.GetAll().AnyAsync(x => x.Id == input.EntitySycObjectId.Value && !x.IsDeleted))
                throw new UserFriendlyException("Select a valid entity object type.");
            if (input.SelectedObjectTypeId.HasValue && (!input.SycObjectId.HasValue ||
                !await _objectTypes.GetAll().AnyAsync(x =>
                    x.Id == input.SelectedObjectTypeId.Value && x.ObjectId == input.SycObjectId.Value && !x.IsDeleted)))
                throw new UserFriendlyException("The selected object type does not belong to this data object.");
            await ValidateFieldType(input.FieldTypeId);
            var fieldObjectId = await _objects.GetAll().Where(x => x.Code == "FIELD" && !x.IsDeleted)
                .Select(x => x.Id).SingleAsync();
            if (input.WidgetTypeId.HasValue && !await _objectTypes.GetAll().AnyAsync(x => x.Id == input.WidgetTypeId.Value && x.ObjectId == fieldObjectId))
                throw new UserFriendlyException("Select a valid widget type.");
            if (input.Length.HasValue && input.Length.Value <= 0) throw new UserFriendlyException("Length must be positive.");
            if (input.Decimals.HasValue && input.Decimals.Value < 0) throw new UserFriendlyException("Decimals cannot be negative.");
            FieldExtraAttributesCodec.Parse(input.ExtraAttributes);
            ResolveFieldLevelCode(input.FieldLevelCode);
            if (!new[] { "Proposed", "Active", "Discontinued" }.Contains(input.FieldStatusCode ?? "Proposed"))
                throw new UserFriendlyException("Select a valid field status.");
        }

        private void Apply(CreateOrEditFieldInput input, AppField field)
        {
            field.FieldTypeId = input.FieldTypeId;
            field.WidgetTypeId = input.WidgetTypeId;
            field.FieldLevelId = input.FieldLevelId;
            field.FieldStatusId = input.FieldStatusId;
            field.FieldName = input.FieldName?.Trim();
            field.Description = input.Description?.Trim();
            field.FieldLevelCode = ResolveFieldLevelCode(input.FieldLevelCode);
            field.FieldStatusCode = input.FieldStatusCode ?? "Proposed";
            field.TrackingNo = input.TrackingNo?.Trim();
            field.IsExtraField = input.IsExtraField;
            if (field.Id == 0 || input.SettingValues != null)
            {
                field.AllowNull = input.AllowNull;
                field.Length = input.Length;
                field.Decimals = input.Decimals;
                field.DefaultValue = input.DefaultValue;
                field.DateFormat = input.DateFormat;
                field.TimeFormat = input.TimeFormat;
                field.AllowMultiSelect = input.AllowMultiSelect;
                field.Required = input.Required;
                field.Visible = input.Visible;
                field.Editable = input.Editable;
            }
            FieldExtraAttributesCodec.Apply(FieldExtraAttributesCodec.Parse(input.ExtraAttributes), field);
        }

        private static void ApplyHistoryRevision(AppFieldHistory revision, AppField field)
        {
            field.SycObjectId = revision.SycObjectId;
            field.EntitySycObjectId = revision.EntitySycObjectId;
            field.FieldName = revision.FieldName;
            field.Description = revision.Description;
            field.FieldTypeId = revision.FieldTypeId;
            field.WidgetTypeId = revision.WidgetTypeId;
            field.FieldLevelId = revision.FieldLevelId;
            field.FieldStatusId = revision.FieldStatusId;
            field.FieldLevelCode = revision.FieldLevelCode;
            field.FieldStatusCode = revision.FieldStatusCode;
            field.TrackingNo = revision.TrackingNo;
            field.IsExtraField = revision.IsExtraField;
            field.AllowNull = revision.AllowNull;
            field.Length = revision.Length;
            field.Decimals = revision.Decimals;
            field.DefaultValue = revision.DefaultValue;
            field.DateFormat = revision.DateFormat;
            field.TimeFormat = revision.TimeFormat;
            field.AllowMultiSelect = revision.AllowMultiSelect;
            field.Required = revision.Required;
            field.Visible = revision.Visible;
            field.Editable = revision.Editable;
            field.SourceAttributeId = revision.SourceAttributeId;
            field.SourceDataType = revision.SourceDataType;
            field.SourceEntityObjectTypeId = revision.SourceEntityObjectTypeId;
            field.EntityObjectTypeCode = revision.EntityObjectTypeCode;
            field.Usage = revision.Usage;
            field.IsLookup = revision.IsLookup;
            field.IsVariation = revision.IsVariation;
            field.IsAdvancedSearch = revision.IsAdvancedSearch;
            field.AcceptMultipleValues = revision.AcceptMultipleValues;
            field.AllowAddNew = revision.AllowAddNew;
            field.SettingValues.Clear();
            foreach (var value in revision.SettingValues)
                field.SettingValues.Add(CopyCurrentSettingValue(value, field.TenantId));
            field.DropdownOptions.Clear();
            foreach (var option in revision.DropdownOptions.OrderBy(x => x.SortOrder))
                field.DropdownOptions.Add(new AppFieldDropdownOption
                {
                    SortOrder = option.SortOrder, Option = option.Option, Value = option.Value
                });
        }

        private async Task RecordHistory(AppField field, string changeType, string restoredFromRevisionNo = null)
        {
            await _history.InsertAsync(new AppFieldHistory
            {
                TenantId = field.TenantId,
                AppFieldId = field.Id,
                RevisionNo = field.CurrentRevisionNo,
                ChangeType = changeType,
                RestoredFromRevisionNo = restoredFromRevisionNo,
                FieldDefinitionKey = field.FieldDefinitionKey,
                SourceFieldId = field.SourceFieldId,
                SycObjectId = field.SycObjectId,
                EntitySycObjectId = field.EntitySycObjectId,
                FieldCode = field.FieldCode,
                FieldName = field.FieldName,
                Description = field.Description,
                FieldTypeId = field.FieldTypeId,
                WidgetTypeId = field.WidgetTypeId,
                FieldLevelId = field.FieldLevelId,
                FieldStatusId = field.FieldStatusId,
                FieldLevelCode = field.FieldLevelCode,
                FieldStatusCode = field.FieldStatusCode,
                TrackingNo = field.TrackingNo,
                CurrentRevisionNo = field.CurrentRevisionNo,
                IsStandard = field.IsStandard,
                IsExtraField = field.IsExtraField,
                IsHidden = field.IsHidden,
                AllowNull = field.AllowNull,
                Length = field.Length,
                Decimals = field.Decimals,
                DefaultValue = field.DefaultValue,
                DateFormat = field.DateFormat,
                TimeFormat = field.TimeFormat,
                AllowMultiSelect = field.AllowMultiSelect,
                Required = field.Required,
                Visible = field.Visible,
                Editable = field.Editable,
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
                DropdownOptions = field.DropdownOptions.OrderBy(x => x.SortOrder).Select(x =>
                    new AppFieldHistoryDropdownOption
                    {
                        SortOrder = x.SortOrder, Option = x.Option, Value = x.Value
                    }).ToList(),
                SettingValues = field.SettingValues.Select(x => CopyHistorySettingValue(x)).ToList(),
                CreationTime = field.CreationTime,
                CreatorUserId = field.CreatorUserId,
                LastModificationTime = field.LastModificationTime,
                LastModifierUserId = field.LastModifierUserId,
                IsDeleted = field.IsDeleted,
                DeleterUserId = field.DeleterUserId,
                DeletionTime = field.DeletionTime,
                ChangedAt = DateTime.UtcNow,
                ChangedBy = AbpSession.UserId
            });
        }

        private async Task ValidateFieldType(long fieldTypeId)
        {
            var fieldObjectId = await _objects.GetAll().Where(x => x.Code == "FIELD" && !x.IsDeleted)
                .Select(x => x.Id).SingleAsync();
            var fieldRootId = await _objectTypes.GetAll()
                .Where(x => x.ObjectId == fieldObjectId && x.Code == "FIELD" && x.ParentId == null)
                .Select(x => x.Id).SingleAsync();
            if (!await _objectTypes.GetAll().AnyAsync(x => x.Id == fieldTypeId &&
                x.ObjectId == fieldObjectId && x.ParentId == fieldRootId))
                throw new UserFriendlyException("Select a valid field type.");
        }

        private string ResolveFieldLevelCode(string requestedLevel)
        {
            var level = AbpSession.TenantId.HasValue ? "Tenant" : requestedLevel ?? "Application";
            if (!new[] { "System", "Application", "Tenant" }.Contains(level) ||
                (!AbpSession.TenantId.HasValue && level == "Tenant"))
                throw new UserFriendlyException("Select a valid field level.");
            return level;
        }

        private async Task<string> NextFieldCode(AppField field, bool acquireLock = true)
        {
            var fieldType = await _objectTypes.GetAsync(field.FieldTypeId);
            var typeCode = fieldType.Code?.Trim().ToUpperInvariant();
            if (string.IsNullOrEmpty(typeCode) || typeCode.Length < 2)
                throw new UserFriendlyException("Field type code must contain at least two characters.");
            typeCode = typeCode.Substring(0, 2);
            if (!typeCode.All(char.IsLetterOrDigit))
                throw new UserFriendlyException("Field type code must start with two letters or digits.");

            char levelCode;
            switch (field.FieldLevelCode)
            {
                case "System": levelCode = 'S'; break;
                case "Application": levelCode = 'A'; break;
                case "Tenant": levelCode = 'T'; break;
                default: throw new UserFriendlyException("Invalid field level.");
            }

            var name = new string((field.FieldName ?? string.Empty).Trim()
                .Where(char.IsLetterOrDigit).Take(4).ToArray())
                .ToUpperInvariant().PadRight(4, '_');
            if (name == "____") throw new UserFriendlyException("Field name needs letters or digits.");

            var sequence = await NextFieldSequence(field.FieldTypeId, acquireLock);
            return typeCode + levelCode + name + sequence;
        }

        private async Task<string> NextFieldSequence(long fieldTypeId, bool acquireLock)
        {
            if (acquireLock)
            {
                var context = CurrentUnitOfWork.GetDbContext<onetouchDbContext>();
                // Keep the lock resource stable while old and new app versions may run together.
                var lockName = "APPFields:FieldType:" + fieldTypeId.ToString(CultureInfo.InvariantCulture);
                await context.Database.ExecuteSqlInterpolatedAsync(
                    $"DECLARE @result int; EXEC @result = sp_getapplock @Resource = {lockName}, @LockMode = 'Exclusive', @LockOwner = 'Transaction'; IF @result < 0 THROW 51000, 'Unable to allocate a field code.', 1;");
            }

            var lastSequence = 0;
            using (CurrentUnitOfWork.DisableFilter(AbpDataFilters.MayHaveTenant, AbpDataFilters.SoftDelete))
            {
                var existingCodes = await _fields.GetAll().Where(x => x.FieldTypeId == fieldTypeId)
                    .Select(x => x.FieldCode).ToListAsync();
                foreach (var code in existingCodes)
                {
                    if (code == null || code.Length != 11 ||
                        (code[2] != 'S' && code[2] != 'A' && code[2] != 'T')) continue;
                    if (int.TryParse(code.Substring(7, 4), NumberStyles.None,
                        CultureInfo.InvariantCulture, out var sequence))
                        lastSequence = Math.Max(lastSequence, sequence);
                }
            }
            if (lastSequence >= 9999)
                throw new UserFriendlyException("The field type has used all four-digit code sequences.");

            return (lastSequence + 1).ToString("D4", CultureInfo.InvariantCulture);
        }

        private static string NextRevision(string current)
        {
            if (!int.TryParse(current, out var number)) throw new UserFriendlyException("Invalid field revision.");
            return (number + 1).ToString("D2");
        }

        private async Task RequirePermission(string permission)
        {
            if (!await PermissionChecker.IsGrantedAsync(permission))
                throw new AbpAuthorizationException("You do not have permission for this field action.");
        }

        private static IQueryable<AppField> SortFields(IQueryable<AppField> query, string sorting)
        {
            switch (sorting?.Trim().ToLowerInvariant())
            {
                case "fieldcode asc": return query.OrderBy(x => x.FieldCode);
                case "fieldcode desc": return query.OrderByDescending(x => x.FieldCode);
                case "fieldname asc": return query.OrderBy(x => x.FieldName);
                case "fieldname desc": return query.OrderByDescending(x => x.FieldName);
                case "fieldtypeid asc": return query.OrderBy(x => x.FieldTypeId);
                case "fieldtypeid desc": return query.OrderByDescending(x => x.FieldTypeId);
                case "fieldlevelcode asc": return query.OrderBy(x => x.FieldLevelCode);
                case "fieldlevelcode desc": return query.OrderByDescending(x => x.FieldLevelCode);
                case "fieldstatuscode asc": return query.OrderBy(x => x.FieldStatusCode);
                case "fieldstatuscode desc": return query.OrderByDescending(x => x.FieldStatusCode);
                case "trackingno asc": return query.OrderBy(x => x.TrackingNo);
                case "trackingno desc": return query.OrderByDescending(x => x.TrackingNo);
                case "creationtime asc": return query.OrderBy(x => x.CreationTime);
                default: return query.OrderByDescending(x => x.CreationTime).ThenByDescending(x => x.Id);
            }
        }

        private async Task<AppFieldDto> ToDtoForResponse(AppField field)
        {
            var dto = ToDto(field);
            dto.NextRevisionNo = AbpSession.TenantId.HasValue && !field.TenantId.HasValue
                ? "00" : NextRevision(field.CurrentRevisionNo);
            if (dto.CreatorUserId.HasValue)
            {
                var names = await GetUserNames(new[] { dto.CreatorUserId }, dto.TenantId);
                dto.CreatorUserName = names.TryGetValue(dto.CreatorUserId.Value, out var name) ? name : null;
            }
            return dto;
        }

        private async Task<Dictionary<long, string>> GetUserNames(IEnumerable<long?> userIds, int? tenantId)
        {
            var ids = userIds.Where(id => id.HasValue).Select(id => id.Value).Distinct().ToList();
            if (ids.Count == 0)
                return new Dictionary<long, string>();

            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
            {
                var users = await _users.GetAll()
                    .Where(x => ids.Contains(x.Id) && (x.TenantId == null || x.TenantId == tenantId))
                    .Select(x => new { x.Id, x.Name, x.Surname })
                    .AsNoTracking().ToListAsync();
                return users.ToDictionary(x => x.Id, x =>
                    string.Join(" ", new[] { x.Name, x.Surname }.Where(name => !string.IsNullOrWhiteSpace(name))));
            }
        }

        private static CreateOrEditFieldInput ToInput(AppField x) => new CreateOrEditFieldInput
        {
            Id = x.Id, SycObjectId = x.SycObjectId, EntitySycObjectId = x.EntitySycObjectId,
            FieldTypeId = x.FieldTypeId, WidgetTypeId = x.WidgetTypeId, FieldLevelId = x.FieldLevelId,
            FieldStatusId = x.FieldStatusId, FieldCode = x.FieldCode, FieldName = x.FieldName,
            Description = x.Description, FieldLevelCode = x.FieldLevelCode, FieldStatusCode = x.FieldStatusCode,
            TrackingNo = x.TrackingNo, IsExtraField = x.IsExtraField, AllowNull = x.AllowNull,
            Length = x.Length, Decimals = x.Decimals, DefaultValue = x.DefaultValue,
            DateFormat = x.DateFormat, TimeFormat = x.TimeFormat, AllowMultiSelect = x.AllowMultiSelect,
            Required = x.Required, Visible = x.Visible, Editable = x.Editable,
            ExtraAttributes = FieldExtraAttributesCodec.Serialize(x),
            SettingValues = x.SettingValues.Select(ToSettingDto).ToList()
        };

        private static AppFieldDto ToDto(AppField x) => OverlayLegacySettings(new AppFieldDto
        {
            Id = x.Id, FieldDefinitionKey = x.FieldDefinitionKey, TenantId = x.TenantId, SourceFieldId = x.SourceFieldId,
            ExpectedCurrentRevisionNo = x.CurrentRevisionNo,
            SycObjectId = x.SycObjectId, EntitySycObjectId = x.EntitySycObjectId,
            FieldTypeId = x.FieldTypeId, WidgetTypeId = x.WidgetTypeId, FieldLevelId = x.FieldLevelId,
            FieldStatusId = x.FieldStatusId, FieldCode = x.FieldCode, FieldName = x.FieldName,
            Description = x.Description, FieldLevelCode = x.FieldLevelCode, FieldStatusCode = x.FieldStatusCode,
            TrackingNo = x.TrackingNo, CurrentRevisionNo = x.CurrentRevisionNo,
            IsStandard = x.IsStandard, IsCustom = !x.IsStandard, IsExtraField = x.IsExtraField, IsHidden = x.IsHidden,
            AllowNull = x.AllowNull, Length = x.Length, Decimals = x.Decimals, DefaultValue = x.DefaultValue,
            DateFormat = x.DateFormat, TimeFormat = x.TimeFormat, AllowMultiSelect = x.AllowMultiSelect,
            Required = x.Required, Visible = x.Visible, Editable = x.Editable,
            ExtraAttributes = FieldExtraAttributesCodec.Serialize(x),
            SettingValues = x.SettingValues.Select(ToSettingDto).ToList(),
            CreationTime = x.CreationTime, CreatorUserId = x.CreatorUserId,
            LastModificationTime = x.LastModificationTime, LastModifierUserId = x.LastModifierUserId,
            IsDeleted = x.IsDeleted, DeleterUserId = x.DeleterUserId, DeletionTime = x.DeletionTime
        });

        private static AppFieldDto ToDto(AppFieldHistory x) => OverlayLegacySettings(new AppFieldDto
        {
            Id = x.AppFieldId, FieldDefinitionKey = x.FieldDefinitionKey, TenantId = x.TenantId,
            ExpectedCurrentRevisionNo = x.CurrentRevisionNo,
            SourceFieldId = x.SourceFieldId, SycObjectId = x.SycObjectId,
            EntitySycObjectId = x.EntitySycObjectId, FieldCode = x.FieldCode,
            FieldName = x.FieldName, Description = x.Description, FieldTypeId = x.FieldTypeId,
            WidgetTypeId = x.WidgetTypeId, FieldLevelId = x.FieldLevelId,
            FieldStatusId = x.FieldStatusId, FieldLevelCode = x.FieldLevelCode,
            FieldStatusCode = x.FieldStatusCode, TrackingNo = x.TrackingNo,
            CurrentRevisionNo = x.CurrentRevisionNo, IsStandard = x.IsStandard,
            IsCustom = !x.IsStandard, IsExtraField = x.IsExtraField, IsHidden = x.IsHidden,
            AllowNull = x.AllowNull, Length = x.Length, Decimals = x.Decimals,
            DefaultValue = x.DefaultValue, DateFormat = x.DateFormat, TimeFormat = x.TimeFormat,
            AllowMultiSelect = x.AllowMultiSelect, Required = x.Required,
            Visible = x.Visible, Editable = x.Editable,
            ExtraAttributes = FieldExtraAttributesCodec.Serialize(x),
            SettingValues = x.SettingValues.Select(ToSettingDto).ToList(),
            CreationTime = x.CreationTime, CreatorUserId = x.CreatorUserId,
            LastModificationTime = x.LastModificationTime, LastModifierUserId = x.LastModifierUserId,
            IsDeleted = x.IsDeleted, DeleterUserId = x.DeleterUserId,
            DeletionTime = x.DeletionTime
        });
    }
}
