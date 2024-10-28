using onetouch.SystemObjects;
using System.Collections.Generic;
using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
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
using Abp.Domain.Uow;
using onetouch.Helpers;
using onetouch.AppEntities.Dtos;
using onetouch.AppEntities;
using onetouch.AppContacts;
using NPOI.SS.Formula.Functions;
using Org.BouncyCastle.X509;
using System.Security.Cryptography;
using Abp.EntityFrameworkCore;
using onetouch.EntityFrameworkCore;

namespace onetouch.SystemObjects
{
    [AbpAuthorize(AppPermissions.Pages_SycEntityObjectCategories)]
    public class SycEntityObjectCategoriesAppService : onetouchAppServiceBase, ISycEntityObjectCategoriesAppService
    {
        private onetouchDbContext _context => _dbContextProvider.GetDbContext();
        private readonly IDbContextProvider<onetouchDbContext> _dbContextProvider;
        private readonly IRepository<SycEntityObjectCategory, long> _sycEntityObjectCategoryRepository;
        private readonly ISycEntityObjectCategoriesExcelExporter _sycEntityObjectCategoriesExcelExporter;
        private readonly IRepository<SydObject, long> _lookup_sydObjectRepository;
        private readonly IRepository<SycEntityObjectCategory, long> _lookup_sycEntityObjectCategoryRepository;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        private readonly Helper _helper;
        private readonly SycEntityLocalizationAppService _sycEntityLocalizeAppService;
        private IRepository<AppContact, long> _appContactRepository;
        public SycEntityObjectCategoriesAppService(IRepository<SycEntityObjectCategory, long> sycEntityObjectCategoryRepository,
            ISycEntityObjectCategoriesExcelExporter sycEntityObjectCategoriesExcelExporter, IRepository<SydObject, long> lookup_sydObjectRepository, 
            IRepository<SycEntityObjectCategory, long> lookup_sycEntityObjectCategoryRepository, Helper helper, IAppEntitiesAppService appEntitiesAppService,
            SycEntityLocalizationAppService sycEntityLocalizationAppService, IRepository<AppContact, long> appContactRepository, IDbContextProvider<onetouchDbContext> dbContextProvider)
        {
            _sycEntityObjectCategoryRepository = sycEntityObjectCategoryRepository;
            _sycEntityObjectCategoriesExcelExporter = sycEntityObjectCategoriesExcelExporter;
            _lookup_sydObjectRepository = lookup_sydObjectRepository;
            _lookup_sycEntityObjectCategoryRepository = lookup_sycEntityObjectCategoryRepository;
            _appEntitiesAppService = appEntitiesAppService;
            _helper = helper;
            _sycEntityLocalizeAppService= sycEntityLocalizationAppService;
            _appContactRepository = appContactRepository;
            _dbContextProvider = dbContextProvider;
        }

        [AbpAllowAnonymous]
        public async Task<PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>>> GetAll(GetAllSycEntityObjectCategoriesInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var filteredSycEntityObjectCategories = _sycEntityObjectCategoryRepository.GetAll()
                        .Include(e => e.ObjectFk)
                        .Include(e => e.ParentFk)
                        .Include(e => e.SycEntityObjectCategories)
                        .WhereIf(input.ExcludeIds != null && input.ExcludeIds.Count > 0,e=> input.ExcludeIds.Contains(e.Id)==false )
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter) || e.Name.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name == input.NameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SydObjectNameFilter), e => e.ObjectFk != null && e.ObjectFk.Name == input.SydObjectNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycEntityObjectCategoryNameFilter), e => e.ParentFk != null && e.ParentFk.Name == input.SycEntityObjectCategoryNameFilter)
                        .Where(e => e.ParentId == null)
                        //.Where(e => e.TenantId==AbpSession.TenantId || e.TenantId == null)
                        //.WhereIf(input.CategoriesOnly , e => e.TenantId == AbpSession.TenantId)
                        //.WhereIf(!input.CategoriesOnly, e => e.TenantId == null);
                        .Where(e => e.TenantId == (input.DepartmentFlag ? null : AbpSession.TenantId))
                        .Where(e => e.TenantId == AbpSession.TenantId || e.TenantId == null)
                         .WhereIf(input.ObjectId > 0, e => e.ObjectId == input.ObjectId);

                //XX
                var tenantLanguage = "ENG";
                var account = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId && x.IsProfileData && x.ParentId == null && x.PartnerId == null && x.AccountId == null);
                if (account != null && !string.IsNullOrEmpty(account.LanguageCode))
                {
                    tenantLanguage = account.LanguageCode;
                }
                var cat = await _lookup_sydObjectRepository.FirstOrDefaultAsync(a => a.Code == "CATEGORY");
                //var categories = _sycEntityLocalizeAppService.GetAll(tenantLanguage, cat.Id ).ToList ();
                //XX

                    var pagedAndFilteredSycEntityObjectCategories = filteredSycEntityObjectCategories
                    .OrderBy(input.Sorting ?? "id asc")
                    .PageBy(input);

                var sycEntityObjectCategories = from o in pagedAndFilteredSycEntityObjectCategories
                                                join o1 in _lookup_sydObjectRepository.GetAll() on o.ObjectId equals o1.Id into j1
                                                from s1 in j1.DefaultIfEmpty()

                                                join o2 in _lookup_sycEntityObjectCategoryRepository.GetAll() on o.ParentId equals o2.Id into j2
                                                from s2 in j2.DefaultIfEmpty()

                                                join s5 in _context.SycEntityLocalizations.Where(z => z.Language.ToUpper() == tenantLanguage.ToUpper() && z.ObjectTypeId == cat.Id) on s2.Id equals s5.ObjectId  into j3
                                                from s3 in j3.DefaultIfEmpty()

                                                select new TreeNode<GetSycEntityObjectCategoryForViewDto>()
                                                {
                                                    Data = new GetSycEntityObjectCategoryForViewDto
                                                    {
                                                        SycEntityObjectCategory = new SycEntityObjectCategoryDto
                                                        {
                                                            Code = o.Code,
                                                            Name = o.Name,
                                                            Id = o.Id
                                                        },
                                                        SydObjectName = s3.String== null ? (s1 == null ? "" : s1.Name.ToString()): s3.String ,
                                                        SycEntityObjectCategoryName = s2 == null ? "" : s2.Name.ToString()
                                                    },
                                                    Leaf = o.SycEntityObjectCategories.Count() == 0,
                                                    totalChildrenCount = o.SycEntityObjectCategories.Count(),
                                                    label = o.Name
                                                };


                var totalCount = await filteredSycEntityObjectCategories.CountAsync();

                return new PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>>(
                    totalCount,
                    await sycEntityObjectCategories.ToListAsync()
                );
            }
        }

        [AbpAllowAnonymous]
        public async Task<PagedResultDto<TreeviewItem>> GetAllWithChildsForContactAsTreeViewWithPaging(GetAllSycEntityObjectCategoriesInput tmpInput)
        {
            tmpInput.ObjectId = await _helper.SystemTables.GetObjectContactId();

            PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> allParents = await GetAll(tmpInput);
            //foreach (var item in allParents.Items)
            //{
            //	if (!item.Leaf)
            //	{
            //		await LoadChilds(item);
            //	}
            //}

            var list = ObjectMapper.Map<PagedResultDto<TreeviewItem>>(allParents);
            list.TotalCount = allParents.TotalCount;
            return list;

        }


        [AbpAllowAnonymous]
        public async Task<PagedResultDto<TreeviewItem>> GetAllWithChildsForContactAsTreeView()
        {
            GetAllSycEntityObjectCategoriesInput tmpInput = new GetAllSycEntityObjectCategoriesInput
            {
                MaxResultCount = 9999,
                SkipCount = 0,
                ObjectId = await _helper.SystemTables.GetObjectContactId()
            };

            PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> allParents = await GetAll(tmpInput);
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
        public async Task<PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>>> GetAllWithChildsForContact()
        {
            GetAllSycEntityObjectCategoriesInput tmpInput = new GetAllSycEntityObjectCategoriesInput
            {
                MaxResultCount = 9999,
                SkipCount = 0,
                ObjectId = await _helper.SystemTables.GetObjectContactId()
            };

            PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> allParents = await GetAll(tmpInput);
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
        public async Task<PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>>> GetAllWithChildsForContactWithPaging(GetAllSycEntityObjectCategoriesInput tmpInput)
        {
            tmpInput.ObjectId = await _helper.SystemTables.GetObjectContactId();
            PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> allParents = await GetAll(tmpInput);
            //foreach (var item in allParents.Items)
            //{
            //	if (!item.Leaf)
            //	{
            //		await LoadChilds(item);
            //	}
            //}

            return allParents;

        }

        [AbpAllowAnonymous]
        public async Task<PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>>> GetAllWithChildsForProduct(bool departmentFlag)
        {
            GetAllSycEntityObjectCategoriesInput tmpInput = new GetAllSycEntityObjectCategoriesInput
            {
                MaxResultCount = 9999,
                SkipCount = 0,
                ObjectId = await _helper.SystemTables.GetObjectItemId(),
                DepartmentFlag = departmentFlag
            };

            PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> allParents = await GetAll(tmpInput);
            foreach (var item in allParents.Items)
            {
                if (!item.Leaf)
                {
                    await LoadChilds(item);
                }
            }

            return allParents;

        }
        //Iteration#42,1 MMT 08/21/2024 Add API to get all categories with children[Start]
        [AbpAllowAnonymous]
        public async Task<PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>>> GetAllWithChildsForTransaction()
        {
            GetAllSycEntityObjectCategoriesInput tmpInput = new GetAllSycEntityObjectCategoriesInput
            {
                MaxResultCount = 9999,
                SkipCount = 0,
                ObjectId = await _helper.SystemTables.GetObjectTransactionId(),
                DepartmentFlag = false
            };

            PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> allParents = await GetAll(tmpInput);
            foreach (var item in allParents.Items)
            {
                if (!item.Leaf)
                {
                    await LoadChilds(item);
                }
            }

            return allParents;

        }
        //Iteration#42,1 MMT 08/21/2024 Add API to get all categories with children[End]

        [AbpAllowAnonymous]
        public async Task<PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>>> GetAllWithChildsForProductWithPaging(GetAllSycEntityObjectCategoriesInput tmpInput)
        {
            tmpInput.ObjectId = await _helper.SystemTables.GetObjectItemId();

            if (tmpInput.EntityId != 0)
            {
                tmpInput.ExcludeIds = new List<long>();
                if (tmpInput.DepartmentFlag)
                {
                    var EntityRelated = await _appEntitiesAppService.GetAppEntityDepartmentsWithPaging(new GetAppEntityAttributesInput { EntityId = tmpInput.EntityId });
                    if (EntityRelated != null && EntityRelated.TotalCount > 0)
                    {
                        tmpInput.ExcludeIds.AddRange(EntityRelated.Items.Select(r => r.EntityObjectCategoryId).ToList());
                    }
                }
                else
                {
                    var EntityRelated = await _appEntitiesAppService.GetAppEntityCategoriesWithPaging(new GetAppEntityAttributesInput { EntityId = tmpInput.EntityId });
                    if (EntityRelated != null && EntityRelated.TotalCount > 0)
                    {
                        tmpInput.ExcludeIds.AddRange(EntityRelated.Items.Select(r => r.EntityObjectCategoryId).ToList());
                    }
                }
            }
            //MMT2024
            if (tmpInput.EntityId == 0 && !string.IsNullOrEmpty(tmpInput.Filter))
            {
                return await  GetAllDepartmentsByFilterWithChildsForProduct(tmpInput.Filter);
            }
            //MMT2024
            PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> allParents = await GetAll(tmpInput);
            return allParents;
         }


        [AbpAllowAnonymous]
        public async Task<PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>>> GetAllDepartmentsWithChildsForProduct()
        {
            GetAllSycEntityObjectCategoriesInput tmpInput = new GetAllSycEntityObjectCategoriesInput
            {
                MaxResultCount = 9999,
                SkipCount = 0,
                //ObjectId = await (departmentFlag?_helper.SystemTables.GetObjectItemId(): _helper.SystemTables.GetObjectItemDataId())
                ObjectId = await _helper.SystemTables.GetObjectItemId()
            };

            PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> allParents = await GetAll(tmpInput);
            foreach (var item in allParents.Items)
            {
                if (!item.Leaf)
                {
                    await LoadChilds(item);
                }
            }

            return allParents;

        }

        private async Task LoadChilds(TreeNode<GetSycEntityObjectCategoryForViewDto> parent)
        {
            parent.Children = await GetAllChilds(parent.Data.SycEntityObjectCategory.Id);
            foreach (var item in parent.Children)
            {
                if (!item.Leaf)
                {
                    await LoadChilds(item);
                }
            }
        }


        public async Task<PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>>> GetAllChildsWithPaging(GetAllSycEntityObjectCategoriesInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.EntityId != 0)
                {
                    input.ExcludeIds = new List<long>();

                    if (input.DepartmentFlag)
                    {
                        var EntityRelated = await _appEntitiesAppService.GetAppEntityDepartmentsWithPaging(new GetAppEntityAttributesInput { EntityId = input.EntityId });
                        if (EntityRelated != null && EntityRelated.TotalCount > 0)
                        {
                            input.ExcludeIds.AddRange(EntityRelated.Items.Select(r => r.EntityObjectCategoryId).ToList());
                        }
                    }
                    else
                    {
                        var EntityRelated = await _appEntitiesAppService.GetAppEntityCategoriesWithPaging(new GetAppEntityAttributesInput { EntityId = input.EntityId });
                        if (EntityRelated != null && EntityRelated.TotalCount > 0)
                        {
                            input.ExcludeIds.AddRange(EntityRelated.Items.Select(r => r.EntityObjectCategoryId).ToList());
                        }
                    }
                    
                }

                var filteredSycEntityObjectCategories = _sycEntityObjectCategoryRepository.GetAll()
                        .Include(e => e.ObjectFk)
                        .Include(e => e.ParentFk)
                        .Include(e => e.SycEntityObjectCategories)
                        .WhereIf(input.ExcludeIds != null && input.ExcludeIds.Count > 0, e => input.ExcludeIds.Contains(e.Id) == false)
                        .Where(e => e.ParentId != null && e.ParentId == input.ParentId)
                        .Where(e => e.TenantId == AbpSession.TenantId || e.TenantId == null);

                var pagedAndFilteredSycEntityObjectCategories = filteredSycEntityObjectCategories
                 .OrderBy(input.Sorting ?? "id asc")
                 .PageBy(input);

                var sycEntityObjectCategories = from o in pagedAndFilteredSycEntityObjectCategories
                                                join o1 in _lookup_sydObjectRepository.GetAll() on o.ObjectId equals o1.Id into j1
                                                from s1 in j1.DefaultIfEmpty()

                                                join o2 in _lookup_sycEntityObjectCategoryRepository.GetAll() on o.ParentId equals o2.Id into j2
                                                from s2 in j2.DefaultIfEmpty()

                                                select new TreeNode<GetSycEntityObjectCategoryForViewDto>()
                                                {
                                                    Data = new GetSycEntityObjectCategoryForViewDto
                                                    {
                                                        SycEntityObjectCategory = new SycEntityObjectCategoryDto
                                                        {
                                                            Code = o.Code,
                                                            Name = o.Name,
                                                            Id = o.Id
                                                        },
                                                        SydObjectName = s1 == null ? "" : s1.Name.ToString(),
                                                        SycEntityObjectCategoryName = s2 == null ? "" : s2.Name.ToString()
                                                    },
                                                    Leaf = o.SycEntityObjectCategories.Count() == 0,
                                                    totalChildrenCount = o.SycEntityObjectCategories.Count(),
                                                    label = o.Name
                                                };


                var totalCount = await filteredSycEntityObjectCategories.CountAsync();

                var sycEntityObjectCategoriesvar = await sycEntityObjectCategories.ToListAsync();
                var sycEntityObjectCategoriesPages = new PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>>(
                    totalCount,
                    sycEntityObjectCategoriesvar);

                return sycEntityObjectCategoriesPages;
            }
        }


        [AbpAllowAnonymous]
        public async Task<IReadOnlyList<TreeNode<GetSycEntityObjectCategoryForViewDto>>> GetAllChilds(long parentId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var filteredSycEntityObjectCategories = _sycEntityObjectCategoryRepository.GetAll()
                        .Include(e => e.ObjectFk)
                        .Include(e => e.ParentFk)
                        .Include(e => e.SycEntityObjectCategories)
                        .Where(e => e.ParentId != null && e.ParentId == parentId)
                        .Where(e => e.TenantId == AbpSession.TenantId || e.TenantId == null);


                var sycEntityObjectCategories = from o in filteredSycEntityObjectCategories
                                                join o1 in _lookup_sydObjectRepository.GetAll() on o.ObjectId equals o1.Id into j1
                                                from s1 in j1.DefaultIfEmpty()

                                                join o2 in _lookup_sycEntityObjectCategoryRepository.GetAll() on o.ParentId equals o2.Id into j2
                                                from s2 in j2.DefaultIfEmpty()

                                                select new TreeNode<GetSycEntityObjectCategoryForViewDto>()
                                                {
                                                    Data = new GetSycEntityObjectCategoryForViewDto
                                                    {
                                                        SycEntityObjectCategory = new SycEntityObjectCategoryDto
                                                        {
                                                            Code = o.Code,
                                                            Name = o.Name,
                                                            Id = o.Id
                                                        },
                                                        SydObjectName = s1 == null ? "" : s1.Name.ToString(),
                                                        SycEntityObjectCategoryName = s2 == null ? "" : s2.Name.ToString()
                                                    },
                                                    Leaf = o.SycEntityObjectCategories.Count() == 0,
                                                    totalChildrenCount = o.SycEntityObjectCategories.Count(),
                                                    label = o.Name
                                                };


                var totalCount = await filteredSycEntityObjectCategories.CountAsync();

                var x = await sycEntityObjectCategories.ToListAsync();

                return x;
            }
        }

        public async Task<GetSycEntityObjectCategoryForViewDto> GetSycEntityObjectCategoryForView(int id)
        {
            var sycEntityObjectCategory = await _sycEntityObjectCategoryRepository.FirstOrDefaultAsync(x => x.Id == id && (x.TenantId == AbpSession.TenantId || x.TenantId == null));

            var output = new GetSycEntityObjectCategoryForViewDto { SycEntityObjectCategory = ObjectMapper.Map<SycEntityObjectCategoryDto>(sycEntityObjectCategory) };

            if (output.SycEntityObjectCategory.ObjectId != null)
            {
                var _lookupSydObject = await _lookup_sydObjectRepository.FirstOrDefaultAsync((int)output.SycEntityObjectCategory.ObjectId);
                output.SydObjectName = _lookupSydObject.Name.ToString();
            }

            if (output.SycEntityObjectCategory.ParentId != null)
            {
                var _lookupSycEntityObjectCategory = await _lookup_sycEntityObjectCategoryRepository.FirstOrDefaultAsync((int)output.SycEntityObjectCategory.ParentId);
                output.SycEntityObjectCategoryName = _lookupSycEntityObjectCategory.Name.ToString();
            }

            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_SycEntityObjectCategories_Edit)]
        public async Task<GetSycEntityObjectCategoryForEditOutput> GetSycEntityObjectCategoryForEdit(EntityDto input)
        {
            var sycEntityObjectCategory = await _sycEntityObjectCategoryRepository.FirstOrDefaultAsync(x => x.Id == input.Id && (x.TenantId == AbpSession.TenantId || x.TenantId == null));

            var output = new GetSycEntityObjectCategoryForEditOutput { SycEntityObjectCategory = ObjectMapper.Map<CreateOrEditSycEntityObjectCategoryDto>(sycEntityObjectCategory) };

            if (output.SycEntityObjectCategory.ObjectId != null)
            {
                var _lookupSydObject = await _lookup_sydObjectRepository.FirstOrDefaultAsync((int)output.SycEntityObjectCategory.ObjectId);
                output.SydObjectName = _lookupSydObject.Name.ToString();
            }

            if (output.SycEntityObjectCategory.ParentId != null)
            {
                var _lookupSycEntityObjectCategory = await _lookup_sycEntityObjectCategoryRepository.FirstOrDefaultAsync((int)output.SycEntityObjectCategory.ParentId);
                output.SycEntityObjectCategoryName = _lookupSycEntityObjectCategory.Name.ToString();
            }

            return output;
        }

        public async Task CreateOrEdit(CreateOrEditSycEntityObjectCategoryDto input)
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
        //T-SII-20220919.0001,1 MMT 12/20/2022 Add an API to validate if the entered name is already entered before or not[Start]
        public async Task<bool> CategoryNameIsExisting(string categoryName)
        {
            var objWithSameName = await _sycEntityObjectCategoryRepository.FirstOrDefaultAsync(x => x.Name.ToUpper() == categoryName.ToUpper() && x.TenantId==AbpSession.TenantId);
            if (objWithSameName != null)
                return true;
            return false;
        }
        //T-SII-20220919.0001,1 MMT 12/20/2022 Add an API to validate if the entered name is already entered before or not[End]

        [AbpAuthorize(AppPermissions.Pages_SycEntityObjectCategories_Create, AppPermissions.Pages_AppItems_Create, AppPermissions.Pages_AppItems_Edit)]
        protected virtual async Task 
            Create(CreateOrEditSycEntityObjectCategoryDto input)
        {
            var sycEntityObjectCategory = ObjectMapper.Map<SycEntityObjectCategory>(input);

            sycEntityObjectCategory.TenantId = AbpSession.TenantId;
            if (string.IsNullOrEmpty(input.Code))
            { input.Code = Guid.NewGuid().ToString(); }

            await _sycEntityObjectCategoryRepository.InsertAsync(sycEntityObjectCategory);
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
            var cat = await _lookup_sydObjectRepository.FirstOrDefaultAsync(a => a.Code == "CATEGORY");
            if (cat != null)
                _sycEntityLocalizeAppService.CreateOrUpdateLocalization(cat.Id, sycEntityObjectCategory.Id, "ENG", "Name", input.Name);
            //xx
        }

        [AbpAuthorize(AppPermissions.Pages_SycEntityObjectCategories_Edit, AppPermissions.Pages_AppItems_Create, AppPermissions.Pages_AppItems_Edit)]
        protected virtual async Task Update(CreateOrEditSycEntityObjectCategoryDto input)
        {
            await CheckParentAllowed((int)input.Id, input.ParentId);

            var sycEntityObjectCategory = await _sycEntityObjectCategoryRepository.FirstOrDefaultAsync(x => x.Id == input.Id && (x.TenantId == AbpSession.TenantId || x.TenantId == null));
            ObjectMapper.Map(input, sycEntityObjectCategory);
            //xx
            var cat = await _lookup_sydObjectRepository.FirstOrDefaultAsync(a => a.Code == "CATEGORY");
            if (cat != null)
                _sycEntityLocalizeAppService.CreateOrUpdateLocalization(cat.Id, sycEntityObjectCategory.Id, "ENG", "Name", input.Name);
            //xx
        }
        //Iteration#42 08/20/2024 MMT Add new APIs to create transaction categories[Start]
        public async Task CreateOrEditForObjectTransaction(CreateOrEditSycEntityObjectCategoryDto input)
        {
            input.ObjectId = await _helper.SystemTables.GetObjectTransactionId();

            if (input.Id == null)
            {
                await Create(input);
            }
            else
            {
                await Update(input);
            }

        }
        //Iteration#42 08/20/2024 MMT Add new APIs to create transaction categories[End]
        public async Task CreateOrEditForObjectProduct(CreateOrEditSycEntityObjectCategoryDto input)
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
        [AbpAuthorize(AppPermissions.Pages_SycEntityObjectCategories_Delete)]
        public async Task Delete(EntityDto input)
        {
            await _sycEntityObjectCategoryRepository.DeleteAsync(x => (x.Id == input.Id || x.ParentId == input.Id) && (x.TenantId == AbpSession.TenantId || x.TenantId == null) );
        }

        public async Task<FileDto> GetSycEntityObjectCategoriesToExcel(GetAllSycEntityObjectCategoriesForExcelInput input)
        {

            var filteredSycEntityObjectCategories = _sycEntityObjectCategoryRepository.GetAll()
                        .Include(e => e.ObjectFk)
                        .Include(e => e.ParentFk)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter) || e.Name.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name == input.NameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SydObjectNameFilter), e => e.ObjectFk != null && e.ObjectFk.Name == input.SydObjectNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycEntityObjectCategoryNameFilter), e => e.ParentFk != null && e.ParentFk.Name == input.SycEntityObjectCategoryNameFilter)
                         .Where(x => x.TenantId == AbpSession.TenantId || x.TenantId == null);

            var query = (from o in filteredSycEntityObjectCategories
                         join o1 in _lookup_sydObjectRepository.GetAll() on o.ObjectId equals o1.Id into j1
                         from s1 in j1.DefaultIfEmpty()

                         join o2 in _lookup_sycEntityObjectCategoryRepository.GetAll() on o.ParentId equals o2.Id into j2
                         from s2 in j2.DefaultIfEmpty()

                         select new GetSycEntityObjectCategoryForViewDto()
                         {
                             SycEntityObjectCategory = new SycEntityObjectCategoryDto
                             {
                                 Code = o.Code,
                                 Name = o.Name,
                                 Id = o.Id
                             },
                             SydObjectName = s1 == null ? "" : s1.Name.ToString(),
                             SycEntityObjectCategoryName = s2 == null ? "" : s2.Name.ToString()
                         });


            var sycEntityObjectCategoryListDtos = await query.ToListAsync();

            return _sycEntityObjectCategoriesExcelExporter.ExportToFile(sycEntityObjectCategoryListDtos);
        }


        [AbpAuthorize(AppPermissions.Pages_SycEntityObjectCategories)]
        public async Task<List<SycEntityObjectCategorySydObjectLookupTableDto>> GetAllSydObjectForTableDropdown()
        {
            return await _lookup_sydObjectRepository.GetAll()
                .Select(sydObject => new SycEntityObjectCategorySydObjectLookupTableDto
                {
                    Id = sydObject.Id,
                    DisplayName = sydObject.Name.ToString()
                }).ToListAsync();
        }

        [AbpAuthorize(AppPermissions.Pages_SycEntityObjectCategories)]
        public async Task<List<SycEntityObjectCategorySycEntityObjectCategoryLookupTableDto>> GetAllSycEntityObjectCategoryForTableDropdown()
        {
            return await _lookup_sycEntityObjectCategoryRepository.GetAll().Where(x => x.TenantId == AbpSession.TenantId || x.TenantId == null)
                .Select(sycEntityObjectCategory => new SycEntityObjectCategorySycEntityObjectCategoryLookupTableDto
                {
                    Id = sycEntityObjectCategory.Id,
                    DisplayName = sycEntityObjectCategory.Name.ToString()
                }).ToListAsync();
        }

        private async Task<bool> CheckParentAllowed(int recordId, int? parentId)
        {
            parentId = parentId == null ? 0 : parentId;

            if (parentId != 0)
            {
                var obj = await _sycEntityObjectCategoryRepository.FirstOrDefaultAsync(x => x.Id == parentId);

                if (obj.ParentId == recordId)
                    throw new UserFriendlyException("Ooppps! cannot make the record child to itself...");

                while (obj.ParentId != null && obj.ParentId != 0)
                {
                    obj = await _sycEntityObjectCategoryRepository.FirstOrDefaultAsync(x => x.Id == (int)obj.ParentId);
                    if (obj.ParentId == recordId)
                        throw new UserFriendlyException("Ooppps! cannot make the record child to itself...");
                }

            }

            return true;
        }
        //MMT36
        [AbpAllowAnonymous]
        public async Task<PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>>> GetAllWithChildsForTransactionWithPaging(GetAllSycEntityObjectCategoriesInput tmpInput)
        {
            tmpInput.ObjectId = await _helper.SystemTables.GetObjectTransactionId();

            if (tmpInput.EntityId != 0)
            {
                tmpInput.ExcludeIds = new List<long>();
                if (tmpInput.DepartmentFlag)
                {
                    var EntityRelated = await _appEntitiesAppService.GetAppEntityDepartmentsWithPaging(new GetAppEntityAttributesInput { EntityId = tmpInput.EntityId });
                    if (EntityRelated != null && EntityRelated.TotalCount > 0)
                    {
                        tmpInput.ExcludeIds.AddRange(EntityRelated.Items.Select(r => r.EntityObjectCategoryId).ToList());
                    }
                }
                else
                {
                    var EntityRelated = await _appEntitiesAppService.GetAppEntityCategoriesWithPaging(new GetAppEntityAttributesInput { EntityId = tmpInput.EntityId });
                    if (EntityRelated != null && EntityRelated.TotalCount > 0)
                    {
                        tmpInput.ExcludeIds.AddRange(EntityRelated.Items.Select(r => r.EntityObjectCategoryId).ToList());
                    }
                }
            }
            PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> allParents = await GetAll(tmpInput);
            return allParents;
        }
        //MMT36
        //MMT24
      
        private async Task<PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>>> GetAllDepartmentsByFilterWithChildsForProduct(string filter)
        {
            GetAllSycEntityObjectCategoriesInput tmpInput = new GetAllSycEntityObjectCategoriesInput
            {
                MaxResultCount = 9999,
                SkipCount = 0,
                ObjectId = await _helper.SystemTables.GetObjectItemId()
               // Filter=filter
            };

            PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> allParents = await GetAll(tmpInput);
            foreach (var item in allParents.Items.Where(z=>!z.Leaf))
            {
                if (!item.Leaf)
                {
                    await LoadFilteredChilds(item,filter);
                }
                item.Expanded = true;
            }

            return allParents;

        }
        private async Task LoadFilteredChilds(TreeNode<GetSycEntityObjectCategoryForViewDto> parent, string filter)
        {
            parent.Children = await GetAllFilteredChilds(parent.Data.SycEntityObjectCategory.Id, filter);
           
            foreach (var item in parent.Children)
            {
                if (!item.Leaf)
                {
                    await LoadFilteredChilds(item, filter);
                }
                item.Expanded = true;
            }
            parent.Children = parent.Children.Where(z => z.Leaf || (!z.Leaf && z.Children != null && z.Children.Count > 0)).ToList();
        }
        private async Task<IReadOnlyList<TreeNode<GetSycEntityObjectCategoryForViewDto>>> GetAllFilteredChilds(long parentId,string filter)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var filteredSycEntityObjectCategories = _sycEntityObjectCategoryRepository.GetAll()
                        .Include(e => e.ObjectFk)
                        .Include(e => e.ParentFk)
                        .Include(e => e.SycEntityObjectCategories)
                        .Where(e => e.ParentId != null && e.ParentId == parentId)
                        .Where(e => e.TenantId == AbpSession.TenantId || e.TenantId == null);


                var sycEntityObjectCategories = from o in filteredSycEntityObjectCategories
                                                join o1 in _lookup_sydObjectRepository.GetAll() on o.ObjectId equals o1.Id into j1
                                                from s1 in j1.DefaultIfEmpty()

                                                join o2 in _lookup_sycEntityObjectCategoryRepository.GetAll() on o.ParentId equals o2.Id into j2
                                                from s2 in j2.DefaultIfEmpty()

                                                select new TreeNode<GetSycEntityObjectCategoryForViewDto>()
                                                {
                                                    Data = new GetSycEntityObjectCategoryForViewDto
                                                    {
                                                        SycEntityObjectCategory = new SycEntityObjectCategoryDto
                                                        {
                                                            Code = o.Code,
                                                            Name = o.Name,
                                                            Id = o.Id
                                                        },
                                                        SydObjectName = s1 == null ? "" : s1.Name.ToString(),
                                                        SycEntityObjectCategoryName = s2 == null ? "" : s2.Name.ToString()
                                                    },
                                                    Leaf = o.SycEntityObjectCategories.Count() == 0,
                                                    totalChildrenCount = o.SycEntityObjectCategories.Count(),
                                                    label = o.Name,
                                                    Expanded= true
                                                };


                var totalCount = await filteredSycEntityObjectCategories.CountAsync();

                var y = await sycEntityObjectCategories.Where(z =>!z.Leaf || (z.Leaf && z.Data.SycEntityObjectCategory.Name.Contains(filter))).ToListAsync();
               // var x = y.Where(z=>z.Leaf || (!z.Leaf &&  z.Children != null && z.Children.Count>0)).ToList();
                return y;
            }
        }
        //MMT24
    }
}