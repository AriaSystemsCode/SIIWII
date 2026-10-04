using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.Json;
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
using onetouch.EntityFrameworkCore;
using onetouch.SystemObjects;

namespace onetouch.AppFields
{
    public class AppFieldManagerAppService : onetouchAppServiceBase, IAppFieldManagerAppService
    {
        private readonly IRepository<AppField, long> _fields;
        private readonly IRepository<AppFieldHistory, long> _history;
        private readonly IRepository<AppTableField, long> _tableFields;
        private readonly IRepository<SydObject, long> _objects;
        private readonly IRepository<SycEntityObjectType, long> _objectTypes;

        public AppFieldManagerAppService(
            IRepository<AppField, long> fields,
            IRepository<AppFieldHistory, long> history,
            IRepository<AppTableField, long> tableFields,
            IRepository<SydObject, long> objects,
            IRepository<SycEntityObjectType, long> objectTypes)
        {
            _fields = fields;
            _history = history;
            _tableFields = tableFields;
            _objects = objects;
            _objectTypes = objectTypes;
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
            var field = new AppField
            {
                FieldTypeId = input.FieldTypeId,
                FieldName = input.FieldName?.Trim(),
                FieldLevelCode = ResolveFieldLevelCode(input.FieldLevelCode)
            };
            return new FieldCodePreviewDto { FieldCode = await NextFieldCode(field, acquireLock: false) };
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_FieldManager)]
        public async Task<PagedResultDto<AppFieldListDto>> GetFields(GetFieldsInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MayHaveTenant))
            {
                var query = VisibleFields();
                if (!input.AllFields) query = query.Where(x => x.IsExtraField);
                var tenantId = AbpSession.TenantId;
                var assignments = _tableFields.GetAll().Where(x => x.TenantId == null || x.TenantId == tenantId);
                if (input.SelectedObjectTypeId.HasValue)
                {
                    var selectedType = await _objectTypes.GetAll().Where(x => x.Id == input.SelectedObjectTypeId.Value && !x.IsDeleted)
                        .Select(x => new { x.Id, x.ObjectId }).SingleOrDefaultAsync();
                    if (selectedType == null) throw new UserFriendlyException("Select a valid object type.");
                    var assignedIds = assignments.Where(x => x.SycObjectId == selectedType.ObjectId &&
                        (x.SycEntityObjectTypeId == null || x.SycEntityObjectTypeId == selectedType.Id))
                        .Select(x => x.AppFieldId);
                    query = query.Where(x => assignedIds.Contains(x.Id));
                }
                else if (input.SelectedObjectId.HasValue)
                {
                    var assignedIds = assignments.Where(x => x.SycObjectId == input.SelectedObjectId.Value &&
                        x.SycEntityObjectTypeId == null).Select(x => x.AppFieldId);
                    query = query.Where(x => assignedIds.Contains(x.Id));
                }
                if (!string.IsNullOrWhiteSpace(input.SearchText))
                {
                    var search = input.SearchText.Trim();
                    query = query.Where(x => x.FieldCode.Contains(search) || x.FieldName.Contains(search) ||
                                             x.Description.Contains(search) || x.TrackingNo.Contains(search));
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

                var count = await query.CountAsync();
                var page = await SortFields(query, input.Sorting).Skip(input.SkipCount)
                    .Take(input.MaxResultCount).AsNoTracking().ToListAsync();
                var typeIds = page.SelectMany(x => new long?[] { x.FieldTypeId, x.WidgetTypeId })
                    .Where(x => x.HasValue).Select(x => x.Value).Distinct().ToList();
                var typeNames = await _objectTypes.GetAll().Where(x => typeIds.Contains(x.Id))
                    .ToDictionaryAsync(x => x.Id, x => x.Name);
                var pageIds = page.Select(x => x.Id).ToList();
                var pageAssignments = await assignments.Where(x => pageIds.Contains(x.AppFieldId))
                    .Select(x => new { x.AppFieldId, x.SycObjectId, x.SycEntityObjectTypeId })
                    .AsNoTracking().ToListAsync();
                var objectIds = pageAssignments.Select(x => x.SycObjectId).Distinct().ToList();
                var objectNames = await _objects.GetAll().Where(x => objectIds.Contains(x.Id))
                    .ToDictionaryAsync(x => x.Id, x => x.Name);
                var assignmentTypeIds = pageAssignments.Where(x => x.SycEntityObjectTypeId.HasValue)
                    .Select(x => x.SycEntityObjectTypeId.Value).Distinct().ToList();
                var assignmentTypeNames = await _objectTypes.GetAll().Where(x => assignmentTypeIds.Contains(x.Id))
                    .ToDictionaryAsync(x => x.Id, x => x.Name);
                var canEdit = PermissionChecker.IsGranted(AppPermissions.Pages_Administration_FieldManager_Edit);
                var canDelete = PermissionChecker.IsGranted(AppPermissions.Pages_Administration_FieldManager_Delete);
                var result = page.Select(x => new AppFieldListDto
                {
                    Id = x.Id,
                    FieldCode = x.FieldCode,
                    FieldName = x.FieldName,
                    Description = x.Description,
                    FieldTypeName = typeNames.TryGetValue(x.FieldTypeId, out var typeName) ? typeName : null,
                    WidgetTypeName = x.WidgetTypeId.HasValue && typeNames.TryGetValue(x.WidgetTypeId.Value, out var widgetName) ? widgetName : null,
                    FieldLevelName = x.FieldLevelCode,
                    StatusName = x.FieldStatusCode,
                    RevisionNo = x.CurrentRevisionNo,
                    TrackingNo = x.TrackingNo,
                    StandardOrCustom = x.IsStandard ? "Standard" : "Custom",
                    IsStandard = x.IsStandard,
                    IsCustom = x.IsCustom,
                    IsExtraField = x.IsExtraField,
                    IsHidden = x.IsHidden,
                    CanEdit = canEdit,
                    CanDelete = canDelete && (!AbpSession.TenantId.HasValue || x.TenantId == AbpSession.TenantId),
                    CanHide = AbpSession.TenantId.HasValue && x.TenantId == null,
                    SycObjectId = x.SycObjectId,
                    EntitySycObjectId = x.EntitySycObjectId,
                    CreatorUserId = x.CreatorUserId,
                    CreationTime = x.CreationTime,
                    Tables = pageAssignments.Where(a => a.AppFieldId == x.Id)
                        .Select(a => a.SycEntityObjectTypeId.HasValue && assignmentTypeNames.TryGetValue(a.SycEntityObjectTypeId.Value, out var assignedTypeName)
                            ? assignedTypeName
                            : objectNames.TryGetValue(a.SycObjectId, out var tableName) ? tableName : null)
                        .Where(name => name != null).Distinct().ToList()
                }).ToList();
                return new PagedResultDto<AppFieldListDto>(count, result);
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_FieldManager_AddExistingField)]
        public async Task<FieldActionResultDto> AssignExistingField(AssignExistingFieldInput input)
        {
            if (input == null) throw new UserFriendlyException("Field assignment is required.");
            if (!await _objects.GetAll().AnyAsync(x => x.Id == input.SycObjectId && !x.IsDeleted))
                throw new UserFriendlyException("Select a valid object.");
            if (input.SycEntityObjectTypeId.HasValue && !await _objectTypes.GetAll().AnyAsync(x =>
                    x.Id == input.SycEntityObjectTypeId.Value && x.ObjectId == input.SycObjectId && !x.IsDeleted))
                throw new UserFriendlyException("The selected object type does not belong to this object.");

            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MayHaveTenant))
            {
                var field = await VisibleFields().FirstOrDefaultAsync(x => x.Id == input.AppFieldId && !x.IsHidden);
                if (field == null) throw new UserFriendlyException("Field was not found.");
                var exists = await _tableFields.GetAll().AnyAsync(x => x.AppFieldId == field.Id &&
                    x.SycObjectId == input.SycObjectId &&
                    x.SycEntityObjectTypeId == input.SycEntityObjectTypeId &&
                    (x.TenantId == null || x.TenantId == AbpSession.TenantId));
                if (exists) return new FieldActionResultDto { Success = true, Message = "Field is already assigned." };
                await _tableFields.InsertAsync(new AppTableField
                {
                    TenantId = AbpSession.TenantId,
                    AppFieldId = field.Id,
                    SycObjectId = input.SycObjectId,
                    SycEntityObjectTypeId = input.SycEntityObjectTypeId
                });
                return new FieldActionResultDto { Success = true, Message = "Field assigned." };
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_FieldManager)]
        public async Task<GetFieldForEditOutput> GetFieldForEdit(long id)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MayHaveTenant))
            {
                var field = await VisibleFields().FirstOrDefaultAsync(x => x.Id == id);
                if (field == null) throw new UserFriendlyException("Field was not found.");
                var canEdit = PermissionChecker.IsGranted(AppPermissions.Pages_Administration_FieldManager_Edit);
                var own = field.TenantId == AbpSession.TenantId;
                return new GetFieldForEditOutput
                {
                    Field = ToDto(field),
                    Permissions = new FieldEditPermissionDto
                    {
                        CanEditCoreInfo = canEdit,
                        CanEditAttributes = canEdit,
                        CanDelete = own && PermissionChecker.IsGranted(AppPermissions.Pages_Administration_FieldManager_Delete),
                        CanHide = AbpSession.TenantId.HasValue && field.TenantId == null,
                        IsTenantCustomCopyRequired = AbpSession.TenantId.HasValue && field.TenantId == null
                    }
                };
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
                var field = await VisibleFields().FirstOrDefaultAsync(x => x.Id == input.Id.Value);
                if (field == null) throw new UserFriendlyException("Field was not found.");
                if (input.SycObjectId != field.SycObjectId)
                    throw new UserFriendlyException("The field's source object cannot be changed. Assign it to another table instead.");
                if (AbpSession.TenantId.HasValue && field.TenantId == null)
                {
                    var copy = await CreateField(input, field.Id);
                    return copy;
                }

                if (!string.IsNullOrWhiteSpace(input.FieldCode) && input.FieldCode.Trim() != field.FieldCode)
                    throw new UserFriendlyException("Field code cannot be changed after creation.");
                Apply(input, field);
                field.CurrentRevisionNo = NextRevision(field.CurrentRevisionNo);
                await _fields.UpdateAsync(field);
                await CurrentUnitOfWork.SaveChangesAsync();
                await RecordHistory(field, "Edit");
                return ToDto(field);
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_FieldManager)]
        public async Task<FieldActionResultDto> DeleteField(EntityDto<long> input)
        {
            await RequirePermission(AppPermissions.Pages_Administration_FieldManager_Delete);
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MayHaveTenant))
            {
                var field = await VisibleFields().FirstOrDefaultAsync(x => x.Id == input.Id);
                if (field == null) throw new UserFriendlyException("Field was not found.");
                if (field.TenantId != AbpSession.TenantId)
                    throw new UserFriendlyException("A tenant cannot delete a host field.");
                field.CurrentRevisionNo = NextRevision(field.CurrentRevisionNo);
                await RecordHistory(field, "Delete");
                await _fields.DeleteAsync(field);
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
                var source = await VisibleFields().FirstOrDefaultAsync(x => x.Id == input.Id);
                if (source == null) throw new UserFriendlyException("Field was not found.");
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
                var field = await VisibleFields().FirstOrDefaultAsync(x => x.Id == input.Id && x.TenantId == null);
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
                IsCustom = AbpSession.TenantId.HasValue,
                IsHidden = isHidden
            };
            Apply(input, field);
            field.FieldCode = await NextFieldCode(field);
            if (!sourceFieldId.HasValue && !string.IsNullOrWhiteSpace(input.FieldCode) &&
                !string.Equals(input.FieldCode.Trim(), field.FieldCode, StringComparison.Ordinal))
                throw new UserFriendlyException("Field code has changed. Refresh the preview and try again.");
            await _fields.InsertAndGetIdAsync(field);
            await CurrentUnitOfWork.SaveChangesAsync();
            if (sourceFieldId.HasValue || assignmentSourceFieldId.HasValue)
            {
                var sourceAssignmentId = assignmentSourceFieldId ?? sourceFieldId.Value;
                var sourceAssignments = await _tableFields.GetAll().Where(x => x.AppFieldId == sourceAssignmentId)
                    .AsNoTracking().ToListAsync();
                foreach (var assignment in sourceAssignments)
                    await _tableFields.InsertAsync(new AppTableField
                    {
                        TenantId = AbpSession.TenantId,
                        AppFieldId = field.Id,
                        SycObjectId = assignment.SycObjectId,
                        SycEntityObjectTypeId = assignment.SycEntityObjectTypeId
                    });
            }
            else
                await _tableFields.InsertAsync(new AppTableField
                {
                    TenantId = AbpSession.TenantId,
                    AppFieldId = field.Id,
                    SycObjectId = input.SycObjectId,
                    SycEntityObjectTypeId = input.SelectedObjectTypeId
                });
            await RecordHistory(field, "Create");
            return ToDto(field);
        }

        private async Task ValidateFieldInput(CreateOrEditFieldInput input)
        {
            if (input.SycObjectId <= 0 || !await _objects.GetAll().AnyAsync(x => x.Id == input.SycObjectId && !x.IsDeleted))
                throw new UserFriendlyException("Select a valid object.");
            if (input.EntitySycObjectId.HasValue && !await _objects.GetAll().AnyAsync(x => x.Id == input.EntitySycObjectId.Value && !x.IsDeleted))
                throw new UserFriendlyException("Select a valid entity object.");
            if (input.SelectedObjectTypeId.HasValue && !await _objectTypes.GetAll().AnyAsync(x =>
                    x.Id == input.SelectedObjectTypeId.Value && x.ObjectId == input.SycObjectId && !x.IsDeleted))
                throw new UserFriendlyException("The selected object type does not belong to this data object.");
            await ValidateFieldType(input.FieldTypeId);
            var fieldObjectId = await _objects.GetAll().Where(x => x.Code == "FIELD" && !x.IsDeleted)
                .Select(x => x.Id).SingleAsync();
            if (input.WidgetTypeId.HasValue && !await _objectTypes.GetAll().AnyAsync(x => x.Id == input.WidgetTypeId.Value && x.ObjectId == fieldObjectId))
                throw new UserFriendlyException("Select a valid widget type.");
            if (input.Length.HasValue && input.Length.Value <= 0) throw new UserFriendlyException("Length must be positive.");
            if (input.Decimals.HasValue && input.Decimals.Value < 0) throw new UserFriendlyException("Decimals cannot be negative.");
            if (!string.IsNullOrWhiteSpace(input.ExtraAttributes))
            {
                try { using (JsonDocument.Parse(input.ExtraAttributes)) { } }
                catch (JsonException) { throw new UserFriendlyException("Extra attributes must be valid JSON."); }
            }
            ResolveFieldLevelCode(input.FieldLevelCode);
            if (!new[] { "Proposed", "Active", "Discontinued" }.Contains(input.FieldStatusCode ?? "Proposed"))
                throw new UserFriendlyException("Select a valid field status.");
        }

        private void Apply(CreateOrEditFieldInput input, AppField field)
        {
            field.SycObjectId = input.SycObjectId;
            field.EntitySycObjectId = input.EntitySycObjectId;
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
            field.ExtraAttributes = input.ExtraAttributes;
        }

        private async Task RecordHistory(AppField field, string changeType)
        {
            await _history.InsertAsync(new AppFieldHistory
            {
                TenantId = field.TenantId,
                AppFieldId = field.Id,
                RevisionNo = field.CurrentRevisionNo,
                ChangeType = changeType,
                SnapshotJson = JsonSerializer.Serialize(ToDto(field)),
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

            if (acquireLock)
            {
                var context = CurrentUnitOfWork.GetDbContext<onetouchDbContext>();
                var lockName = "APPFields:FieldType:" + field.FieldTypeId.ToString(CultureInfo.InvariantCulture);
                await context.Database.ExecuteSqlInterpolatedAsync(
                    $"DECLARE @result int; EXEC @result = sp_getapplock @Resource = {lockName}, @LockMode = 'Exclusive', @LockOwner = 'Transaction'; IF @result < 0 THROW 51000, 'Unable to allocate a field code.', 1;");
            }

            var lastSequence = 0;
            using (CurrentUnitOfWork.DisableFilter(AbpDataFilters.MayHaveTenant, AbpDataFilters.SoftDelete))
            {
                var existingCodes = await _fields.GetAll().Where(x => x.FieldTypeId == field.FieldTypeId)
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

            return typeCode + levelCode + name + (lastSequence + 1).ToString("D4", CultureInfo.InvariantCulture);
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

        private static CreateOrEditFieldInput ToInput(AppField x) => new CreateOrEditFieldInput
        {
            Id = x.Id, SycObjectId = x.SycObjectId, EntitySycObjectId = x.EntitySycObjectId,
            FieldTypeId = x.FieldTypeId, WidgetTypeId = x.WidgetTypeId, FieldLevelId = x.FieldLevelId,
            FieldStatusId = x.FieldStatusId, FieldCode = x.FieldCode, FieldName = x.FieldName,
            Description = x.Description, FieldLevelCode = x.FieldLevelCode, FieldStatusCode = x.FieldStatusCode,
            TrackingNo = x.TrackingNo, IsExtraField = x.IsExtraField, AllowNull = x.AllowNull,
            Length = x.Length, Decimals = x.Decimals, DefaultValue = x.DefaultValue,
            DateFormat = x.DateFormat, TimeFormat = x.TimeFormat, AllowMultiSelect = x.AllowMultiSelect,
            Required = x.Required, Visible = x.Visible, Editable = x.Editable, ExtraAttributes = x.ExtraAttributes
        };

        private static AppFieldDto ToDto(AppField x) => new AppFieldDto
        {
            Id = x.Id, TenantId = x.TenantId, SourceFieldId = x.SourceFieldId,
            SycObjectId = x.SycObjectId, EntitySycObjectId = x.EntitySycObjectId,
            FieldTypeId = x.FieldTypeId, WidgetTypeId = x.WidgetTypeId, FieldLevelId = x.FieldLevelId,
            FieldStatusId = x.FieldStatusId, FieldCode = x.FieldCode, FieldName = x.FieldName,
            Description = x.Description, FieldLevelCode = x.FieldLevelCode, FieldStatusCode = x.FieldStatusCode,
            TrackingNo = x.TrackingNo, CurrentRevisionNo = x.CurrentRevisionNo,
            IsStandard = x.IsStandard, IsCustom = x.IsCustom, IsExtraField = x.IsExtraField, IsHidden = x.IsHidden,
            AllowNull = x.AllowNull, Length = x.Length, Decimals = x.Decimals, DefaultValue = x.DefaultValue,
            DateFormat = x.DateFormat, TimeFormat = x.TimeFormat, AllowMultiSelect = x.AllowMultiSelect,
            Required = x.Required, Visible = x.Visible, Editable = x.Editable, ExtraAttributes = x.ExtraAttributes,
            CreationTime = x.CreationTime, CreatorUserId = x.CreatorUserId,
            LastModificationTime = x.LastModificationTime, LastModifierUserId = x.LastModifierUserId,
            IsDeleted = x.IsDeleted, DeleterUserId = x.DeleterUserId, DeletionTime = x.DeletionTime
        };
    }
}
