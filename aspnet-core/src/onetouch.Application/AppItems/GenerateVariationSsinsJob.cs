using System.Linq;
using Abp.BackgroundJobs;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Threading;
using Microsoft.EntityFrameworkCore;
using onetouch.AppEntities;
using onetouch.AppEntities.Dtos;
using onetouch.Helpers;

namespace onetouch.AppItems
{
    public class GenerateVariationSsinsJob : BackgroundJob<GenerateVariationSsinsJobArgs>, ITransientDependency
    {
        private readonly IRepository<AppItem, long> _appItemRepository;
        private readonly IRepository<AppEntity, long> _appEntityRepository;
        private readonly Helper _helper;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public GenerateVariationSsinsJob(
            IRepository<AppItem, long> appItemRepository,
            IRepository<AppEntity, long> appEntityRepository,
            Helper helper,
            IUnitOfWorkManager unitOfWorkManager)
        {
            _appItemRepository = appItemRepository;
            _appEntityRepository = appEntityRepository;
            _helper = helper;
            _unitOfWorkManager = unitOfWorkManager;
        }

        public override void Execute(GenerateVariationSsinsJobArgs args)
        {
            using (var uow = _unitOfWorkManager.Begin())
            {
                using (_unitOfWorkManager.Current.SetTenantId(args.TenantId))
                {
                    var variations = _appItemRepository.GetAll()
                        .Include(x => x.EntityFk)
                        .Where(x => x.ParentId == args.ParentItemId && string.IsNullOrEmpty(x.SSIN))
                        .ToList();

                    foreach (var variation in variations)
                    {
                        var entity = variation.EntityFk ?? _appEntityRepository.FirstOrDefault(variation.EntityId);
                        if (entity == null)
                            continue;

                        var ssin = AsyncHelper.RunSync(() => _helper.SystemTables.GenerateSSIN(args.ObjectTypeId, new AppEntityDto
                        {
                            Id = entity.Id,
                            Code = entity.Code,
                            ObjectId = entity.ObjectId,
                            TenantId = entity.TenantId,
                            TenantOwner = entity.TenantOwner
                        }));

                        variation.SSIN = ssin;
                        entity.SSIN = ssin;
                    }

                    _unitOfWorkManager.Current.SaveChanges();
                }

                uow.Complete();
            }
        }
    }
}
