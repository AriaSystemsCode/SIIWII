using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.SystemObjects
{
    public interface ISycEntityLocalizationAppService
    {
        void CreateOrUpdateLocalization(long objectTypeId, long objectId, string LanguageCode, string key, string text);
       // public List<object> GetAll(string lang, long objectTypeId);
    }
}
