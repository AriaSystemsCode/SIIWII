using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.Auditing;
using Abp.Authorization;
using Abp.Configuration;
using Abp.Notifications;
using Abp.Runtime.Session;
using Abp.UI;
using onetouch.Globals;
using onetouch.Notifications.Dto;

namespace onetouch.Notifications
{
    [AbpAuthorize]
    public class NotificationAppService : onetouchAppServiceBase, INotificationAppService
    {
        private readonly INotificationDefinitionManager _notificationDefinitionManager;
        private readonly IUserNotificationManager _userNotificationManager;
        private readonly INotificationSubscriptionManager _notificationSubscriptionManager;
        //2025
        TimeZoneInfoAppService _timeZoneInfoAppService;
        //2025
        public NotificationAppService(
            INotificationDefinitionManager notificationDefinitionManager,
            IUserNotificationManager userNotificationManager,
            INotificationSubscriptionManager notificationSubscriptionManager,
            TimeZoneInfoAppService timeZoneInfoAppService)
        {
            _notificationDefinitionManager = notificationDefinitionManager;
            _userNotificationManager = userNotificationManager;
            _notificationSubscriptionManager = notificationSubscriptionManager;
            //2025
            _timeZoneInfoAppService = timeZoneInfoAppService;
            //2025
        }

        [DisableAuditing]
        public async Task<GetNotificationsOutput> GetUserNotifications(GetUserNotificationsInput input)
        {
            var totalCount = await _userNotificationManager.GetUserNotificationCountAsync(
                AbpSession.ToUserIdentifier(), input.State, input.StartDate, input.EndDate
                );

            var unreadCount = await _userNotificationManager.GetUserNotificationCountAsync(
                AbpSession.ToUserIdentifier(), UserNotificationState.Unread, input.StartDate, input.EndDate
                );
            var notifications = await _userNotificationManager.GetUserNotificationsAsync(
                AbpSession.ToUserIdentifier(), input.State, input.SkipCount, input.MaxResultCount, input.StartDate, input.EndDate
                );
            //T-SII-20250730.0003,1 MMT 10/01/2025 - Home page - The notifications time on SIIWII Shows (8 hours ago) for a notification that the user  just received[Start]
            if (!string.IsNullOrEmpty(input.TimeZone) && notifications != null && notifications.Count>0)
            {
                var currentTimeZone = TimeZone.CurrentTimeZone.StandardName.ToString();
                foreach (var note in notifications)
                {
                    var utcValue = _timeZoneInfoAppService.GetUTCDatetimeValue(note.Notification.CreationTime, currentTimeZone);
                    note.Notification.CreationTime = _timeZoneInfoAppService.GetDatetimeValueFromUTC(utcValue, input.TimeZone);
                }
            }
            //T-SII-20250730.0003,1 MMT 10/01/2025 - Home page - The notifications time on SIIWII Shows (8 hours ago) for a notification that the user  just received[End]
            return new GetNotificationsOutput(totalCount, unreadCount, notifications);
        }

        public async Task SetAllNotificationsAsRead()
        {
            await _userNotificationManager.UpdateAllUserNotificationStatesAsync(AbpSession.ToUserIdentifier(), UserNotificationState.Read);
        }

        public async Task SetNotificationAsRead(EntityDto<Guid> input)
        {
            var userNotification = await _userNotificationManager.GetUserNotificationAsync(AbpSession.TenantId, input.Id);
            if (userNotification == null)
            {
                return;
            }

            if (userNotification.UserId != AbpSession.GetUserId())
            {
                throw new Exception(string.Format("Given user notification id ({0}) is not belong to the current user ({1})", input.Id, AbpSession.GetUserId()));
            }

            await _userNotificationManager.UpdateUserNotificationStateAsync(AbpSession.TenantId, input.Id, UserNotificationState.Read);
        }

        public async Task<GetNotificationSettingsOutput> GetNotificationSettings()
        {
            var output = new GetNotificationSettingsOutput();

            output.ReceiveNotifications = await SettingManager.GetSettingValueAsync<bool>(NotificationSettingNames.ReceiveNotifications);

            //Get general notifications, not entity related notifications.
            var notificationDefinitions = (await _notificationDefinitionManager.GetAllAvailableAsync(AbpSession.ToUserIdentifier())).Where(nd => nd.EntityType == null);

            output.Notifications = ObjectMapper.Map<List<NotificationSubscriptionWithDisplayNameDto>>(notificationDefinitions);

            var subscribedNotifications = (await _notificationSubscriptionManager
                .GetSubscribedNotificationsAsync(AbpSession.ToUserIdentifier()))
                .Select(ns => ns.NotificationName)
                .ToList();

            output.Notifications.ForEach(n => n.IsSubscribed = subscribedNotifications.Contains(n.Name));

            return output;
        }

        public async Task UpdateNotificationSettings(UpdateNotificationSettingsInput input)
        {
            await SettingManager.ChangeSettingForUserAsync(AbpSession.ToUserIdentifier(), NotificationSettingNames.ReceiveNotifications, input.ReceiveNotifications.ToString());

            foreach (var notification in input.Notifications)
            {
                if (notification.IsSubscribed)
                {
                    await _notificationSubscriptionManager.SubscribeAsync(AbpSession.ToUserIdentifier(), notification.Name);
                }
                else
                {
                    await _notificationSubscriptionManager.UnsubscribeAsync(AbpSession.ToUserIdentifier(), notification.Name);
                }
            }
        }

        public async Task DeleteNotification(EntityDto<Guid> input)
        {
            var notification = await _userNotificationManager.GetUserNotificationAsync(AbpSession.TenantId, input.Id);
            if (notification == null)
            {
                return;
            }

            if (notification.UserId != AbpSession.GetUserId())
            {
                throw new UserFriendlyException(L("ThisNotificationDoesntBelongToYou"));
            }

            await _userNotificationManager.DeleteUserNotificationAsync(AbpSession.TenantId, input.Id);
        }

        public async Task DeleteAllUserNotifications(DeleteAllUserNotificationsInput input)
        {
            await _userNotificationManager.DeleteAllUserNotificationsAsync(
                AbpSession.ToUserIdentifier(),
                input.State,
                input.StartDate,
                input.EndDate);
        }

    }
}