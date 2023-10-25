using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using onetouch.MultiTenancy.HostDashboard.Dto;

namespace onetouch.MultiTenancy.HostDashboard
{
    public interface IIncomeStatisticsService
    {
        Task<List<IncomeStastistic>> GetIncomeStatisticsData(DateTime startDate, DateTime endDate,
            ChartDateInterval dateInterval);
    }
}