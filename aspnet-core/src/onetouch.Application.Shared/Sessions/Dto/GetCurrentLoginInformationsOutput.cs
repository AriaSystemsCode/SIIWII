using onetouch.AppEntities.Dtos;
using onetouch.UiCustomization.Dto;

namespace onetouch.Sessions.Dto
{
    public class GetCurrentLoginInformationsOutput
    {
        public UserLoginInfoDto User { get; set; }

        public TenantLoginInfoDto Tenant { get; set; }

        public ApplicationInfoDto Application { get; set; }

        public UiCustomizationSettingsDto Theme { get; set; }

    }
    //mmt
    public class CurrencyInfoDto : LookupLabelDto
    {
        public string Symbol { get; set; }

    }
    //mmt
}