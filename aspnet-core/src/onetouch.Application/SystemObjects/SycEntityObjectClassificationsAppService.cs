using onetouch.SystemObjects;
using System.Collections.Generic;


using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.SystemObjects.Exporting;
using onetouch.SystemObjects.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using onetouch.Common;
using Abp.UI;
using onetouch.Helpers;
using Abp.Domain.Uow;
using onetouch.AppEntities;
using onetouch.AppEntities.Dtos;
using Abp.EntityFrameworkCore;
using onetouch.EntityFrameworkCore;
using onetouch.AppContacts;

namespace onetouch.SystemObjects
{
    [AbpAuthorize(AppPermissions.Pages_SycEntityObjectClassifications)]
    public class SycEntityObjectClassificationsAppService : onetouchAppServiceBase, ISycEntityObjectClassificationsAppService
    {
        private onetouchDbContext _context => _dbContextProvider.GetDbContext();
        private readonly IDbContextProvider<onetouchDbContext> _dbContextProvider;
        private IRepository<AppContact, long> _appContactRepository;
        private readonly IRepository<SycEntityObjectClassification, long> _sycEntityObjectClassificationRepository;
        private readonly ISycEntityObjectClassificationsExcelExporter _sycEntityObjectClassificationsExcelExporter;
        private readonly IRepository<SydObject, long> _lookup_sydObjectRepository;
        private readonly IRepository<SycEntityObjectClassification, long> _lookup_sycEntityObjectClassificationRepository;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        private readonly Helper _helper;
        //xx
        private readonly ISycEntityLocalizationAppService _sycEntityLocalizeAppService;
        //xx
        public SycEntityObjectClassificationsAppService(IRepository<SycEntityObjectClassification, long> sycEntityObjectClassificationRepository,
            ISycEntityObjectClassificationsExcelExporter sycEntityObjectClassificationsExcelExporter, IRepository<SydObject, long> lookup_sydObjectRepository,
            IRepository<SycEntityObjectClassification, long> lookup_sycEntityObjectClassificationRepository, Helper helper, IAppEntitiesAppService appEntitiesAppService,
            ISycEntityLocalizationAppService sycEntityLocalizationAppService,IDbContextProvider<onetouchDbContext> dbContextProvider, IRepository<AppContact, long> appContactRepository)
        {

            _sycEntityObjectClassificationRepository = sycEntityObjectClassificationRepository;
            _sycEntityObjectClassificationsExcelExporter = sycEntityObjectClassificationsExcelExporter;
            _lookup_sydObjectRepository = lookup_sydObjectRepository;
            _lookup_sycEntityObjectClassificationRepository = lookup_sycEntityObjectClassificationRepository;
            _appEntitiesAppService = appEntitiesAppService;
            _helper = helper;
           
            _sycEntityLocalizeAppService = sycEntityLocalizationAppService;
            _appContactRepository = appContactRepository;
            _dbContextProvider = dbContextProvider;
        }

        public async Task<PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>>> GetAll(GetAllSycEntityObjectClassificationsInput input)
        {

            var filteredSycEntityObjectClassifications = _sycEntityObjectClassificationRepository.GetAll()
                    .Include(e => e.ObjectFk)
                    .Include(e => e.ParentFk)
                    .Include(e => e.SycEntityObjectClassifications)
                    .WhereIf(input.ExcludeIds != null && input.ExcludeIds.Count > 0, e => input.ExcludeIds.Contains(e.Id) == false)
                    .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter) || e.Name.Contains(input.Filter))
                    .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                    .WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name == input.NameFilter)
                    .WhereIf(!string.IsNullOrWhiteSpace(input.SydObjectNameFilter), e => e.ObjectFk != null && e.ObjectFk.Name == input.SydObjectNameFilter)
                    .WhereIf(!string.IsNullOrWhiteSpace(input.SycEntityObjectClassificationNameFilter), e => e.ParentFk != null && e.ParentFk.Name == input.SycEntityObjectClassificationNameFilter)
                    .Where(e => e.ParentId == null)
                    .Where(e => e.TenantId == AbpSession.TenantId || e.TenantId == null)
                    .WhereIf(input.ObjectId > 0, e => e.ObjectId == input.ObjectId);

            
            var pagedAndFilteredSycEntityObjectClassifications = filteredSycEntityObjectClassifications
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);
            //XX
            var tenantLanguage = "ENG";
            var account = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId && x.IsProfileData && x.ParentId == null && x.PartnerId == null && x.AccountId == null);
            if (account != null && !string.IsNullOrEmpty(account.LanguageCode))
            {
                tenantLanguage = account.LanguageCode;
            }
            var cat = await _lookup_sydObjectRepository.FirstOrDefaultAsync(a => a.Code == "CLASSIFICATION");
            var sycEntityObjectClassifications = from o in pagedAndFilteredSycEntityObjectClassifications
                                                 join o1 in _lookup_sydObjectRepository.GetAll() on o.ObjectId equals o1.Id into j1
                                                 from s1 in j1.DefaultIfEmpty()

                                                 join o2 in _lookup_sycEntityObjectClassificationRepository.GetAll() on o.ParentId equals o2.Id into j2
                                                 from s2 in j2.DefaultIfEmpty()

                                                 join s5 in _context.SycEntityLocalizations.Where(z => z.Language.ToUpper() == tenantLanguage.ToUpper() && z.ObjectTypeId == cat.Id) on s2.Id equals s5.ObjectId into j3
                                                 from s3 in j3.DefaultIfEmpty()

                                                 select new TreeNode<GetSycEntityObjectClassificationForViewDto>()
                                                 {
                                                     Data = new GetSycEntityObjectClassificationForViewDto
                                                     {
                                                         SycEntityObjectClassification = new SycEntityObjectClassificationDto
                                                         {
                                                             Code = o.Code,
                                                             Name = s3.String == null ? o.Name : s3.String ,
                                                             Id = o.Id
                                                         },
                                                         SydObjectName = s3.String == null ? (s1 == null ? "" : s1.Name.ToString()) : s3.String,
                                                         SycEntityObjectClassificationName = s2 == null ? "" : s2.Name.ToString()
                                                     },
                                                     Leaf = o.SycEntityObjectClassifications.Count() == 0,
                                                     totalChildrenCount = o.SycEntityObjectClassifications.Count(),
                                                     label = o.Name
                                                 };


            var totalCount = await filteredSycEntityObjectClassifications.CountAsync();

            return new PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>>(
                totalCount,
                await sycEntityObjectClassifications.ToListAsync()
            );
        }
        //T-SII-20220919.0001,1 MMT 12/20/2022 Add an API to validate if the entered name is already entered before or not[Start]
        public async Task<bool> ClassificationNameIsExisting(string classificationName)
        {
            var objWithSameName = await _sycEntityObjectClassificationRepository.FirstOrDefaultAsync(x => x.Name.ToUpper() == classificationName.ToUpper());
            if (objWithSameName != null)
                return true;
            return false;
        }
        //T-SII-20220919.0001,1 MMT 12/20/2022 Add an API to validate if the entered name is already entered before or not[End]

        public async Task<IReadOnlyList<TreeNode<GetSycEntityObjectClassificationForViewDto>>> GetAllChilds(long parentId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var filteredSycEntityObjectClassifications = _sycEntityObjectClassificationRepository.GetAll()
                        .Include(e => e.ObjectFk)
                        .Include(e => e.ParentFk)
                        .Include(e => e.SycEntityObjectClassifications)
                        .Where(e => e.ParentId != null && e.ParentId == parentId)
                        .Where(e => e.TenantId == AbpSession.TenantId || e.TenantId == null);

                var sycEntityObjectClassifications = from o in filteredSycEntityObjectClassifications
                                                     join o1 in _lookup_sydObjectRepository.GetAll() on o.ObjectId equals o1.Id into j1
                                                     from s1 in j1.DefaultIfEmpty()

                                                     join o2 in _lookup_sycEntityObjectClassificationRepository.GetAll() on o.ParentId equals o2.Id into j2
                                                     from s2 in j2.DefaultIfEmpty()

                                                     select new TreeNode<GetSycEntityObjectClassificationForViewDto>()
                                                     {
                                                         Data = new GetSycEntityObjectClassificationForViewDto
                                                         {
                                                             SycEntityObjectClassification = new SycEntityObjectClassificationDto
                                                             {
                                                                 Code = o.Code,
                                                                 Name = o.Name,
                                                                 Id = o.Id
                                                             },
                                                             SydObjectName = s1 == null ? "" : s1.Name.ToString(),
                                                             SycEntityObjectClassificationName = s2 == null ? "" : s2.Name.ToString()
                                                         },
                                                         Leaf = o.SycEntityObjectClassifications.Count() == 0,
                                                         totalChildrenCount = o.SycEntityObjectClassifications.Count(),
                                                         label = o.Name
                                                     };


                var totalCount = await filteredSycEntityObjectClassifications.CountAsync();

                var x = await sycEntityObjectClassifications.ToListAsync();

                return x;
            }
        }


        public async Task<PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>>> GetAllChildsWithPaging(GetAllSycEntityObjectClassificationsInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.EntityId != 0)
                {
                    input.ExcludeIds = new List<long>();
                       var EntityRelated = await _appEntitiesAppService.GetAppEntityClassificationsWithPaging(new GetAppEntityAttributesInput { EntityId = input.EntityId });
                    if (EntityRelated != null && EntityRelated.TotalCount > 0)
                    {
                        input.ExcludeIds.AddRange(EntityRelated.Items.Select(r => r.EntityObjectClassificationId).ToList());
                    }
                }

                var filteredSycEntityObjectClassifications = _sycEntityObjectClassificationRepository.GetAll()
                        .Include(e => e.ObjectFk)
                        .Include(e => e.ParentFk)
                        .Include(e => e.SycEntityObjectClassifications)
                        .WhereIf(input.ExcludeIds != null && input.ExcludeIds.Count > 0, e => input.ExcludeIds.Contains(e.Id) == false)
                        .Where(e => e.ParentId != null && e.ParentId == input.ParentId)
                        .Where(e => e.TenantId == AbpSession.TenantId || e.TenantId == null);

                var pagedAndFilteredSycEntityObjectClassifications = filteredSycEntityObjectClassifications
              .OrderBy(input.Sorting ?? "id asc")
              .PageBy(input);

                var sycEntityObjectClassifications = from o in pagedAndFilteredSycEntityObjectClassifications
                                                     join o1 in _lookup_sydObjectRepository.GetAll() on o.ObjectId equals o1.Id into j1
                                                     from s1 in j1.DefaultIfEmpty()

                                                     join o2 in _lookup_sycEntityObjectClassificationRepository.GetAll() on o.ParentId equals o2.Id into j2
                                                     from s2 in j2.DefaultIfEmpty()

                                                     select new TreeNode<GetSycEntityObjectClassificationForViewDto>()
                                                     {
                                                         Data = new GetSycEntityObjectClassificationForViewDto
                                                         {
                                                             SycEntityObjectClassification = new SycEntityObjectClassificationDto
                                                             {
                                                                 Code = o.Code,
                                                                 Name = o.Name,
                                                                 Id = o.Id
                                                             },
                                                             SydObjectName = s1 == null ? "" : s1.Name.ToString(),
                                                             SycEntityObjectClassificationName = s2 == null ? "" : s2.Name.ToString()
                                                         },
                                                         Leaf = o.SycEntityObjectClassifications.Count() == 0,
                                                         totalChildrenCount = o.SycEntityObjectClassifications.Count(),
                                                         label = o.Name
                                                     };


                var totalCount = await filteredSycEntityObjectClassifications.CountAsync();

                
                var sycEntityObjectClassificationsvar = await sycEntityObjectClassifications.ToListAsync();
                var sycEntityObjectClassificationsPages = new PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>>(
                    totalCount,
                    sycEntityObjectClassificationsvar);

                return sycEntityObjectClassificationsPages;

            }
        }

        [AbpAllowAnonymous]
        public async Task<IReadOnlyList<TreeNode<GetSycEntityObjectClassificationForViewDto>>> GetAllChildsForLables()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var parentId = await _helper.SystemTables.GetEntityObjectClassificationsLableID();


                var filteredSycEntityObjectClassifications = _sycEntityObjectClassificationRepository.GetAll()
                        .Include(e => e.ObjectFk)
                        .Include(e => e.ParentFk)
                        .Include(e => e.SycEntityObjectClassifications)
                        .Where(e => e.ParentId != null && e.ParentId == parentId && e.TenantId == null)
                         .Where(x => x.TenantId == AbpSession.TenantId || x.TenantId == null);

                var sycEntityObjectClassifications = from o in filteredSycEntityObjectClassifications
                                                     join o1 in _lookup_sydObjectRepository.GetAll() on o.ObjectId equals o1.Id into j1
                                                     from s1 in j1.DefaultIfEmpty()

                                                     join o2 in _lookup_sycEntityObjectClassificationRepository.GetAll() on o.ParentId equals o2.Id into j2
                                                     from s2 in j2.DefaultIfEmpty()

                                                     select new TreeNode<GetSycEntityObjectClassificationForViewDto>()
                                                     {
                                                         Data = new GetSycEntityObjectClassificationForViewDto
                                                         {
                                                             SycEntityObjectClassification = new SycEntityObjectClassificationDto
                                                             {
                                                                 Code = o.Code,
                                                                 Name = o.Name,
                                                                 Id = o.Id
                                                             },
                                                             SydObjectName = s1 == null ? "" : s1.Name.ToString(),
                                                             SycEntityObjectClassificationName = s2 == null ? "" : s2.Name.ToString()
                                                         },
                                                         Leaf = o.SycEntityObjectClassifications.Count() == 0,
                                                         totalChildrenCount = o.SycEntityObjectClassifications.Count(),
                                                         label = o.Name
                                                     };


                var totalCount = await filteredSycEntityObjectClassifications.CountAsync();

                var x = await sycEntityObjectClassifications.ToListAsync();

                return x;
            }
        }

        //Esraa [End]

        [AbpAllowAnonymous]
        public async Task<PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>>> GetAllWithChildsForContact()
        {
            GetAllSycEntityObjectClassificationsInput tmpInput = new GetAllSycEntityObjectClassificationsInput
            {
                MaxResultCount = 9999,
                SkipCount = 0,
                ObjectId = await _helper.SystemTables.GetObjectContactId()
            };

            PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> allParents = await GetAll(tmpInput);
            foreach (var item in allParents.Items)
            {
                if (!item.Leaf)
                {
                    await LoadChilds(item);
                }
            }

            return allParents;

        }

        [AbpAllowAnonymous]
        public async Task<PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>>> GetAllWithChildsForContactWithPaging(GetAllSycEntityObjectClassificationsInput input)
        {
            input.ObjectId = await _helper.SystemTables.GetObjectContactId();

            PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> allParents = await GetAll(input);
            //foreach (var item in allParents.Items)
            //{
            //    if (!item.Leaf)
            //    {
            //        await LoadChilds(item);
            //    }
            //}

            return allParents;

        }

        [AbpAllowAnonymous]
        public async Task<PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>>> GetAllWithChildsForProduct()
        {
            GetAllSycEntityObjectClassificationsInput tmpInput = new GetAllSycEntityObjectClassificationsInput
            {
                MaxResultCount = 9999,
                SkipCount = 0,
                ObjectId = await _helper.SystemTables.GetObjectItemId()
            };

            PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> allParents = await GetAll(tmpInput);
            foreach (var item in allParents.Items)
            {
                if (!item.Leaf)
                {
                    await LoadChilds(item);
                }
            }

            return allParents;

        }

        [AbpAllowAnonymous]
        public async Task<PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>>> GetAllWithChildsForProductWithPaging(GetAllSycEntityObjectClassificationsInput input)
        {
            input.ObjectId = await _helper.SystemTables.GetObjectItemId();

            if (input.EntityId != 0)
            {
                input.ExcludeIds = new List<long>();
                      var EntityRelated = await _appEntitiesAppService.GetAppEntityClassificationsWithPaging(new GetAppEntityAttributesInput { EntityId = input.EntityId });
                    if (EntityRelated != null && EntityRelated.TotalCount > 0)
                    {
                        input.ExcludeIds.AddRange(EntityRelated.Items.Select(r => r.EntityObjectClassificationId).ToList());
                    }
            }

            PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> allParents = await GetAll(input);
            //foreach (var item in allParents.Items)
            //{
            //    if (!item.Leaf)
            //    {
            //        await LoadChilds(item);
            //    }
            //}

            return allParents;

        }


        [AbpAllowAnonymous]
        public async Task<PagedResultDto<TreeviewItem>> GetAllWithChildsForContactAsTreeViewWithPaging(GetAllSycEntityObjectClassificationsInput tmpInput)
        {
            tmpInput = new GetAllSycEntityObjectClassificationsInput
            {   
                ObjectId = await _helper.SystemTables.GetObjectContactId()
            };

            PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> allParents = await GetAll(tmpInput);
            foreach (var item in allParents.Items)
            {
                if (!item.Leaf)
                {
                    await LoadChilds(item);
                }
            }

            var list = ObjectMapper.Map<PagedResultDto<TreeviewItem>>(allParents);
            return list;

        }

        [AbpAllowAnonymous]
        public async Task<PagedResultDto<TreeviewItem>> GetAllWithChildsForContactAsTreeView()
        {
            GetAllSycEntityObjectClassificationsInput tmpInput = new GetAllSycEntityObjectClassificationsInput
            {
                MaxResultCount = 9999,
                SkipCount = 0,
                ObjectId = await _helper.SystemTables.GetObjectContactId()
            };

            PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> allParents = await GetAll(tmpInput);
            foreach (var item in allParents.Items)
            {
                if (!item.Leaf)
                {
                    await LoadChilds(item);
                }
            }

            var list = ObjectMapper.Map<PagedResultDto<TreeviewItem>>(allParents);
            return list;

        }

        private async Task LoadChilds(TreeNode<GetSycEntityObjectClassificationForViewDto> parent)
        {
            parent.Children = await GetAllChilds(parent.Data.SycEntityObjectClassification.Id);
            foreach (var item in parent.Children)
            {
                if (!item.Leaf)
                {
                    await LoadChilds(item);
                }
            }
        }

        public async Task<GetSycEntityObjectClassificationForViewDto> GetSycEntityObjectClassificationForView(int id)
        {
            var sycEntityObjectClassification = await _sycEntityObjectClassificationRepository.FirstOrDefaultAsync(x => x.Id == id && (x.TenantId == AbpSession.TenantId || x.TenantId == null));

            var output = new GetSycEntityObjectClassificationForViewDto { SycEntityObjectClassification = ObjectMapper.Map<SycEntityObjectClassificationDto>(sycEntityObjectClassification) };

            if (output.SycEntityObjectClassification.ObjectId != null)
            {
                var _lookupSydObject = await _lookup_sydObjectRepository.FirstOrDefaultAsync((int)output.SycEntityObjectClassification.ObjectId);
                output.SydObjectName = _lookupSydObject.Name.ToString();
            }

            if (output.SycEntityObjectClassification.ParentId != null)
            {
                var _lookupSycEntityObjectClassification = await _lookup_sycEntityObjectClassificationRepository.FirstOrDefaultAsync((int)output.SycEntityObjectClassification.ParentId);
                output.SycEntityObjectClassificationName = _lookupSycEntityObjectClassification.Name.ToString();
            }

            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_SycEntityObjectClassifications_Edit)]
        public async Task<GetSycEntityObjectClassificationForEditOutput> GetSycEntityObjectClassificationForEdit(EntityDto input)
        {
            var sycEntityObjectClassification = await _sycEntityObjectClassificationRepository.FirstOrDefaultAsync(x => x.Id == input.Id && (x.TenantId == AbpSession.TenantId || x.TenantId == null));

            var output = new GetSycEntityObjectClassificationForEditOutput { SycEntityObjectClassification = ObjectMapper.Map<CreateOrEditSycEntityObjectClassificationDto>(sycEntityObjectClassification) };

            if (output.SycEntityObjectClassification.ObjectId != null)
            {
                var _lookupSydObject = await _lookup_sydObjectRepository.FirstOrDefaultAsync((int)output.SycEntityObjectClassification.ObjectId);
                output.SydObjectName = _lookupSydObject.Name.ToString();
            }

            if (output.SycEntityObjectClassification.ParentId != null)
            {
                var _lookupSycEntityObjectClassification = await _lookup_sycEntityObjectClassificationRepository.FirstOrDefaultAsync((int)output.SycEntityObjectClassification.ParentId);
                output.SycEntityObjectClassificationName = _lookupSycEntityObjectClassification.Name.ToString();
            }

            return output;
        }

        public async Task CreateOrEdit(CreateOrEditSycEntityObjectClassificationDto input)
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

        public async Task CreateOrEditForObjectProduct(CreateOrEditSycEntityObjectClassificationDto input)
        {
            input.ObjectId = await _helper.SystemTables.GetObjectItemId();

            if (input.Id == null)
            {
                await Create(input);
            }
            else
            {
                await Update(input);
            }
        }

        [AbpAuthorize(AppPermissions.Pages_SycEntityObjectClassifications_Create, AppPermissions.Pages_AppItems_Create, AppPermissions.Pages_AppItems_Edit)]
        protected virtual async Task Create(CreateOrEditSycEntityObjectClassificationDto input)
        {
            var sycEntityObjectClassification = ObjectMapper.Map<SycEntityObjectClassification>(input);
            sycEntityObjectClassification.TenantId = AbpSession.TenantId;
            if(string.IsNullOrEmpty(input.Code))
            { input.Code = Guid.NewGuid().ToString(); }

            await _sycEntityObjectClassificationRepository.InsertAsync(sycEntityObjectClassification);
            try
            {
                await CurrentUnitOfWork.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                //throw new UserFriendlyException("Code '" + input.Code + "' Is Already Exists.");
                throw new UserFriendlyException(L("CodeIsAlreadyExists", input.Code));

            }
            //xx
            var classification = await _lookup_sydObjectRepository.FirstOrDefaultAsync(a => a.Code == "CLASSIFICATION");
            if (classification != null)
                _sycEntityLocalizeAppService.CreateOrUpdateLocalization(classification.Id, sycEntityObjectClassification.Id, "ENG", "Name", input.Name);
            //xx
        }

        [AbpAuthorize(AppPermissions.Pages_SycEntityObjectClassifications_Edit, AppPermissions.Pages_AppItems_Create, AppPermissions.Pages_AppItems_Edit)]
        protected virtual async Task Update(CreateOrEditSycEntityObjectClassificationDto input)
        {

            await CheckParentAllowed((int)input.Id, input.ParentId);

            var sycEntityObjectClassification = await _sycEntityObjectClassificationRepository.FirstOrDefaultAsync((int)input.Id);
            ObjectMapper.Map(input, sycEntityObjectClassification);
            //xx
            var classification = await _lookup_sydObjectRepository.FirstOrDefaultAsync(a => a.Code == "CLASSIFICATION");
            if (classification != null)
                _sycEntityLocalizeAppService.CreateOrUpdateLocalization(classification.Id, sycEntityObjectClassification.Id, "ENG", "Name", input.Name);
            //xx
        }

        [AbpAuthorize(AppPermissions.Pages_SycEntityObjectClassifications_Delete)]
        public async Task Delete(EntityDto input)
        {
            await _sycEntityObjectClassificationRepository.DeleteAsync(x => (x.Id == input.Id || x.ParentId == input.Id) && (x.TenantId == AbpSession.TenantId || x.TenantId == null) );
        }

        public async Task<FileDto> GetSycEntityObjectClassificationsToExcel(GetAllSycEntityObjectClassificationsForExcelInput input)
        {

            var filteredSycEntityObjectClassifications = _sycEntityObjectClassificationRepository.GetAll()
                        .Include(e => e.ObjectFk)
                        .Include(e => e.ParentFk)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter) || e.Name.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name == input.NameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SydObjectNameFilter), e => e.ObjectFk != null && e.ObjectFk.Name == input.SydObjectNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycEntityObjectClassificationNameFilter), e => e.ParentFk != null && e.ParentFk.Name == input.SycEntityObjectClassificationNameFilter)
                         .Where(x => x.TenantId == AbpSession.TenantId || x.TenantId == null);

            var query = (from o in filteredSycEntityObjectClassifications
                         join o1 in _lookup_sydObjectRepository.GetAll() on o.ObjectId equals o1.Id into j1
                         from s1 in j1.DefaultIfEmpty()

                         join o2 in _lookup_sycEntityObjectClassificationRepository.GetAll() on o.ParentId equals o2.Id into j2
                         from s2 in j2.DefaultIfEmpty()

                         select new GetSycEntityObjectClassificationForViewDto()
                         {
                             SycEntityObjectClassification = new SycEntityObjectClassificationDto
                             {
                                 Code = o.Code,
                                 Name = o.Name,
                                 Id = o.Id
                             },
                             SydObjectName = s1 == null ? "" : s1.Name.ToString(),
                             SycEntityObjectClassificationName = s2 == null ? "" : s2.Name.ToString()
                         });


            var sycEntityObjectClassificationListDtos = await query.ToListAsync();

            return _sycEntityObjectClassificationsExcelExporter.ExportToFile(sycEntityObjectClassificationListDtos);
        }


        [AbpAuthorize(AppPermissions.Pages_SycEntityObjectClassifications)]
        public async Task<List<SycEntityObjectClassificationSydObjectLookupTableDto>> GetAllSydObjectForTableDropdown()
        {
            return await _lookup_sydObjectRepository.GetAll()
                .Select(sydObject => new SycEntityObjectClassificationSydObjectLookupTableDto
                {
                    Id = sydObject.Id,
                    DisplayName = sydObject.Name.ToString()
                }).ToListAsync();
        }

        [AbpAuthorize(AppPermissions.Pages_SycEntityObjectClassifications)]
        public async Task<List<SycEntityObjectClassificationSycEntityObjectClassificationLookupTableDto>> GetAllSycEntityObjectClassificationForTableDropdown()
        {
            return await _lookup_sycEntityObjectClassificationRepository.GetAll().Where(x => x.TenantId == AbpSession.TenantId || x.TenantId == null)
                .Select(sycEntityObjectClassification => new SycEntityObjectClassificationSycEntityObjectClassificationLookupTableDto
                {
                    Id = sycEntityObjectClassification.Id,
                    DisplayName = sycEntityObjectClassification.Name.ToString()
                }).ToListAsync();
        }

        private async Task<bool> CheckParentAllowed(int recordId, int? parentId)
        {
            parentId = parentId == null ? 0 : parentId;

            if (parentId != 0)
            {
                var obj = await _sycEntityObjectClassificationRepository.FirstOrDefaultAsync(x => x.Id == parentId);

                if (obj.ParentId == recordId)
                    throw new UserFriendlyException("Ooppps! cannot make the record child to itself...");

                while (obj.ParentId != null && obj.ParentId != 0)
                {
                    obj = await _sycEntityObjectClassificationRepository.FirstOrDefaultAsync(x => x.Id == (int)obj.ParentId);
                    if (obj.ParentId == recordId)
                        throw new UserFriendlyException("Ooppps! cannot make the record child to itself...");
                }

            }

            return true;
        }
        //MMT36
        [AbpAllowAnonymous]
        public async Task<PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>>> GetAllWithChildsForTransactionWithPaging(GetAllSycEntityObjectClassificationsInput input)
        {
            input.ObjectId = await _helper.SystemTables.GetObjectTransactionId();

            if (input.EntityId != 0)
            {
                input.ExcludeIds = new List<long>();
                var EntityRelated = await _appEntitiesAppService.GetAppEntityClassificationsWithPaging(new GetAppEntityAttributesInput { EntityId = input.EntityId });
                if (EntityRelated != null && EntityRelated.TotalCount > 0)
                {
                    input.ExcludeIds.AddRange(EntityRelated.Items.Select(r => r.EntityObjectClassificationId).ToList());
                }
            }

            PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> allParents = await GetAll(input);
            //foreach (var item in allParents.Items)
            //{
            //    if (!item.Leaf)
            //    {
            //        await LoadChilds(item);
            //    }
            //}

            return allParents;

        }
        //MMT36
    }
}