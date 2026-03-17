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
using Abp.Localization;
using DocumentFormat.OpenXml.Office2010.Excel;
using System.Globalization;

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
        //i50
        private readonly IRepository<ApplicationLanguageText, long> _lookup_ApplicationLanguageText;
        private readonly IApplicationLanguageManager _lookup_ApplicationLanguages;
        //I50
        public SycEntityObjectClassificationsAppService(IRepository<SycEntityObjectClassification, long> sycEntityObjectClassificationRepository,
            ISycEntityObjectClassificationsExcelExporter sycEntityObjectClassificationsExcelExporter, IRepository<SydObject, long> lookup_sydObjectRepository,
            IRepository<SycEntityObjectClassification, long> lookup_sycEntityObjectClassificationRepository, Helper helper, IAppEntitiesAppService appEntitiesAppService,
            ISycEntityLocalizationAppService sycEntityLocalizationAppService,IDbContextProvider<onetouchDbContext> dbContextProvider,
            IRepository<AppContact, long> appContactRepository, IRepository<ApplicationLanguageText, long> lookup_ApplicationLanguageText
            , IApplicationLanguageManager lookup_ApplicationLanguages)
        {
            //I50
            _lookup_ApplicationLanguageText = lookup_ApplicationLanguageText;
            _lookup_ApplicationLanguages = lookup_ApplicationLanguages;
            //I50
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
            var defaultLang = GetDefaultLanguage().Result;
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
                                                 join o3 in _lookup_ApplicationLanguageText.GetAll().Where(z => z.LanguageName == defaultLang) on ("SYCENTITYOBJECTCLASSIFICATIONS-NAME-" + o.Id.ToString() + "-" + o.Name).Trim().ToUpper() equals o3.Key into j5
                                                 from s6 in j5.DefaultIfEmpty()

                                                 join o4 in _lookup_ApplicationLanguageText.GetAll().Where(z => z.LanguageName == defaultLang) on (s2 != null ? "SYCENTITYOBJECTCLASSIFICATIONS-NAME-" + s2.Id.ToString() + "-" + s2.Name : "XXX").Trim().ToUpper() equals o4.Key into j4
                                                 from s4 in j4.DefaultIfEmpty()

                                                 //where s6.LanguageName == defaultLang && ((s2 != null && s4.LanguageName == defaultLang) || (s2 == null))
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
                                                         // SycEntityObjectClassificationName = s2 == null ? "" : s2.Name.ToString()
                                                         SycEntityObjectClassificationName = s2 == null ? "" : s4 == null ? s2.Name.ToString() : s4.Value,
                                                     },
                                                     Leaf = o.SycEntityObjectClassifications.Count() == 0,
                                                     totalChildrenCount = o.SycEntityObjectClassifications.Count(),
                                                     //label = o.Name
                                                     label = s6 == null ? o.Name : s6.Value.Trim()
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
            var objWithSameName = await _sycEntityObjectClassificationRepository.FirstOrDefaultAsync(x => x.Name.ToUpper() == classificationName.ToUpper() && x.TenantId == AbpSession.TenantId);
            if (objWithSameName != null)
                return true;
            return false;
        }
        //T-SII-20220919.0001,1 MMT 12/20/2022 Add an API to validate if the entered name is already entered before or not[End]
        public async Task<string> GetDefaultLanguage()
        {
            return CultureInfo.CurrentUICulture.Name;
            string name = "en";
            var defaultLanguage = await _lookup_ApplicationLanguages.GetDefaultLanguageOrNullAsync(AbpSession.TenantId);
            if (defaultLanguage != null) { name = defaultLanguage.Name; }
            return name;
        }
        public async Task<IReadOnlyList<TreeNode<GetSycEntityObjectClassificationForViewDto>>> GetAllChilds(long parentId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var defaultLang = GetDefaultLanguage().Result;
                var filteredSycEntityObjectClassifications = _sycEntityObjectClassificationRepository.GetAll()
                        .Include(e => e.ObjectFk)
                        .Include(e => e.ParentFk)
                        .Include(e => e.SycEntityObjectClassifications)
                        .Where(e => e.ParentId != null && e.ParentId == parentId)
                        .Where(e => e.TenantId == AbpSession.TenantId || e.TenantId == null);

                var sycEntityObjectClassifications = from o in filteredSycEntityObjectClassifications
                                                     join o1 in _lookup_sydObjectRepository.GetAll() on o.ObjectId equals o1.Id into j1
                                                     from s1 in j1.DefaultIfEmpty()
                                                     join o3 in _lookup_ApplicationLanguageText.GetAll() on ("SYCENTITYOBJECTCLASSIFICATIONS-NAME-" + o.Id.ToString() + "-" + o.Name).Trim().ToUpper() equals o3.Key into j3
                                                     from s3 in j3.DefaultIfEmpty()
                                                     join o2 in _lookup_sycEntityObjectClassificationRepository.GetAll() on o.ParentId equals o2.Id into j2
                                                     from s2 in j2.DefaultIfEmpty()
                                                     join o4 in _lookup_ApplicationLanguageText.GetAll() on (s2 != null ? "SYCENTITYOBJECTCLASSIFICATIONS-NAME-" + s2.Id.ToString() + "-" + s2.Name : "XXX").Trim().ToUpper() equals o4.Key into j4
                                                     from s4 in j4.DefaultIfEmpty()
                                                     where s3.LanguageName == defaultLang && ((s2 != null && s4.LanguageName == defaultLang) || (s2 == null))
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
                                                             //SycEntityObjectClassificationName = s2 == null ? "" : s2.Name.ToString()
                                                             SycEntityObjectClassificationName = s2 == null ? "" : s4 == null ? s2.Name.ToString() : s4.Value.Trim(),
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
                var defaultLang = GetDefaultLanguage().Result;
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
                                                         //I50
                                                     join o3 in _lookup_ApplicationLanguageText.GetAll() on ("SYCENTITYOBJECTCLASSIFICATIONS-NAME-" + o.Id.ToString() + "-" + o.Name).Trim().ToUpper() equals o3.Key into j3
                                                     from s3 in j3.DefaultIfEmpty()

                                                     join o4 in _lookup_ApplicationLanguageText.GetAll() on (s2 != null ? "SYCENTITYOBJECTCLASSIFICATIONS-NAME-" + s2.Id.ToString() + "-" + s2.Name : "XXX").Trim().ToUpper() equals o4.Key into j4
                                                     from s4 in j4.DefaultIfEmpty()

                                                     where s3.LanguageName == defaultLang && ((s2 != null && s4.LanguageName == defaultLang) || (s2 == null))

                                                     //I50
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
                                                             //SycEntityObjectClassificationName = s2 == null ? "" : s2.Name.ToString()
                                                             SycEntityObjectClassificationName = s2 == null ? "" : s4 == null ? s2.Name.ToString() : s4.Value,
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
        //Iteration43,1 MMT 08/21/2024 Add Api to get all classifications with children[Start]
        [AbpAllowAnonymous]
        public async Task<PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>>> GetAllWithChildsForTransaction()
        {
            GetAllSycEntityObjectClassificationsInput tmpInput = new GetAllSycEntityObjectClassificationsInput
            {
                MaxResultCount = 9999,
                SkipCount = 0,
                ObjectId = await _helper.SystemTables.GetObjectTransactionId()
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
        //[End]
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
            //I50
            if (output.SycEntityObjectClassification != null)
            {

                var Key = ("SYCENTITYOBJECTCLASSIFICATIONS-NAME-" + output.SycEntityObjectClassification.Id.ToString() + "-" + output.SycEntityObjectClassification.Name).Trim().ToUpper();
                output.SycEntityObjectClassificationName = L(Key);
            }
            //I50
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
            //I50
            if (output.SycEntityObjectClassification != null)
            {

                var Key = ("SYCENTITYOBJECTCLASSIFICATIONS-NAME-" + output.SycEntityObjectClassification.Id.ToString() + "-" + output.SycEntityObjectClassification.Name).Trim().ToUpper();
                output.SycEntityObjectClassificationName = L(Key);
            }
            //I50
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
        //Iteration#42 08/20/2024 MMT Add new APIs to create transaction categories[Start]
        public async Task CreateOrEditForObjectTransaction(CreateOrEditSycEntityObjectClassificationDto input)
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

            var id =await _sycEntityObjectClassificationRepository.InsertAsync(sycEntityObjectClassification);
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
            #region add to translation
            string word = input.Name;
            var languagesList = _lookup_ApplicationLanguages.GetLanguages(AbpSession.TenantId).ToList();
            if (languagesList != null)
            {
                foreach (var lang in languagesList.Select(e => e.Name).ToList())
                {
                    ApplicationLanguageText entity = new ApplicationLanguageText();
                    entity.Key = ("SYCENTITYOBJECTCLASSIFICATIONS-NAME-" + id.ToString() + "-" + input.Name).Trim().ToUpper();
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

        [AbpAuthorize(AppPermissions.Pages_SycEntityObjectClassifications_Edit, AppPermissions.Pages_AppItems_Create, AppPermissions.Pages_AppItems_Edit)]
        protected virtual async Task Update(CreateOrEditSycEntityObjectClassificationDto input)
        {

            await CheckParentAllowed((int)input.Id, input.ParentId);

            var sycEntityObjectClassification = await _sycEntityObjectClassificationRepository.FirstOrDefaultAsync((int)input.Id);
            string oldWord = sycEntityObjectClassification.Name;
            ObjectMapper.Map(input, sycEntityObjectClassification);
            //xx
            var classification = await _lookup_sydObjectRepository.FirstOrDefaultAsync(a => a.Code == "CLASSIFICATION");
            if (classification != null)
                _sycEntityLocalizeAppService.CreateOrUpdateLocalization(classification.Id, sycEntityObjectClassification.Id, "ENG", "Name", input.Name);
            //xx
            #region add to translation
            string word = input.Name;

            ApplicationLanguageText entity = new ApplicationLanguageText();
            string oldKey = ("SYCENTITYOBJECTCLASSIFICATIONS-NAME-" + sycEntityObjectClassification.Id.ToString() + "-" + oldWord).Trim().ToUpper();

            var languagesList = _lookup_ApplicationLanguages.GetLanguages(AbpSession.TenantId).ToList();
            if (languagesList != null)
            {
                foreach (var lang in languagesList.Select(e => e.Name).ToList())
                {
                    var oldRecord = _lookup_ApplicationLanguageText.FirstOrDefaultAsync(e => e.Key == oldKey && e.LanguageName == lang).Result;
                    if (oldRecord != null && oldRecord.Id > 0)
                    {
                        oldRecord.Key = ("SYCENTITYOBJECTCLASSIFICATIONS-NAME-" + sycEntityObjectClassification.Id.ToString() + "-" + input.Name).Trim().ToUpper();
                        oldRecord.Value = word;
                        oldRecord.TenantId = AbpSession.TenantId;
                        await _lookup_ApplicationLanguageText.UpdateAsync(oldRecord);
                    }
                    else
                    {
                        ApplicationLanguageText newRecord = new ApplicationLanguageText();
                        newRecord.Key = ("SYCENTITYOBJECTCLASSIFICATIONS-NAME-" + sycEntityObjectClassification.Id.ToString() + "-" + input.Name).Trim().ToUpper();
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