using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Application.Editions;
using Abp.Application.Features;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;

namespace onetouch.Editions
{
    public class EditionManager : AbpEditionManager
    {
        public const string DefaultEditionName = "Standard";

        public EditionManager(
            IRepository<Edition> editionRepository,
            IAbpZeroFeatureValueStore featureValueStore,
            IUnitOfWorkManager unitOfWorkManager)
            : base(
                editionRepository,
                featureValueStore,
                unitOfWorkManager
            )
        {
        }

        public async Task<List<Edition>> GetAllAsync()
        {
            return await EditionRepository.GetAllListAsync();
        }
    }
}
