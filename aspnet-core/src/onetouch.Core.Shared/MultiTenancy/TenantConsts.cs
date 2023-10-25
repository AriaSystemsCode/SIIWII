namespace onetouch.MultiTenancy
{
    public class TenantConsts
    {
       // public const string TenancyNameRegex = "^[a-zA-Z][a-zA-Z0-9_-]{1,}$";
       public const string TenancyNameRegex = "^[A-Za-z0-9-_]+([\\-\\.]{1}[a-z0-9]+)*\\.?[A-Za-z]{2,6}$";

        public const string DefaultTenantName = "Default";

        public const int MaxNameLength = 128;

        public const int DefaultTenantId = 1;
    }
}
