using onetouch.SycCurrencyExchangeRates.Dtos;
using onetouch.SycCurrencyExchangeRates;
using onetouch.AppSubscriptionPlans.Dtos;
using onetouch.AppSubscriptionPlans;
using onetouch.AppSubScriptionPlan.Dtos;
using onetouch.AppSubScriptionPlan;
using onetouch.Maintainances.Dtos;
using onetouch.Maintainances;
using onetouch.AppItemSelectors.Dtos;
using onetouch.AppItemSelectors;
using onetouch.SycIdentifierDefinitions.Dtos;
using onetouch.SycIdentifierDefinitions;
using onetouch.SycSegmentIdentifierDefinitions.Dtos;
using onetouch.SycSegmentIdentifierDefinitions;
using onetouch.SycCounters.Dtos;
using onetouch.SycCounters;
using onetouch.Onetouch.Dtos;
using onetouch.Onetouch;
using onetouch.AppEventGuests.Dtos;
using onetouch.AppEventGuests;
using onetouch.AppEvents.Dtos;
using onetouch.AppEvents;
using onetouch.AppAdvertisements.Dtos;
using onetouch.AppAdvertisements;
using onetouch.AppPosts.Dtos;
using onetouch.AppPosts;
using onetouch.AppItemsLists.Dtos;
using onetouch.AppItemsLists;
using onetouch.AutotaskQueues.Dtos;
using onetouch.AutotaskQueues;
using onetouch.AppTenantsActivitiesLogs.Dtos;
using onetouch.AppTenantsActivitiesLogs;
using onetouch.AppTenantPlans.Dtos;
using onetouch.AppTenantPlans;
using onetouch.AppTransactions.Dtos;
using onetouch.AppTransactions;
using onetouch.SycPlanServices.Dtos;
using onetouch.SycPlanServices;
using onetouch.SycPlans.Dtos;
using onetouch.SycPlans;
using onetouch.SycServices.Dtos;
using onetouch.SycServices;
using onetouch.SycApplications.Dtos;
using onetouch.SycApplications;
using onetouch.AutoTaskTicketNotes.Dtos;
using onetouch.AutoTaskTicketNotes;
using onetouch.AutoTaskTickets.Dtos;
using onetouch.AutoTaskTickets;
using onetouch.AppItems.Dtos;
using onetouch.AppItems;
using onetouch.Accounts.Dtos;
using onetouch.Accounts;
using onetouch.AccountInfos.Dtos;
using onetouch.AccountInfos;
using onetouch.AppEntities.Dtos;
using onetouch.AppEntities;
using onetouch.SystemObjects.Dtos;
using onetouch.SystemObjects;
using Abp.Application.Editions;
using Abp.Application.Features;
using Abp.Auditing;
using Abp.Authorization;
using Abp.Authorization.Users;
//using Abp.DynamicEntityParameters;
using Abp.EntityHistory;
using Abp.Localization;
using Abp.Notifications;
using Abp.Organizations;
using Abp.UI.Inputs;
using Abp.Webhooks;
using AutoMapper;
using onetouch.Auditing.Dto;
using onetouch.Authorization.Accounts.Dto;
using onetouch.Authorization.Delegation;
using onetouch.Authorization.Permissions.Dto;
using onetouch.Authorization.Roles;
using onetouch.Authorization.Roles.Dto;
using onetouch.Authorization.Users;
using onetouch.Authorization.Users.Delegation.Dto;
using onetouch.Authorization.Users.Dto;
using onetouch.Authorization.Users.Importing.Dto;
using onetouch.Authorization.Users.Profile.Dto;
using onetouch.Chat;
using onetouch.Chat.Dto;
//using onetouch.DynamicEntityParameters.Dto;
using onetouch.Editions;
using onetouch.Editions.Dto;
using onetouch.Friendships;
using onetouch.Friendships.Cache;
using onetouch.Friendships.Dto;
using onetouch.Localization.Dto;
using onetouch.MultiTenancy;
using onetouch.MultiTenancy.Dto;
using onetouch.MultiTenancy.HostDashboard.Dto;
using onetouch.MultiTenancy.Payments;
using onetouch.MultiTenancy.Payments.Dto;
using onetouch.Notifications.Dto;
using onetouch.Organizations.Dto;
using onetouch.Sessions.Dto;
using onetouch.WebHooks.Dto;
using onetouch.Common;
using onetouch.AppContacts;
using onetouch.AppContacts.Dtos;
using onetouch.Message.Dto;
using onetouch.Message;
using System.Linq;
using Abp.Application.Services.Dto;
using onetouch.AutoTaskAttachmentInfo;
using onetouch.TenantInvitations;
using System;
using onetouch.AppSizeScales.Dtos;
using onetouch.AppSiiwiiTransaction.Dtos;
using onetouch.AppSiiwiiTransaction;
using onetouch.AppMarketplaceItems;
using onetouch.AppMarketplaceItemLists;
using onetouch.AppMarketplaceItems.Dtos;
using onetouch.AppMarketplaceMessages;

namespace onetouch
{
    internal static class CustomDtoMapper
    {
        public static void CreateMappings(IMapperConfigurationExpression configuration)
        {
            configuration.CreateMap<CreateOrEditSycCurrencyExchangeRatesDto, onetouch.SycCurrencyExchangeRates.SycCurrencyExchangeRates>().ReverseMap();
            configuration.CreateMap<SycCurrencyExchangeRatesDto, onetouch.SycCurrencyExchangeRates.SycCurrencyExchangeRates>().ReverseMap();
            configuration.CreateMap<CreateOrEditAppTenantInvoiceDto, AppTenantInvoice>().ReverseMap();
            configuration.CreateMap<AppTenantInvoiceDto, AppTenantInvoice>().ReverseMap();
            configuration.CreateMap<CreateOrEditAppTenantActivityLogDto, AppTenantActivitiesLog>().ReverseMap();
            configuration.CreateMap<AppTenantActivityLogDto, AppTenantActivitiesLog>().ReverseMap();
            configuration.CreateMap<CreateOrEditAppTenantActivityLogDto, oldAppTenantsActivitiesLog>().ReverseMap();
            configuration.CreateMap<AppTenantActivityLogDto, oldAppTenantsActivitiesLog>().ReverseMap();
            configuration.CreateMap<CreateOrEditAppTenantSubscriptionPlanDto, AppTenantSubscriptionPlan>().ReverseMap();
            configuration.CreateMap<AppTenantSubscriptionPlanDto, AppTenantSubscriptionPlan>().ReverseMap();
            configuration.CreateMap<CreateOrEditAppSubscriptionPlanHeaderDto, AppSubscriptionPlanHeader>().ReverseMap();
            configuration.CreateMap<AppSubscriptionPlanHeaderDto, AppSubscriptionPlanHeader>().ReverseMap();
            configuration.CreateMap<CreateOrEditAppSubscriptionPlanDetailDto, AppSubscriptionPlanDetail>().ReverseMap();
            configuration.CreateMap<AppSubscriptionPlanDetailDto, AppSubscriptionPlanDetail>().ReverseMap();

            configuration.CreateMap<CreateOrEditMaintainanceDto, Maintainance>().ReverseMap();
            configuration.CreateMap<MaintainanceDto, Maintainance>().ReverseMap();
            configuration.CreateMap<CreateOrEditAppItemSelectorDto, AppItemSelector>().ReverseMap();
            configuration.CreateMap<AppItemSelectorDto, AppItemSelector>().ReverseMap();
            configuration.CreateMap<CreateOrEditSycEntityObjectTypeDto, SycEntityObjectType>().ReverseMap();
            configuration.CreateMap<CreateOrEditSycIdentifierDefinitionDto, SycIdentifierDefinition>().ReverseMap();
            configuration.CreateMap<SycIdentifierDefinitionDto, SycIdentifierDefinition>().ReverseMap();
            configuration.CreateMap<CreateOrEditSycSegmentIdentifierDefinitionDto, SycSegmentIdentifierDefinition>().ReverseMap();
            configuration.CreateMap<SycSegmentIdentifierDefinitionDto, SycSegmentIdentifierDefinition>().ReverseMap();
            configuration.CreateMap<CreateOrEditSycCounterDto, SycCounter>().ReverseMap();
            configuration.CreateMap<SycCounterDto, SycCounter>().ReverseMap();
            configuration.CreateMap<CreateOrEditSycAttachmentTypeDto, SycAttachmentType>().ReverseMap();
            configuration.CreateMap<SycAttachmentType, SycAttachmentTypeDto>().ReverseMap();
            configuration.CreateMap<CreateOrEditSycTenantInvitatiosDto, SycTenantInvitatios>().ReverseMap();
            configuration.CreateMap<SycTenantInvitatiosDto, SycTenantInvitatios>().ReverseMap();
            configuration.CreateMap<CreateOrEditAppEventGuestDto, AppEventGuest>().ReverseMap();
            configuration.CreateMap<GetAppEventForViewDto, GetAppEventForEditDto>().ReverseMap();
            configuration.CreateMap<AppEventGuestDto, AppEventGuest>().ReverseMap();
            configuration.CreateMap<CreateOrEditAppEventDto, AppEvent>().ReverseMap();
            configuration.CreateMap<AppEventDto, AppEvent>().ReverseMap();
            configuration.CreateMap<CreateOrEditAppAdvertisementDto, AppAdvertisement>().ReverseMap();
            configuration.CreateMap<AppAdvertisementDto, AppAdvertisement>().ReverseMap();
            configuration.CreateMap<CreateOrEditAppPostDto, AppPost>().ReverseMap();
            configuration.CreateMap<AppPostDto, AppPost>().ReverseMap();
            configuration.CreateMap<AppItemsList, AppItemsList>()
                .ForMember(d => d.Id, s => s.Ignore())
                //.ForMember(dest => dest.EntityId, opt => opt.Ignore())
                .ForMember(dest => dest.EntityFk, opt => opt.Ignore())
                .ForMember(dest => dest.ItemSharingFkList, opt => opt.Ignore())
              //.ForMember(dest => dest.AppItemsListDetails, opt => opt.Ignore())
              ;

            configuration.CreateMap<AppItemsListDetail, AppItemsListDetail>()
                .ForMember(d => d.Id, s => s.Ignore())
                .ForMember(d => d.ItemsListFK, s => s.Ignore())
                .ForMember(d => d.ItemFK, s => s.Ignore())
                ;

            configuration.CreateMap<AppItemsListDetail, CreateOrEditAppItemsListItemDto>()
                .ForMember(d => d.ItemCode, s => s.MapFrom(ss => ss.ItemFK.Code))
                .ForMember(d => d.ItemName, s => s.MapFrom(ss => ss.ItemFK.Name))
                .ForMember(d => d.ItemDescription, s => s.MapFrom(ss => ss.ItemFK.EntityFk.Notes))
                .ForMember(d => d.ImageURL, s => s.MapFrom(ss => ss.ItemFK.TenantId.ToString()))
                .ForMember(d => d.State, s => s.MapFrom(ss => string.IsNullOrEmpty(ss.State) == true ? StateEnum.ActiveOrEmpty : (StateEnum)Enum.Parse(typeof(StateEnum), ss.State.ToString().Trim())));

            configuration.CreateMap<AppItemsListItemVariationDto, AppItemsListDetail>()
                .ForMember(d => d.ItemId, s => s.MapFrom(ss => ss.ItemId))
                .ForMember(d => d.State, s => s.MapFrom(ss => ss.State.ToString()));

            configuration.CreateMap<AppItemsListDetail, AppItemsListItemVariationDto>()
                .ForMember(d => d.ItemCode, s => s.MapFrom(ss => ss.ItemFK.Code))
                .ForMember(d => d.ItemName, s => s.MapFrom(ss => ss.ItemFK.Name))
                .ForMember(d => d.ItemDescription, s => s.MapFrom(ss => ss.ItemFK.EntityFk.Notes))
                .ForMember(d => d.ImageURL, s => s.MapFrom(ss => ss.ItemFK.TenantId.ToString()))
                .ForMember(d => d.State, s => s.MapFrom(ss => string.IsNullOrEmpty(ss.State) == true ? StateEnum.ActiveOrEmpty : (StateEnum)Enum.Parse(typeof(StateEnum), ss.State.ToString().Trim())))
                .ForMember(d => d.Variation, s => s.MapFrom(ss => ss.ItemFK.ParentFk));

            configuration.CreateMap<CreateOrEditAppItemsListItemDto, AppItemsListDetail>()
                .ForMember(d => d.State, s => s.MapFrom(ss => ss.State.ToString()));

            configuration.CreateMap<AppItem, AppItemVariationDto>()
                                .ForMember(d => d.ItemCode, s => s.MapFrom(ss => ss.Code))
                .ForMember(d => d.ItemName, s => s.MapFrom(ss => ss.Name))
                .ForMember(d => d.EntityExtraData, s => s.MapFrom(ss => ss.EntityFk.EntityExtraData))
                .ForMember(d => d.State, s => s.MapFrom(ss => StateEnum.ActiveOrEmpty))
                .ForMember(d => d.ImgURL, s => s.MapFrom(ss =>
                    (ss.EntityFk.EntityAttachments.FirstOrDefault(x => x.IsDefault == true) == null ?
                    (ss.EntityFk.EntityAttachments.FirstOrDefault() == null ? ss.EntityFk.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment : "")
                    : ss.EntityFk.EntityAttachments.FirstOrDefault(x => x.IsDefault == true).AttachmentFk.Attachment)
                ));
            configuration.CreateMap<AppItemVariationDto, AppItem>();
            configuration.CreateMap<AppItem, AppItemVariationDto>()
                 .ForMember(d => d.EntityAttachments, s => s.MapFrom(ss => ss.EntityFk.EntityAttachments))
                 .ForMember(d => d.EntityExtraData, s => s.MapFrom(ss => ss.EntityFk.EntityExtraData))
                 .ForMember(d => d.ItemCode, s => s.MapFrom(ss => ss.Code))
                 .ForMember(d => d.State, s => s.MapFrom(ss => StateEnum.ActiveOrEmpty))
                 .ForMember(d => d.ItemName, s => s.MapFrom(ss => ss.Name))
                ;
            configuration.CreateMap<AppItemVariationDto, AppItemsListDetail>()
                .ForMember(d => d.State, s => s.MapFrom(ss => ss.State.ToString()));

            configuration.CreateMap<AppItemsListDetail, AppItemVariationDto>()
                .ForMember(d => d.State, s => s.MapFrom(ss => string.IsNullOrEmpty(ss.State) == true ? StateEnum.ActiveOrEmpty : (StateEnum)Enum.Parse(typeof(StateEnum), ss.State.ToString().Trim())));

            configuration.CreateMap<CreateOrEditAppItemsListDto, AppItemsList>();
            configuration.CreateMap<AppItemsList, CreateOrEditAppItemsListDto>()
                 .ForMember(d => d.UsersCount, s => s.MapFrom(ss => ss.ItemSharingFkList.Count(x => x.SharedUserId != null)))
                 .ForMember(d => d.StatusCode, s => s.MapFrom(ss => ss.EntityFk != null ? ss.EntityFk.EntityObjectStatusCode : ""))
                 .ForMember(d => d.StatusId, s => s.MapFrom(ss => ss.EntityFk != null ? ss.EntityFk.EntityObjectStatusId : 0))
                 .ForMember(d => d.Users, s => s.MapFrom(ss => ss.ItemSharingFkList.Where(x => x.SharedUserId != null).Take(5)))
                ;

            configuration.CreateMap<AppItemSharing, UserInfoDto>()
                .ForMember(d => d.Name, s => s.MapFrom(ss => ss.UserFk.Name))
                .ForMember(d => d.Id, s => s.MapFrom(ss => ss.SharedUserId))
                ;
            configuration.CreateMap<CreateOrEditAppItemsListDto, AppEntityDto>().ReverseMap();
            configuration.CreateMap<AppItemsListDto, AppItemsList>().ReverseMap();
            configuration.CreateMap<CreateOrEditAutotaskQueueDto, AutotaskQueue>().ReverseMap();
            configuration.CreateMap<AutotaskQueueDto, AutotaskQueue>().ReverseMap();
            configuration.CreateMap<CreateOrEditAppTenantsActivitiesLogDto, oldAppTenantsActivitiesLog>().ReverseMap();
            configuration.CreateMap<AppTenantsActivitiesLogDto, oldAppTenantsActivitiesLog>().ReverseMap();
            configuration.CreateMap<CreateOrEditAppTenantPlanDto, AppTenantPlan>().ReverseMap();
            configuration.CreateMap<AppTenantPlanDto, AppTenantPlan>().ReverseMap();
            configuration.CreateMap<CreateOrEditAppTransactionDto, AppTransaction>().ReverseMap();
            configuration.CreateMap<AppTransactionDto, AppTransaction>().ReverseMap();
            configuration.CreateMap<CreateOrEditSycPlanServiceDto, SycPlanService>().ReverseMap();
            configuration.CreateMap<SycPlanServiceDto, SycPlanService>().ReverseMap();
            configuration.CreateMap<CreateOrEditSycPlanDto, SycPlan>().ReverseMap();
            configuration.CreateMap<SycPlanDto, SycPlan>().ReverseMap();
            configuration.CreateMap<CreateOrEditSycServiceDto, SycService>().ReverseMap();
            configuration.CreateMap<SycServiceDto, SycService>().ReverseMap();
            configuration.CreateMap<CreateOrEditSycApplicationDto, SycApplication>().ReverseMap();
            configuration.CreateMap<SycApplicationDto, SycApplication>().ReverseMap();
            configuration.CreateMap<AttachmentInfoDto, AttachmentInfo>()
                .ForMember(d => d.Title, s => s.MapFrom(ss => ss.Description))
                .ForMember(d => d.FullPath, s => s.MapFrom(ss => ss.FullPath))
                .ForMember(d => d.Id, s => s.MapFrom(ss => ss.ID));
            configuration.CreateMap<AttachmentInfo, AttachmentInfoDto>()
                .ForMember(d => d.Description, s => s.MapFrom(ss => ss.Title))
                .ForMember(d => d.FullPath, s => s.MapFrom(ss => ss.FullPath))
                .ForMember(d => d.FileName, s => s.MapFrom(ss => System.IO.Path.GetFileName(ss.FullPath)))
                .ForMember(d => d.ID, s => s.MapFrom(ss => ss.Id));

            configuration.CreateMap<CreateOrEditTicketNoteDto, TicketNote>()
                 .ForMember(d => d.EntityAttachments, s => s.MapFrom(ss => ss.EntityAttachments.Select(r => new AttachmentInfo { Title = r.Description, FullPath = r.FullPath, Id = r.ID }).ToList()));
            configuration.CreateMap<TicketNote, CreateOrEditTicketNoteDto>()
                .ForMember(d => d.EntityAttachments, s => s.MapFrom(ss => ss.EntityAttachments.Select(r => new AttachmentInfoDto { ID = r.Id, Description = r.Title, FullPath = r.FullPath, FileName = System.IO.Path.GetFileName(r.FullPath) }).ToList()));
            configuration.CreateMap<CreateOrEditTicketNoteDto, GetTicketNoteForViewDto>()
                .ForMember(d => d.Attachments, s => s.MapFrom(ss => ss.EntityAttachments.Select(r => new AttachmentInfoDto { ID = r.Id, Description = r.Description, FullPath = r.FullPath, FileName = System.IO.Path.GetFileName(r.FullPath) }).ToList()));

            configuration.CreateMap<TicketNoteDto, TicketNote>().ReverseMap();
            configuration.CreateMap<CreateOrEditTicketDto, Ticket>()
                .ForMember(d => d.EntityAttachments, s => s.MapFrom(ss => ss.EntityAttachments.Select(r => new AttachmentInfo { Id = r.ID, Title = r.Description, FullPath = r.FullPath }).ToList())); ;
            configuration.CreateMap<Ticket, CreateOrEditTicketDto>()
                .ForMember(d => d.EntityAttachments, s => s.MapFrom(ss => ss.EntityAttachments.Select(r => new AttachmentInfoDto { ID = r.Id, Description = r.Title, FullPath = r.FullPath, FileName = System.IO.Path.GetFileName(r.FullPath) }).ToList())); ;

            configuration.CreateMap<TicketDto, Ticket>().ReverseMap();
            configuration.CreateMap<CreateOrEditAppItemDto, AppItem>();
            configuration.CreateMap<AppItem, CreateOrEditAppItemDto>()
                .ForMember(d => d.EntityCategories, s => s.MapFrom(ss => ss.EntityFk.EntityCategories.Where(x => x.EntityObjectCategoryFk.TenantId != null)))
                .ForMember(d => d.EntityDepartments, s => s.MapFrom(ss => ss.EntityFk.EntityCategories.Where(x => x.EntityObjectCategoryFk.TenantId == null)))
                .ForMember(d => d.EntityClassifications, s => s.MapFrom(ss => ss.EntityFk.EntityClassifications))
                .ForMember(d => d.EntityAttachments, s => s.MapFrom(ss => ss.EntityFk.EntityAttachments))
                .ForMember(d => d.EntityExtraData, s => s.MapFrom(ss => ss.EntityFk.EntityExtraData))
                .ForMember(d => d.AppItemPriceInfos, s => s.MapFrom(ss => ss.ItemPricesFkList))
                .ForMember(d => d.AppItemSizesScaleInfo, s => s.MapFrom(ss => ss.ItemSizeScaleHeadersFkList))
                .ForMember(d => d.VariationItems, s => s.MapFrom(ss => ss.ParentFkList))
                .ForMember(d => d.EntityObjectTypeId, s => s.MapFrom(ss => ss.EntityFk.EntityObjectTypeId))
                .ForMember(d => d.Listed, s => s.MapFrom(ss => (ss.ListingItemFkList != null && ss.ListingItemFkList.Count() > 0) ? true : false))
                .ForMember(d => d.Published, s => s.MapFrom(ss => (ss.PublishedListingItemFkList != null && ss.PublishedListingItemFkList.Count() > 0) ? true : false));

            configuration.CreateMap<AppItemForViewDto, AppItem>();
            configuration.CreateMap<AppItem, AppItemForViewDto>()
                //.ForMember(d => d.EntityCategories, s => s.MapFrom(ss => ss.EntityFk.EntityCategories.Where(x => x.EntityObjectCategoryFk.TenantId != null)))
                //.ForMember(d => d.EntityDepartments, s => s.MapFrom(ss => ss.EntityFk.EntityCategories.Where(x => x.EntityObjectCategoryFk.TenantId == null)))
                //.ForMember(d => d.EntityClassifications, s => s.MapFrom(ss => ss.EntityFk.EntityClassifications))
                .ForMember(d => d.EntityCategories, opt => opt.Ignore())
                .ForMember(d => d.variations, opt => opt.Ignore())
                .ForMember(d => d.EntityDepartments, opt => opt.Ignore())
                .ForMember(d => d.EntityClassifications, opt => opt.Ignore())
                .ForMember(d => d.EntityAttachments, s => s.MapFrom(ss => ss.EntityFk.EntityAttachments))
                .ForMember(d => d.EntityExtraData, s => s.MapFrom(ss => ss.EntityFk.EntityExtraData))
                .ForMember(d => d.VariationItems, s => s.MapFrom(ss => ss.ParentFkList))
                .ForMember(d => d.EntityObjectTypeId, s => s.MapFrom(ss => ss.EntityFk.EntityObjectTypeId))
                .ForMember(d => d.AppItemPriceInfos, s => s.MapFrom(ss => ss.ItemPricesFkList))
                .ForMember(d => d.AppItemSizesScaleInfo, s => s.MapFrom(ss => ss.ItemSizeScaleHeadersFkList))
                .ForMember(d => d.Listed, s => s.MapFrom(ss => (ss.ListingItemFkList != null && ss.ListingItemFkList.Count() > 0) ? true : false))
                .ForMember(d => d.Published, s => s.MapFrom(ss => (ss.PublishedListingItemFkList != null && ss.PublishedListingItemFkList.Count() > 0) ? true : false));

            configuration.CreateMap<AppItem, AppItemVariationsDto>().ForMember(d => d.EntityExtraData, s => s.MapFrom(ss => ss.EntityFk.EntityExtraData));
            configuration.CreateMap<AppItemForEditDto, AppItem>();
            configuration.CreateMap<AppItem, AppItemForEditDto>()
                    //.ForMember(d => d.EntityCategories, s => s.MapFrom(ss => ss.EntityFk.EntityCategories.Where(x => x.EntityObjectCategoryFk.TenantId != null)))
                    //.ForMember(d => d.EntityDepartments, s => s.MapFrom(ss => ss.EntityFk.EntityCategories.Where(x => x.EntityObjectCategoryFk.TenantId == null)))
                    //.ForMember(d => d.EntityClassifications, s => s.MapFrom(ss => ss.EntityFk.EntityClassifications))
                    .ForMember(d => d.variations, opt => opt.Ignore())
                .ForMember(d => d.EntityCategories, opt => opt.Ignore())
                .ForMember(d => d.EntityDepartments, opt => opt.Ignore())
                .ForMember(d => d.EntityClassifications, opt => opt.Ignore())
                .ForMember(d => d.EntityAttachments, s => s.MapFrom(ss => ss.EntityFk.EntityAttachments))
                .ForMember(d => d.EntityExtraData, s => s.MapFrom(ss => ss.EntityFk.EntityExtraData))
                .ForMember(d => d.VariationItems, s => s.MapFrom(ss => ss.ParentFkList))
                .ForMember(d => d.EntityObjectTypeId, s => s.MapFrom(ss => ss.EntityFk.EntityObjectTypeId))
                .ForMember(d => d.AppItemPriceInfos, s => s.MapFrom(ss => ss.ItemPricesFkList))
                .ForMember(d => d.Listed, s => s.MapFrom(ss => (ss.ListingItemFkList != null && ss.ListingItemFkList.Count() > 0) ? true : false))
                .ForMember(d => d.Published, s => s.MapFrom(ss => (ss.PublishedListingItemFkList != null && ss.PublishedListingItemFkList.Count() > 0) ? true : false))
                .ForMember(d => d.AppItemSizesScaleInfo, s => s.MapFrom(ss => ss.ItemSizeScaleHeadersFkList));

            configuration.CreateMap<AppItem, VariationItemDto>()
                .ForMember(d => d.EntityExtraData, s => s.MapFrom(ss => ss.EntityFk.EntityExtraData))
                .ForMember(d => d.AppItemPriceInfos, s => s.MapFrom(ss => ss.ItemPricesFkList))
                .ForMember(d => d.EntityAttachments, s => s.MapFrom(ss => ss.EntityFk.EntityAttachments));

            configuration.CreateMap<VariationItemDto, AppItem>();

            configuration.CreateMap<VariationItemDto, AppEntityDto>().ReverseMap();

            configuration.CreateMap<AppEntityExtraDataDto, AppEntityExtraData>();
            configuration.CreateMap<AppEntityExtraData, AppEntityExtraDataDto>()
            .ForMember(d => d.EntityObjectTypeCode, s => s.MapFrom(ss => ss.EntityObjectTypeFk == null ? null : ss.EntityObjectTypeFk.Code))
            .ForMember(d => d.EntityObjectTypeName, s => s.MapFrom(ss => ss.EntityObjectTypeFk == null ? null : ss.EntityObjectTypeFk.Name))
            .ForMember(d => d.AttributeValueFkName, s => s.MapFrom(ss => ss.AttributeValueFk == null ? null : ss.AttributeValueFk.Name))
            .ForMember(d => d.AttributeValueFkCode, s => s.MapFrom(ss => ss.AttributeValueFk == null ? null : ss.AttributeValueFk.Code));
            ;

            #region AppEntityRelationDto
            configuration.CreateMap<AppEntitiesRelationshipDto, AppEntitiesRelationship>();
            configuration.CreateMap<AppEntitiesRelationship, AppEntitiesRelationshipDto>()
                .ForMember(d => d.EntityTypeCode, s => s.MapFrom(ss => ss.EntityFk == null ? ss.EntityTypeCode : ss.EntityFk.EntityObjectTypeCode))
                .ForMember(d => d.EntityCode, s => s.MapFrom(ss => ss.EntityFk == null ? ss.EntityCode : ss.EntityFk.Code))
                .ForMember(d => d.RelatedEntityCode, s => s.MapFrom(ss => ss.RelatedEntityFk == null ? ss.RelatedEntityTypeCode : ss.RelatedEntityFk.EntityObjectTypeCode))
                .ForMember(d => d.RelatedEntityCode, s => s.MapFrom(ss => ss.RelatedEntityFk == null ? ss.RelatedEntityCode : ss.RelatedEntityFk.Code))
                ;
            #endregion AppEntityRelationDto

            configuration.CreateMap<AppItemPriceInfo, AppItemPrices>().ReverseMap();
            configuration.CreateMap<AppItemPrices, AppItemPriceInfo>()
            .ForMember(d => d.CurrencyName, s => s.MapFrom(ss => ss.CurrencyFk == null ? null : ss.CurrencyFk.Name))
            .ForMember(d => d.CurrencySymbol, s => s.MapFrom(ss => ss.CurrencyFk != null && ss.CurrencyFk.EntityExtraData != null && ss.CurrencyFk.EntityExtraData.Count > 0 && (ss.CurrencyFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 41).AttributeValue != null) ? ss.CurrencyFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 41).AttributeValue : null));
            //MMT
            configuration.CreateMap<AppItemDto, AppItem>();
            configuration.CreateMap<AppItem, AppItem>()
                .ForMember(d => d.Id, s => s.Ignore())
                .ForMember(dest => dest.EntityFk, opt => opt.Ignore())
                .ForMember(dest => dest.ItemSharingFkList, opt => opt.Ignore())
                .ForMember(dest => dest.ListingItemFkList, opt => opt.Ignore())
                .ForMember(dest => dest.ParentEntityFk, opt => opt.Ignore())
                .ForMember(dest => dest.ParentFk, opt => opt.Ignore())
                .ForMember(dest => dest.ParentFkList, opt => opt.Ignore())
                .ForMember(dest => dest.PublishedListingItemFk, opt => opt.Ignore())
                .ForMember(dest => dest.PublishedListingItemFkList, opt => opt.Ignore())
              ;
            configuration.CreateMap<ItemSharingDto, AppItemSharing>();
            configuration.CreateMap<AppItemSharing, ItemSharingDto>()
                   .ForMember(d => d.SharedUserName, s => s.MapFrom(ss => ss.UserFk.Name))
                   .ForMember(d => d.SharedUserSureName, s => s.MapFrom(ss => ss.UserFk.Surname));

            configuration.CreateMap<AppContactPaymentMethod, AppContactPaymentMethodDto>().ReverseMap();
            configuration.CreateMap<CreateOrEditAppItemDto, AppEntityDto>()
                .ForMember(d => d.Notes, s => s.MapFrom(ss => ss.Description))
                .ReverseMap();

            configuration.CreateMap<PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>>, PagedResultDto<TreeviewItem>>();
            configuration.CreateMap<TreeNode<GetSycEntityObjectClassificationForViewDto>, TreeviewItem>()
                .ForMember(d => d.Text, s => s.MapFrom(ss => ss.label))
                .ForMember(d => d.Value, s => s.MapFrom(ss => ss.Data.SycEntityObjectClassification.Id))
               .ReverseMap();

            configuration.CreateMap<PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>>, PagedResultDto<TreeviewItem>>();
            configuration.CreateMap<TreeNode<GetSycEntityObjectCategoryForViewDto>, TreeviewItem>()
                .ForMember(d => d.Text, s => s.MapFrom(ss => ss.label))
                .ForMember(d => d.Value, s => s.MapFrom(ss => ss.Data.SycEntityObjectCategory.Id))
               .ReverseMap();

            configuration.CreateMap<CreateOrEditAccountDto, AppContact>()
                 .ForMember(d => d.AppContactAddresses, s => s.MapFrom(ss => ss.ContactAddresses))
                 .ForMember(d => d.AppContactPaymentMethods, s => s.MapFrom(ss => ss.ContactPaymentMethods))
                 .ForMember(d => d.CurrencyId, s => s.MapFrom(ss => ss.CurrencyId == 0 ? null : ss.CurrencyId))
                 .ForMember(d => d.LanguageId, s => s.MapFrom(ss => ss.LanguageId == 0 ? null : ss.LanguageId))
            .ReverseMap();

            configuration.CreateMap<AppContact, AccountSummaryDto>()
                .ForMember(d => d.PhoneNumber, s => s.MapFrom(ss => ss.Phone1Number))
                ;

            configuration.CreateMap<AccountDto, AppContact>()
                .ForMember(d => d.AccountType, s => s.Ignore());

            configuration.CreateMap<AppContact, AccountDto>()
                .ForMember(d => d.AccountType, s => s.Ignore());

            configuration.CreateMap<AppAddressDto, AppAddress>().ReverseMap();

            configuration.CreateMap<AppContactAddressDto, AppContactAddress>();
            configuration.CreateMap<AppContactAddress, AppContactAddressDto>()
            .ForMember(d => d.AddressLine1, s => s.MapFrom(ss => ss.AddressFk.AddressLine1))
            .ForMember(d => d.AddressLine2, s => s.MapFrom(ss => ss.AddressFk.AddressLine2))
            .ForMember(d => d.AddressTypeIdName, s => s.MapFrom(ss => ss.AddressTypeFk.Name))
            .ForMember(d => d.City, s => s.MapFrom(ss => ss.AddressFk.City))
            .ForMember(d => d.Name, s => s.MapFrom(ss => ss.AddressFk.Name))
            .ForMember(d => d.Code, s => s.MapFrom(ss => ss.AddressFk.Code))
            .ForMember(d => d.State, s => s.MapFrom(ss => ss.AddressFk.State))
            .ForMember(d => d.PostalCode, s => s.MapFrom(ss => ss.AddressFk.PostalCode))
            .ForMember(d => d.AddressLine2, s => s.MapFrom(ss => ss.AddressFk.AddressLine2))
            .ForMember(d => d.CountryIdName, s => s.MapFrom(ss => ss.AddressFk.CountryFk.Name));

            configuration.CreateMap<AppEntityAddressDto, AppEntityAddress>();
            configuration.CreateMap<AppEntityAddress, AppEntityAddressDto>()
            .ForMember(d => d.AddressLine1, s => s.MapFrom(ss => ss.AddressFk.AddressLine1))
            .ForMember(d => d.AddressLine2, s => s.MapFrom(ss => ss.AddressFk.AddressLine2))
            .ForMember(d => d.AddressTypeIdName, s => s.MapFrom(ss => ss.AddressTypeFk.Name))
            .ForMember(d => d.City, s => s.MapFrom(ss => ss.AddressFk.City))
            .ForMember(d => d.Name, s => s.MapFrom(ss => ss.AddressFk.Name))
            .ForMember(d => d.Code, s => s.MapFrom(ss => ss.AddressFk.Code))
            .ForMember(d => d.State, s => s.MapFrom(ss => ss.AddressFk.State))
            .ForMember(d => d.PostalCode, s => s.MapFrom(ss => ss.AddressFk.PostalCode))
            .ForMember(d => d.AddressLine2, s => s.MapFrom(ss => ss.AddressFk.AddressLine2))
            .ForMember(d => d.CountryIdName, s => s.MapFrom(ss => ss.AddressFk.CountryFk.Name));

            configuration.CreateMap<AppContact, BranchDto>()
             .ForMember(d => d.ContactAddresses, s => s.MapFrom(ss => ss.AppContactAddresses))
             .ForMember(d => d.CurrencyName, s => s.MapFrom(ss => ss.CurrencyFk.Name))
             .ForMember(d => d.LanguageName, s => s.MapFrom(ss => ss.LanguageFk.Name))
             .ForMember(d => d.Phone1TypeName, s => s.MapFrom(ss => ss.Phone1TypeFk.Name))
             .ForMember(d => d.Phone2TypeName, s => s.MapFrom(ss => ss.Phone2TypeFk.Name))
             .ForMember(d => d.Phone3TypeName, s => s.MapFrom(ss => ss.Phone3TypeFk.Name))
             ;
            configuration.CreateMap<BranchDto, AppContact>()
             .ForMember(d => d.CurrencyId, s => s.MapFrom(ss => ss.CurrencyId == 0 ? null : ss.CurrencyId))
             .ForMember(d => d.LanguageId, s => s.MapFrom(ss => ss.LanguageId == 0 ? null : ss.LanguageId))
             ;

            //configuration.CreateMap<BranchDto, AppContact>();
            configuration.CreateMap<BranchForViewDto, AppContact>().ReverseMap();

            configuration.CreateMap<AppContact, ContactDto>()
            .ForMember(d => d.ContactAddresses, s => s.MapFrom(ss => ss.AppContactAddresses))
            .ForMember(d => d.CurrencyName, s => s.MapFrom(ss => ss.CurrencyFk.Name))
            .ForMember(d => d.LanguageName, s => s.MapFrom(ss => ss.LanguageFk.Name))
            .ForMember(d => d.Phone1TypeName, s => s.MapFrom(ss => ss.Phone1TypeFk.Name))
            .ForMember(d => d.Phone2TypeName, s => s.MapFrom(ss => ss.Phone2TypeFk.Name))
            .ForMember(d => d.Phone3TypeName, s => s.MapFrom(ss => ss.Phone3TypeFk.Name))
            ;
            configuration.CreateMap<ContactDto, AppContact>()
             .ForMember(d => d.AppContactAddresses, s => s.MapFrom(ss => ss.ContactAddresses))
             .ForMember(d => d.CurrencyId, s => s.MapFrom(ss => ss.CurrencyId == 0 ? null : ss.CurrencyId))
             .ForMember(d => d.LanguageId, s => s.MapFrom(ss => ss.LanguageId == 0 ? null : ss.LanguageId))
             ;

            configuration.CreateMap<ContactForViewDto, AppContact>().ReverseMap();

            //Esraa 
            configuration.CreateMap<MessagesDto, AppMessage>();
            configuration.CreateMap<AppMessage, MessagesDto>()
                .ForMember(d => d.SendDate, s => s.MapFrom(ss => ss.CreationTime))
                .ForMember(d => d.ReceiveDate, s => s.MapFrom(ss => ss.CreationTime))
                .ForMember(d => d.EntityObjectTypeCode, s => s.MapFrom(ss => ss.EntityFk.EntityObjectTypeFk.Code))//.EntityObjectTypeCode
                .ForMember(d => d.EntityObjectStatusCode, s => s.MapFrom(ss => ss.EntityFk.EntityObjectStatusCode));
            configuration.CreateMap<CreateMessageInput, AppMessage>().ReverseMap();
            configuration.CreateMap<CreateMessageInput, AppEntityDto>().ReverseMap();
            configuration.CreateMap<CreateMessageForRecieversInput, AppEntityDto>().ReverseMap();
            configuration.CreateMap<CreateMessageInput, AppMarketplaceMessage>().ReverseMap();

            configuration.CreateMap<MessagesDto, AppMarketplaceMessage>();
            configuration.CreateMap<AppMarketplaceMessage, MessagesDto>()
                .ForMember(d => d.SendDate, s => s.MapFrom(ss => ss.CreationTime))
                .ForMember(d => d.ReceiveDate, s => s.MapFrom(ss => ss.CreationTime))
                .ForMember(d => d.EntityObjectTypeCode, s => s.MapFrom(ss => ss.EntityFk.EntityObjectTypeFk.Code))//.EntityObjectTypeCode
                .ForMember(d => d.EntityObjectStatusCode, s => s.MapFrom(ss => ss.EntityFk.EntityObjectStatusCode));
            //Esraa
            //configuration.CreateMap<AppContact, TreeNode<BranchDto>>()
            //    .ForMember(d => d.label, s => s.MapFrom(ss => ss.Name))
            //    .ForMember(d => d., s => s.MapFrom(ss => ss.Name));
            configuration.CreateMap<CreateOrEditSycAttachmentCategoryDto, SycAttachmentCategory>().ReverseMap();
            configuration.CreateMap<SycAttachmentCategoryDto, SycAttachmentCategory>().ReverseMap();

            configuration.CreateMap<CreateOrEditAccountInfoDto, AppContact>()
                .ForMember(d => d.AccountType, s => s.Ignore())
                .ForMember(d => d.CurrencyId, s => s.MapFrom(ss => ss.CurrencyId == 0 ? null : ss.CurrencyId))
                .ForMember(d => d.LanguageId, s => s.MapFrom(ss => ss.LanguageId == 0 ? null : ss.LanguageId))
                ;

            configuration.CreateMap<AppContact, CreateOrEditAccountInfoDto>()
                .ForMember(d => d.AccountType, s => s.Ignore())
                .ForMember(d => d.CurrencyId, s => s.MapFrom(ss => ss.CurrencyId == 0 ? null : ss.CurrencyId))
                .ForMember(d => d.LanguageId, s => s.MapFrom(ss => ss.LanguageId == 0 ? null : ss.LanguageId))
                ;

            configuration.CreateMap<CreateOrEditAccountInfoDto, AppContactDto>()
                .ForMember(d => d.AccountType, s => s.Ignore())
                 .ForMember(d => d.CurrencyId, s => s.MapFrom(ss => ss.CurrencyId == 0 ? null : ss.CurrencyId))
                .ForMember(d => d.LanguageId, s => s.MapFrom(ss => ss.LanguageId == 0 ? null : ss.LanguageId))
                ;
            configuration.CreateMap<AppContactDto, CreateOrEditAccountInfoDto>()
                .ForMember(d => d.AccountType, s => s.Ignore())
                 .ForMember(d => d.CurrencyId, s => s.MapFrom(ss => ss.CurrencyId == 0 ? null : ss.CurrencyId))
                .ForMember(d => d.LanguageId, s => s.MapFrom(ss => ss.LanguageId == 0 ? null : ss.LanguageId))
                ;
            configuration.CreateMap<AppContactDto, AppContact>()
                 .ForMember(d => d.AppContactAddresses, s => s.MapFrom(ss => ss.ContactAddresses))
                 .ForMember(d => d.CurrencyId, s => s.MapFrom(ss => ss.CurrencyId == 0 ? null : ss.CurrencyId))
                .ForMember(d => d.LanguageId, s => s.MapFrom(ss => ss.LanguageId == 0 ? null : ss.LanguageId))
                 .ReverseMap();
            configuration.CreateMap<CreateOrEditAccountInfoDto, AppEntityDto>()
                .ForMember(d => d.Notes, s => s.MapFrom(ss => ss.Notes))
                .ReverseMap();

            configuration.CreateMap<AppContact, AppContact>()
                 .ForMember(d => d.LastModificationTime, s => s.MapFrom(ss => ss.LastModificationTime == null ? ss.LastModificationTime : null))
                .ForMember(d => d.LastModifierUserId, s => s.MapFrom(ss => ss.LastModifierUserId == null ? ss.LastModifierUserId : null))

                 .ReverseMap();

            configuration.CreateMap<AppContactAddress, AppContactAddress>();

            configuration.CreateMap<AppAddress, AppAddress>()
                 .ForMember(d => d.LastModificationTime, s => s.MapFrom(ss => ss.LastModificationTime == null ? ss.LastModificationTime : null))
                .ForMember(d => d.LastModifierUserId, s => s.MapFrom(ss => ss.LastModifierUserId == null ? ss.LastModifierUserId : null))

                 .ReverseMap();

            configuration.CreateMap<CreateOrEditAccountDto, AppContactDto>()
              .ForMember(d => d.CurrencyId, s => s.MapFrom(ss => ss.CurrencyId == 0 ? null : ss.CurrencyId))
             .ForMember(d => d.LanguageId, s => s.MapFrom(ss => ss.LanguageId == 0 ? null : ss.LanguageId))
                .ReverseMap();
            configuration.CreateMap<CreateOrEditAccountDto, AppEntityDto>()
                .ForMember(d => d.Notes, s => s.MapFrom(ss => ss.About))
                .ReverseMap();

            configuration.CreateMap<AppEntityCategory, AppEntityCategoryDto>()
                .ForMember(d => d.EntityObjectCategoryCode, s => s.MapFrom(ss => ss.EntityObjectCategoryFk.Code))
                .ForMember(d => d.EntityObjectCategoryName, s => s.MapFrom(ss => ss.EntityObjectCategoryFk.Name));
            configuration.CreateMap<AppEntityCategoryDto, AppEntityCategory>();

            configuration.CreateMap<AppEntityClassification, AppEntityClassificationDto>()
                .ForMember(d => d.EntityObjectClassificationCode, s => s.MapFrom(ss => ss.EntityObjectClassificationFk.Code))
                .ForMember(d => d.EntityObjectClassificationName, s => s.MapFrom(ss => ss.EntityObjectClassificationFk.Name));
            configuration.CreateMap<AppEntityClassificationDto, AppEntityClassification>();

            configuration.CreateMap<AppEntityAttachmentDto, AppEntityAttachment>()
                .ForMember(g => g.AttachmentId, options => options.Ignore())
                .ForMember(g => g.AttachmentFk, options => options.Ignore()); ;
            configuration.CreateMap<AppEntityAttachment, AppEntityAttachmentDto>()
                .ForMember(d => d.FileName, s => s.MapFrom(ss => ss.AttachmentFk.Attachment))
           .ForMember(d => d.DisplayName, s => s.MapFrom(ss => ss.AttachmentFk.Name))
                ;

            configuration.CreateMap<CreateOrEditSuiIconDto, SuiIcon>().ReverseMap();
            configuration.CreateMap<SuiIconDto, SuiIcon>().ReverseMap();
            configuration.CreateMap<CreateOrEditAppEntityDto, AppEntity>()
                .ForMember(dest => dest.Code, opt => opt.Condition(source => source.Id == 0 || source.Id == null)).ReverseMap()
                ;

            configuration.CreateMap<AppEntityDto, AppEntity>()
                .ReverseMap();

            configuration.CreateMap<AppEntity, AppEntity>()
                 .ForMember(d => d.LastModificationTime, s => s.MapFrom(ss => ss.LastModificationTime == null ? ss.LastModificationTime : null))
                .ForMember(d => d.LastModifierUserId, s => s.MapFrom(ss => ss.LastModifierUserId == null ? ss.LastModifierUserId : null))
                .ReverseMap();

            configuration.CreateMap<CreateOrEditSycEntityObjectClassificationDto, SycEntityObjectClassification>().ReverseMap();
            //.ForMember(dest => dest.Code, opt => opt.Condition(source => source.Id == 0 || source.Id == null)).ReverseMap();
            configuration.CreateMap<SycEntityObjectClassificationDto, SycEntityObjectClassification>().ReverseMap();
            configuration.CreateMap<CreateOrEditSycEntityObjectStatusDto, SycEntityObjectStatus>()
                .ForMember(dest => dest.Code, opt => opt.Condition(source => source.Id == 0 || source.Id == null)).ReverseMap();
            configuration.CreateMap<SycEntityObjectStatusDto, SycEntityObjectStatus>().ReverseMap();
            configuration.CreateMap<CreateOrEditSycEntityObjectCategoryDto, SycEntityObjectCategory>().ReverseMap();
            //.ForMember(dest => dest.Code, opt => opt.Condition(source => source.Id == 0 || source.Id == null)).ReverseMap();
            configuration.CreateMap<SycEntityObjectCategoryDto, SycEntityObjectCategory>().ReverseMap();
            configuration.CreateMap<CreateOrEditSycEntityObjectTypeDto, SycEntityObjectType>()
                .ForMember(dest => dest.Code, opt => opt.Condition(source => source.Id == 0 || source.Id == null)).ReverseMap();
            configuration.CreateMap<SycEntityObjectTypeDto, SycEntityObjectType>().ReverseMap();
            configuration.CreateMap<CreateOrEditSydObjectDto, SydObject>()
                .ForMember(dest => dest.Code, opt => opt.Condition(source => source.Id == 0 || source.Id == null)).ReverseMap();
            configuration.CreateMap<SydObjectDto, SydObject>().ReverseMap();
            //configuration.CreateMap<GetSydObjectForViewDto, TreeNode<GetSydObjectForViewDto>>()
            //    .ForMember(d => d.Data, s => s.MapFrom(ss => ss));

            //configuration.CreateMap<GetSysObjectTypeForViewDto, TreeNode<GetSysObjectTypeForViewDto>>()
            //    .ForMember(d => d.Data, s => s.MapFrom(ss => ss));
            configuration.CreateMap<CreateOrEditSysObjectTypeDto, SysObjectType>().ReverseMap();
            configuration.CreateMap<SysObjectTypeDto, SysObjectType>().ReverseMap();
            //Inputs
            configuration.CreateMap<CheckboxInputType, FeatureInputTypeDto>();
            configuration.CreateMap<SingleLineStringInputType, FeatureInputTypeDto>();
            configuration.CreateMap<ComboboxInputType, FeatureInputTypeDto>();
            configuration.CreateMap<IInputType, FeatureInputTypeDto>()
                .Include<CheckboxInputType, FeatureInputTypeDto>()
                .Include<SingleLineStringInputType, FeatureInputTypeDto>()
                .Include<ComboboxInputType, FeatureInputTypeDto>();
            configuration.CreateMap<StaticLocalizableComboboxItemSource, LocalizableComboboxItemSourceDto>();
            configuration.CreateMap<ILocalizableComboboxItemSource, LocalizableComboboxItemSourceDto>()
                .Include<StaticLocalizableComboboxItemSource, LocalizableComboboxItemSourceDto>();
            configuration.CreateMap<LocalizableComboboxItem, LocalizableComboboxItemDto>();
            configuration.CreateMap<ILocalizableComboboxItem, LocalizableComboboxItemDto>()
                .Include<LocalizableComboboxItem, LocalizableComboboxItemDto>();

            //Chat
            configuration.CreateMap<ChatMessage, ChatMessageDto>();
            configuration.CreateMap<ChatMessage, ChatMessageExportDto>();

            //Feature
            configuration.CreateMap<FlatFeatureSelectDto, Feature>().ReverseMap();
            configuration.CreateMap<Feature, FlatFeatureDto>();

            //Role
            configuration.CreateMap<RoleEditDto, Role>().ReverseMap();
            configuration.CreateMap<Role, RoleListDto>();
            configuration.CreateMap<UserRole, UserListRoleDto>();

            //Edition
            configuration.CreateMap<EditionEditDto, SubscribableEdition>().ReverseMap();
            configuration.CreateMap<EditionCreateDto, SubscribableEdition>();
            configuration.CreateMap<EditionSelectDto, SubscribableEdition>().ReverseMap();
            configuration.CreateMap<SubscribableEdition, EditionInfoDto>();

            configuration.CreateMap<Edition, EditionInfoDto>().Include<SubscribableEdition, EditionInfoDto>();

            configuration.CreateMap<SubscribableEdition, EditionListDto>();
            configuration.CreateMap<Edition, EditionEditDto>();
            configuration.CreateMap<Edition, SubscribableEdition>();
            configuration.CreateMap<Edition, EditionSelectDto>();

            //Payment
            configuration.CreateMap<SubscriptionPaymentDto, SubscriptionPayment>().ReverseMap();
            configuration.CreateMap<SubscriptionPaymentListDto, SubscriptionPayment>().ReverseMap();
            configuration.CreateMap<SubscriptionPayment, SubscriptionPaymentInfoDto>();

            //Permission
            configuration.CreateMap<Permission, FlatPermissionDto>();
            configuration.CreateMap<Permission, FlatPermissionWithLevelDto>();

            //Language
            configuration.CreateMap<ApplicationLanguage, ApplicationLanguageEditDto>();
            configuration.CreateMap<ApplicationLanguage, ApplicationLanguageListDto>();
            configuration.CreateMap<NotificationDefinition, NotificationSubscriptionWithDisplayNameDto>();
            configuration.CreateMap<ApplicationLanguage, ApplicationLanguageEditDto>()
                .ForMember(ldto => ldto.IsEnabled, options => options.MapFrom(l => !l.IsDisabled));

            //Tenant
            configuration.CreateMap<Tenant, RecentTenant>();
            configuration.CreateMap<Tenant, TenantLoginInfoDto>();
            configuration.CreateMap<Tenant, TenantListDto>();
            configuration.CreateMap<TenantEditDto, Tenant>().ReverseMap();
            configuration.CreateMap<CurrentTenantInfoDto, Tenant>().ReverseMap();

            //User
            configuration.CreateMap<User, UserEditDto>()
                .ForMember(dto => dto.Password, options => options.Ignore())
                .ReverseMap()
                .ForMember(user => user.Password, options => options.Ignore());
            configuration.CreateMap<User, UserLoginInfoDto>();
            configuration.CreateMap<User, UserListDto>();
            configuration.CreateMap<User, ChatUserDto>();
            configuration.CreateMap<User, OrganizationUnitUserListDto>();
            configuration.CreateMap<Role, OrganizationUnitRoleListDto>();
            configuration.CreateMap<CurrentUserProfileEditDto, User>().ReverseMap();
            configuration.CreateMap<UserLoginAttemptDto, UserLoginAttempt>().ReverseMap();
            configuration.CreateMap<ImportUserDto, User>();

            //AuditLog
            configuration.CreateMap<AuditLog, AuditLogListDto>();
            configuration.CreateMap<EntityChange, EntityChangeListDto>();
            configuration.CreateMap<EntityPropertyChange, EntityPropertyChangeDto>();

            //Friendship
            configuration.CreateMap<Friendship, FriendDto>();
            configuration.CreateMap<FriendCacheItem, FriendDto>();

            //OrganizationUnit
            configuration.CreateMap<OrganizationUnit, OrganizationUnitDto>();

            //Webhooks
            configuration.CreateMap<WebhookSubscription, GetAllSubscriptionsOutput>();
            configuration.CreateMap<WebhookSendAttempt, GetAllSendAttemptsOutput>()
                .ForMember(webhookSendAttemptListDto => webhookSendAttemptListDto.WebhookName,
                    options => options.MapFrom(l => l.WebhookEvent.WebhookName))
                .ForMember(webhookSendAttemptListDto => webhookSendAttemptListDto.Data,
                    options => options.MapFrom(l => l.WebhookEvent.Data));

            configuration.CreateMap<WebhookSendAttempt, GetAllSendAttemptsOfWebhookEventOutput>();

            //configuration.CreateMap<DynamicParameter, DynamicParameterDto>().ReverseMap();
            //configuration.CreateMap<DynamicParameterValue, DynamicParameterValueDto>().ReverseMap();
            //configuration.CreateMap<EntityDynamicParameter, EntityDynamicParameterDto>()
            //    .ForMember(dto => dto.DynamicParameterName,
            //        options => options.MapFrom(entity => entity.DynamicParameter.ParameterName));
            //configuration.CreateMap<EntityDynamicParameterDto, EntityDynamicParameter>();

            //configuration.CreateMap<EntityDynamicParameterValue, EntityDynamicParameterValueDto>().ReverseMap();
            //User Delegations
            configuration.CreateMap<CreateUserDelegationDto, UserDelegation>();
            //Mariam
            configuration.CreateMap<ContactDto, AppEntityDto>()
                .ForMember(d => d.Notes, s => s.MapFrom(ss => ss.Notes))
                .ReverseMap();
            configuration.CreateMap<AppContact, GetMemberForEditDto>();
            configuration.CreateMap<AppItemExcelDto, AppItem>();
            //Mariam
            configuration.CreateMap<AppEntityUserReactions, AppEntityUserReactionDto>();
            configuration.CreateMap<AppEntityReactionsCount, AppEntityUserReactionsCountDto>()
                .ForMember(dto => dto.CommentsCount, obj => obj.MapFrom(ent => ent.EntityCommentsCount));
            /* ADD YOUR OWN CUSTOM AUTOMAPPER MAPPINGS HERE */
            configuration.CreateMap<LookupLabelDto, CurrencyInfoDto>().ReverseMap();
            //mmt
            configuration.CreateMap<AppSizeScaleForEditDto, AppSizeScalesHeaderDto>()
                .ForMember(a => a.AppSizeScalesDetails, b => b.MapFrom(ent => ent.AppSizeScalesDetails));
            configuration.CreateMap<AppSizeScalesDetailDto, AppSizeScalesDetail>().ReverseMap();
            configuration.CreateMap<AppSizeScaleForEditDto, AppEntityDto>().ReverseMap();
            configuration.CreateMap<AppSizeScalesHeaderDto, AppSizeScalesHeader>()
                .ForMember(a => a.AppSizeScalesDetails, b => b.MapFrom(ent => ent.AppSizeScalesDetails));
            configuration.CreateMap<AppSizeScalesHeader, AppSizeScalesDetail>().ReverseMap();
            configuration.CreateMap<AppSizeScalesHeader, AppSizeScaleForEditDto>()
               .ForMember(a => a.AppSizeScalesDetails, b => b.MapFrom(ent => ent.AppSizeScalesDetails));

            configuration.CreateMap<AppItemSizeScalesHeader, AppItemSizesScaleInfo>()
                .ForMember(a => a.AppSizeScalesDetails, b => b.MapFrom(ent => ent.AppItemSizeScalesDetails))
                 .ForMember(a => a.Code, b => b.MapFrom(ent => ent.SizeScaleCode));

            configuration.CreateMap<AppItemSizesScaleInfo, AppItemSizeScalesHeader>()
           .ForMember(a => a.AppItemSizeScalesDetails, b => b.MapFrom(ent => ent.AppSizeScalesDetails))
           .ForMember(a => a.SizeScaleCode, b => b.MapFrom(ent => ent.Code));

            configuration.CreateMap<AppItemSizeScalesDetails, AppSizeScalesDetailDto>();
            configuration.CreateMap<AppSizeScalesDetailDto, AppItemSizeScalesDetails>();

            //mmt
            //MMT33
            configuration.CreateMap<AppTransactionHeaders, CreateOrEditAppTransactionsDto>()
          .ForMember(a => a.AppTransactionsDetails, b => b.MapFrom(ent => ent.AppTransactionDetails));

            configuration.CreateMap<CreateOrEditAppTransactionsDto, AppTransactionHeaders>()
           .ForMember(a => a.AppTransactionDetails, b => b.MapFrom(ent => ent.AppTransactionsDetails))
           .ForMember(a => a.EnteredUserByRole, b => b.MapFrom(ent => ent.EnteredByUserRole));
            configuration.CreateMap<AppTransactionsDetailDto, AppTransactionDetails>();
            configuration.CreateMap<AppTransactionDetails, AppTransactionsDetailDto>();

            configuration.CreateMap<GetAppTransactionsForViewDto, AppTransactionHeaders>()
             .ForMember(a => a.AppTransactionDetails, b => b.MapFrom(ent => ent.AppTransactionsDetails));

            configuration.CreateMap<AppTransactionHeaders, GetAppTransactionsForViewDto>()
            .ForMember(a => a.AppTransactionContacts, b => b.MapFrom(ent => ent.AppTransactionContacts))
            .ForMember(a => a.AppTransactionsDetails, b => b.MapFrom(ent => ent.AppTransactionDetails))
            .ForMember(a => a.EnteredDate, b => b.MapFrom(z => z.CreationTime))
            .ForMember(a => a.CreatorUserId, b => b.MapFrom(z => z.CreatorUserId));

            configuration.CreateMap<GetOrderDetailsForViewDto, AppTransactionHeaders>()
            .ForMember(a => a.AppTransactionDetails, b => b.MapFrom(ent => ent.AppTransactionsDetails));
            configuration.CreateMap<AppTransactionHeaders, GetOrderDetailsForViewDto>()
            .ForMember(a => a.AppTransactionsDetails, b => b.MapFrom(ent => ent.AppTransactionDetails));

            configuration.CreateMap<AppMarketplaceItemSharings, ItemSharingDto>();
            configuration.CreateMap<ItemSharingDto, AppMarketplaceItemSharings>();
            configuration.CreateMap<AppItemSizeScalesHeader, AppMarketplaceItemSizeScaleHeaders>();
            configuration.CreateMap<AppMarketplaceItemSizeScaleHeaders, AppItemSizeScalesHeader>();
            configuration.CreateMap<AppItem, onetouch.AppMarketplaceItems.AppMarketplaceItems>().ForMember(a => a.Code, b => b.MapFrom(ent => ent.SSIN))
                .ForMember(a => a.EntitiesRelationships, b => b.MapFrom(ent => ent.EntityFk.EntitiesRelationships))
                .ForMember(a => a.EntityAttachments, b => b.MapFrom(ent => ent.EntityFk.EntityAttachments))
                .ForMember(a => a.EntityCategories, b => b.MapFrom(ent => ent.EntityFk.EntityCategories))
                .ForMember(a => a.EntityClassifications, b => b.MapFrom(ent => ent.EntityFk.EntityClassifications))
                .ForMember(a => a.EntityExtraData, b => b.MapFrom(ent => ent.EntityFk.EntityExtraData))
                .ForMember(a => a.EntityAddresses, b => b.MapFrom(ent => ent.EntityFk.EntityAddresses))
                .ForMember(a => a.EntityObjectStatusCode, b => b.MapFrom(ent => ent.EntityFk.EntityObjectStatusCode))
                // .ForMember(a => a.EntityObjectStatusFk, b => b.MapFrom(ent => ent.EntityFk.EntityObjectStatusFk))
                .ForMember(a => a.EntityObjectStatusCode, b => b.MapFrom(ent => ent.EntityFk.EntityObjectStatusCode))
                .ForMember(a => a.EntityObjectStatusId, b => b.MapFrom(ent => ent.EntityFk.EntityObjectStatusId))
                .ForMember(a => a.EntityObjectTypeCode, b => b.MapFrom(ent => ent.EntityFk.EntityObjectTypeCode))
                //.ForMember(a => a.EntityObjectTypeFk, b => b.MapFrom(ent => ent.EntityFk.EntityObjectTypeFk))
                .ForMember(a => a.EntityObjectTypeId, b => b.MapFrom(ent => ent.EntityFk.EntityObjectTypeId))
                .ForMember(a => a.ItemPricesFkList, b => b.MapFrom(ent => ent.ItemPricesFkList))
                .ForMember(a => a.ItemSizeScaleHeadersFkList, b => b.MapFrom(ent => ent.ItemSizeScaleHeadersFkList))
                .ForMember(a => a.ItemPricesFkList, b => b.MapFrom(ent => ent.ItemPricesFkList))
                .ForMember(a => a.ParentFkList, b => b.MapFrom(ent => (ent.ParentId == null & ent.ParentFk != null) ? ent.ParentFk : null))
                .ForMember(a => a.ManufacturerCode, b => b.MapFrom(ent => ent.Code)); //
            configuration.CreateMap<AppItemPrices, AppMarketplaceItemPrices>();
            configuration.CreateMap<AppMarketplaceItemPrices, AppItemPrices>();
            configuration.CreateMap<AppItemSizeScalesDetails, AppMarketplaceItemSizeScaleDetails>();
            configuration.CreateMap<AppMarketplaceItemSizeScaleDetails, AppItemSizeScalesDetails>();
            configuration.CreateMap<AppItemsList, onetouch.AppMarketplaceItemLists.AppMarketplaceItemLists>().ForMember(a => a.EntitiesRelationships, b => b.MapFrom(ent => ent.EntityFk.EntitiesRelationships))
                .ForMember(a => a.EntityAttachments, b => b.MapFrom(ent => ent.EntityFk.EntityAttachments))
                .ForMember(a => a.EntityCategories, b => b.MapFrom(ent => ent.EntityFk.EntityCategories))
                .ForMember(a => a.EntityClassifications, b => b.MapFrom(ent => ent.EntityFk.EntityClassifications))
                .ForMember(a => a.EntityExtraData, b => b.MapFrom(ent => ent.EntityFk.EntityExtraData))
                .ForMember(a => a.EntityAddresses, b => b.MapFrom(ent => ent.EntityFk.EntityAddresses))
                .ForMember(a => a.EntityObjectStatusCode, b => b.MapFrom(ent => ent.EntityFk.EntityObjectStatusCode))
                .ForMember(a => a.EntityObjectStatusCode, b => b.MapFrom(ent => ent.EntityFk.EntityObjectStatusCode))
                .ForMember(a => a.EntityObjectStatusId, b => b.MapFrom(ent => ent.EntityFk.EntityObjectStatusId))
                .ForMember(a => a.EntityObjectTypeCode, b => b.MapFrom(ent => ent.EntityFk.EntityObjectTypeCode))
                .ForMember(a => a.ObjectId, b => b.MapFrom(ent => ent.EntityFk.ObjectId))
                .ForMember(a => a.EntityObjectTypeId, b => b.MapFrom(ent => ent.EntityFk.EntityObjectTypeId));

            configuration.CreateMap<AppItemsListDetail, AppMarketplaceItemsListDetails>();
            //MMT33
            configuration.CreateMap<AppTransactionHeaders, GetAllAppTransactionsForViewDto>()
          .ForMember(a => a.AppTransactionsDetails, b => b.MapFrom(ent => ent.AppTransactionDetails))
          .ForMember(a => a.AppTransactionContacts, b => b.MapFrom(ent => ent.AppTransactionContacts));

            configuration.CreateMap<GetAllAppTransactionsForViewDto, AppTransactionHeaders>()
           .ForMember(a => a.AppTransactionDetails, b => b.MapFrom(ent => ent.AppTransactionsDetails))
           .ForMember(a => a.AppTransactionContacts, b => b.MapFrom(ent => ent.AppTransactionContacts));

            configuration.CreateMap<onetouch.AppMarketplaceItems.AppMarketplaceItems, AppTransactionDetails>()
                .ForMember(d => d.ItemSSIN, opt => opt.MapFrom(z => z.Code))
                .ForMember(d => d.EntityCategories, opt => opt.MapFrom(z => z.EntityCategories))
                .ForMember(d => d.ItemDescription, opt => opt.MapFrom(z => z.Description))
                .ForMember(d => d.SSIN, opt => opt.MapFrom(z => z.SSIN))
                .ForMember(d => d.EntityClassifications, opt => opt.MapFrom(z => z.EntityClassifications))
                .ForMember(d => d.EntityAttachments, s => s.MapFrom(ss => ss.EntityAttachments))
                .ForMember(d => d.EntityExtraData, s => s.MapFrom(ss => ss.EntityExtraData));
            //
            configuration.CreateMap<onetouch.AppMarketplaceItems.AppMarketplaceItems, AppMarketplaceItemForViewDto>()
                .ForMember(d => d.EntityCategories, opt => opt.Ignore())
                .ForMember(d => d.variations, opt => opt.Ignore())
                .ForMember(d => d.EntityDepartments, opt => opt.Ignore())
                .ForMember(d => d.EntityClassifications, opt => opt.Ignore())
                .ForMember(d => d.EntityAttachments, s => s.MapFrom(ss => ss.EntityAttachments))
                .ForMember(d => d.EntityExtraData, s => s.MapFrom(ss => ss.EntityExtraData))
                .ForMember(d => d.VariationItems, s => s.MapFrom(ss => ss.ParentFkList))
                .ForMember(d => d.EntityObjectTypeId, s => s.MapFrom(ss => ss.EntityObjectTypeId))
                .ForMember(d => d.AppItemPriceInfos, s => s.MapFrom(ss => ss.ItemPricesFkList))
                .ForMember(d => d.AppItemSizesScaleInfo, s => s.MapFrom(ss => ss.ItemSizeScaleHeadersFkList));
            //.ForMember(d => d.Listed, s => s.MapFrom(ss => (ss.ListingItemFkList != null && ss.ListingItemFkList.Count() > 0) ? true : false))
            //.ForMember(d => d.Published, s => s.MapFrom(ss => (ss.PublishedListingItemFkList != null && ss.PublishedListingItemFkList.Count() > 0) ? true : false));

            configuration.CreateMap<onetouch.AppMarketplaceItems.AppMarketplaceItems, AppItemVariationsDto>().ForMember(d => d.EntityExtraData, s => s.MapFrom(ss => ss.EntityExtraData));

            //configuration.CreateMap<AppItemPriceInfo, AppMarketplaceItemPrices>().ReverseMap();
            configuration.CreateMap<AppMarketplaceItemPrices, AppItemPriceInfo>()
            .ForMember(d => d.CurrencyName, s => s.MapFrom(ss => ss.CurrencyFk == null ? null : ss.CurrencyFk.Name))
            .ForMember(d => d.CurrencySymbol, s => s.MapFrom(ss => ss.CurrencyFk != null && ss.CurrencyFk.EntityExtraData != null && ss.CurrencyFk.EntityExtraData.Count > 0 &&
            (ss.CurrencyFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 41).AttributeValue != null) ? ss.CurrencyFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 41).AttributeValue : null));

            configuration.CreateMap<onetouch.AppMarketplaceItems.AppMarketplaceItems, VariationItemDto>()
              .ForMember(d => d.EntityExtraData, s => s.MapFrom(ss => ss.EntityExtraData))
              .ForMember(d => d.AppItemPriceInfos, s => s.MapFrom(ss => ss.ItemPricesFkList))
              .ForMember(d => d.EntityAttachments, s => s.MapFrom(ss => ss.EntityAttachments));

            configuration.CreateMap<AppMarketplaceItemSizeScaleHeaders, AppItemSizesScaleInfo>()
           .ForMember(a => a.AppSizeScalesDetails, b => b.MapFrom(ent => ent.AppItemSizeScalesDetails))
           .ForMember(a => a.Code, b => b.MapFrom(ent => ent.SizeScaleCode));
            configuration.CreateMap<AppMarketplaceItemSizeScaleDetails, AppSizeScalesDetailDto>();
            configuration.CreateMap<onetouch.AppMarketplaceItems.AppMarketplaceItems, AppTransactionDetails>();
            configuration.CreateMap<AppTransactionContacts, AppTransactionContactDto>()
                .ForMember(d => d.ContactAddressDetail, b => b.MapFrom(z => z.ContactAddressFk))
                .ForMember(d => d.ContactRole, s => s.MapFrom(ss => (ContactRoleEnum)Enum.Parse(typeof(ContactRoleEnum), ss.ContactRole.ToString())));

            configuration.CreateMap<AppAddress, ContactAppAddressDto>().ReverseMap();

            configuration.CreateMap<AppTransactionContactDto, AppTransactionContacts>()
                .ForMember(d => d.ContactRole, s => s.MapFrom(ss => Enum.GetName(typeof(ContactRoleEnum), ss.ContactRole)));

            configuration.CreateMap<onetouch.AppMarketplaceItems.AppMarketplaceItems, AppItem>();
            configuration.CreateMap<onetouch.AppMarketplaceItems.AppMarketplaceItems, AppEntity>()
                .ForMember(d => d.Code, opt => opt.MapFrom(z => z.Code))
                .ForMember(d => d.EntityCategories, opt => opt.MapFrom(z => z.EntityCategories))
                .ForMember(d => d.Notes, opt => opt.MapFrom(z => z.Description))
                .ForMember(d => d.SSIN, opt => opt.MapFrom(z => z.SSIN))
                .ForMember(d => d.EntityClassifications, opt => opt.MapFrom(z => z.EntityClassifications))
                .ForMember(d => d.EntityAttachments, s => s.MapFrom(ss => ss.EntityAttachments))
                .ForMember(d => d.EntityExtraData, s => s.MapFrom(ss => ss.EntityExtraData));
            configuration.CreateMap<AppAddress, ContactAddressDto>();

            configuration.CreateMap<AppEntity, onetouch.AppMarketplaceTransactions.AppMarketplaceTransactionHeaders>();
            configuration.CreateMap<onetouch.AppSiiwiiTransaction.AppTransactionHeaders, onetouch.AppMarketplaceTransactions.AppMarketplaceTransactionHeaders>().ReverseMap();
            configuration.CreateMap<AppEntity, onetouch.AppMarketplaceTransactions.AppMarketplaceTransactionDetails>();
            configuration.CreateMap<onetouch.AppSiiwiiTransaction.AppTransactionDetails, onetouch.AppMarketplaceTransactions.AppMarketplaceTransactionDetails>().ReverseMap();
            configuration.CreateMap<AppTransactionContacts, onetouch.AppMarketplaceTransactions.AppMarketplaceTransactionContacts>().ReverseMap();
            configuration.CreateMap<AppEntity, AppTransactionHeaders>();
            configuration.CreateMap<AppEntity, AppTransactionDetails>();
            configuration.CreateMap<CreateOrEditAppFeatureDto, AppFeature>().ReverseMap();
            configuration.CreateMap<AppFeatureDto, AppFeature>().ReverseMap();
        }
    }
}