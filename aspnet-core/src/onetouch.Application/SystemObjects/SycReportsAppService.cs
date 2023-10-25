

using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.SystemObjects.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using Abp.Domain.Uow;

namespace onetouch.SystemObjects
{
	[AbpAuthorize]
    public class SycReportsAppService : onetouchAppServiceBase, ISycReportsAppService
	{
		 private readonly IRepository<SycReport> _SycReportRepository;
		 

		  public SycReportsAppService(IRepository<SycReport> SycReportRepository ) 
		  {
			_SycReportRepository = SycReportRepository;
			
		  }

		 public async Task<PagedResultDto<GetSycReportForViewDto>> GetAll(GetAllSycReportInput input)
         {
			using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
			{
				var filteredSycReports = _SycReportRepository.GetAll().Include(x => x.EntityObjectTypeFk)
					.Where(x => x.EntityObjectTypeFk.Code == input.EntityObjectTypeCode)
					.Where(x => x.TenantId== AbpSession.TenantId || x.TenantId==null);

				var pagedAndFilteredSycReports = filteredSycReports
					.OrderBy(input.Sorting ?? "id asc")
					.PageBy(input);

				var SycReports = from o in pagedAndFilteredSycReports
								 select new GetSycReportForViewDto()
								 {
									 SycReport = new SycReportDto
									 {
										 Name = o.Name,
										 Id = o.Id,
										 Description=o.Description,
										 ImgUrl = "attachments/-1/" + o.Thumbnail,
									 }
								 };

				var totalCount = await filteredSycReports.CountAsync();

				return new PagedResultDto<GetSycReportForViewDto>(
					totalCount,
					await SycReports.ToListAsync()
				);
			}
         }
		 
    }
}