using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using onetouch.EntityFrameworkCore;

namespace onetouch.HealthChecks
{
    public class onetouchDbContextHealthCheck : IHealthCheck
    {
        private readonly DatabaseCheckHelper _checkHelper;

        public onetouchDbContextHealthCheck(DatabaseCheckHelper checkHelper)
        {
            _checkHelper = checkHelper;
        }

        public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = new CancellationToken())
        {
            if (_checkHelper.Exist("db"))
            {
                return Task.FromResult(HealthCheckResult.Healthy("onetouchDbContext connected to database."));
            }

            return Task.FromResult(HealthCheckResult.Unhealthy("onetouchDbContext could not connect to database"));
        }
    }
}
