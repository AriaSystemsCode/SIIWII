using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.EntityFrameworkCore;
using Abp.EntityFrameworkCore.Uow;
using Microsoft.EntityFrameworkCore;
using onetouch.AppEntities;
using onetouch.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.SystemObjects
{
    public class SycEntityLocalizationAppService : onetouchAppServiceBase, ISycEntityLocalizationAppService
    {
        private onetouchDbContext _context => _dbContextProvider.GetDbContext();
        private readonly IDbContextProvider<onetouchDbContext> _dbContextProvider;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        public SycEntityLocalizationAppService(IDbContextProvider<onetouchDbContext> dbContextProvider, IAppEntitiesAppService appEntitiesAppService)//IRepository<SycEntityLocalization, long> sycEntityLocalizeRepository)
        {
            _appEntitiesAppService = appEntitiesAppService;
            _dbContextProvider = dbContextProvider;
        }
        public List<SycEntityLocalization> GetAll(string lang, long objectTypeId)
        {
            return  _context.SycEntityLocalizations.Where  (z=>z.Language == lang && z.ObjectTypeId == objectTypeId).ToList();
        }
        public async void CreateOrUpdateLocalization(long objectTypeId, long objectId, string LanguageCode, string key, string text)
        {
         

               var x = _context;
                var _sycEntityLocalizeRepository = x.SycEntityLocalizations;
                var loc =  _sycEntityLocalizeRepository.FirstOrDefault(a => a.ObjectTypeId == objectTypeId
                         && a.ObjectId == objectId && a.Language == LanguageCode && a.Key == key);
                if (loc == null)
                {
                    SycEntityLocalization localize = new SycEntityLocalization
                    {
                        Language = LanguageCode,
                        ObjectTypeId = objectTypeId,
                        ObjectId = objectId,
                        Key = key,
                        String = text

                    };

                     _context.SycEntityLocalizations.Add(localize);
                     _context.SaveChanges();
                var lang = _appEntitiesAppService.GetAllLanguageForTableDropdown();
                if (lang != null)
                {
                    foreach (var lan in lang.Result)
                    {
                        if (lan.Code != LanguageCode)
                        {
                            SycEntityLocalization locLan = new SycEntityLocalization { Language = lan.Code, ObjectTypeId = objectTypeId, ObjectId = objectId, Key = key, String = text};
                            _context.SycEntityLocalizations.Add(locLan);
                        }
                    }
                    _context.SaveChanges();

                }
            }
                else
                {
                    loc.String = text;
                    _sycEntityLocalizeRepository.Update(loc);
                     _context.SaveChanges();
                }
               
        }
    }
}
