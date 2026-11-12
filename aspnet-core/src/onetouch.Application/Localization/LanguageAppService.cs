using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Text;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Localization;
using Abp.MultiTenancy;
using Abp.UI;
using DocumentFormat.OpenXml.Wordprocessing;
using onetouch.Authorization;
using onetouch.Localization.Dto;

namespace onetouch.Localization
{
    [AbpAuthorize(AppPermissions.Pages_Administration_Languages)]
    public class LanguageAppService : onetouchAppServiceBase, ILanguageAppService
    {
        private readonly IApplicationLanguageManager _applicationLanguageManager;
        private readonly IApplicationLanguageTextManager _applicationLanguageTextManager;
        private readonly IRepository<ApplicationLanguage> _languageRepository;
        private readonly IApplicationCulturesProvider _applicationCulturesProvider;

        public LanguageAppService(
            IApplicationLanguageManager applicationLanguageManager,
            IApplicationLanguageTextManager applicationLanguageTextManager,
            IRepository<ApplicationLanguage> languageRepository, 
            IApplicationCulturesProvider applicationCulturesProvider)
        {
            _applicationLanguageManager = applicationLanguageManager;
            _languageRepository = languageRepository;
            _applicationLanguageTextManager = applicationLanguageTextManager;
            _applicationCulturesProvider = applicationCulturesProvider;
        }

        public async Task<string> GetDefaultLanguage()
        {
            string name = "en";
            var defaultLanguage = await _applicationLanguageManager.GetDefaultLanguageOrNullAsync(AbpSession.TenantId);
            if (defaultLanguage != null) { name = defaultLanguage.Name; }
            return name;
        }
        public async Task<GetLanguagesOutput> GetLanguages()
        {
            var languages = (await _applicationLanguageManager.GetLanguagesAsync(AbpSession.TenantId)).OrderBy(l => l.DisplayName);
            var defaultLanguage = await _applicationLanguageManager.GetDefaultLanguageOrNullAsync(AbpSession.TenantId);

            return new GetLanguagesOutput(
                ObjectMapper.Map<List<ApplicationLanguageListDto>>(languages),
                defaultLanguage?.Name
                );
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_Languages_Create, AppPermissions.Pages_Administration_Languages_Edit)]
        public async Task<GetLanguageForEditOutput> GetLanguageForEdit(NullableIdDto input)
        {
            ApplicationLanguage language = null;
            if (input.Id.HasValue)
            {
                language = await _languageRepository.GetAsync(input.Id.Value);
            }

            var output = new GetLanguageForEditOutput();

            //Language
            output.Language = language != null
                ? ObjectMapper.Map<ApplicationLanguageEditDto>(language)
                : new ApplicationLanguageEditDto();

            //Language names
            output.LanguageNames = _applicationCulturesProvider
                .GetAllCultures()
                .Select(c => new ComboboxItemDto(c.Name, c.EnglishName + " (" + c.Name + ")") { IsSelected = output.Language.Name == c.Name })
                .ToList();

            //Flags
            output.Flags = FamFamFamFlagsHelper
                .FlagClassNames
                .OrderBy(f => f)
                .Select(f => new ComboboxItemDto(f, FamFamFamFlagsHelper.GetCountryCode(f)) { IsSelected = output.Language.Icon == f })
                .ToList();

            return output;
        }

        public async Task CreateOrUpdateLanguage(CreateOrUpdateLanguageInput input)
        {
            if (input.Language.Id.HasValue)
            {
                await UpdateLanguageAsync(input);
            }
            else
            {
                await CreateLanguageAsync(input);
            }
        }

        public async Task DeleteLanguage(EntityDto input)
        {
            var language = await _languageRepository.GetAsync(input.Id);
            await _applicationLanguageManager.RemoveAsync(AbpSession.TenantId, language.Name);
        }

        public async Task SetDefaultLanguage(SetDefaultLanguageInput input)
        {
            await _applicationLanguageManager.SetDefaultLanguageAsync(
                AbpSession.TenantId,
               CultureHelper.GetCultureInfoByChecking(input.Name).Name
                );
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_Languages_ChangeTexts)]
        public async Task<PagedResultDto<LanguageTextListDto>> GetLanguageTexts(GetLanguageTextsInput input)
        {
            /* Note: This method is used by SPA without paging, MPA with paging.
             * So, it can both usable with paging or not */

            //Normalize base language name
            if (input.BaseLanguageName.IsNullOrEmpty())
            {
                var defaultLanguage = await _applicationLanguageManager.GetDefaultLanguageOrNullAsync(AbpSession.TenantId);
                if (defaultLanguage == null)
                {
                    defaultLanguage = (await _applicationLanguageManager.GetLanguagesAsync(AbpSession.TenantId)).FirstOrDefault();
                    if (defaultLanguage == null)
                    {
                        throw new Exception("No language found in the application!");
                    }
                }

                input.BaseLanguageName = defaultLanguage.Name;
            }

            var source = LocalizationManager.GetSource(input.SourceName);
            var baseCulture = CultureInfo.GetCultureInfo(input.BaseLanguageName);
            var targetCulture = CultureInfo.GetCultureInfo(input.TargetLanguageName);

            var languageTexts = source
                .GetAllStrings()
                .Select(localizedString => new LanguageTextListDto
                {
                    Key = localizedString.Name,
                    BaseValue = _applicationLanguageTextManager.GetStringOrNull(AbpSession.TenantId, source.Name, baseCulture, localizedString.Name),
                    TargetValue = _applicationLanguageTextManager.GetStringOrNull(AbpSession.TenantId, source.Name, targetCulture, localizedString.Name, false)
                })
                .AsQueryable();

            //Filters
            if (input.TargetValueFilter == "EMPTY")
            {
                languageTexts = languageTexts.Where(s => s.TargetValue.IsNullOrEmpty());
            }

            if (!input.FilterText.IsNullOrEmpty())
            {
                languageTexts = languageTexts.Where(
                    l => (l.Key != null && l.Key.IndexOf(input.FilterText, StringComparison.CurrentCultureIgnoreCase) >= 0) ||
                         (l.BaseValue != null && l.BaseValue.IndexOf(input.FilterText, StringComparison.CurrentCultureIgnoreCase) >= 0) ||
                         (l.TargetValue != null && l.TargetValue.IndexOf(input.FilterText, StringComparison.CurrentCultureIgnoreCase) >= 0)
                    );
            }

            var totalCount = languageTexts.Count();

            //Ordering
            if (!input.Sorting.IsNullOrEmpty())
            {
                languageTexts = languageTexts.OrderBy(input.Sorting);
            }

            //Paging
            if (input.SkipCount > 0)
            {
                languageTexts = languageTexts.Skip(input.SkipCount);
            }

            if (input.MaxResultCount > 0)
            {
                languageTexts = languageTexts.Take(input.MaxResultCount);
            }

            return new PagedResultDto<LanguageTextListDto>(
                totalCount,
                languageTexts.ToList()
                );
        }
        //export erp text files

        public async Task ExportERPFiles(string? fileName,string language)
        {
            GetLanguageTextsInput langInput = new GetLanguageTextsInput();
            langInput.BaseLanguageName = "en";
            langInput.TargetLanguageName = "ar-EG";
            
            langInput.SourceName = "onetouch";
            
            langInput.SkipCount = 0;
            langInput.TargetValueFilter = "ALL";
            langInput.Sorting = null;
            
            if (string.IsNullOrEmpty(fileName))
            {
                langInput.FilterText = "AriaERP";
                langInput.MaxResultCount = 1000000;
            }
            else
            {
                langInput.FilterText = fileName;
                langInput.MaxResultCount = 1000;
            }
            var result = await GetLanguageTexts(langInput);
            if (result != null && result.TotalCount > 0)
            {
                string lang = langInput.TargetLanguageName == "ar-EG" ? "ar" : langInput.TargetLanguageName;
                if (!string.IsNullOrEmpty(fileName))
                {
                    string xmlFile = "<?xml version = \"1.0\" encoding=\"Windows-1256\" standalone=\"yes\"?>" + "\r\n";
                    xmlFile += "<VFPData>" + "\r\n";
                    foreach (var trans in result.Items)
                    {
                        var keySplit = trans.Key.Split("-");
                        //"AriaERP - Screens--aldtver_scx.xml - _1H80UY10F - Caption - ariabranchformset.AriaForm1";
                        //<aldtver_scx_ar row_key="_1H80UY10K" cproperty="Caption"
                        //orgtext="Ok" orgcol="ariabranchformset.AriaForm1.cmdOk" langtext="موافق"/>
                        var fileNameAct = keySplit[3];
                        var fileSplit = fileNameAct.Split(".");
                        xmlFile += "<" + fileSplit[0].TrimEnd() + "_" + lang +
                                  " row_key=\"" + keySplit[4] + "\" cproperty=\"" +
                                  keySplit[5] + "\" orgtext=\"" + trans.BaseValue + "\" orgcol=\"" +
                                  keySplit[6] + "\"  langtext=\"" + trans.TargetValue + "\"/>" + "\r\n";
                    }
                    xmlFile += "</VFPData>";
                    string filePath = System.IO.Path.Combine(
    AppDomain.CurrentDomain.BaseDirectory,
    "App_Data",
    "Translations",
   fileName);
                    System.IO.File.WriteAllText(
                          filePath,
                          xmlFile,
                          new UTF8Encoding(false)
                      );
                }
                else
                {
                    var res = result.Items.OrderBy(z=>z.Key).ToList();
                    if (res != null)
                    {
                        string xmlFile = "<?xml version = \"1.0\" encoding=\"Windows-1256\" standalone=\"yes\"?>" + "\r\n";
                        xmlFile += "<VFPData>" + "\r\n";
                        string fileNameAct = "";
                        string filePath = "";
                        string[] fileSplit = new string[1];
                        foreach (var trans in res)
                        {
                            var keySplit = trans.Key.Split("-");
                            
                            //"AriaERP - Screens--aldtver_scx.xml - _1H80UY10F - Caption - ariabranchformset.AriaForm1";
                            //<aldtver_scx_ar row_key="_1H80UY10K" cproperty="Caption"
                            //orgtext="Ok" orgcol="ariabranchformset.AriaForm1.cmdOk" langtext="موافق"/>
                            if (!string.IsNullOrEmpty(fileNameAct) && fileNameAct != keySplit[3])
                            {
                                fileNameAct = keySplit[3];
                                fileName = fileNameAct;
                                xmlFile += "</VFPData>";
                                 filePath = System.IO.Path.Combine(
                AppDomain.CurrentDomain.BaseDirectory,
                "App_Data",
                "Translations",
               fileNameAct);
                                System.IO.File.WriteAllText(
                                      filePath,
                                      xmlFile,
                                      new UTF8Encoding(false)
                                  );
                                
                                
                                fileSplit = fileNameAct.Split(".");
                                xmlFile = "<?xml version = \"1.0\" encoding=\"Windows-1256\" standalone=\"yes\"?>" + "\r\n";
                                xmlFile += "<VFPData>" + "\r\n";

                            }
                            fileNameAct = keySplit[3];
                            fileName = fileNameAct;
                            //fileName = fileNameAct;
                            xmlFile += "<" + fileSplit[0] + "_" + lang +
                                      " row_key=\"" + keySplit[4] + "\" cproperty=\"" +
                                      keySplit[5] + "\" orgtext=\"" + trans.BaseValue + "\" orgcol=\"" +
                                      keySplit[6] + "\"  langtext=\"" + trans.TargetValue + "\"/>" + "\r\n";
                        }
                        xmlFile += "</VFPData>";
                        filePath = System.IO.Path.Combine(
        AppDomain.CurrentDomain.BaseDirectory,
        "App_Data",
        "Translations",
       fileName);
                        System.IO.File.WriteAllText(
                              filePath,
                              xmlFile,
                              new UTF8Encoding(false)
                          );

                    }

                }
            }
        }

        //
        public async Task UpdateLanguageText(UpdateLanguageTextInput input)
        {
            var culture = CultureHelper.GetCultureInfoByChecking(input.LanguageName);
            var source = LocalizationManager.GetSource(input.SourceName);
            await _applicationLanguageTextManager.UpdateStringAsync(AbpSession.TenantId, source.Name, culture, input.Key, input.Value);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_Languages_Create)]
        protected virtual async Task CreateLanguageAsync(CreateOrUpdateLanguageInput input)
        {
            if (AbpSession.MultiTenancySide != MultiTenancySides.Host)
            {
                throw new UserFriendlyException(L("TenantsCannotCreateLanguage"));
            }

            var culture = CultureHelper.GetCultureInfoByChecking(input.Language.Name);

            await CheckLanguageIfAlreadyExists(culture.Name);

            await _applicationLanguageManager.AddAsync(
                new ApplicationLanguage(
                    AbpSession.TenantId,
                    culture.Name,
                    culture.DisplayName,
                    input.Language.Icon
                )
                {
                    IsDisabled = !input.Language.IsEnabled
                }
            );
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_Languages_Edit)]
        protected virtual async Task UpdateLanguageAsync(CreateOrUpdateLanguageInput input)
        {
            Debug.Assert(input.Language.Id != null, "input.Language.Id != null");

            var culture = CultureHelper.GetCultureInfoByChecking(input.Language.Name);

            await CheckLanguageIfAlreadyExists(culture.Name, input.Language.Id.Value);

            var language = await _languageRepository.GetAsync(input.Language.Id.Value);

            language.Name = culture.Name;
            language.DisplayName = culture.DisplayName;
            language.Icon = input.Language.Icon;
            language.IsDisabled = !input.Language.IsEnabled;

            await _applicationLanguageManager.UpdateAsync(AbpSession.TenantId, language);
        }

        private async Task CheckLanguageIfAlreadyExists(string languageName, int? expectedId = null)
        {
            var existingLanguage = (await _applicationLanguageManager.GetLanguagesAsync(AbpSession.TenantId))
                .FirstOrDefault(l => l.Name == languageName);

            if (existingLanguage == null)
            {
                return;
            }

            if (expectedId != null && existingLanguage.Id == expectedId.Value)
            {
                return;
            }

            throw new UserFriendlyException(L("ThisLanguageAlreadyExists"));
        }
    }
}