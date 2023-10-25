using onetouch.AppEntities;
					using System.Collections.Generic;


using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.AccountInfos.Exporting;
using onetouch.AccountInfos.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using onetouch.SystemObjects;
using onetouch.Helpers;
using onetouch.AppContacts;
using Abp.Domain.Uow;
using NUglify.Helpers;
using Org.BouncyCastle.Math.EC.Rfc7748;
using onetouch.AppEntities.Dtos;
using onetouch.Storage;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using onetouch.Configuration;
using System.Drawing.Printing;
using onetouch.Attachments;
using onetouch.Common;
using onetouch.AppContacts.Dtos;
using Stripe.Checkout;
using AuthorizeNet.Api.Contracts.V1;
using AuthorizeNet.Api.Controllers.Bases;
using AuthorizeNet.Api.Controllers;
using Abp.UI;
using System.Text.RegularExpressions;

namespace onetouch.AccountInfos
{
	[AbpAuthorize(AppPermissions.Pages_AccountInfo)]
    public class AccountInfoAppService_old : onetouchAppServiceBase, IAccountInfoAppService
    {
		private readonly IRepository<AppContact,long> _appContactRepository;
        private readonly IRepository<AppEntity, long> _appEntityRepository;
        private readonly IRepository<AppEntityCategory, long> _appEntityCategoryRepository;
        private readonly IRepository<AppEntityAttachment, long> _appEntityAttachmentRepository;
        private readonly IRepository<AppAttachment, long> _appAttachmentRepository;
        private readonly IRepository<AppEntityClassification, long> _appEntityClassificationRepository;
        private readonly IRepository<AppAddress, long> _appAddressRepository;
        private readonly IRepository<AppContactAddress, long> _appContactAddressRepository;
        private readonly IRepository<AppContactPaymentMethod, long> _appContactPaymentMethodRepository;

        private readonly Helper _helper;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly ITempFileCacheManager _tempFileCacheManager;
        private readonly IConfigurationRoot _appConfiguration;

        private readonly IAppEntitiesAppService _appEntitiesAppService;
        private enum CardType
        {
            MasterCard, Visa, AmericanExpress, Discover, JCB
        };

        public AccountInfoAppService_old(IRepository<AppEntity, long> lookup_appEntityRepository, IRepository<AppContact, long> lookup_appContactRepository, Helper helper,IUnitOfWorkManager unitOfWorkManager 
            , IRepository<AppEntityCategory, long> appEntityCategoryRepository
            , IRepository<AppEntityClassification, long> appEntityClassificationRepository
            , ITempFileCacheManager tempFileCacheManager
            , IRepository<AppEntityAttachment, long> appEntityAttachmentRepository
            , IAppConfigurationAccessor appConfigurationAccessor
            , IRepository<AppAttachment, long> appAttachmentRepository
            , IRepository<AppAddress, long> appAddressRepository
            , IRepository<AppContactAddress, long> appContactAddressRepository
            , IAppEntitiesAppService appEntitiesAppService
            , IRepository<AppContactPaymentMethod, long> appContactPaymentMethodRepository)
        {
			_appEntityRepository = lookup_appEntityRepository;
            _appContactRepository = lookup_appContactRepository;
            _helper = helper;
            _unitOfWorkManager = unitOfWorkManager;
            _appEntityCategoryRepository = appEntityCategoryRepository;
            _appEntityClassificationRepository = appEntityClassificationRepository;
            _tempFileCacheManager = tempFileCacheManager;
            _appEntityAttachmentRepository = appEntityAttachmentRepository;
            _appConfiguration = appConfigurationAccessor.Configuration;
            _appAttachmentRepository = appAttachmentRepository;
            _appAddressRepository = appAddressRepository;
            _appContactAddressRepository = appContactAddressRepository;
            _appEntitiesAppService = appEntitiesAppService;
            _appContactPaymentMethodRepository = appContactPaymentMethodRepository;
        }

		 [AbpAuthorize(AppPermissions.Pages_AccountInfo_Edit)]
		 public async Task<GetAccountInfoForEditOutput> GetAccountInfoForEdit()
         {
            
            var accountInfo = await _appContactRepository.GetAll()
                .Where(x => x.IsProfileData && x.ParentId==null)
                .Include(x=>x.PartnerFkList)
                .Include(x => x.AppContactPaymentMethods)
                //.Include(x=>x.AppContactAddresses).ThenInclude(x=>x.AddressFk)
                //.Include(x => x.AppContactAddresses).ThenInclude(x => x.AddressTypeFk)
                //.Include(x=>x.EntityFk)
                .FirstOrDefaultAsync();

            if (accountInfo == null)
                return new GetAccountInfoForEditOutput { AccountInfo = new CreateOrEditAccountInfoDto { EntityCategories = new List<AppEntityCategoryDto>(), EntityClassifications = new List<AppEntityClassificationDto>() } };
            var output = new GetAccountInfoForEditOutput {AccountInfo = ObjectMapper.Map<CreateOrEditAccountInfoDto>(accountInfo)};
            output.AccountInfo.ContactPaymentMethods = ObjectMapper.Map<IList<AppContactPaymentMethodDto>>(accountInfo.AppContactPaymentMethods);
            //using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            //{
            var entity = await _appEntityRepository.GetAll()
                .Include(x => x.EntityCategories).ThenInclude(x => x.EntityObjectCategoryFk)
                .Include(x => x.EntityClassifications).ThenInclude(x => x.EntityObjectClassificationFk)
                .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                .FirstOrDefaultAsync(x => x.Id == accountInfo.EntityId);

                output.AccountInfo.EntityCategories = ObjectMapper.Map<IList<AppEntityCategoryDto>>(entity.EntityCategories);
                output.AccountInfo.EntityClassifications = ObjectMapper.Map<IList<AppEntityClassificationDto>>(entity.EntityClassifications);
                output.AccountInfo.EntityAttachments = ObjectMapper.Map<IList<AppEntityAttachmentDto>>(entity.EntityAttachments);
            //}

            //output.AccountInfo.ContactAddresses = ObjectMapper.Map<IList<AppContactAddressDto>>(accountInfo.AppContactAddresses);

            var branch = ObjectMapper.Map<BranchDto>(accountInfo);
            BranchForViewDto branchForViewDto = new BranchForViewDto { Branch = branch, Id = branch.Id, SubTotal = 0 };
            List<TreeNode<BranchForViewDto>> branches = new List<TreeNode<BranchForViewDto>>
            {
                new TreeNode<BranchForViewDto>() { label = branch.Name, Data = branchForViewDto}
            };
            output.AccountInfo.Branches = branches;

            //var branch = await _appContactRepository.GetAll().Where(x => x.IsProfileData && x.ParentId == null).FirstOrDefaultAsync();
            //output.AccountInfo.Branches = ObjectMapper.Map<IList<BranchDto>>(branch);

            if (output.AccountInfo!=null)
                output.AccountInfo.Notes = accountInfo.EntityFk.Notes;

            if (output.AccountInfo != null)
            {
                if (output.AccountInfo.Phone1TypeId != null)
                {
                    var _lookupAppEntity = await _appEntityRepository.FirstOrDefaultAsync((long)output.AccountInfo.Phone1TypeId);
                    output.Phone1TypeName = _lookupAppEntity.Name.ToString();
                }

                if (output.AccountInfo.Phone2TypeId != null)
                {
                    var _lookupAppEntity = await _appEntityRepository.FirstOrDefaultAsync((long)output.AccountInfo.Phone2TypeId);
                    output.Phone2TypeName = _lookupAppEntity.Name.ToString();
                }

                if (output.AccountInfo.Phone3TypeId != null)
                {
                    var _lookupAppEntity = await _appEntityRepository.FirstOrDefaultAsync((long)output.AccountInfo.Phone3TypeId);
                    output.Phone3TypeName = _lookupAppEntity.Name.ToString();
                }

                if (output.AccountInfo.CurrencyId != null)
                {
                    var _lookupAppEntity = await _appEntityRepository.FirstOrDefaultAsync((long)output.AccountInfo.CurrencyId);
                    output.CurrencyName = _lookupAppEntity.Name.ToString();
                }

                if (output.AccountInfo.LanguageId != null)
                {
                    var _lookupAppEntity = await _appEntityRepository.FirstOrDefaultAsync((long)output.AccountInfo.LanguageId);
                    output.LanguageName = _lookupAppEntity.Name.ToString();
                }
            }
            else
            {
                output.AccountInfo = new CreateOrEditAccountInfoDto();
            }

            foreach (var item in output.AccountInfo.EntityAttachments)
            {
                item.Url = @"attachments/" + AbpSession.TenantId + @"/" + item.FileName;
            }
            return output;
         }

        public async Task<GetAccountInfoForEditOutput> CreateOrEdit(CreateOrEditAccountInfoDto input)
         {
            return await Update(input);
         }

        [AbpAuthorize(AppPermissions.Pages_AccountInfo_Edit)]
        protected virtual async Task<GetAccountInfoForEditOutput> Update(CreateOrEditAccountInfoDto input)
        {
            AppContact contactOriginal;
            if (input.AccountLevel == AccountLevelEnum.Profile)
            {
                contactOriginal = await _appContactRepository.FirstOrDefaultAsync(x => x.IsProfileData);
            }
            else
            {
                contactOriginal = await _appContactRepository.FirstOrDefaultAsync(x => x.Id == input.Id);
            }

            var contactObjectId = await _helper.SystemTables.GetObjectContactId();
            var partnerEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeParetnerId();
            
            AppEntityDto entity = new AppEntityDto();
            ObjectMapper.Map(input, entity);
            entity.Id = 0;
            entity.ObjectId = contactObjectId;
            entity.EntityObjectTypeId = partnerEntityObjectTypeId;
            entity.Name = input.Name;
            entity.Notes = input.Notes;
            entity.Code = input.Code;
            entity.TenantId = AbpSession.TenantId;

            AppContactDto contact = new AppContactDto();
            //var contactSavedId = contact.Id;
            ObjectMapper.Map(input, contact);
            //contact.Id = contactSavedId;

            contact.IsProfileData = input.AccountLevel == AccountLevelEnum.Profile;
            contact.TenantId = AbpSession.TenantId;

            entity.Id = contactOriginal==null ? 0 : contactOriginal.EntityId;
            var savedEntity = await _appEntitiesAppService.SaveEntity(entity);

            contact.EntityId = savedEntity;
            contact.Id = contactOriginal == null ? 0 : contactOriginal.Id;
            await _appEntitiesAppService.SaveContact(contact);

            await CurrentUnitOfWork.SaveChangesAsync();
            return await GetAccountInfoForEdit();
            //AppEntity entity;

            //if (contact != null)
            //{
            //    entity = await _appEntityRepository.GetAll().Include(x => x.EntityCategories)
            //        .Include(x => x.EntityClassifications)
            //        .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
            //        .FirstOrDefaultAsync(x => x.Id == contact.EntityId);
            //}
            //else
            //{
            //    entity = new AppEntity();
            //    contact = new AppContact();
            //}

            ////------------------------------------------
            //var contactObjectId = await _helper.SystemTables.GetObjectContactId();
            //var partnerEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeParetnerId();

            //entity.ObjectId = contactObjectId;
            //entity.EntityObjectTypeId = partnerEntityObjectTypeId;
            //entity.Name = input.Name;
            //entity.Description = input.Notes;
            //entity.TenantId = GetCurrentTenant().Id;

            ////add new categories
            //if (input.EntityCategories != null)
            //{
            //    foreach (var item in input.EntityCategories)
            //    {
            //        if (entity.EntityCategories.Count(x => x.EntityObjectCategoryId == item.EntityObjectCategoryId) == 0)
            //        {
            //            entity.EntityCategories.Add(new AppEntityCategory { EntityObjectCategoryId = (int)item.EntityObjectCategoryId, EntityId = entity.Id });
            //        }
            //    }
            //}
            ////delete removed categories
            //if (entity.EntityCategories != null)
            //{
            //    foreach (var item in entity.EntityCategories)
            //    {
            //        if (input.EntityCategories.Count(x => x.EntityObjectCategoryId == item.EntityObjectCategoryId) == 0)
            //        {
            //            await _appEntityCategoryRepository.DeleteAsync(item.Id);
            //        }
            //    }
            //}

            ////add new Classifications
            //if (input.EntityClassifications != null)
            //{
            //    foreach (var item in input.EntityClassifications)
            //    {
            //        if (entity.EntityClassifications.Count(x => x.EntityObjectClassificationId == item.EntityObjectClassificationId) == 0)
            //        {
            //            entity.EntityClassifications.Add(new AppEntityClassification { EntityObjectClassificationId = (int)item.EntityObjectClassificationId, EntityId = entity.Id });
            //        }
            //    }
            //}

            ////delete removed Classifications
            //if (entity.EntityClassifications != null)
            //{
            //    foreach (var item in entity.EntityClassifications)
            //    {
            //        if (input.EntityClassifications.Count(x => x.EntityObjectClassificationId == item.EntityObjectClassificationId) == 0)
            //        {
            //            await _appEntityClassificationRepository.DeleteAsync(item.Id);
            //        }
            //    }
            //}

            ////add new attachments
            //if (input.EntityAttachments != null)
            //{
            //    foreach (var item in input.EntityAttachments)
            //    {
            //        bool newRecord = false;
            //        if (entity.EntityAttachments.Count(x => x.AttachmentCategoryId == item.AttachmentCategoryId) == 0)
            //        {
            //            newRecord = true;
            //        }
            //        string extension = "";
            //        if (item.FileName.Split(".").Length > 1)
            //        {
            //            extension = item.FileName.Split(".")[item.FileName.Split(".").Length - 1];
            //        }
            //        var filename = item.guid + (extension == "" ? "" : "." + extension);

            //        if (newRecord)
            //        {
            //            var att = new AppAttachment { Name = item.FileName, Attachment = filename, TenantId = AbpSession.TenantId };
            //            await _appAttachmentRepository.InsertAsync(att);
            //            await CurrentUnitOfWork.SaveChangesAsync();
            //            entity.EntityAttachments.Add(new AppEntityAttachment { AttachmentCategoryId = (int)item.AttachmentCategoryId, EntityId = entity.Id, AttachmentId = att.Id });
            //            await CurrentUnitOfWork.SaveChangesAsync();
            //        }
            //        else
            //        {
            //            var existed = entity.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == item.AttachmentCategoryId).AttachmentFk;
            //            existed.Name = item.FileName;
            //            existed.Attachment = filename;
            //        }
            //        MoveFile(filename);
            //    }
            //}

            //if (entity.EntityAttachments != null)
            //{
            //    //delete removed attachments
            //    foreach (var item in entity.EntityAttachments)
            //    {
            //        if (input.EntityAttachments.Count(x => x.AttachmentCategoryId == item.AttachmentCategoryId) == 0)
            //        {
            //            await _appEntityAttachmentRepository.DeleteAsync(item.Id);
            //            await _appAttachmentRepository.DeleteAsync(item.AttachmentId);
            //        }
            //    }
            //}

            //if (entity.Id == 0)
            //{
            //    entity = await _appEntityRepository.InsertAsync(entity);
            //    await CurrentUnitOfWork.SaveChangesAsync();
            //}


            ////------------------------------------------
            ////contact = ObjectMapper.Map<AppContact>(input);
            //var contactSavedId = contact.Id;
            //ObjectMapper.Map(input, contact);
            //contact.Id = contactSavedId;
            //contact.ObjectId = contactObjectId;
            //contact.EntityObjectTypeId = partnerEntityObjectTypeId;
            //contact.EntityId = entity.Id;
            //contact.IsProfileData = true;
            //contact.TenantId = GetCurrentTenant().Id;

            //if (contact.Id == 0)
            //{
            //    contact = await _appContactRepository.InsertAsync(contact);
            //    await CurrentUnitOfWork.SaveChangesAsync();
            //}

        }

        [AbpAuthorize(AppPermissions.Pages_AccountInfo_Publish)]
        public async Task PublishProfile()
        {

            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var contact = await _appContactRepository.GetAll().AsNoTracking().Include(x => x.AppContactAddresses).ThenInclude(x=>x.AddressFk).AsNoTracking().FirstOrDefaultAsync(x => x.TenantId == GetCurrentTenant().Id && x.IsProfileData == true);
                var entity = await _appEntityRepository.GetAll().AsNoTracking().Include(x => x.EntityCategories)
                                    .Include(x => x.EntityClassifications)
                                    .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                                    .AsNoTracking()
                                    .FirstOrDefaultAsync(x => x.TenantId == GetCurrentTenant().Id && x.Id == contact.EntityId);

                var publishContact = await _appContactRepository.GetAll().AsNoTracking().Include(x => x.AppContactAddresses).FirstOrDefaultAsync(x => x.TenantId == null && x.IsProfileData == false && x.PartnerId == contact.Id);

                AppEntityDto entityDto = new AppEntityDto();
                ObjectMapper.Map(entity, entityDto);
                entityDto.Id = 0;

                AppContactDto contactDto = new AppContactDto();
                ObjectMapper.Map(contact, contactDto);
                
                contactDto.PartnerId = contact.Id;
                contactDto.IsProfileData = false;
                contactDto.TenantId = null;
                contactDto.ContactAddresses = null;
                contactDto.Id = 0;

                if (publishContact != null)
                {
                    contactDto.Id = publishContact.Id;
                    entityDto.Id = publishContact.EntityId;
                }

                var savedEntity = await _appEntitiesAppService.SaveEntity(entityDto);

                contactDto.EntityId = savedEntity;
                contactDto.Id=await _appEntitiesAppService.SaveContact(contactDto);

                // Remove Addresses
                if (publishContact != null)
                {
                    var publishAddressesIds = publishContact.AppContactAddresses.Select(x => x.AddressId).ToArray();
                    var publishContactAddressesIds = publishContact.AppContactAddresses.Select(x => x.Id).ToArray();

                    await _appContactAddressRepository.DeleteAsync(x => publishContactAddressesIds.Contains(x.Id));
                    await _appAddressRepository.DeleteAsync(x => publishAddressesIds.Contains(x.Id));
                }

                // Add Addresses
                var addressesIds = contact.AppContactAddresses.Select(x => x.AddressId).ToArray();

                var addresses = _appAddressRepository.GetAll().Where(x => addressesIds.Contains(x.Id)).ToList();
                //foreach (var item in addresses)
                //{
                //    AppAddress address = new AppAddress();
                //    ObjectMapper.Map(item, address);
                //    address.Id = 0;
                //    address = await _appAddressRepository.InsertAsync(address);
                //    await CurrentUnitOfWork.SaveChangesAsync();


                //    var aId = contact.AppContactAddresses.FirstOrDefault(x => x.AddressId == item.Id && x.ContactId==);
                //    await _appContactAddressRepository.InsertAsync(new AppContactAddress { AddressId = address.Id, ContactId = contactDto.Id, AddressTypeId = aId.AddressTypeId });
                //}
                foreach (var contactAddress in contact.AppContactAddresses)
                {
                    var savedAddress = await _appAddressRepository.FirstOrDefaultAsync(x=>x.Id==contactAddress.AddressId);
                    AppAddress address = new AppAddress();
                    AppContactAddressDto existedInPublish = null;
                    
                    if(contactDto.ContactAddresses!=null)
                        existedInPublish = contactDto.ContactAddresses.FirstOrDefault(x => x.Code == contactAddress.AddressFk.Code);
                    
                    if(existedInPublish == null)
                    {
                        ObjectMapper.Map(savedAddress, address);
                        address.Id = 0;
                        address = await _appAddressRepository.InsertAsync(address);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                    else
                    {
                        address.Id = existedInPublish.AddressId;
                        address.Code = existedInPublish.Code;
                    }


                    AppContactAddress newContactAddress = new AppContactAddress();
                    //ObjectMapper.Map(contactAddress, newContactAddress);
                    newContactAddress.Id = 0;
                    newContactAddress.AddressId = address.Id;
                    newContactAddress.ContactId = contactDto.Id;
                    newContactAddress.AddressTypeId = contactAddress.AddressTypeId;
                    if (contactDto.ContactAddresses == null)
                        contactDto.ContactAddresses = new List<AppContactAddressDto>();
                    contactDto.ContactAddresses.Add(new AppContactAddressDto { Code = address.Code,AddressId=address.Id });
                    //var aId = contact.AppContactAddresses.FirstOrDefault(x => x.AddressId == contactAddress.Id && x.ContactId ==);
                    //await _appContactAddressRepository.InsertAsync(new AppContactAddress { AddressId = address.Id, ContactId = contactDto.Id, AddressTypeId = aId.AddressTypeId });
                    await _appContactAddressRepository.InsertAsync(newContactAddress);
                }
            }
        }

        [AbpAuthorize(AppPermissions.Pages_AccountInfo)]
		public async Task<List<AccountInfoAppEntityLookupTableDto>> GetAllAppEntityForTableDropdown()
		{
			return await _appEntityRepository.GetAll()
				.Select(appEntity => new AccountInfoAppEntityLookupTableDto
				{
					Id = appEntity.Id,
					DisplayName = appEntity.Name.ToString()
				}).ToListAsync();
		}

        [AbpAuthorize(AppPermissions.Pages_AccountInfo)]
        public async Task<long> GetCurrTenantEntityId()
        {
            var contact = await _appContactRepository.FirstOrDefaultAsync(x => x.IsProfileData);
            if (contact == null)
                return 0;

            return contact.EntityId;
        }



    }
}