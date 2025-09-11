namespace onetouch.MultiTenancy.Dto
{
    public class RegisterTenantOutput
    {
        public int TenantId { get; set; }

        public string TenancyName { get; set; }

        public string Name { get; set; }

        public string UserName { get; set; }

        public string EmailAddress { get; set; }

        public bool IsTenantActive { get; set; }

        public bool IsActive { get; set; }

        public bool IsEmailConfirmationRequired { get; set; }
        //MMT,1 Add Admin user first name and last name in the Tenant regsitration page[Start]
        public string FirstName { get; set; }
        public string LastName { get; set; }
        //MMT,1 Add Admin user first name and last name in the Tenant regsitration page[End]
        public string AccountType { get; set; }
        public string AccountTypeId { get; set; }

    }
}