using System.Threading.Tasks;
using System.Collections.Generic;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppFields.Dto;

namespace onetouch.AppFields
{
    public interface IAppFieldManagerAppService : IApplicationService
    {
        Task<FieldManagerPermissionDto> GetPagePermissions();
        Task<List<ObjectTypeTreeNodeDto>> GetObjectTypeTree();
        Task<FieldCreateOrEditMetadataDto> GetFieldCreateOrEditMetadata();
        Task<FieldCodePreviewDto> PreviewFieldCode(PreviewFieldCodeInput input);
        Task<PagedResultDto<AppFieldListDto>> GetFields(GetFieldsInput input);
        Task<FieldActionResultDto> AssignExistingField(AssignExistingFieldInput input);
        Task<PagedResultDto<AppFieldDto>> GetUnlinkedFields(GetUnlinkedFieldsInput input);
        Task<LinkExistingFieldsResultDto> LinkExistingFields(LinkExistingFieldsInput input);
        Task<FieldActionResultDto> SyncFieldSnapshots(SyncFieldSnapshotsInput input);
        Task<AppFieldDto> GetAppliedField(GetAppliedFieldInput input);
        Task<GetFieldForEditOutput> GetFieldForEdit(long id);
        Task<List<AppFieldHistoryDto>> GetFieldHistory(long appFieldId);
        Task<AppFieldDto> CreateOrEditField(CreateOrEditFieldInput input);
        Task<FieldActionResultDto> DeleteField(EntityDto<long> input);
        Task<AppFieldDto> DuplicateField(EntityDto<long> input);
        Task HideField(EntityDto<long> input);
    }
}
