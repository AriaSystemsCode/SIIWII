using System;
using System.Threading.Tasks;
using Abp;
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

        Task TenantsMovedToEdition(UserIdentifier argsUser, string sourceEditionName, string targetEditionName);

        Task SomeUsersCouldntBeImported(UserIdentifier argsUser, string fileToken, string fileType, string fileName);

        Task SharedProduct(UserIdentifier[] argsUser, string message); 
    }
}
