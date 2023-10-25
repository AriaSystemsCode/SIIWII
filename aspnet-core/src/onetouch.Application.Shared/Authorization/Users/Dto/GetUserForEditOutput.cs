using System;
using System.Collections.Generic;
using onetouch.Organizations.Dto;

namespace onetouch.Authorization.Users.Dto
{
    public class GetUserForEditOutput
    {
        public Guid? ProfilePictureId { get; set; }

        public UserEditDto User { get; set; }

        public UserRoleDto[] Roles { get; set; }

        public List<OrganizationUnitDto> AllOrganizationUnits { get; set; }

        public List<string> MemberedOrganizationUnits { get; set; }
        //Mariam[Start]
        public string TenancyName { get; set; }
        //Mariam[End]
    }
}