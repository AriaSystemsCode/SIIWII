using Abp.Zero.Ldap.Authentication;
using Abp.Zero.Ldap.Configuration;
using onetouch.Authorization.Users;
using onetouch.MultiTenancy;

namespace onetouch.Authorization.Ldap
{
    public class AppLdapAuthenticationSource : LdapAuthenticationSource<Tenant, User>
    {
        public AppLdapAuthenticationSource(ILdapSettings settings, IAbpZeroLdapModuleConfig ldapModuleConfig)
            : base(settings, ldapModuleConfig)
        {
        }
    }
}