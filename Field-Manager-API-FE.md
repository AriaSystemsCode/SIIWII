# Field Manager API contract for FE

Base path: `/api/services/app/AppFieldManager`. JSON names below use the camel case returned to Angular. Successful ABP responses place the endpoint payload in `result`.

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

**API description:** Calculates the code to display before save. The 11-character code is two field-type characters, one field-level character (`S`, `A`, or `T`), four characters from the field name, and a four-digit sequence per field type. This preview does not reserve the sequence; the save endpoint recalculates it.

**API request:** `POST /PreviewFieldCode` with a JSON body.

| Request parameter | Description |
| --- | --- |
| `fieldTypeId` (number, required) | Positive ID of a field type returned by `GetFieldCreateOrEditMetadata`. |
| `fieldName` (string, required, max 250) | Proposed field name; its first four letters or digits contribute to the code. |
| `fieldLevelCode` (string, optional, max 32) | `System` or `Application` for a host; a tenant session uses `Tenant`. Host default is `Application`. |

**API response:**

| Response attribute | Description |
| --- | --- |
| `result.fieldCode` | Calculated 11-character field code for display. |

## 5. `GetFields`

**API description:** Returns a paged list of visible fields. Selecting an object type returns fields assigned to that type plus fields assigned to its base data object. Selecting an entity or data object returns its base assignments.

**API request:** `GET /GetFields` with query parameters.

| Request parameter | Description |
| --- | --- |
| `selectedObjectId` (number, optional) | `SydObject` ID from a tree entity or data-object node. Filters to fields assigned directly to that object. |
| `selectedObjectTypeId` (number, optional) | `SycEntityObjectType` ID from a tree object-type node. Takes precedence over `selectedObjectId`; includes base-object assignments. |
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
| `result.items[].id` | `APPFields` record ID. |
| `result.items[].fieldCode` | Generated field code. |
| `result.items[].fieldName` | Field name. |
| `result.items[].description` | Field description. |
| `result.items[].fieldTypeName` | Display name of the field type. |
| `result.items[].widgetTypeName` | Display name of the widget type, if assigned. |
| `result.items[].fieldLevelName` | Field level code shown as a name. |
| `result.items[].statusName` | Field status code shown as a name. |
| `result.items[].revisionNo` | Current revision number. |
| `result.items[].trackingNo` | Tracking or iteration reference. |
| `result.items[].standardOrCustom` | `Standard` or `Custom` display text. |
| `result.items[].isStandard` | Field is host standard data. |
| `result.items[].isCustom` | Field is tenant custom data. |
| `result.items[].isExtraField` | Field belongs in the Extra Fields view. |
| `result.items[].isHidden` | Tenant copy is hidden. |
| `result.items[].canEdit` | Current user may edit this row. |
| `result.items[].canDelete` | Current user may delete this row. |
| `result.items[].canHide` | Current tenant may hide this host field. |
| `result.items[].sycObjectId` | Source `SydObject` ID. |
| `result.items[].entitySycObjectId` | Related entity object's ID, if set. |
| `result.items[].creatorUserId` | Creator user ID, if recorded. |
| `result.items[].creatorUserName` | Creator's full name, if the user record is available. |
| `result.items[].creationTime` | Creation date/time. |
| `result.items[].tables[]` | Names of the field's assigned objects or object types. Includes all visible assignments for the field, not only the selected node. |

## 6. `AssignExistingField`

**API description:** Assigns an existing visible field to a base object or a specific object type. Repeating an existing assignment succeeds without adding another row.

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

## 7. `GetFieldForEdit`

**API description:** Returns one visible field and the actions permitted for that field. Tenant editing of a host field requires a tenant copy on save.

**API request:** `GET /GetFieldForEdit` with a query parameter.

| Request parameter | Description |
| --- | --- |
| `id` (number, required) | `APPFields` record ID. |

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

**API description:** Creates a field when `id` is absent, or edits one when `id` is present. A tenant edit of a host field creates a tenant copy. Create assigns the field to `sycObjectId` or its selected object type; edit keeps the existing assignments. The server generates and verifies the field code.

**API request:** `POST /CreateOrEditField` with a JSON body.

| Request parameter | Description |
| --- | --- |
| `id` (number or `null`, optional) | Existing `APPFields` ID to edit; omit or send `null` to create. |
| `sycObjectId` (number, required) | Source `SydObject` ID. Cannot change on edit. |
| `entitySycObjectId` (number or `null`, optional) | Related entity `SydObject` ID. |
| `selectedObjectTypeId` (number or `null`, optional) | On create, assign the field to this object type; must belong to `sycObjectId`. Omit for base-object assignment. Not used to change assignment on edit. |
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

**API response:** `result` is the saved field. Every attribute is defined in the **AppFieldDto response attributes** table below.

## 9. `DeleteField`

**API description:** Soft-deletes an eligible field and records a revision. A tenant cannot delete a host field.

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

**API description:** Creates a new Proposed field from an existing visible field, with a newly generated code and copied table assignments.

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

## AppFieldDto response attributes

This is the complete `result` field returned by `CreateOrEditField` and `DuplicateField`, and the complete `result.field` returned by `GetFieldForEdit`.

| Response attribute | Description |
| --- | --- |
| `id` | `APPFields` record ID. |
| `sycObjectId` | Source `SydObject` ID. |
| `entitySycObjectId` | Related entity object's ID, if set. |
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
| `sourceFieldId` | Host field ID when this is a tenant copy; otherwise `null`. |
| `currentRevisionNo` | Current revision number. |
| `isStandard` | Field is host standard data. |
| `isCustom` | Field is tenant custom data. |
| `isHidden` | Tenant copy is hidden. |
| `creationTime` | Creation date/time. |
| `creatorUserId` | Creator user ID, if recorded. |
| `lastModificationTime` | Last modification date/time, if modified. |
| `lastModifierUserId` | Last modifier user ID, if recorded. |
| `isDeleted` | Whether this record is soft-deleted. |
| `deleterUserId` | Deleting user ID, if deleted. |
| `deletionTime` | Deletion date/time, if deleted. |
