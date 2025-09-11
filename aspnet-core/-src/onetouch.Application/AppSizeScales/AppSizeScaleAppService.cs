using Abp.Application.Services.Dto;
using Abp.Collections.Extensions;
using Abp.Domain.Repositories;
using onetouch.AppItems;
using onetouch.AppSizeScales.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using Microsoft.EntityFrameworkCore;
using onetouch.AppEntities.Dtos;
using onetouch.Helpers;
using onetouch.AppEntities;
using NUglify.Helpers;
using System.ComponentModel.DataAnnotations;
using onetouch.Accounts.Dtos;
using onetouch.SycIdentifierDefinitions;
using System.Linq.Expressions;

namespace onetouch.AppSizeScales
{
    public class AppSizeScaleAppService : onetouchAppServiceBase, IAppSizeScaleAppService
    {
        private readonly IRepository<AppSizeScalesHeader, long> _appSizeScaleHeaderRepository;
        private readonly IRepository<AppSizeScalesDetail, long> _appSizeScaleDetailRepository;
        private readonly Helper _helper;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        private readonly SycIdentifierDefinitionsAppService _iAppSycIdentifierDefinitionsService;
        public AppSizeScaleAppService(IRepository<AppSizeScalesHeader, long> appSizeScaleHeaderRepository, Helper helper,
            IAppEntitiesAppService appEntitiesAppService, IRepository<AppSizeScalesDetail, long> appSizeScaleDetailRepository,
            SycIdentifierDefinitionsAppService sycIdentifierDefinitionsAppService)
        {
            _iAppSycIdentifierDefinitionsService = sycIdentifierDefinitionsAppService;
            _appSizeScaleHeaderRepository = appSizeScaleHeaderRepository;
            _helper = helper;
            _appEntitiesAppService = appEntitiesAppService;
            _appSizeScaleDetailRepository = appSizeScaleDetailRepository;
        }

        public async Task<PagedResultDto<GetAppSizeScaleForViewDto>> GetAll(GetAllAppSizeScaleInput input)
        {
            var sizeScales = _appSizeScaleHeaderRepository.GetAll()
                .WhereIf(!string.IsNullOrEmpty(input.Filter),x => x.Name.Contains(input.Filter))
                .WhereIf(input.ParentId != null,x => x.ParentId == input.ParentId)
                .WhereIf(input.ParentId == null, x => x.ParentId == null);

            var pagedAndFilteredScale = sizeScales.OrderBy("name asc").PageBy(input);

            var _scales = from o in pagedAndFilteredScale
                          select new GetAppSizeScaleForViewDto()
                          {
                              Code = o.Code,
                              Name = o.Name,
                              Id = o.Id
                          };

            var scalesList = await _scales.ToListAsync();
            var totalCount = await sizeScales.CountAsync();
            var x = new PagedResultDto<GetAppSizeScaleForViewDto>(
                        totalCount,
                        scalesList);
            return x;

        }
        public async Task<AppSizeScaleForEditDto> GetSizeScaleForEdit(long sizeScaleId)
        {
            AppSizeScaleForEditDto returnObj = new AppSizeScaleForEditDto();
            var sizeScale = await _appSizeScaleHeaderRepository.GetAll().Include(x => x.AppSizeScalesDetails).FirstOrDefaultAsync(x => x.Id == sizeScaleId);
            if (sizeScale != null)
            {
                returnObj = ObjectMapper.Map<AppSizeScaleForEditDto>(sizeScale);
            }

            return returnObj;
        }
        public async Task<AppSizeScaleForEditDto> CreateOrEditAppSizeScale(AppSizeScaleForEditDto input)
        {
            return await Update(input);
        }
        private async Task<AppSizeScaleForEditDto> Update(AppSizeScaleForEditDto input)
        {
            var itemStatusId =  await _helper.SystemTables.GetEntityObjectStatusItemActive();
            var scaleObjectId = await _helper.SystemTables.GetObjectScaleId();
            var sizeScaleEntity = await _helper.SystemTables.GetEntityObjectTypeSizeScale();
            

            if (input.Id == null || input.Id == 0)
            {
                string seq = await _iAppSycIdentifierDefinitionsService.GetNextEntityCode("SIZE-SCALE");
                input.Code =( input.ParentId == null ? "SizeScale-": "SizeRatio-") + seq;
                AppEntityDto entity = new AppEntityDto();
                ObjectMapper.Map(input, entity);
                entity.Id = 0;
                entity.ObjectId = scaleObjectId;
                entity.EntityObjectTypeId = sizeScaleEntity;
                entity.Name = input.Name;
                entity.EntityObjectStatusId = itemStatusId;
                entity.TenantId = AbpSession.TenantId;
                AppSizeScalesHeaderDto appSizeScaleHeaderDto = new AppSizeScalesHeaderDto();
                //appSizeScaleHeader.EntityFk = entity;
                ObjectMapper.Map(input, appSizeScaleHeaderDto);
                AppSizeScalesHeader appSizeScaleHeader = new AppSizeScalesHeader();
                ObjectMapper.Map(appSizeScaleHeaderDto, appSizeScaleHeader);
                var savedEntity = await _appEntitiesAppService.SaveEntity(entity);
                appSizeScaleHeader.EntityId = savedEntity;
                appSizeScaleHeader.TenantId = AbpSession.TenantId;
                appSizeScaleHeader.AppSizeScalesDetails.ForEach(a=> a.TenantId = AbpSession.TenantId);
                appSizeScaleHeader.AppSizeScalesDetails.ForEach(a => a.Id = 0);
                appSizeScaleHeader = await _appSizeScaleHeaderRepository.InsertAsync(appSizeScaleHeader);
                await CurrentUnitOfWork.SaveChangesAsync();
                return await GetSizeScaleForEdit(appSizeScaleHeader.Id);
            }
            else
            {

                var sizeScale =await _appSizeScaleHeaderRepository.GetAll().AsNoTracking()//.Include (x=>x.AppSizeScalesDetails).AsNoTracking()
                    .Include (x=> x.EntityFk).AsNoTracking()
                    .FirstOrDefaultAsync(x=>x.Id== input.Id);
                if (sizeScale != null)
                {
                    AppSizeScalesHeaderDto appSizeScaleHeaderDto = new AppSizeScalesHeaderDto();
                    ObjectMapper.Map(input, appSizeScaleHeaderDto);
                    AppSizeScalesHeader appSizeScaleHeader = new AppSizeScalesHeader();
                    ObjectMapper.Map(appSizeScaleHeaderDto, appSizeScaleHeader);
                    AppEntityDto entity = new AppEntityDto();
                    ObjectMapper.Map(input, entity);
                    entity.ObjectId = scaleObjectId;
                    entity.EntityObjectTypeId = sizeScaleEntity;
                    entity.Name = input.Name;
                    entity.EntityObjectStatusId = itemStatusId;
                    entity.TenantId = AbpSession.TenantId;
                    entity.Id = sizeScale.EntityFk.Id;
                    entity.Code = sizeScale.EntityFk.Code ;
                    var savedEntity = await _appEntitiesAppService.SaveEntity(entity);
                    appSizeScaleHeader.Id = sizeScale.Id;
                    appSizeScaleHeader.EntityId = sizeScale.EntityId;
                    appSizeScaleHeader.TenantId = AbpSession.TenantId;
                    appSizeScaleHeader.AppSizeScalesDetails = new List<AppSizeScalesDetail>();
                    sizeScale = await _appSizeScaleHeaderRepository.UpdateAsync(appSizeScaleHeader);

                    var selectedId = input.AppSizeScalesDetails.Select(a => a.SizeCode).Distinct().ToList().JoinAsString(",");
                    await _appSizeScaleDetailRepository.DeleteAsync(z=>z.SizeScaleId == input.Id & !selectedId.Contains (z.SizeCode));
                    // await CurrentUnitOfWork.SaveChangesAsync();

                    foreach (var sizeObj in input.AppSizeScalesDetails)
                    {
                        var is1stDimVal = !string.IsNullOrWhiteSpace(sizeObj.D1Position) && string.IsNullOrWhiteSpace(sizeObj.D2Position);
                        var is2ndDimVal = string.IsNullOrWhiteSpace(sizeObj.D1Position) && !string.IsNullOrWhiteSpace(sizeObj.D2Position);
                        var sizeObjectDetail = await _appSizeScaleDetailRepository.GetAll()
                            .WhereIf(is1stDimVal,a=> !string.IsNullOrWhiteSpace(a.D1Position) && string.IsNullOrWhiteSpace(a.D2Position))
                            .WhereIf(is2ndDimVal, a=> string.IsNullOrWhiteSpace(a.D1Position) && !string.IsNullOrWhiteSpace(a.D2Position))
                            .Where (a=> a.SizeScaleId == sizeScale.Id & a.SizeCode == sizeObj.SizeCode).AsNoTracking().FirstOrDefaultAsync();

                        if (sizeObjectDetail == null) //if (sizeObj.Id == 0)
                        {
                            var appSizeScalesDetail = ObjectMapper.Map<AppSizeScalesDetail>(sizeObj);
                            appSizeScalesDetail.SizeScaleId = sizeScale.Id;
                            appSizeScalesDetail.TenantId = AbpSession.TenantId;
                            await _appSizeScaleDetailRepository.InsertAsync(appSizeScalesDetail);
                        }
                        else
                        {
                            //var size = await _appSizeScaleDetailRepository.GetAll().FirstOrDefaultAsync(x=> x.Id == sizeObj.Id);
                            //if (size != null)
                            var appSizeScalesDetail = ObjectMapper.Map<AppSizeScalesDetail>(sizeObj);
                            appSizeScalesDetail.SizeScaleId = sizeScale.Id;
                            appSizeScalesDetail.TenantId = AbpSession.TenantId;
                            appSizeScalesDetail.Id = sizeObjectDetail.Id;
                            try
                            {
                                await _appSizeScaleDetailRepository.UpdateAsync(appSizeScalesDetail);

                            }
                            catch (Exception ex)
                            { }
                        }
                    }
                        await CurrentUnitOfWork.SaveChangesAsync();

                    return await GetSizeScaleForEdit(sizeScale.Id);
                }
                else
                {
                    throw new Exception("This Size Scale is not found in the database");
                }

            }
        }
    }
}
