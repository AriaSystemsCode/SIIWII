# Field Manager API contract for FE

Base path: `/api/services/app/AppFieldManager`. JSON names below use the camel case returned to Angular. Successful ABP responses place the endpoint payload in `result`.

The existing `/api/services/app/SycEntityObjectTypes/GetAllWithExtraAttributes` endpoint also accepts an optional `source` enum query parameter. `source=0` (`Xml`, the default) preserves its original `SycEntityObjectTypes.ExtraAttributes` XML behavior. `source=1` (`AppFields`) returns only `IsExtraField` definitions from the selected type's effective `AppTableFields` snapshots, including base-object assignments reached through `SydObjects.BaseEntityId`. The response keeps the existing `extraAttributes.extraAttributes[]` shape. Callers that omit `source` continue receiving XML attributes. No FE proxy change is required for existing calls; regenerate NSwag before passing the new parameter through the generated proxy.

Field Manager stores settings in typed columns and child rows. `AppFieldsOptions` defines selectable choices for a setting. `AppFieldSettingValues` stores each selected choice in a separate row with `AppFieldsOptionId`; history and table snapshots use their corresponding setting-value tables. Migration `20261016170000_UseFieldSettingOptionsOnly` removes the redundant dropdown-option tables after checking they contain no rows. The `extraAttributes` JSON property remains for compatible non-option attributes and accepts an empty `dropdownOptions` array, but selectable choices must be sent through `settingValues`. The `source=0` XML metadata on `SycEntityObjectTypes` is unaffected.

Database prerequisite: apply the Field Manager migrations through `20261012120000_TypedAppTableFields`. The earlier snapshot migration removes `AppTableFields.AppFieldId` and its foreign key; the new migration moves the copied definition into typed `AppTableFields` columns and removes `SnapshotJson`. The catalog table was renamed from `APPFields` to `AppFields` without changing its rows.
The previous assignment table did not record an applied revision, so migration backfill snapshots the catalog definition as it exists when the migration runs.

## 1. `GetPagePermissions`

**API description:** Returns the current user's Field Manager permissions and host or tenant context.

**API request:** `GET /GetPagePermissions`. No parameters.

**API response:** `result` is an object.

| Response attribute | Description |
| --- | --- |
| `result.canViewPage` | User may open the Field Manager page. |
| `result.canCreateField` | User may create a field. |
| `result.canEditField` | User may edit a field. |
| `result.canDeleteField` | User may delete an eligible field. |
| `result.canDuplicateField` | User may duplicate a field. |
| `result.canRestoreRevision` | User has the restore-revision permission; a restore endpoint is not currently exposed. |
| `result.canAddExistingField` | User may assign an existing field to an object or object type. |
| `result.isHost` | Current session belongs to the host. |
| `result.isTenant` | Current session belongs to a tenant. |

## 2. `GetObjectTypeTree`

**API description:** Returns the Field Manager navigation tree: entity objects, child data objects, and object types. `children` contains the nested nodes.

**API request:** `GET /GetObjectTypeTree`. No parameters.

**API response:** `result` is an array of root nodes. Every root and descendant has the same attributes.

| Response attribute | Description |
| --- | --- |
| `result[]` | Root entity or data-object node. |
| `result[].id` | ID of the `SydObject` or `SycEntityObjectType` represented by this node. |
| `result[].parentId` | Parent node's ID; `null` for a root. IDs alone can overlap between tables. |
| `result[].key` | Unique UI key, prefixed `Entity:`, `DataObject:`, or `ObjectType:`. |
| `result[].parentKey` | Parent's unique key; `null` for a root. |
| `result[].code` | Object or object-type code. |
| `result[].name` | Display name. |
| `result[].nodeType` | `Entity`, `DataObject`, or `ObjectType`. |
| `result[].sycObjectId` | `SydObject` ID used for field assignments and `GetFields.selectedObjectId`. For an object-type node, this is its owning data-object ID. |
| `result[].children[]` | Child nodes; recursively use the same attributes. |

## 3. `GetFieldCreateOrEditMetadata`

**API description:** Returns the lookup choices used by the create and edit form.

**API request:** `GET /GetFieldCreateOrEditMetadata`. No parameters.

**API response:** `result` is an object of lookup arrays. Each array item has `id`, `code`, and `name`.

| Response attribute | Description |
| --- | --- |
| `result.fieldTypes[]` | Field-type choices under the FIELD object type. |
| `result.widgetTypes[]` | Widget-type choices; may be empty when no widget types are configured. |
| `result.fieldLevels[]` | `System`, `Application`, and `Tenant` choices. |
| `result.fieldStatuses[]` | `Proposed`, `Active`, and `Discontinued` choices. |
| `result.entities[]` | Entity and data objects available to the form. |
| `result.<array>[].id` | Database ID for field types, widgets, and entities; `null` for level and status choices. |
| `result.<array>[].code` | Value to send for the selected choice, especially `fieldLevelCode` and `fieldStatusCode`. |
| `result.<array>[].name` | Display label. |

## 4. `PreviewFieldCode`

**API description:** Returns only the next four-digit sequence for the selected field type. The 11-character code saved by `CreateOrEditField` is two field-type characters, one field-level character (`S`, `A`, or `T`), four characters from the field name, and this sequence. The preview does not reserve the sequence; the save endpoint recalculates it.

**API request:** `POST /PreviewFieldCode` with a JSON body.

| Request parameter | Description |
| --- | --- |
| `fieldTypeId` (number, required) | Positive ID of a field type returned by `GetFieldCreateOrEditMetadata`. |
| `fieldName` (string, required, max 250) | Proposed field name; its first four letters or digits contribute to the code. |
| `fieldLevelCode` (string, optional, max 32) | `System` or `Application` for a host; a tenant session uses `Tenant`. Host default is `Application`. |

**API response:**

| Response attribute | Description |
| --- | --- |
| `result.sequence` | Proposed four-digit sequence, such as `0001`, for this field type. |

## 5. `GetFields`

**API description:** Returns a paged list of fields. All Fields lists catalog definitions and aggregates direct and inherited table usage by immutable `fieldDefinitionKey`; a soft-deleted definition still used by a table appears as `Archived` and is read-only. Selecting an object or object type reads its applied `AppTableFields` snapshots plus base-object snapshots reached through `SydObjects.BaseEntityId`. Base fields remain assigned only to the base object. A selected object's own snapshot takes precedence when the same logical field is assigned at both levels. Snapshots keep their applied revision when the catalog definition is edited.

**API request:** `GET /GetFields` with query parameters.

| Request parameter | Description |
| --- | --- |
| `selectedObjectId` (number, optional) | `SydObject` ID from a tree entity or data-object node. Includes fields assigned to that object and its `BaseEntityId` chain. |
| `selectedObjectTypeId` (number, optional) | `SycEntityObjectType` ID from a tree object-type node. Takes precedence over `selectedObjectId`; includes its object's fields and inherited base-entity fields. |
| `allFields` (boolean, optional; default `true`) | `true` returns all matching fields; `false` returns only extra fields. |
| `searchText` (string, optional) | Searches field code, name, description, and tracking number. |
| `fieldTypeId` (number, optional) | Filter by field type ID. |
| `fieldStatusId` (number, optional) | Filter by status ID. |
| `fieldLevelId` (number, optional) | Filter by level ID. |
| `fieldStatusCode` (string, optional) | Filter by status code. |
| `fieldLevelCode` (string, optional) | Filter by level code. |
| `trackingNo` (string, optional) | Exact tracking-number filter. |
| `isStandard` (boolean, optional) | Filter standard (`true`) or nonstandard (`false`) fields. |
| `createdByUserId` (number, optional) | Filter by creator user ID. |
| `createdFrom` (date/time, optional) | Include fields created at or after this date/time. |
| `createdTo` (date/time, optional) | Include fields created at or before this date/time. |
| `groupBy` (string, optional) | Accepted by the request DTO but currently not applied by the backend. |
| `skipCount` (number, optional; default `0`) | Number of matching records to skip. |
| `maxResultCount` (number, optional; default `10`) | Maximum records to return. |
| `sorting` (string, optional) | Sort expression: `fieldCode`, `fieldName`, `fieldTypeId`, `fieldLevelCode`, `fieldStatusCode`, `trackingNo`, or `creationTime`, followed by `asc` or `desc`. Default is newest first. |

**API response:**

| Response attribute | Description |
| --- | --- |
| `result.totalCount` | Total number of matching fields before pagination. |
| `result.items[]` | Fields on the requested page. |
| `result.items[].id` | Original `AppFields` record ID from the definition or applied snapshot. Archived rows are read-only. |
| `result.items[].fieldDefinitionKey` | Immutable logical key used to read an applied snapshot with `GetAppliedField`. |
| `result.items[].fieldCode` | Generated field code. |
| `result.items[].fieldName` | Field name. |
| `result.items[].description` | Field description. |
| `result.items[].fieldTypeName` | Display name of the field type. |
| `result.items[].widgetTypeName` | Display name of the widget type, if assigned. |
| `result.items[].fieldLevelName` | Field level code shown as a name. |
| `result.items[].statusName` | Field status; `Archived` when the catalog definition was soft-deleted or removed. |
| `result.items[].revisionNo` | Current catalog revision in All Fields, or the applied snapshot revision for a selected table. |
| `result.items[].trackingNo` | Tracking or iteration reference. |
| `result.items[].standardOrCustom` | `Standard` or `Custom` display text. |
| `result.items[].isStandard` | Field is host standard data. |
| `result.items[].isCustom` | Field is tenant custom data; derived as the opposite of `isStandard`. |
| `result.items[].isExtraField` | Field belongs in the Extra Fields view. |
| `result.items[].isHidden` | Tenant copy is hidden. |
| `result.items[].canEdit` | Current user may edit this row. |
| `result.items[].canDelete` | Current user may delete this row. |
| `result.items[].canHide` | Current tenant may hide this host field. |
| `result.items[].sycObjectId` | Definition owner `SydObjects.Id`; `null` for ordinary fields. Only Field type setting definitions have an owner. |
| `result.items[].entitySycObjectId` | Owning `SycEntityObjectTypes.Id` for a Field type setting; `null` for ordinary fields. |
| `result.items[].creatorUserId` | Creator user ID, if recorded. |
| `result.items[].creatorUserName` | Creator's full name, if the user record is available. |
| `result.items[].creationTime` | Creation date/time. |
| `result.items[].tables[]` | Names of every visible object or object type using this logical field, matched by `fieldDefinitionKey` without a foreign key to `AppFields`. |

## 6. `AssignExistingField`

**API description:** Copies a current visible, non-discontinued ordinary definition into an independent table snapshot for a base object or object type. Field type setting definitions are not assignable to business tables. A field already available from the object's `BaseEntityId` chain is treated as assigned; no duplicate row is added.

**API request:** `POST /AssignExistingField` with a JSON body.

| Request parameter | Description |
| --- | --- |
| `appFieldId` (number, required) | Positive ID of the field to assign. |
| `sycObjectId` (number, required) | Positive `SydObject` ID receiving the assignment. |
| `sycEntityObjectTypeId` (number or `null`, optional) | Object-type ID for a subtype-specific assignment; `null` assigns the field to the base object. The type must belong to `sycObjectId`. |

**API response:**

| Response attribute | Description |
| --- | --- |
| `result.success` | `true` when the assignment exists after the call. |
| `result.message` | `Field assigned.` or `Field is already assigned.` |

### `GetUnlinkedFields`

**API description:** Lists visible, active ordinary field definitions in `AppFields` that are not yet applied to a data table or entity. Field type setting definitions are excluded. Fields inherited from the table's `BaseEntityId` chain are treated as linked, as are base-table fields for an object-type node. Requires the Add Existing Field permission.

**API request:** `GET /GetUnlinkedFields?tableId=45&sycEntityObjectTypeId=123&skipCount=0&maxResultCount=10`. Omit `sycEntityObjectTypeId` for the base table.

| Request parameter | Description |
| --- | --- |
| `tableId` (number, required) | `SydObjects.Id` of a `DATA` or `ENTITY` object, such as AppTransactionHeaders or Address. |
| `sycEntityObjectTypeId` (number or `null`, optional) | Object-type ID for Sales/Purchase or another subtype; must belong to `tableId`. |
| `searchText` (string, optional) | Searches field code, name, and description. |
| `skipCount` (number, optional) | Number of matching fields to skip. |
| `maxResultCount` (number, optional) | Page size; defaults to 10. |
| `sorting` (string, optional) | Uses the same field sort names as `GetFields`. |

**API response:** `result.totalCount` is the number of available definitions; `result.items[]` contains the complete `AppFieldDto` attributes documented below. Soft-deleted, hidden, discontinued, and already linked fields are excluded.

### `LinkExistingFields`

**API description:** Adds several current `AppFields` definitions to one data table in a single transaction. Each new `AppTableFields` row keeps its own field snapshot. Fields already applied to the selected node, including fields inherited through `BaseEntityId`, are skipped. An invalid or unavailable field rejects the entire request. Requires the Add Existing Field permission.

**API request:** `POST /LinkExistingFields` with a JSON body, for example `{ "tableId": 45, "sycEntityObjectTypeId": 123, "appFieldIds": [10, 11] }`.

| Request parameter | Description |
| --- | --- |
| `tableId` (number, required) | `SydObjects.Id` of the target `DATA` or `ENTITY` object. |
| `sycEntityObjectTypeId` (number or `null`, optional) | Target subtype ID; omit or send `null` for the base table. |
| `appFieldIds` (number array, required) | Positive `AppFields.Id` values to link; duplicates are counted once. |

**API response:**

| Response attribute | Description |
| --- | --- |
| `result.linkedCount` | Number of new `AppTableFields` snapshots created. |
| `result.alreadyLinkedCount` | Number of distinct requested fields already applied to this node. |

## 7. `GetFieldForEdit`

**API description:** Returns one visible field and the actions permitted for that field. Tenant editing of a host field requires a tenant copy on save.

**API request:** `GET /GetFieldForEdit` with a query parameter.

| Request parameter | Description |
| --- | --- |
| `id` (number, required) | `AppFields` record ID. |

**API response:**

| Response attribute | Description |
| --- | --- |
| `result.field` | Field record. Every attribute is defined in the **AppFieldDto response attributes** table below. |
| `result.permissions.canEditCoreInfo` | User may edit the field's core information. |
| `result.permissions.canEditAttributes` | User may edit field attributes. |
| `result.permissions.canDelete` | User may delete this field. |
| `result.permissions.canHide` | Tenant may hide this host field. |
| `result.permissions.isTenantCustomCopyRequired` | Saving an edit will create a tenant copy of the host field. |

## 8. `CreateOrEditField`

**API description:** Creates an ownerless ordinary field definition when `id` is absent, or edits one when `id` is present. A tenant edit of a host field creates a tenant copy. On create, optional `sycObjectId` and `selectedObjectTypeId` also assign a snapshot; without them the definition remains unlinked. Edit keeps existing assignments. The server generates and verifies the field code.

**API request:** `POST /CreateOrEditField` with a JSON body.

| Request parameter | Description |
| --- | --- |
| `id` (number or `null`, optional) | Existing `AppFields` ID to edit; omit or send `null` to create. |
| `expectedCurrentRevisionNo` (string, required on edit) | Revision returned by `GetFieldForEdit`, for example `00`. A stale or missing value rejects the edit and asks the user to refresh. |
| `sycObjectId` (number or `null`, optional) | Initial assignment target `SydObjects.Id` on create; not stored as the ordinary definition's owner. Omit to create an unlinked definition. Not used to change assignment on edit. |
| `entitySycObjectId` (number or `null`, optional) | Legacy definition-owner input. Omit for ordinary fields; it is not saved when creating or editing them. |
| `selectedObjectTypeId` (number or `null`, optional) | On create, assign the field to this object type; requires `sycObjectId` and must belong to it. Omit for an object-wide assignment. Not used to change assignment on edit. |
| `fieldTypeId` (number, required) | ID of a valid field type under FIELD. |
| `widgetTypeId` (number or `null`, optional) | ID of a widget type under the FIELD object. |
| `fieldLevelId` (number or `null`, optional) | Numeric level ID, if available. The current metadata supplies level codes with `id: null`. |
| `fieldStatusId` (number or `null`, optional) | Numeric status ID, if available. The current metadata supplies status codes with `id: null`. |
| `fieldCode` (string, optional, max 11) | Previewed code on create. Save rejects a stale preview; omit to use the server-generated code. Cannot change a saved code on edit. |
| `fieldName` (string, required, max 250) | Field name; contributes four characters to the generated code. |
| `description` (string, optional, max 2000) | Field description. |
| `fieldLevelCode` (string, optional, max 32) | `System` or `Application` for a host; tenant saves always use `Tenant`. Host default is `Application`. |
| `fieldStatusCode` (string, optional, max 32) | `Proposed`, `Active`, or `Discontinued`; default is `Proposed`. |
| `trackingNo` (string, optional, max 100) | Tracking or iteration reference. |
| `isExtraField` (boolean, optional) | Marks the field as an extra field; default `false`. |
| `allowNull` (boolean, optional) | Field permits a null value; default `false`. |
| `length` (number or `null`, optional) | Maximum field length; when supplied must be positive. |
| `decimals` (number or `null`, optional) | Decimal places; when supplied must be zero or greater. |
| `defaultValue` (string, optional, max 2000) | Default field value. |
| `dateFormat` (string, optional, max 100) | Date display or input format. |
| `timeFormat` (string, optional, max 100) | Time display or input format. |
| `allowMultiSelect` (boolean, optional) | Allows multiple selections; default `false`. |
| `required` (boolean, optional) | Marks the field required; default `false`. |
| `visible` (boolean, optional; default `true`) | Field is visible. |
| `editable` (boolean, optional; default `true`) | Field can be edited. |
| `extraAttributes` (string, optional) | JSON-encoded extra configuration. Must contain valid JSON when supplied. |

**API response:** `result` is the saved field. Every attribute is defined in the **AppFieldDto response attributes** table below. Editing saves the new revision in `AppFieldsHistory`; existing table snapshots keep their applied revision.

## 9. `DeleteField`

**API description:** Soft-deletes an eligible catalog definition and records a revision. Existing table snapshots remain available and read-only. A tenant cannot delete a host field.

**API request:** `DELETE /DeleteField` with a query parameter.

| Request parameter | Description |
| --- | --- |
| `id` (number, required) | ID of the field to delete. |

**API response:**

| Response attribute | Description |
| --- | --- |
| `result.success` | `true` when the field was deleted. |
| `result.message` | Confirmation text: `Field deleted.` |

## 10. `DuplicateField`

**API description:** Creates a new Proposed ordinary field from an existing visible ordinary field, with a newly generated code and copied table assignments. Field type settings cannot be duplicated this way.

**API request:** `POST /DuplicateField` with a JSON body.

| Request parameter | Description |
| --- | --- |
| `id` (number, required) | ID of the source field to duplicate. |

**API response:** `result` is the new field. Every attribute is defined in the **AppFieldDto response attributes** table below.

## 11. `HideField`

**API description:** Hides a host field for the current tenant by creating a hidden tenant copy. Available only in a tenant session.

**API request:** `POST /HideField` with a JSON body.

| Request parameter | Description |
| --- | --- |
| `id` (number, required) | ID of the host field to hide for the current tenant. |

**API response:**

| Response attribute | Description |
| --- | --- |
| `result` | `null`; this operation returns no field DTO. |

## 12. `SyncFieldSnapshots`

**API description:** Applies the current `AppFields` revision to the field's existing table snapshots. The field's old snapshots stay unchanged until this endpoint is called. A tenant can sync only its own field and table snapshots.

**API request:** `POST /SyncFieldSnapshots` with a JSON body.

| Request parameter | Description |
| --- | --- |
| `appFieldId` (number, required) | ID of the current catalog field definition. |
| `sycObjectId` (number, optional) | Object whose snapshot should be updated. Omit to update all owned snapshots for the field. |
| `sycEntityObjectTypeId` (number or `null`, optional) | Type-specific snapshot to update. Requires `sycObjectId`; omit or send `null` for the base-object snapshot. |

**API response:** `result.success` is `true`; `result.message` reports the number of updated table snapshots. A missing assignment produces an error.

## 13. `GetAppliedField`

**API description:** Returns the full definition snapshot applied to an object or object type, including snapshots inherited through `SydObjects.BaseEntityId`. The selected object's snapshot takes precedence over an inherited one with the same definition key; within the same object, the type-specific snapshot takes precedence. This endpoint reads `AppTableFields` and still works after the catalog definition is soft-deleted.

**API request:** `GET /GetAppliedField` with query parameters.

| Request parameter | Description |
| --- | --- |
| `fieldDefinitionKey` (GUID, required) | Immutable logical key of the applied field. |
| `sycObjectId` (number, required) | Object that uses the field. |
| `sycEntityObjectTypeId` (number or `null`, optional) | Selected object type; includes its object's and base-entity snapshots when no type-specific snapshot exists. |

**API response:** `result` is the applied revision of the complete `AppFieldDto` below. It is a read-only snapshot; editing continues through `CreateOrEditField` on the catalog definition.

## 14. `GetFieldHistory`

**API description:** Returns the saved `AppFieldsHistory` rows for one visible field, newest first. It also works for a soft-deleted field that still has table assignments. The current revision is returned only if it has been saved to history; the current definition remains available through `GetFieldForEdit`.

**API request:** `GET /GetFieldHistory?appFieldId=123`.

| Request parameter | Description |
| --- | --- |
| `appFieldId` (number, required) | `AppFields.Id` of the field whose revision history is requested. |

**API response:** `result` is an array; it is empty when the visible field has no saved history rows.

| Response attribute | Description |
| --- | --- |
| `result[].id` | `AppFieldsHistory.Id` of the history row. |
| `result[].appFieldId` | `AppFields.Id` associated with the revision. |
| `result[].fieldDefinitionKey` | Stable logical field key shared by all revisions and table snapshots. |
| `result[].revisionNo` | Revision number captured in this history row. |
| `result[].changeType` | Recorded action, such as `Create`, `Edit`, or `Delete`. |
| `result[].field` | Typed field definition captured for this revision. Its attributes match the `AppFieldDto` response documented below; `field.id` is the original `AppFields.Id`. |
| `result[].changedAt` | UTC time when the history row was recorded. |
| `result[].changedBy` | User ID that recorded the change, when available. |
| `result[].restoredFromRevisionNo` | Source revision when a revision was restored, if applicable. |

## AppFieldDto response attributes

This is the complete `result` field returned by `CreateOrEditField` and `DuplicateField`, and the complete `result.field` returned by `GetFieldForEdit`.

| Response attribute | Description |
| --- | --- |
| `id` | `AppFields` record ID. |
| `sycObjectId` | Definition owner `SydObjects.Id`; `null` for ordinary fields. |
| `entitySycObjectId` | Owning `SycEntityObjectTypes.Id` for a Field type setting; `null` for ordinary fields. |
| `selectedObjectTypeId` | Currently `null` in this DTO; assignments are stored separately and this response does not populate it. |
| `fieldTypeId` | Field-type ID. |
| `widgetTypeId` | Widget-type ID, if assigned. |
| `fieldLevelId` | Numeric field-level ID, if set. |
| `fieldStatusId` | Numeric field-status ID, if set. |
| `fieldCode` | Generated 11-character field code. |
| `fieldName` | Field name. |
| `description` | Field description. |
| `fieldLevelCode` | `System`, `Application`, or `Tenant`. |
| `fieldStatusCode` | `Proposed`, `Active`, or `Discontinued`. |
| `trackingNo` | Tracking or iteration reference. |
| `isExtraField` | Whether this is an extra field. |
| `allowNull` | Whether null values are allowed. |
| `length` | Configured maximum length, if set. |
| `decimals` | Configured decimal places, if set. |
| `defaultValue` | Configured default value. |
| `dateFormat` | Configured date format. |
| `timeFormat` | Configured time format. |
| `allowMultiSelect` | Whether multiple selections are allowed. |
| `required` | Whether the field is marked required. |
| `visible` | Whether the field is visible. |
| `editable` | Whether the field is editable. |
| `extraAttributes` | JSON-encoded extra configuration, if set. |
| `tenantId` | Owning tenant ID; `null` for a host field. |
| `fieldDefinitionKey` | Immutable logical key shared with applied table snapshots; no foreign key is required. |
| `sourceFieldId` | Host field ID when this is a tenant copy; otherwise `null`. |
| `currentRevisionNo` | Current revision number. |
| `expectedCurrentRevisionNo` | Copy of the current revision to send when editing this definition. |
| `isStandard` | Field is host standard data. |
| `isCustom` | Field is tenant custom data; derived as the opposite of `isStandard`. |
| `isHidden` | Tenant copy is hidden. |
| `creationTime` | Creation date/time. |
| `creatorUserId` | Creator user ID, if recorded. |
| `lastModificationTime` | Last modification date/time, if modified. |
| `lastModifierUserId` | Last modifier user ID, if recorded. |
| `isDeleted` | Whether this record is soft-deleted. |
| `deleterUserId` | Deleting user ID, if deleted. |
| `deletionTime` | Deletion date/time, if deleted. |

## Dynamic settings (version 10)

`GET /api/services/app/AppFieldManager/GetFieldTypeSettings?fieldTypeId=827`
returns the type-owned setting definitions in `result[]`. Each definition has
`settingFieldId`, `fieldCode`, `fieldName`, `valueTypeId`, `valueTypeCode`,
`defaultValue`, `required`, `allowMultiSelect`, and `options[]`. Each option has
`id`, `code`, `name`, and `sortOrder`. The options belong to the setting field,
not to the ordinary field being edited.

`CreateOrEditField` accepts `settingValues[]`. Each row has `settingFieldId`
and exactly one of `valueText`, `valueNumber`, `valueBoolean`, `valueDateTime`,
or `appFieldsOptionId`. For a multi-select setting, send one row per selected
option. An explicit empty list clears optional settings; omitting the property
preserves current settings on edit.
On creation, omission maps the legacy typed request properties into applicable
settings and uses setting defaults.
The API rejects a setting from another field type, an option from another
setting, wrong value types, duplicate options, and multiple selections on a
single-select setting.

`AppFieldDto.settingValues[]` returns the current values. The same structure
is returned in `GetFieldForEdit`, `GetAppliedField`, and each history revision.
Responses also include copied `settingFieldCode`, `settingFieldName`,
`optionCode`, and `optionName` so applied and historical values remain readable
after setting labels or options change.

Host administrators can maintain the choices for a type-owned setting with
`POST /api/services/app/AppFieldManager/SaveFieldSettingOptions` using
`settingFieldId` and `options[]` (`id` is zero for a new choice). Omitted
existing choices become inactive; existing field selections and snapshots
remain stored. The deprecated top-level typed properties are retained in the
API for compatibility; dynamic `settingValues[]` is the Field Manager source
for ordinary fields.

Date--Date picker DateFormat offers `yyyy-MM-dd`, `MM/dd/yyyy`, and `dd/MM/yyyy` through `GetFieldTypeSettings.options[]`. Send the selected `appFieldsOptionId` in `settingValues[]`. Matching existing current values are mapped to those options by the version 10 seed.
