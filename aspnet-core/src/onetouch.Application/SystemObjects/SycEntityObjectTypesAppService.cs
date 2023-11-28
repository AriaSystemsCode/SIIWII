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
using System.Xml.Serialization;
using System.IO;
using onetouch.AppItems.Dtos;
using onetouch.Helpers;
using Abp.Domain.Uow;
using onetouch.AppEntities.Dtos;
using onetouch.SycIdentifierDefinitions;
using Abp.Localization;
using onetouch.Localization;

namespace onetouch.SystemObjects
{

    public class SycEntityObjectTypesAppService : onetouchAppServiceBase, ISycEntityObjectTypesAppService
    {
        private readonly IRepository<SycEntityObjectType, long> _sycEntityObjectTypeRepository;
        private readonly ISycEntityObjectTypesExcelExporter _sycEntityObjectTypesExcelExporter;
        private readonly IRepository<SydObject, long> _lookup_sydObjectRepository;
        private readonly IRepository<SycEntityObjectType, long> _lookup_sycEntityObjectTypeRepository;
        private readonly IRepository<SycIdentifierDefinition, long> _lookup_SycIdentifierDefinitionRepository;
        private readonly IRepository<ApplicationLanguageText, long> _lookup_ApplicationLanguageText;
        private readonly IApplicationLanguageManager _lookup_ApplicationLanguages;
        //private readonly ILanguageAppService _languageAppService;
        private readonly Helper _helper;

        public SycEntityObjectTypesAppService(IRepository<SycEntityObjectType, long> sycEntityObjectTypeRepository, ISycEntityObjectTypesExcelExporter sycEntityObjectTypesExcelExporter, IRepository<SydObject, long> lookup_sydObjectRepository, IRepository<SycEntityObjectType, long> lookup_sycEntityObjectTypeRepository, Helper helper,
            IRepository<SycIdentifierDefinition, long> lookup_SycIdentifierDefinitionRepository
            , IRepository<ApplicationLanguageText, long> lookup_ApplicationLanguageText
            , IApplicationLanguageManager lookup_ApplicationLanguages
            //, ILanguageAppService languageAppService
            )
        {
            _sycEntityObjectTypeRepository = sycEntityObjectTypeRepository;
            _sycEntityObjectTypesExcelExporter = sycEntityObjectTypesExcelExporter;
            _lookup_sydObjectRepository = lookup_sydObjectRepository;
            _lookup_sycEntityObjectTypeRepository = lookup_sycEntityObjectTypeRepository;
            _lookup_SycIdentifierDefinitionRepository = lookup_SycIdentifierDefinitionRepository;
            _lookup_ApplicationLanguageText = lookup_ApplicationLanguageText;
            _lookup_ApplicationLanguages = lookup_ApplicationLanguages;
            //_languageAppService = _languageAppService;
            _helper = helper;
        }
        public async Task<string> GetDefaultLanguage()
        {
            string name = "en";
            var defaultLanguage = await _lookup_ApplicationLanguages.GetDefaultLanguageOrNullAsync(AbpSession.TenantId);
            if (defaultLanguage != null) { name = defaultLanguage.Name; }
            return name;
        }
        public async Task<List<GetAllEntityObjectTypeOutput>> GetAllWithExtraAttributes(long id)
        {
            var list = await _lookup_sycEntityObjectTypeRepository.GetAll().Where(x => x.TenantId == null && (x.Id == id || id == 0)).ToListAsync();
            //           .Select(sycEntityObjectType => new GetAllEntityObjectTypeOutput
            //           {
            //               Id = sycEntityObjectType.Id,
            //               Code = sycEntityObjectType.Code.ToString(),
            //               Name = sycEntityObjectType.Name.ToString(),
            //ExtraAttributesString = sycEntityObjectType.ExtraAttributes.ToString(),
            //           }).ToListAsync();
            var newList = new List<GetAllEntityObjectTypeOutput>();
            foreach (var item in list)
            {
                var type = new GetAllEntityObjectTypeOutput();
                type.Id = item.Id;
                type.Name = item.Name;
                //MMT
                type.Code = item.Code;
                //MMT
                if (!string.IsNullOrEmpty(item.ExtraAttributes))
                {
                    // load xml ExtraData
                    var serializer = new XmlSerializer(typeof(ItemExtraAttributes));
                    ItemExtraAttributes result;
                    using (TextReader reader = new StringReader(item.ExtraAttributes))
                    {
                        result = (ItemExtraAttributes)serializer.Deserialize(reader);
                        type.ExtraAttributes = result;
                    }
                }
                newList.Add(type);

            }

            return newList;
        }

        public async Task<List<GetAllEntityObjectTypeOutput>> GetAllWithExtraAttributesByCode(string code)
        {
            var type = await _sycEntityObjectTypeRepository.FirstOrDefaultAsync(x => x.Code == code && (x.TenantId == null || x.TenantId == AbpSession.TenantId));
            //XX
            if (type ==null)
                return new List<GetAllEntityObjectTypeOutput>();
            //XX
            var list = await _lookup_sycEntityObjectTypeRepository.GetAll().Where(x => x.TenantId == null && (x.Code == code)).FirstOrDefaultAsync();
            if (list != null)
                return await GetAllWithExtraAttributes(list.Id);
            else
            {
                var x = new List<GetAllEntityObjectTypeOutput>();
                x.Add(new GetAllEntityObjectTypeOutput { Id = type.Id, Code = type.Code, Name = type.Name });

                return x;

            }
        }

        public async Task<PagedResultDto<TreeNode<GetSycEntityObjectTypeForViewDto>>> GetAll(GetAllSycEntityObjectTypesInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var defaultLang = GetDefaultLanguage().Result;

                var filteredSycEntityObjectTypes = _sycEntityObjectTypeRepository.GetAll()
                            .Include(e => e.ObjectFk)
                            .Include(e => e.ParentFk)
                            .Include(e => e.SycEntityObjectTypes)
                            .Include(e => e.SycIdentifierDefinitionFK)
                            .WhereIf(input.Hidden != null, e => e.Hidden == null || (e.Hidden != null && (bool)e.Hidden == (bool)input.Hidden))
                            .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter) || e.Name.Contains(input.Filter) || e.ExtraAttributes.Contains(input.Filter))
                            .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                            .WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name == input.NameFilter)
                            .WhereIf(!string.IsNullOrWhiteSpace(input.ExtraDataFilter), e => e.ExtraAttributes == input.ExtraDataFilter)
                            .WhereIf(!string.IsNullOrWhiteSpace(input.SydObjectNameFilter), e => e.ObjectFk != null && e.ObjectFk.Name == input.SydObjectNameFilter)
                            .WhereIf(input?.SydObjectIdFilter > 0, e => e.ObjectId == input.SydObjectIdFilter)
                            .WhereIf(!string.IsNullOrWhiteSpace(input.SycEntityObjectTypeNameFilter), e => e.ParentFk != null && e.ParentFk.Name == input.SycEntityObjectTypeNameFilter)
                            //MMT T-SII-20220901.0019 - General : search for word doesn't work in product type[Start]
                            //.WhereIf(input.ParentIds == null || input.ParentIds?.Length == 0, e => e.ParentId == null)
                            .WhereIf((input.ParentIds == null || input.ParentIds?.Length == 0) && string.IsNullOrWhiteSpace(input.Filter), e => e.ParentId == null)
                            //MMT T-SII-20220901.0019 - General : search for word doesn't work in product type[End]
                            .WhereIf(input.ParentIds?.Length > 0, e => input.ParentIds.Contains((long)e.ParentId))
                            .Where(x => x.TenantId == AbpSession.TenantId || x.TenantId == null);

                var pagedAndFilteredSycEntityObjectTypes = filteredSycEntityObjectTypes
                    .OrderBy(input.Sorting ?? "id asc")
                    .PageBy(input);

                var sycEntityObjectTypes = from o in pagedAndFilteredSycEntityObjectTypes
                                           join o1 in _lookup_sydObjectRepository.GetAll() on o.ObjectId equals o1.Id into j1
                                           from s1 in j1.DefaultIfEmpty()

                                           join o2 in _lookup_sycEntityObjectTypeRepository.GetAll() on o.ParentId equals o2.Id into j2
                                           from s2 in j2.DefaultIfEmpty()

                                           join o3 in _lookup_ApplicationLanguageText.GetAll() on ("SYCENTITYOBJECTTYPES-NAME-" + o.Id.ToString() + "-" + o.Name).Trim().ToUpper() equals o3.Key into j3
                                           from s3 in j3.DefaultIfEmpty()

                                           join o4 in _lookup_ApplicationLanguageText.GetAll() on (s2 != null ? "SYCENTITYOBJECTTYPES-NAME-" + s2.Id.ToString() + "-" + s2.Name : "XXX").Trim().ToUpper() equals o4.Key into j4
                                           from s4 in j4.DefaultIfEmpty()

                                           where s3.LanguageName == defaultLang && ((s2 != null && s4.LanguageName == defaultLang) || (s2 == null))

                                           select new TreeNode<GetSycEntityObjectTypeForViewDto>()
                                           {
                                               Data = new GetSycEntityObjectTypeForViewDto
                                               {
                                                   SycEntityObjectType = new SycEntityObjectTypeDto
                                                   {
                                                       Code = o.Code,
                                                       Name = s3 == null ? o.Name : s3.Value.Trim(),
                                                       ExtraAttributes = o.ExtraAttributes,
                                                       Id = o.Id
                                                   },
                                                   SydObjectName = s1 == null ? "" : s1.Name.ToString(),
                                                   SycEntityObjectTypeName = s2 == null ? "" : s4 == null ? s2.Name.ToString() : s4.Value,
                                                   IdentifierCode = o.SycIdentifierDefinitionFK == null ? "" : o.SycIdentifierDefinitionFK.Code,

                                               },
                                               Leaf = o.SycEntityObjectTypes.Count() == 0,
                                               label = s3 == null ? o.Name : s3.Value.Trim()
                                           };

                var totalCount = await filteredSycEntityObjectTypes.CountAsync();

                return new PagedResultDto<TreeNode<GetSycEntityObjectTypeForViewDto>>(
                    totalCount,
                    await sycEntityObjectTypes.ToListAsync()
                );
            }
        }

        public async Task<SelectItemDto[]> GetAllParentsIds()
        {
            var filteredSycEntityObjectTypes = await _sycEntityObjectTypeRepository.GetAll()
                .Where(x => x.ParentId != null)
                .GroupBy(x => new { parentID = x.ParentId, parentCode = x.ParentCode })
                .Select(x => new SelectItemDto { Label = x.Key.parentCode.ToString(), Value = x.Key.parentID.ToString() })
                .ToArrayAsync();
            return filteredSycEntityObjectTypes;
        }
        [AbpAllowAnonymous]
        public async Task<PagedResultDto<TreeNode<GetSycEntityObjectTypeForViewDto>>> GetAllWithChildsForProduct()
        {
            GetAllSycEntityObjectTypesInput tmpInput = new GetAllSycEntityObjectTypesInput
            {
                MaxResultCount = 9999,
                SkipCount = 0,
                SydObjectIdFilter = await _helper.SystemTables.GetObjectItemId(),
                Hidden = false,
            };

            PagedResultDto<TreeNode<GetSycEntityObjectTypeForViewDto>> allParents = await GetAll(tmpInput);
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
        public async Task<PagedResultDto<TreeNode<GetSycEntityObjectTypeForViewDto>>> GetAllWithChildsForProductWithPaging(GetAllSycEntityObjectTypesInput tempInput)
        {

            tempInput.SydObjectIdFilter = await _helper.SystemTables.GetObjectItemId();
            tempInput.Hidden = false;
            PagedResultDto<TreeNode<GetSycEntityObjectTypeForViewDto>> allParents = await GetAll(tempInput);
            //foreach (var item in allParents.Items)
            //{
            //	if (!item.Leaf)
            //	{
            //		await LoadChilds(item);
            //	}
            //}

            return allParents;

        }


        private async Task LoadChilds(TreeNode<GetSycEntityObjectTypeForViewDto> parent)
        {
            parent.Children = await GetAllChilds(parent.Data.SycEntityObjectType.Id);
            foreach (var item in parent.Children)
            {
                if (!item.Leaf)
                {
                    await LoadChilds(item);
                }
            }
        }

        [AbpAllowAnonymous]
        public async Task<IReadOnlyList<TreeNode<GetSycEntityObjectTypeForViewDto>>> GetAllChilds(long parentId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var defaultLang = GetDefaultLanguage().Result;
                var filteredSycEntityObjectCategories = _sycEntityObjectTypeRepository.GetAll()
                        .Include(e => e.ObjectFk)
                        .Include(e => e.ParentFk)
                        .Include(e => e.SycEntityObjectTypes)
                        .Where(e => e.ParentId != null && e.ParentId == parentId)
                        .Where(e => e.TenantId == AbpSession.TenantId || e.TenantId == null);


                var sycEntityObjectCategories = from o in filteredSycEntityObjectCategories
                                                join o1 in _lookup_sydObjectRepository.GetAll() on o.ObjectId equals o1.Id into j1
                                                from s1 in j1.DefaultIfEmpty()

                                                join o2 in _sycEntityObjectTypeRepository.GetAll() on o.ParentId equals o2.Id into j2
                                                from s2 in j2.DefaultIfEmpty()

                                                join o3 in _lookup_ApplicationLanguageText.GetAll() on ("SYCENTITYOBJECTTYPES-NAME-" + o.Id.ToString() + "-" + o.Name).Trim().ToUpper() equals o3.Key into j3
                                                from s3 in j3.DefaultIfEmpty()

                                                join o4 in _lookup_ApplicationLanguageText.GetAll() on (s2 != null ? "SYCENTITYOBJECTTYPES-NAME-" + s2.Id.ToString() + "-" + s2.Name : "XXX").Trim().ToUpper() equals o4.Key into j4
                                                from s4 in j4.DefaultIfEmpty()

                                                where s3.LanguageName == defaultLang && ((s2 != null && s4.LanguageName == defaultLang) || (s2 == null))

                                                select new TreeNode<GetSycEntityObjectTypeForViewDto>()
                                                {
                                                    Data = new GetSycEntityObjectTypeForViewDto
                                                    {
                                                        SycEntityObjectType = new SycEntityObjectTypeDto
                                                        {
                                                            Code = o.Code,
                                                            Name = s3 == null ? o.Name : s3.Value.Trim(),
                                                            ExtraAttributes = o.ExtraAttributes,
                                                            Id = o.Id
                                                        },
                                                        SydObjectName = s1 == null ? "" : s1.Name.ToString(),
                                                        SycEntityObjectTypeName = s2 == null ? "" : s4 == null ? s2.Name.ToString() : s4.Value,
                                                        IdentifierCode = o.SycIdentifierDefinitionFK == null ? "" : o.SycIdentifierDefinitionFK.Code,

                                                    },
                                                    Leaf = o.SycEntityObjectTypes.Count() == 0,
                                                    label = s3 == null ? o.Name : s3.Value.Trim()
                                                };


                var totalCount = await filteredSycEntityObjectCategories.CountAsync();

                var x = await sycEntityObjectCategories.ToListAsync();

                return x;
            }

        }

        [AbpAllowAnonymous]
        public async Task<PagedResultDto<TreeNode<GetSycEntityObjectTypeForViewDto>>> GetAllChildsWithPaging(GetAllChildsWithPagingInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var defaultLang = GetDefaultLanguage().Result;
                var filteredSycEntityObjectTypes = _sycEntityObjectTypeRepository.GetAll()
                        .Include(e => e.ObjectFk)
                        .Include(e => e.ParentFk)
                        .Include(e => e.SycEntityObjectTypes)
                        .Where(e => e.ParentId != null && e.ParentId == input.parentId)
                        .Where(e => e.TenantId == AbpSession.TenantId || e.TenantId == null);
                var filteredSycEntityObjectTypesPaged = filteredSycEntityObjectTypes
                                                                .OrderBy(input.Sorting ?? "id asc")
                                                                .PageBy(input);

                var sycEntityObjectTypes = from o in filteredSycEntityObjectTypesPaged
                                           join o1 in _lookup_sydObjectRepository.GetAll() on o.ObjectId equals o1.Id into j1
                                           from s1 in j1.DefaultIfEmpty()

                                           join o2 in _sycEntityObjectTypeRepository.GetAll() on o.ParentId equals o2.Id into j2
                                           from s2 in j2.DefaultIfEmpty()
                                           join o3 in _lookup_ApplicationLanguageText.GetAll() on ("SYCENTITYOBJECTTYPES-NAME-" + o.Id.ToString() + "-" + o.Name).Trim().ToUpper() equals o3.Key into j3
                                           from s3 in j3.DefaultIfEmpty()

                                           join o4 in _lookup_ApplicationLanguageText.GetAll() on (s2 != null ? "SYCENTITYOBJECTTYPES-NAME-" + s2.Id.ToString() + "-" + s2.Name : "XXX").Trim().ToUpper() equals o4.Key into j4
                                           from s4 in j4.DefaultIfEmpty()

                                           where s3.LanguageName == defaultLang && ((s2 != null && s4.LanguageName == defaultLang) || (s2 == null))


                                           select new TreeNode<GetSycEntityObjectTypeForViewDto>()
                                           {
                                               Data = new GetSycEntityObjectTypeForViewDto
                                               {
                                                   SycEntityObjectType = new SycEntityObjectTypeDto
                                                   {
                                                       Code = o.Code,
                                                       Name = s3 == null ? o.Name : s3.Value.Trim(),
                                                       ExtraAttributes = o.ExtraAttributes,
                                                       Id = o.Id
                                                   },
                                                   SydObjectName = s1 == null ? "" : s1.Name.ToString(),
                                                   SycEntityObjectTypeName = s2 == null ? "" : s4 == null ? s2.Name.ToString() : s4.Value,
                                                   IdentifierCode = o.SycIdentifierDefinitionFK == null ? "" : o.SycIdentifierDefinitionFK.Code,

                                               },
                                               Leaf = o.SycEntityObjectTypes.Count() == 0,
                                               label = s3 == null ? o.Name : s3.Value.Trim()
                                           };


                var totalCount = await filteredSycEntityObjectTypes.CountAsync();

                var sycEntityObjectTypesDto = await sycEntityObjectTypes.ToListAsync();

                var sycEntityObjectTypeForViewDto = new PagedResultDto<TreeNode<GetSycEntityObjectTypeForViewDto>>(
                                                    totalCount,
                                                    sycEntityObjectTypesDto);

                return sycEntityObjectTypeForViewDto;
            }
        }


        public async Task<IReadOnlyList<TreeNode<GetSycEntityObjectTypeForViewDto>>> GetChilds(int parentId)
        {
            var defaultLang = GetDefaultLanguage().Result;
            var filteredSycEntityObjectTypes = _sycEntityObjectTypeRepository.GetAll()
                        .Include(e => e.ObjectFk)
                        .Include(e => e.ParentFk)
                        .Include(e => e.SycEntityObjectTypes)
                        .Where(e => e.ParentId != null && e.ParentId == parentId);

            var sycEntityObjectTypes = from o in filteredSycEntityObjectTypes
                                       join o1 in _lookup_sydObjectRepository.GetAll() on o.ObjectId equals o1.Id into j1
                                       from s1 in j1.DefaultIfEmpty()
                                       join o3 in _lookup_ApplicationLanguageText.GetAll() on ("SYCENTITYOBJECTTYPES-NAME-" + o.Id.ToString() + "-" + o.Name).Trim().ToUpper() equals o3.Key into j3
                                       from s3 in j3.DefaultIfEmpty()
                                       join o2 in _lookup_sycEntityObjectTypeRepository.GetAll() on o.ParentId equals o2.Id into j2
                                       from s2 in j2.DefaultIfEmpty()
                                       join o4 in _lookup_ApplicationLanguageText.GetAll() on (s2 != null ? "SYCENTITYOBJECTTYPES-NAME-" + s2.Id.ToString() + "-" + s2.Name : "XXX").Trim().ToUpper() equals o4.Key into j4
                                       from s4 in j4.DefaultIfEmpty()
                                       where s3.LanguageName == defaultLang && ((s2 != null && s4.LanguageName == defaultLang) || (s2 == null))

                                       select new TreeNode<GetSycEntityObjectTypeForViewDto>()
                                       {
                                           Data = new GetSycEntityObjectTypeForViewDto
                                           {
                                               SycEntityObjectType = new SycEntityObjectTypeDto
                                               {
                                                   Code = o.Code,
                                                   Name = s3 == null ? o.Name : s3.Value.Trim(),
                                                   ExtraAttributes = o.ExtraAttributes,
                                                   Id = o.Id
                                               },
                                               SydObjectName = s1 == null ? "" : s1.Name.ToString(),
                                               SycEntityObjectTypeName = s2 == null ? "" : s4 == null ? s2.Name.ToString() : s4.Value.Trim(),

                                           },
                                           Leaf = o.SycEntityObjectTypes.Count() == 0
                                       }
                                       ;

            var totalCount = await filteredSycEntityObjectTypes.CountAsync();

            var x = await sycEntityObjectTypes.ToListAsync();

            return x;
        }

        public async Task<GetSycEntityObjectTypeForViewDto> GetSycEntityObjectTypeForView(int id)
        {
                var sycEntityObjectType = await _sycEntityObjectTypeRepository.FirstOrDefaultAsync(x => x.Id == id  && (x.TenantId == AbpSession.TenantId || x.TenantId == null));


                var output = new GetSycEntityObjectTypeForViewDto { SycEntityObjectType = ObjectMapper.Map<SycEntityObjectTypeDto>(sycEntityObjectType) };

                if (output.SycEntityObjectType.SycIdentifierDefinitionId != null && output.SycEntityObjectType.SycIdentifierDefinitionId > 0)
                {
                    var idStructure = await _lookup_SycIdentifierDefinitionRepository.FirstOrDefaultAsync((long)output.SycEntityObjectType.SycIdentifierDefinitionId);
                    output.IdentifierCode = idStructure.Code;
                }

                if (output.SycEntityObjectType.ObjectId != null)
                {
                    var _lookupSydObject = await _lookup_sydObjectRepository.FirstOrDefaultAsync((int)output.SycEntityObjectType.ObjectId);
                    output.SydObjectName = _lookupSydObject.Name.ToString();
                }

                if (output.SycEntityObjectType.ParentId != null)
                {
                    var _lookupSycEntityObjectType = await _lookup_sycEntityObjectTypeRepository.FirstOrDefaultAsync((int)output.SycEntityObjectType.ParentId);
                    output.SycEntityObjectTypeName = _lookupSycEntityObjectType.Name.ToString();
                }
                if (output.SycEntityObjectType != null)
                {

                    var Key = ("SYCENTITYOBJECTTYPES-NAME-" + output.SycEntityObjectType.Id.ToString() + "-" + output.SycEntityObjectType.Name).Trim().ToUpper();
                    output.SycEntityObjectTypeName = L(Key);
                }

                return output;
        }

        [AbpAuthorize(AppPermissions.Pages_SycEntityObjectTypes_Edit)]
        public async Task<GetSycEntityObjectTypeForEditOutput> GetSycEntityObjectTypeForEdit(EntityDto input)
        {
            var sycEntityObjectType = await _sycEntityObjectTypeRepository.FirstOrDefaultAsync(x => x.Id == input.Id && (x.TenantId == AbpSession.TenantId || x.TenantId == null));

            var output = new GetSycEntityObjectTypeForEditOutput { SycEntityObjectType = ObjectMapper.Map<CreateOrEditSycEntityObjectTypeDto>(sycEntityObjectType) };

            if (output.SycEntityObjectType.SycIdentifierDefinitionId != null && output.SycEntityObjectType.SycIdentifierDefinitionId > 0)
            {
                var idStructure = await _lookup_SycIdentifierDefinitionRepository.FirstOrDefaultAsync((long)output.SycEntityObjectType.SycIdentifierDefinitionId);
                output.IdentifierCode = idStructure.Code;
            }

            if (output.SycEntityObjectType.ObjectId != null)
            {
                var _lookupSydObject = await _lookup_sydObjectRepository.FirstOrDefaultAsync((int)output.SycEntityObjectType.ObjectId);
                output.SydObjectName = _lookupSydObject.Name.ToString();

            }

            if (output.SycEntityObjectType.ParentId != null)
            {
                var _lookupSycEntityObjectType = await _lookup_sycEntityObjectTypeRepository.FirstOrDefaultAsync((int)output.SycEntityObjectType.ParentId);
                output.SycEntityObjectTypeName = _lookupSycEntityObjectType.Name.ToString();
            }

            if (output.SycEntityObjectType != null)
            {
                var Key = ("SYCENTITYOBJECTTYPES-NAME-" + output.SycEntityObjectType.Id.ToString() + "-" + output.SycEntityObjectType.Name).Trim().ToUpper();
                output.SycEntityObjectTypeName = L(Key);
            }


            return output;
        }

        public async Task CreateOrEdit(CreateOrEditSycEntityObjectTypeDto input)
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

        [AbpAuthorize(AppPermissions.Pages_SycEntityObjectTypes_Create)]
        protected virtual async Task Create(CreateOrEditSycEntityObjectTypeDto input)
        {
            var sycEntityObjectType = ObjectMapper.Map<SycEntityObjectType>(input);
            sycEntityObjectType.TenantId = AbpSession.TenantId;
            var id = await _sycEntityObjectTypeRepository.InsertAndGetIdAsync(sycEntityObjectType);

            #region add to translation
            string word = input.Name;
            var languagesList = _lookup_ApplicationLanguages.GetLanguages(AbpSession.TenantId).ToList();
            if (languagesList != null)
            {
                foreach (var lang in languagesList.Select(e => e.Name).ToList())
                {
                    ApplicationLanguageText entity = new ApplicationLanguageText();
                    entity.Key = ("SYCENTITYOBJECTTYPES-NAME-" + id.ToString() + "-" + input.Name).Trim().ToUpper();
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

        [AbpAuthorize(AppPermissions.Pages_SycEntityObjectTypes_Edit)]
        protected virtual async Task Update(CreateOrEditSycEntityObjectTypeDto input)
        {
            await CheckParentAllowed((int)input.Id, input.ParentId);

            var sycEntityObjectType = await _sycEntityObjectTypeRepository.FirstOrDefaultAsync(x => x.Id == (int)input.Id && (x.TenantId == AbpSession.TenantId || x.TenantId == null));
            string oldWord = sycEntityObjectType.Name;
            ObjectMapper.Map(input, sycEntityObjectType);


            #region add to translation
            string word = input.Name;

            ApplicationLanguageText entity = new ApplicationLanguageText();
            string oldKey = ("SYCENTITYOBJECTTYPES-NAME-" + sycEntityObjectType.Id.ToString() + "-" + oldWord).Trim().ToUpper();

            var languagesList = _lookup_ApplicationLanguages.GetLanguages(AbpSession.TenantId).ToList();
            if (languagesList != null)
            {
                foreach (var lang in languagesList.Select(e => e.Name).ToList())
                {
                    var oldRecord = _lookup_ApplicationLanguageText.FirstOrDefaultAsync(e => e.Key == oldKey && e.LanguageName == lang).Result;
                    if (oldRecord != null && oldRecord.Id > 0)
                    {
                        oldRecord.Key = ("SYCENTITYOBJECTTYPES-NAME-" + sycEntityObjectType.Id.ToString() + "-" + input.Name).Trim().ToUpper();
                        oldRecord.Value = word;
                        oldRecord.TenantId = AbpSession.TenantId;
                        await _lookup_ApplicationLanguageText.UpdateAsync(oldRecord);
                    }
                    else
                    {
                        ApplicationLanguageText newRecord = new ApplicationLanguageText();
                        newRecord.Key = ("SYCENTITYOBJECTTYPES-NAME-" + sycEntityObjectType.Id.ToString() + "-" + input.Name).Trim().ToUpper();
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

        [AbpAuthorize(AppPermissions.Pages_SycEntityObjectTypes_Delete)]
        public async Task Delete(EntityDto input)
        {
            await _sycEntityObjectTypeRepository.DeleteAsync(input.Id);
        }

        public async Task<FileDto> GetSycEntityObjectTypesToExcel(GetAllSycEntityObjectTypesForExcelInput input)
        {

            var filteredSycEntityObjectTypes = _sycEntityObjectTypeRepository.GetAll()
                        .Include(e => e.ObjectFk)
                        .Include(e => e.ParentFk)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter) || e.Name.Contains(input.Filter) || e.ExtraAttributes.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name == input.NameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.ExtraDataFilter), e => e.ExtraAttributes == input.ExtraDataFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SydObjectNameFilter), e => e.ObjectFk != null && e.ObjectFk.Name == input.SydObjectNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycEntityObjectTypeNameFilter), e => e.ParentFk != null && e.ParentFk.Name == input.SycEntityObjectTypeNameFilter)
                         .Where(x => x.TenantId == AbpSession.TenantId || x.TenantId == null);

            var query = (from o in filteredSycEntityObjectTypes
                         join o1 in _lookup_sydObjectRepository.GetAll() on o.ObjectId equals o1.Id into j1
                         from s1 in j1.DefaultIfEmpty()

                         join o2 in _lookup_sycEntityObjectTypeRepository.GetAll() on o.ParentId equals o2.Id into j2
                         from s2 in j2.DefaultIfEmpty()

                         select new GetSycEntityObjectTypeForViewDto()
                         {
                             SycEntityObjectType = new SycEntityObjectTypeDto
                             {
                                 Code = o.Code,
                                 Name = o.Name,
                                 ExtraAttributes = o.ExtraAttributes,
                                 Id = o.Id
                             },
                             SydObjectName = s1 == null ? "" : s1.Name.ToString(),
                             SycEntityObjectTypeName = s2 == null ? "" : s2.Name.ToString()
                         });


            var sycEntityObjectTypeListDtos = await query.ToListAsync();

            return _sycEntityObjectTypesExcelExporter.ExportToFile(sycEntityObjectTypeListDtos);
        }


        [AbpAuthorize(AppPermissions.Pages_SycEntityObjectTypes)]
        public async Task<List<SycEntityObjectTypeSydObjectLookupTableDto>> GetAllSydObjectForTableDropdown()
        {
            return await _lookup_sydObjectRepository.GetAll()
                .Select(sydObject => new SycEntityObjectTypeSydObjectLookupTableDto
                {
                    Id = sydObject.Id,
                    DisplayName = sydObject.Name.ToString()
                }).ToListAsync();
        }

        [AbpAuthorize(AppPermissions.Pages_SycEntityObjectTypes)]
        public async Task<List<SycEntityObjectTypeSycEntityObjectTypeLookupTableDto>> GetAllSycEntityObjectTypeForTableDropdown()
        {
            return await _lookup_sycEntityObjectTypeRepository.GetAll().Where(x => x.TenantId == AbpSession.TenantId || x.TenantId == null)
                .Select(sycEntityObjectType => new SycEntityObjectTypeSycEntityObjectTypeLookupTableDto
                {
                    Id = sycEntityObjectType.Id,
                    DisplayName = sycEntityObjectType.Name.ToString()
                }).ToListAsync();
        }

        [AbpAuthorize(AppPermissions.Pages_SycEntityObjectTypes)]
        public async Task<PagedResultDto<SycEntityObjectTypeSycIdentifierDefinitionLookupTableDto>> GetAllSycIdentifierDefinitionForLookupTable(onetouch.SystemObjects.Dtos.GetAllForLookupTableInput input)
        {
            var query = _lookup_SycIdentifierDefinitionRepository.GetAll().WhereIf(
                   !string.IsNullOrWhiteSpace(input.Filter),
                  e => e.Code != null && e.Code.Contains(input.Filter)
               );

            var totalCount = await query.CountAsync();

            var sycIdentifierDefinitionList = await query
                .PageBy(input)
                .ToListAsync();

            var lookupTableDtoList = new List<SycEntityObjectTypeSycIdentifierDefinitionLookupTableDto>();
            foreach (var sycIdentifierDefinition in sycIdentifierDefinitionList)
            {
                lookupTableDtoList.Add(new SycEntityObjectTypeSycIdentifierDefinitionLookupTableDto
                {
                    Id = sycIdentifierDefinition.Id,
                    DisplayName = sycIdentifierDefinition.Code?.ToString()
                });
            }

            return new PagedResultDto<SycEntityObjectTypeSycIdentifierDefinitionLookupTableDto>(
                totalCount,
                lookupTableDtoList
            );
        }

        private async Task<bool> CheckParentAllowed(int recordId, int? parentId)
        {
            parentId = parentId == null ? 0 : parentId;

            if (parentId != 0)
            {
                var obj = await _sycEntityObjectTypeRepository.FirstOrDefaultAsync(x => x.Id == parentId);

                if (obj.ParentId == recordId)
                    throw new UserFriendlyException("Ooppps! cannot make the record child to itself...");

                while (obj.ParentId != null && obj.ParentId != 0)
                {
                    obj = await _sycEntityObjectTypeRepository.FirstOrDefaultAsync(x => x.Id == (int)obj.ParentId);
                    if (obj.ParentId == recordId)
                        throw new UserFriendlyException("Ooppps! cannot make the record child to itself...");
                }

            }

            return true;
        }

    }
}