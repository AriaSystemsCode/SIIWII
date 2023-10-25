using onetouch.SycIdentifierDefinitions;
using onetouch.SycSegmentIdentifierDefinitions;
using onetouch.SycCounters;
using onetouch.AppEvents;
using onetouch.AppAdvertisements;
using onetouch.AppPosts;
using onetouch.AppItemsLists;
using onetouch.AutoTaskTicketNotes;
using onetouch.AutoTaskTickets;
using onetouch.AppItems;
using onetouch.AppEntities;
using onetouch.SystemObjects;
using System;
using System.Linq;
using Abp.Organizations;
using onetouch.Authorization.Roles;
using onetouch.MultiTenancy;
using onetouch.AppContacts;

namespace onetouch.EntityHistory
{
    public static class EntityHistoryHelper
    {
        public const string EntityHistoryConfigurationName = "EntityHistory";

        public static readonly Type[] HostSideTrackedTypes =
        {
            typeof(SycIdentifierDefinition),
            typeof(SycSegmentIdentifierDefinition),
            typeof(SycCounter),
            typeof(SycAttachmentType),
            typeof(AppEvent),
            typeof(AppAdvertisement),
            typeof(AppPost),
            typeof(TicketNote),
            typeof(Ticket),
            typeof(SycAttachmentCategory),
            typeof(SuiIcon),
            typeof(AppContact),
            typeof(SycEntityObjectClassification),
            typeof(SycEntityObjectStatus),
            typeof(SycEntityObjectCategory),
            typeof(SycEntityObjectType),
            typeof(SydObject),
            typeof(SysObjectType),
            typeof(OrganizationUnit), typeof(Role), typeof(Tenant)
        };

        public static readonly Type[] TenantSideTrackedTypes =
        {
            typeof(SycIdentifierDefinition),
            typeof(SycSegmentIdentifierDefinition),
            typeof(SycCounter),
            typeof(AppEvent),
            typeof(AppPost),
            typeof(AppItemsList),
            typeof(TicketNote),
            typeof(Ticket),
            typeof(AppItem),
            typeof(AppContact),
            typeof(OrganizationUnit), typeof(Role)
        };

        public static readonly Type[] TrackedTypes =
            HostSideTrackedTypes
                .Concat(TenantSideTrackedTypes)
                .GroupBy(type => type.FullName)
                .Select(types => types.First())
                .ToArray();
    }
}