using System;
using System.Threading.Tasks;
using Abp;
using Abp.Domain.Entities;
using Abp.Notifications;
using onetouch.Authorization.Users;
using onetouch.MultiTenancy;

namespace onetouch.Notifications
{
    public interface IAppNotifier
    {
        Task WelcomeToTheApplicationAsync(User user);

        Task NewUserRegisteredAsync(User user);

        Task NewTenantRegisteredAsync(Tenant tenant);

        Task GdprDataPrepared(UserIdentifier user, Guid binaryObjectId);

        Task SendMessageAsync(UserIdentifier user, string message, NotificationSeverity severity = NotificationSeverity.Info);
        //T-SII-20220413.0001,1 MMT 05/15/2023 -The notification message Enhachment[Start]
        Task SendMessageAsync(UserIdentifier user, string message, NotificationSeverity severity = NotificationSeverity.Info, EntityIdentifier entityIdentifier=null);
        //T-SII-20220413.0001,1 MMT 05/15/2023 -The notification message Enhachment[End]

        Task TenantsMovedToEdition(UserIdentifier argsUser, string sourceEditionName, string targetEditionName);

        Task SomeUsersCouldntBeImported(UserIdentifier argsUser, string fileToken, string fileType, string fileName);

        Task SharedProduct(UserIdentifier[] argsUser, string message); 
    }
}
