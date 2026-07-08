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
using Abp.Localization;
using Microsoft.CodeAnalysis;
using DocumentFormat.OpenXml.Office2010.Excel;
using System.Globalization;
using Abp.EntityFrameworkCore.Uow;
using onetouch.AppMarketplaceContacts;

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
        //i50
        private readonly IRepository<ApplicationLanguageText, long> _lookup_ApplicationLanguageText;
        private readonly IApplicationLanguageManager _lookup_ApplicationLanguages;
        //I50
        public SycEntityObjectCategoriesAppService(IRepository<SycEntityObjectCategory, long> sycEntityObjectCategoryRepository,
            ISycEntityObjectCategoriesExcelExporter sycEntityObjectCategoriesExcelExporter, IRepository<SydObject, long> lookup_sydObjectRepository, 
            IRepository<SycEntityObjectCategory, long> lookup_sycEntityObjectCategoryRepository, Helper helper, IAppEntitiesAppService appEntitiesAppService,
            SycEntityLocalizationAppService sycEntityLocalizationAppService, IRepository<AppContact, long> appContactRepository,
            IDbContextProvider<onetouchDbContext> dbContextProvider, IRepository<ApplicationLanguageText, long> lookup_ApplicationLanguageText
            , IApplicationLanguageManager lookup_ApplicationLanguages)
        {
            //I50
            _lookup_ApplicationLanguageText = lookup_ApplicationLanguageText;
            _lookup_ApplicationLanguages = lookup_ApplicationLanguages;
            //I50
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

                //I50[Start]
                IQueryable<SycEntityObjectCategory> filteredCategories = null;
                if (!string.IsNullOrEmpty(input.FilterCondition))
                {
                    var contxt = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);
                    string jsonFilter = input.FilterCondition;

                    var filterCondition = Helper.ApplyJsonFilter<SycEntityObjectCategory>(jsonFilter);//.ToList();
                    if (filterCondition != null)
                        filteredCategories = contxt.SycEntityObjectCategories.Where(filterCondition).Where(z => z.ParentId == null)
                            .OrderBy(input.Sorting ?? "id asc")
                            .Take(input.MaxResultCount);//.ToListAsync();

                }
                //I50[End]

                var defaultLang = GetDefaultLanguage().Result;
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

                IQueryable<TreeNode<GetSycEntityObjectCategoryForViewDto>> sycEntityObjectCategories = null;
                if (filteredCategories != null)
                {
                    sycEntityObjectCategories = from o in pagedAndFilteredSycEntityObjectCategories
                                                join q in filteredCategories on o.Id equals q.Id
                                                join o1 in _lookup_sydObjectRepository.GetAll() on o.ObjectId equals o1.Id into j1
                                                from s1 in j1.DefaultIfEmpty()

                                                join o2 in _lookup_sycEntityObjectCategoryRepository.GetAll() on o.ParentId equals o2.Id into j2
                                                from s2 in j2.DefaultIfEmpty()

                                                join s5 in _context.SycEntityLocalizations.Where(z => z.Language.ToUpper() == tenantLanguage.ToUpper() && z.ObjectTypeId == cat.Id) on s2.Id equals s5.ObjectId into j3
                                                from s3 in j3.DefaultIfEmpty()

                                                join o3 in _lookup_ApplicationLanguageText.GetAll() on ("SYCENTITYOBJECTCATEGORIES-NAME-" + o.Id.ToString() + "-" + o.Name).Trim().ToUpper() equals o3.Key into j5
                                                from s6 in j5.DefaultIfEmpty()

                                                join o4 in _lookup_ApplicationLanguageText.GetAll() on (s2 != null ? "SYCENTITYOBJECTCATEGORIES-NAME-" + s2.Id.ToString() + "-" + s2.Name : "XXX").Trim().ToUpper() equals o4.Key into j4
                                                from s4 in j4.DefaultIfEmpty()

                                                where s6.LanguageName == defaultLang && ((s2 != null && s4.LanguageName == defaultLang) || (s2 == null))
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
                                                        SydObjectName = s3.String == null ? (s1 == null ? "" : s1.Name.ToString()) : s3.String,
                                                        //SycEntityObjectCategoryName = s2 == null ? "" : s2.Name.ToString()
                                                        SycEntityObjectCategoryName = s2 == null ? "" : s4 == null ? s2.Name.ToString() : s4.Value,
                                                    },
                                                    Leaf = o.SycEntityObjectCategories.Count() == 0,
                                                    totalChildrenCount = o.SycEntityObjectCategories.Count(),
                                                    //label = o.Name
                                                    label = s6 == null ? o.Name : s6.Value.Trim()
                                                };
                }
                else
                {
                    sycEntityObjectCategories = from o in pagedAndFilteredSycEntityObjectCategories
                                                join o1 in _lookup_sydObjectRepository.GetAll() on o.ObjectId equals o1.Id into j1
                                                from s1 in j1.DefaultIfEmpty()

                                                join o2 in _lookup_sycEntityObjectCategoryRepository.GetAll() on o.Id equals o2.Id into j2
                                                from s2 in j2.DefaultIfEmpty()

                                                join s5 in _context.SycEntityLocalizations.Where(z => z.Language.ToUpper() == tenantLanguage.ToUpper() && z.ObjectTypeId == cat.Id) on s2.Id equals s5.ObjectId into j3
                                                from s3 in j3.DefaultIfEmpty()

                                                join o3 in _lookup_ApplicationLanguageText.GetAll().Where(z => z.LanguageName == defaultLang) on ("SYCENTITYOBJECTCATEGORIES-NAME-" + o.Id.ToString() + "-" + o.Name).Trim().ToUpper() equals o3.Key into j5
                                                from s6 in j5.DefaultIfEmpty()

                                                join o4 in _lookup_ApplicationLanguageText.GetAll().Where(z=>z.LanguageName== defaultLang) on (s2 != null ? "SYCENTITYOBJECTCATEGORIES-NAME-" + s2.Id.ToString() + "-" + s2.Name : "XXX").Trim().ToUpper() equals o4.Key into j4
                                                from s4 in j4.DefaultIfEmpty()

                                                //where s6.LanguageName == defaultLang && ((s2 != null && s4.LanguageName == defaultLang) || (s2 == null))

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
                                                        SydObjectName = s3.String == null ? (s1 == null ? "" : s1.Name.ToString()) : s3.String,
                                                        //SycEntityObjectCategoryName = s2 == null ? "" : s2.Name.ToString()
                                                        SycEntityObjectCategoryName = s2 == null ? "" : s4 == null ? s2.Name.ToString() : s4.Value,
                                                    },
                                                    Leaf = o.SycEntityObjectCategories.Count() == 0,
                                                    totalChildrenCount = o.SycEntityObjectCategories.Count(),
                                                    //label = o.Name
                                                    label = s6 == null ? o.Name : s6.Value.Trim()
                                                };
                }



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
            //T-SII-20250307.0003,1 MMT 09/25/2025 departments filter works only in the product add mode[Start]
            //if (tmpInput.EntityId == 0 && !string.IsNullOrEmpty(tmpInput.Filter))
            if (!string.IsNullOrEmpty(tmpInput.Filter))
            //T-SII-20250307.0003,1 MMT 09/25/2025 departments filter works only in the product add mode[End]
            {
                return await  GetAllDepartmentsByFilterWithChildsForProduct(tmpInput.Filter, tmpInput.IncludeResultCount);
            }
            //MMT2024
            PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> allParents = await GetAll(tmpInput);
            return tmpInput.IncludeResultCount
                ? await PrepareProductCategoryResult(allParents, tmpInput.ObjectId)
                : allParents;
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
        public async Task<string> GetDefaultLanguage()
        {
            return CultureInfo.CurrentUICulture.Name;
            string name = "en";
            var defaultLanguage = await _lookup_ApplicationLanguages.GetDefaultLanguageOrNullAsync(AbpSession.TenantId);
            if (defaultLanguage != null) { name = defaultLanguage.Name; }
            return name;
        }

        public async Task<PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>>> GetAllChildsWithPaging(GetAllSycEntityObjectCategoriesInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var defaultLang = GetDefaultLanguage().Result;
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
                                                    //I50
                                                join o3 in _lookup_ApplicationLanguageText.GetAll() on ("SYCENTITYOBJECTCATEGORIES-NAME-" + o.Id.ToString() + "-" + o.Name).Trim().ToUpper() equals o3.Key into j3
                                                from s3 in j3.DefaultIfEmpty()

                                                join o4 in _lookup_ApplicationLanguageText.GetAll() on (s2 != null ? "SYCENTITYOBJECTCATEGORIES-NAME-" + s2.Id.ToString() + "-" + s2.Name : "XXX").Trim().ToUpper() equals o4.Key into j4
                                                from s4 in j4.DefaultIfEmpty()

                                                where s3.LanguageName == defaultLang && ((s2 != null && s4.LanguageName == defaultLang) || (s2 == null))

                                                //I50

                                                select new TreeNode<GetSycEntityObjectCategoryForViewDto>()
                                                {
                                                    Data = new GetSycEntityObjectCategoryForViewDto
                                                    {
                                                        SycEntityObjectCategory = new SycEntityObjectCategoryDto
                                                        {
                                                            Code = o.Code,
                                                            Name = o.Name,
                                                            Id = o.Id,
                                                            ParentId = o.ParentId
                                                        },
                                                        SydObjectName = s1 == null ? "" : s1.Name.ToString(),
                                                        //SycEntityObjectCategoryName = s2 == null ? "" : s2.Name.ToString()
                                                        SycEntityObjectCategoryName = s2 == null ? "" : s4 == null ? s2.Name.ToString() : s4.Value,
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
                var defaultLang = GetDefaultLanguage().Result;
                var filteredSycEntityObjectCategories = _sycEntityObjectCategoryRepository.GetAll()
                        .Include(e => e.ObjectFk)
                        .Include(e => e.ParentFk)
                        .Include(e => e.SycEntityObjectCategories)
                        .Where(e => e.ParentId != null && e.ParentId == parentId)
                        .Where(e => e.TenantId == AbpSession.TenantId || e.TenantId == null);


                var sycEntityObjectCategories = from o in filteredSycEntityObjectCategories
                                                join o1 in _lookup_sydObjectRepository.GetAll() on o.ObjectId equals o1.Id into j1
                                                from s1 in j1.DefaultIfEmpty()
                                                join o3 in _lookup_ApplicationLanguageText.GetAll() on("SYCENTITYOBJECTCATEGORIES-NAME-" + o.Id.ToString() + "-" + o.Name).Trim().ToUpper() equals o3.Key into j3
                                                from s3 in j3.DefaultIfEmpty()
                                                join o2 in _lookup_sycEntityObjectCategoryRepository.GetAll() on o.ParentId equals o2.Id into j2
                                                from s2 in j2.DefaultIfEmpty()
                                                join o4 in _lookup_ApplicationLanguageText.GetAll() on(s2 != null ? "SYCENTITYOBJECTCATEGORIES-NAME-" + s2.Id.ToString() + "-" + s2.Name : "XXX").Trim().ToUpper() equals o4.Key into j4
                                                from s4 in j4.DefaultIfEmpty()
                                                where s3.LanguageName == defaultLang && ((s2 != null && s4.LanguageName == defaultLang) || (s2 == null))
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
                                                        //SycEntityObjectCategoryName = s2 == null ? "" : s2.Name.ToString()
                                                        SycEntityObjectCategoryName = s2 == null ? "" : s4 == null ? s2.Name.ToString() : s4.Value.Trim(),
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
        [AbpAllowAnonymous]
        public async Task<GetSycEntityObjectCategoryForViewDto> GetSycEntityObjectCategoryForView(int id)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
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
                //I50
                if (output.SycEntityObjectCategory != null)
                {

                    var Key = ("SYCENTITYOBJECTCATEGORIES-NAME-" + output.SycEntityObjectCategory.Id.ToString() + "-" + output.SycEntityObjectCategory.Name).Trim().ToUpper();
                    output.SycEntityObjectCategoryName = L(Key);
                }
                //I50

                return output;
            }
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
            //I50
            if (output.SycEntityObjectCategory != null)
            {

                var Key = ("SYCENTITYOBJECTCATEGORIES-NAME-" + output.SycEntityObjectCategory.Id.ToString() + "-" + output.SycEntityObjectCategory.Name).Trim().ToUpper();
                output.SycEntityObjectCategoryName = L(Key);
            }
            //I50
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

            var id = await _sycEntityObjectCategoryRepository.InsertAsync(sycEntityObjectCategory);
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
            #region add to translation
            string word = input.Name;
            var languagesList = _lookup_ApplicationLanguages.GetLanguages(AbpSession.TenantId).ToList();
            if (languagesList != null)
            {
                foreach (var lang in languagesList.Select(e => e.Name).ToList())
                {
                    ApplicationLanguageText entity = new ApplicationLanguageText();
                    entity.Key = ("SYCENTITYOBJECTCATEGORIES-NAME-" + id.ToString() + "-" + input.Name).Trim().ToUpper();
                    entity.Source = "onetouch";
                    entity.Value = word;
                    entity.LanguageName = lang;
                    entity.TenantId = AbpSession.TenantId;
                    await _lookup_ApplicationLanguageText.InsertAsync(entity);
                }
            }
            //string ArString = TranslateText(word, "en", "ar");

            #endregion add to translation
        }

        [AbpAuthorize(AppPermissions.Pages_SycEntityObjectCategories_Edit, AppPermissions.Pages_AppItems_Create, AppPermissions.Pages_AppItems_Edit)]
        protected virtual async Task Update(CreateOrEditSycEntityObjectCategoryDto input)
        {
            await CheckParentAllowed((int)input.Id, input.ParentId);

            var sycEntityObjectCategory = await _sycEntityObjectCategoryRepository.FirstOrDefaultAsync(x => x.Id == input.Id && (x.TenantId == AbpSession.TenantId || x.TenantId == null));
            string oldWord = sycEntityObjectCategory.Name;
            ObjectMapper.Map(input, sycEntityObjectCategory);
            //xx
            var cat = await _lookup_sydObjectRepository.FirstOrDefaultAsync(a => a.Code == "CATEGORY");
            if (cat != null)
                _sycEntityLocalizeAppService.CreateOrUpdateLocalization(cat.Id, sycEntityObjectCategory.Id, "ENG", "Name", input.Name);
            //xx
            #region add to translation
            string word = input.Name;

            ApplicationLanguageText entity = new ApplicationLanguageText();
            string oldKey = ("SYCENTITYOBJECTCATEGORIES-NAME-" + sycEntityObjectCategory.Id.ToString() + "-" + oldWord).Trim().ToUpper();

            var languagesList = _lookup_ApplicationLanguages.GetLanguages(AbpSession.TenantId).ToList();
            if (languagesList != null)
            {
                foreach (var lang in languagesList.Select(e => e.Name).ToList())
                {
                    var oldRecord = _lookup_ApplicationLanguageText.FirstOrDefaultAsync(e => e.Key == oldKey && e.LanguageName == lang).Result;
                    if (oldRecord != null && oldRecord.Id > 0)
                    {
                        oldRecord.Key = ("SYCENTITYOBJECTCATEGORIES-NAME-" + sycEntityObjectCategory.Id.ToString() + "-" + input.Name).Trim().ToUpper();
                        oldRecord.Value = word;
                        oldRecord.TenantId = AbpSession.TenantId;
                        await _lookup_ApplicationLanguageText.UpdateAsync(oldRecord);
                    }
                    else
                    {
                        ApplicationLanguageText newRecord = new ApplicationLanguageText();
                        newRecord.Key = ("SYCENTITYOBJECTCATEGORIES-NAME-" + sycEntityObjectCategory.Id.ToString() + "-" + input.Name).Trim().ToUpper();
                        newRecord.Source = "onetouch";
                        newRecord.Value = word;
                        newRecord.LanguageName = lang;
                        newRecord.TenantId = AbpSession.TenantId;
                        await _lookup_ApplicationLanguageText.InsertAsync(newRecord);
                    }
                }
            }
            //string ArString = TranslateText(word, "en", "ar");

            #endregion add to translation
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
      
        private async Task<PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>>> GetAllDepartmentsByFilterWithChildsForProduct(string filter, bool includeResultCount)
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

            return includeResultCount
                ? await PrepareProductCategoryResult(allParents, tmpInput.ObjectId)
                : allParents;

        }
        private async Task<PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>>> PrepareProductCategoryResult(PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> categories, long itemObjectId)
        {
            await SetProductResultCounts(categories.Items, itemObjectId);

            var items = NormalizeProductCategoryNodes(categories.Items)
                .Where(z => z.resultCount != 0)
                .ToList();
            SetProductCategoryLabels(items);

            return new PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>>(items.Count, items);
        }

        private async Task SetProductResultCounts(IReadOnlyList<TreeNode<GetSycEntityObjectCategoryForViewDto>> categories, long itemObjectId)
        {
            if (categories == null || categories.Count == 0)
            {
                return;
            }

            var categoryNodes = categories
                .SelectMany(GetTreeNodes)
                .Where(z => z?.Data?.SycEntityObjectCategory != null)
                .ToList();

            var categoryIds = categoryNodes
                .Select(z => z.Data.SycEntityObjectCategory.Id)
                .Distinct()
                .ToList();

            if (categoryIds.Count == 0)
            {
                return;
            }

            var productCounts = await _context.AppEntityCategories
                .AsNoTracking()
                .Where(z => categoryIds.Contains(z.EntityObjectCategoryId) && z.EntityFk.ObjectId == itemObjectId)
                .GroupBy(z => z.EntityObjectCategoryId)
                .Select(z => new
                {
                    CategoryId = z.Key,
                    ResultCount = z.Select(r => r.EntityId).Distinct().LongCount()
                })
                .ToDictionaryAsync(z => z.CategoryId, z => z.ResultCount);

            foreach (var category in categoryNodes)
            {
                category.resultCount = productCounts.TryGetValue(category.Data.SycEntityObjectCategory.Id, out var resultCount) ? resultCount : 0;
            }
        }

        private IReadOnlyList<TreeNode<GetSycEntityObjectCategoryForViewDto>> NormalizeProductCategoryNodes(IReadOnlyList<TreeNode<GetSycEntityObjectCategoryForViewDto>> categories)
        {
            return (categories ?? new List<TreeNode<GetSycEntityObjectCategoryForViewDto>>())
                .Where(z => z?.Data?.SycEntityObjectCategory != null)
                .GroupBy(z => z.Data.SycEntityObjectCategory.Id)
                .Select(z =>
                {
                    var category = z.First();
                    if (category.Children != null)
                    {
                        category.Children = NormalizeProductCategoryNodes(category.Children)
                            .Where(c => c.resultCount != 0)
                            .ToList();
                    }

                    return category;
                })
                .ToList();
        }

        private void SetProductCategoryLabels(IReadOnlyList<TreeNode<GetSycEntityObjectCategoryForViewDto>> categories)
        {
            foreach (var category in categories ?? new List<TreeNode<GetSycEntityObjectCategoryForViewDto>>())
            {
                if (category.resultCount > 0)
                {
                    category.label = $"{GetProductCategoryBaseLabel(category)} ({category.resultCount})";
                }

                if (category.Children != null)
                {
                    SetProductCategoryLabels(category.Children);
                }
            }
        }

        private string GetProductCategoryBaseLabel(TreeNode<GetSycEntityObjectCategoryForViewDto> category)
        {
            var label = string.IsNullOrWhiteSpace(category.label)
                ? category.Data?.SycEntityObjectCategory?.Name
                : category.label;

            if (string.IsNullOrWhiteSpace(label))
            {
                return string.Empty;
            }

            return System.Text.RegularExpressions.Regex.Replace(label, @"\s\(\d+\)$", string.Empty);
        }

        private IEnumerable<TreeNode<GetSycEntityObjectCategoryForViewDto>> GetTreeNodes(TreeNode<GetSycEntityObjectCategoryForViewDto> category)
        {
            if (category == null)
            {
                yield break;
            }

            yield return category;

            if (category.Children == null)
            {
                yield break;
            }

            foreach (var child in category.Children.SelectMany(GetTreeNodes))
            {
                yield return child;
            }
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
