using Abp.Domain.Repositories;
using onetouch.AppItems.Dtos;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppItems
{
    public interface IAppItemRepository : IRepository<AppItem, long>
    {
        public Task<List<long>> GetItemPageIds(GetAllAppItemsInput input);
    }
}
