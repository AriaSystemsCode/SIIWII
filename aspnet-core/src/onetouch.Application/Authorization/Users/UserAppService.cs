using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.Configuration;
using Abp.Authorization;
using Abp.Authorization.Roles;
using Abp.Authorization.Users;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Linq.Extensions;
using Abp.Notifications;
using Abp.Organizations;
using Abp.Runtime.Session;
using Abp.UI;
using Abp.Zero.Configuration;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using onetouch.Authorization.Permissions;
using onetouch.Authorization.Permissions.Dto;
using onetouch.Authorization.Roles;
using onetouch.Authorization.Users.Dto;
using onetouch.Authorization.Users.Exporting;
using onetouch.Dto;
using onetouch.Notifications;
using onetouch.Url;
using onetouch.Organizations.Dto;
using Abp.Domain.Uow;
using onetouch.AppEntities.Dtos;
using onetouch.Helpers;
using onetouch.AppEntities;
using onetouch.Accounts.Dtos;
using onetouch.AppContacts;
using onetouch.AppContacts.Dtos;
using onetouch.Accounts;
using onetouch.AccountInfos.Dtos;

namespace onetouch.Authorization.Users
{
    [AbpAuthorize(AppPermissions.Pages_Administration_Users)]
    public class UserAppService : onetouchAppServiceBase, IUserAppService
    {
        public IAppUrlService AppUrlService { get; set; }

        private readonly RoleManager _roleManager;
        private readonly IUserEmailer _userEmailer;
        private readonly IUserListExcelExporter _userListExcelExporter;
        private readonly INotificationSubscriptionManager _notificationSubscriptionManager;
        private readonly IAppNotifier _appNotifier;
        private readonly IRepository<RolePermissionSetting, long> _rolePermissionRepository;
        private readonly IRepository<UserPermissionSetting, long> _userPermissionRepository;
        private readonly IRepository<UserRole, long> _userRoleRepository;
        private readonly IRepository<Role> _roleRepository;
        private readonly IUserPolicy _userPolicy;
        private readonly IEnumerable<IPasswordValidator<User>> _passwordValidators;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IRepository<OrganizationUnit, long> _organizationUnitRepository;
        private readonly IRoleManagementConfig _roleManagementConfig;
        private readonly UserManager _userManager;
        private readonly IRepository<UserOrganizationUnit, long> _userOrganizationUnitRepository;
        private readonly IRepository<OrganizationUnitRole, long> _organizationUnitRoleRepository;
        //Mariam
        private readonly Helper _helper;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        //private readonly IRepository<AppEntitiesRelationship, long> _appEntitiesRelationshipRepository;
        private readonly IRepository<AppEntityExtraData, long> _appEntityExtraDataRepository;
        private readonly IAccountsAppService _appAccountsAppService;
        private readonly IRepository<AppEntity, long> _appEntityRepository;
        private readonly IRepository<AppContact, long> _appContactRepository;
        //Mariam 
        public UserAppService( 
            RoleManager roleManager,
            IUserEmailer userEmailer,
            IUserListExcelExporter userListExcelExporter,
            INotificationSubscriptionManager notificationSubscriptionManager,
            IAppNotifier appNotifier,
            IRepository<RolePermissionSetting, long> rolePermissionRepository,
            IRepository<UserPermissionSetting, long> userPermissionRepository,
            IRepository<UserRole, long> userRoleRepository,
            IRepository<Role> roleRepository,
            IUserPolicy userPolicy,
            IEnumerable<IPasswordValidator<User>> passwordValidators,
            IPasswordHasher<User> passwordHasher,
            IRepository<OrganizationUnit, long> organizationUnitRepository,
            IRoleManagementConfig roleManagementConfig,
            UserManager userManager,
            IRepository<UserOrganizationUnit, long> userOrganizationUnitRepository,
            IRepository<OrganizationUnitRole, long> organizationUnitRoleRepository, Helper helper, 
            AppEntitiesAppService appEntitiesAppService,   IRepository<AppEntityExtraData, long> appEntityExtraDataRepository,
            AccountsAppService appAccountsAppService, IRepository<AppEntity, long> appEntityRepository,
            IRepository<AppContact, long> appContactRepository)
        {
            _roleManager = roleManager;
            _userEmailer = userEmailer;
            _userListExcelExporter = userListExcelExporter;
            _notificationSubscriptionManager = notificationSubscriptionManager;
            _appNotifier = appNotifier;
            _rolePermissionRepository = rolePermissionRepository;
            _userPermissionRepository = userPermissionRepository;
            _userRoleRepository = userRoleRepository;
            _userPolicy = userPolicy;
            _passwordValidators = passwordValidators;
            _passwordHasher = passwordHasher;
            _organizationUnitRepository = organizationUnitRepository;
            _roleManagementConfig = roleManagementConfig;
            _userManager = userManager;
            _userOrganizationUnitRepository = userOrganizationUnitRepository;
            _organizationUnitRoleRepository = organizationUnitRoleRepository;
            _roleRepository = roleRepository;
            //Mariam
            _helper = helper;
            _appEntitiesAppService = appEntitiesAppService;
            //_appEntitiesRelationshipRepository = appEntitiesRelationshipRepository;
            _appEntityExtraDataRepository = appEntityExtraDataRepository;
            _appAccountsAppService = appAccountsAppService;
            _appEntityRepository = appEntityRepository;
            _appContactRepository = appContactRepository;
            //MAriam
            AppUrlService = NullAppUrlService.Instance;
        }

        public async Task<PagedResultDto<UserListDto>> GetUsers(GetUsersInput input)
        {
            var query = GetUsersFilteredQuery(input);

            var userCount = await query.CountAsync();
            
            var users = await query
                .OrderBy(input.Sorting)
                .PageBy(input)
                .ToListAsync();
            
            var userListDtos = ObjectMapper.Map<List<UserListDto>>(users);
            //Mariam{Start}
           // userListDtos.ForEach(s => s.UserName = (s.UserName.Contains ("@") ? s.UserName.Split("@", StringSplitOptions.RemoveEmptyEntries)[0] : s.UserName));
            //Mariam[End]
            await FillRoleNames(userListDtos);

            return new PagedResultDto<UserListDto>(
                userCount,
                userListDtos
                );
        }

        public List<UserDto> GetAllUsersNames(string searchTerm)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var UserList = from o in UserManager.Users.Where(x => x.TenantId != null)
                               join o1 in TenantManager.Tenants on o.TenantId equals o1.Id into j1

                               from s1 in j1.DefaultIfEmpty()
                               where s1.TenancyName.ToLower().Contains(searchTerm.ToLower()) || o.UserName.ToLower().Contains(searchTerm.ToLower())

                               select new UserDto()
                               { 
                                   //Mariam[Start]
                                    Name = o.UserName.Contains("@") ? (o.UserName.Split("@", StringSplitOptions.RemoveEmptyEntries))[0]: o.UserName,
                                    EmailAddress = o.EmailAddress,
                                    //ImgURL="",
                               };
                
                return UserList.ToList();

            }
        }

        public async Task<FileDto> GetUsersToExcel(GetUsersToExcelInput input)
        {
            var query = GetUsersFilteredQuery(input);

            var users = await query
                .OrderBy(input.Sorting)
                .ToListAsync();

            var userListDtos = ObjectMapper.Map<List<UserListDto>>(users);
            await FillRoleNames(userListDtos);

            return _userListExcelExporter.ExportToFile(userListDtos);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_Users_Create, AppPermissions.Pages_Administration_Users_Edit)]
        public async Task<GetUserForEditOutput> GetUserForEdit(NullableIdDto<long> input)
        {
            //Getting all available roles
            var userRoleDtos = await _roleManager.Roles
                .OrderBy(r => r.DisplayName)
                .Select(r => new UserRoleDto
                {
                    RoleId = r.Id,
                    RoleName = r.Name,
                    RoleDisplayName = r.DisplayName
                })
                .ToArrayAsync();

            var allOrganizationUnits = await _organizationUnitRepository.GetAllListAsync();

            var output = new GetUserForEditOutput
            {
                Roles = userRoleDtos,
                AllOrganizationUnits = ObjectMapper.Map<List<OrganizationUnitDto>>(allOrganizationUnits),
                MemberedOrganizationUnits = new List<string>()
            };

            if (!input.Id.HasValue)
            {
                //Creating a new user
                output.User = new UserEditDto
                {
                    IsActive = true,
                    ShouldChangePasswordOnNextLogin = true,
                    IsTwoFactorEnabled = await SettingManager.GetSettingValueAsync<bool>(AbpZeroSettingNames.UserManagement.TwoFactorLogin.IsEnabled),
                    IsLockoutEnabled = await SettingManager.GetSettingValueAsync<bool>(AbpZeroSettingNames.UserManagement.UserLockOut.IsEnabled)
                };
                //Mariam
                if (AbpSession.TenantId != null)
                {
                    var tenantobject = TenantManager.FindById(int.Parse(AbpSession.TenantId.ToString()));
                    if (tenantobject != null)
                        output.TenancyName = (string.IsNullOrEmpty(tenantobject.TenancyName) ? "" :  tenantobject.TenancyName);
                }
                
                foreach (var defaultRole in await _roleManager.Roles.Where(r => r.IsDefault).ToListAsync())
                {
                    var defaultUserRole = userRoleDtos.FirstOrDefault(ur => ur.RoleName == defaultRole.Name);
                    if (defaultUserRole != null)
                    {
                        defaultUserRole.IsAssigned = true;
                    }
                }
            }
            else
            {
                //Editing an existing user
                var user = await UserManager.GetUserByIdAsync(input.Id.Value);
                //Mariam[Start]
                output.TenancyName = user.UserName.Contains("@") ? (user.UserName.Split("@", StringSplitOptions.RemoveEmptyEntries))[1] : "";
                
                
                //Mariam[End]
                output.User = ObjectMapper.Map<UserEditDto>(user);
                //Mariam[Start]
                output.User.UserName = output.User.UserName.Contains("@") ? (output.User.UserName.Split("@", StringSplitOptions.RemoveEmptyEntries))[0] : output.User.UserName;
                //Mariam[End]
                output.ProfilePictureId = user.ProfilePictureId;

                var organizationUnits = await UserManager.GetOrganizationUnitsAsync(user);
                output.MemberedOrganizationUnits = organizationUnits.Select(ou => ou.Code).ToList();

                var allRolesOfUsersOrganizationUnits = GetAllRoleNamesOfUsersOrganizationUnits(input.Id.Value);

                foreach (var userRoleDto in userRoleDtos)
                {
                    userRoleDto.IsAssigned = await UserManager.IsInRoleAsync(user, userRoleDto.RoleName);
                    userRoleDto.InheritedFromOrganizationUnit = allRolesOfUsersOrganizationUnits.Contains(userRoleDto.RoleName);
                }
            }

            return output;
        }

        private List<string> GetAllRoleNamesOfUsersOrganizationUnits(long userId)
        {
            return (from userOu in _userOrganizationUnitRepository.GetAll()
                    join roleOu in _organizationUnitRoleRepository.GetAll() on userOu.OrganizationUnitId equals roleOu
                        .OrganizationUnitId
                    join userOuRoles in _roleRepository.GetAll() on roleOu.RoleId equals userOuRoles.Id
                    where userOu.UserId == userId
                    select userOuRoles.Name).ToList();
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_Users_ChangePermissions)]
        public async Task<GetUserPermissionsForEditOutput> GetUserPermissionsForEdit(EntityDto<long> input)
        {
            var user = await UserManager.GetUserByIdAsync(input.Id);
            var permissions = PermissionManager.GetAllPermissions();
            var grantedPermissions = await UserManager.GetGrantedPermissionsAsync(user);

            return new GetUserPermissionsForEditOutput
            {
                Permissions = ObjectMapper.Map<List<FlatPermissionDto>>(permissions).OrderBy(p => p.DisplayName).ToList(),
                GrantedPermissionNames = grantedPermissions.Select(p => p.Name).ToList()
            };
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_Users_ChangePermissions)]
        public async Task ResetUserSpecificPermissions(EntityDto<long> input)
        {
            var user = await UserManager.GetUserByIdAsync(input.Id);
            await UserManager.ResetAllPermissionsAsync(user);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_Users_ChangePermissions)]
        public async Task UpdateUserPermissions(UpdateUserPermissionsInput input)
        {
            var user = await UserManager.GetUserByIdAsync(input.Id);
            var grantedPermissions = PermissionManager.GetPermissionsFromNamesByValidating(input.GrantedPermissionNames);
            await UserManager.SetGrantedPermissionsAsync(user, grantedPermissions);
        }

        public async Task CreateOrUpdateUser(CreateOrUpdateUserInput input)
        {
            if (input.User.Id.HasValue)
            {
                await UpdateUserAsync(input);
            }
            else
            {
                await CreateUserAsync(input);
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_Users_Delete)]
        public async Task DeleteUser(EntityDto<long> input)
        {
            if (input.Id == AbpSession.GetUserId())
            {
                throw new UserFriendlyException(L("YouCanNotDeleteOwnAccount"));
            }

            var user = await UserManager.GetUserByIdAsync(input.Id);
            //Mariam[Start]
            await DeleteUserContact(user);
            //Mariam[End]
            CheckErrors(await UserManager.DeleteAsync(user));
           
        }
        //Mariam[Start]
        private async Task DeleteUserContact (User userObject)
        {
           
            var contactEntityExtraData = _appEntityExtraDataRepository.GetAll().FirstOrDefault(x=>  x.AttributeId == 715 && x.AttributeValue == userObject.Id.ToString());
            if (contactEntityExtraData != null)
            {
                var contact = _appContactRepository.GetAll().FirstOrDefault(x => x.TenantId == AbpSession.TenantId && x.EntityId == contactEntityExtraData.EntityId);
              
                EntityDto contactObj = new EntityDto();
                contactObj.Id = int.Parse(contact.Id.ToString());
                await _appAccountsAppService.DeleteContact(contactObj);
            }
            
        }
        //Mariam[End]
        [AbpAuthorize(AppPermissions.Pages_Administration_Users_Unlock)]
        public async Task UnlockUser(EntityDto<long> input)
        {
            var user = await UserManager.GetUserByIdAsync(input.Id);
            user.Unlock();
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_Users_Edit)]
        protected virtual async Task UpdateUserAsync(CreateOrUpdateUserInput input)
        {
            Debug.Assert(input.User.Id != null, "input.User.Id should be set.");

            var user = await UserManager.FindByIdAsync(input.User.Id.Value.ToString());
            
            //Update user properties
            ObjectMapper.Map(input.User, user); //Passwords is not mapped (see mapping configuration)

            //Mariam[Start]
            if (AbpSession.TenantId != null)
            {
                var tenantobject = TenantManager.FindById(int.Parse(AbpSession.TenantId.ToString()));
                if (tenantobject != null)
                   user.UserName += (string.IsNullOrEmpty(tenantobject.TenancyName) ? "" : "@" + tenantobject.TenancyName);
                user.NormalizedUserName = user.UserName.ToUpper();
            }
            //Mariam[End]

            CheckErrors(await UserManager.UpdateAsync(user));

            if (input.SetRandomPassword)
            {
                var randomPassword = await _userManager.CreateRandomPassword();
                user.Password = _passwordHasher.HashPassword(user, randomPassword);
                input.User.Password = randomPassword;
            }
            else if (!input.User.Password.IsNullOrEmpty())
            {
                await UserManager.InitializeOptionsAsync(AbpSession.TenantId);
                CheckErrors(await UserManager.ChangePasswordAsync(user, input.User.Password));
            }

            //Update roles
            CheckErrors(await UserManager.SetRolesAsync(user, input.AssignedRoleNames));

            //update organization units
            await UserManager.SetOrganizationUnitsAsync(user, input.OrganizationUnits.ToArray());

            if (input.SendActivationEmail)
            {
                user.SetNewEmailConfirmationCode();
                await _userEmailer.SendEmailActivationLinkAsync(
                    user,
                    AppUrlService.CreateEmailActivationUrlFormat(AbpSession.TenantId),
                    input.User.Password
                );
            }
            //Mariam[Start]
            
            var contactEntityExtraData = _appEntityExtraDataRepository.GetAll().FirstOrDefault(x => x.AttributeId == 715 && x.AttributeValue == input.User.Id.ToString());
            if (contactEntityExtraData != null)
            {

                var contact = _appContactRepository.GetAll().FirstOrDefault(x => x.TenantId == AbpSession.TenantId && x.EntityId == contactEntityExtraData.EntityId);
                ContactForEditDto contactView = await _appAccountsAppService.GetContactForView(contact.Id);
                ContactDto contactDto = contactView.Contact;//ObjectMapper.Map<ContactDto>(contact);
                contactDto.FirstName = input.User.Name;
                contactDto.LastName = input.User.Surname;
                contactDto.EMailAddress = input.User.EmailAddress;
                contactDto.UserId = user.Id;
                contactDto.Name = input.User.Name + " " + input.User.Surname;
                contactDto.UserName = input.User.UserName;
                contactDto.TradeName = "";
                contactDto.Code = input.Code;
                ContactDto savedContactDto = await _appAccountsAppService.CreateOrEditContact(contactDto);

            }
            //MMT, 09/07/2022 T-SII-20220803.0003 Newly registered user does not have related Team member[Start]
            else
            {
                var account = _appContactRepository.GetAll().FirstOrDefault(x => x.TenantId == AbpSession.TenantId && x.IsProfileData && x.ParentId == null && x.PartnerId == null && x.AccountId == null);
                if (account != null)
                {
     
                        ContactDto contactDto = new ContactDto();
                        contactDto.AccountId = account.Id;
                        contactDto.FirstName = input.User.Name;
                        contactDto.LastName = input.User.Surname;
                        contactDto.EMailAddress = input.User.EmailAddress;
                        contactDto.UserId = input.User.Id;
                        contactDto.Name = input.User.Name + " " + user.Surname;
                        contactDto.UserName = input.User.UserName;
                        contactDto.TradeName = "";
                        contactDto.ParentId = account.Id;
                        contactDto.Code = input.Code;
                        ContactDto savedContactDto = await _appAccountsAppService.CreateOrEditContact(contactDto);
                }
            }
            //MMT, 09/07/2022 T-SII-20220803.0003 Newly registered user does not have related Team member[End]
            //Mariam[End]
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_Users_Create)]
        protected virtual async Task CreateUserAsync(CreateOrUpdateUserInput input)
        {
            //MMT,1  T-SII-20221011.0002 When create new user , No team member created[Start]
            //if (AbpSession.TenantId.HasValue)
            //{
            //    await _userPolicy.CheckMaxUserCountAsync(AbpSession.GetTenantId());
            //}
            //MMT,1  T-SII-20221011.0002 When create new user , No team member created[End]

            var user = ObjectMapper.Map<User>(input.User); //Passwords is not mapped (see mapping configuration)
            user.TenantId = AbpSession.TenantId;
            //Mariam[Start]
            if (AbpSession.TenantId != null)
            {
                var tenantobject = TenantManager.FindById(int.Parse(AbpSession.TenantId.ToString()));
                if (tenantobject != null)
                user.UserName += (string.IsNullOrEmpty (tenantobject.TenancyName) ? "": "@"+tenantobject.TenancyName);
            }
            //Mariam[End]
            //Set password
            if (input.SetRandomPassword)
            {
                var randomPassword = await _userManager.CreateRandomPassword();
                user.Password = _passwordHasher.HashPassword(user, randomPassword);
                input.User.Password = randomPassword;
            }
            else if (!input.User.Password.IsNullOrEmpty())
            {
                await UserManager.InitializeOptionsAsync(AbpSession.TenantId);
                foreach (var validator in _passwordValidators)
                {
                    CheckErrors(await validator.ValidateAsync(UserManager, user, input.User.Password));
                }

                user.Password = _passwordHasher.HashPassword(user, input.User.Password);
            }

            user.ShouldChangePasswordOnNextLogin = input.User.ShouldChangePasswordOnNextLogin;

            //Assign roles
            user.Roles = new Collection<UserRole>();
            foreach (var roleName in input.AssignedRoleNames)
            {
                var role = await _roleManager.GetRoleByNameAsync(roleName);
                user.Roles.Add(new UserRole(AbpSession.TenantId, user.Id, role.Id));
            }

            CheckErrors(await UserManager.CreateAsync(user));

            //Update Entity/Contact table[Start-Mariam] 
            if(AbpSession.TenantId != null && AbpSession.TenantId != 0 )
            {
                var account = _appContactRepository.GetAll().FirstOrDefault(x => x.TenantId == AbpSession.TenantId && x.IsProfileData && x.ParentId == null && x.PartnerId == null && x.AccountId == null);
                if (account != null)
                {
                    ContactDto contactDto = new ContactDto();
                    contactDto.AccountId = account.Id;
                    contactDto.FirstName = input.User.Name;
                    contactDto.LastName = input.User.Surname;
                    contactDto.EMailAddress = input.User.EmailAddress;
                    contactDto.UserId = user.Id;
                    contactDto.Name = input.User.Name + " " + input.User.Surname;
                    contactDto.UserName = input.User.UserName;
                    contactDto.TradeName = "";
                    contactDto.ParentId = account.Id;
                    contactDto.Code = input.Code ;
                    ContactDto savedContactDto = await _appAccountsAppService.CreateOrEditContact(contactDto);
                }
            }
            
            
            //[End-Mariam]

            await CurrentUnitOfWork.SaveChangesAsync(); //To get new user's Id.

            //Notifications
            await _notificationSubscriptionManager.SubscribeToAllAvailableNotificationsAsync(user.ToUserIdentifier());
            await _appNotifier.WelcomeToTheApplicationAsync(user);

            //Organization Units
            await UserManager.SetOrganizationUnitsAsync(user, input.OrganizationUnits.ToArray());

            //Send activation email
            if (input.SendActivationEmail)
            {
                user.SetNewEmailConfirmationCode();
                await _userEmailer.SendEmailActivationLinkAsync(
                    user,
                    AppUrlService.CreateEmailActivationUrlFormat(AbpSession.TenantId),
                    input.User.Password
                );
            }
            
        }

        private async Task FillRoleNames(IReadOnlyCollection<UserListDto> userListDtos)
        {
           

            /* This method is optimized to fill role names to given list. */
            var userIds = userListDtos.Select(u => u.Id);

            var userRoles = await _userRoleRepository.GetAll()
                .Where(userRole => userIds.Contains(userRole.UserId))
                .Select(userRole => userRole).ToListAsync();

            var distinctRoleIds = userRoles.Select(userRole => userRole.RoleId).Distinct();

            foreach (var user in userListDtos)
            {
                var rolesOfUser = userRoles.Where(userRole => userRole.UserId == user.Id).ToList();
                user.Roles = ObjectMapper.Map<List<UserListRoleDto>>(rolesOfUser);
                //Mariam[start]
                var contactEntityExtraData = _appEntityExtraDataRepository.GetAll().FirstOrDefault(x => x.AttributeId == 715 && x.AttributeValue == user.Id.ToString());
                if (contactEntityExtraData != null)
                {
                    var contact = _appContactRepository.GetAll().FirstOrDefault(x => x.TenantId == AbpSession.TenantId && x.EntityId == contactEntityExtraData.EntityId);
                    if (contact != null)
                    user.MemberId = contact.Id;
                }
                //Mariam[end]
            }

            var roleNames = new Dictionary<int, string>();
            foreach (var roleId in distinctRoleIds)
            {
                var role = await _roleManager.FindByIdAsync(roleId.ToString());
                if (role != null)
                {
                    roleNames[roleId] = role.DisplayName;
                }
            }

            foreach (var userListDto in userListDtos)
            {
                foreach (var userListRoleDto in userListDto.Roles)
                {
                    if (roleNames.ContainsKey(userListRoleDto.RoleId))
                    {
                        userListRoleDto.RoleName = roleNames[userListRoleDto.RoleId];
                    }
                }

                userListDto.Roles = userListDto.Roles.Where(r => r.RoleName != null).OrderBy(r => r.RoleName).ToList();
            }
        }

        private IQueryable<User> GetUsersFilteredQuery(IGetUsersInput input)
        {
            var query = UserManager.Users
                .WhereIf(input.Role.HasValue, u => u.Roles.Any(r => r.RoleId == input.Role.Value))
                .WhereIf(input.OnlyLockedUsers, u => u.LockoutEndDateUtc.HasValue && u.LockoutEndDateUtc.Value > DateTime.UtcNow)
                .WhereIf(
                    !input.Filter.IsNullOrWhiteSpace(),
                    u =>
                        u.Name.Contains(input.Filter) ||
                        u.Surname.Contains(input.Filter) ||
                        u.UserName.Contains(input.Filter) ||
                        u.EmailAddress.Contains(input.Filter)
                );

            if (input.Permissions != null && input.Permissions.Any(p => !p.IsNullOrWhiteSpace()))
            {
                var staticRoleNames = _roleManagementConfig.StaticRoles.Where(
                    r => r.GrantAllPermissionsByDefault &&
                         r.Side == AbpSession.MultiTenancySide
                ).Select(r => r.RoleName).ToList();

                input.Permissions = input.Permissions.Where(p => !string.IsNullOrEmpty(p)).ToList();

                query = from user in query
                        join ur in _userRoleRepository.GetAll() on user.Id equals ur.UserId into urJoined
                        from ur in urJoined.DefaultIfEmpty()
                        join urr in _roleRepository.GetAll() on ur.RoleId equals urr.Id into urrJoined
                        from urr in urrJoined.DefaultIfEmpty()
                        join up in _userPermissionRepository.GetAll()
                            .Where(userPermission => input.Permissions.Contains(userPermission.Name)) on user.Id equals up.UserId into upJoined
                        from up in upJoined.DefaultIfEmpty()
                        join rp in _rolePermissionRepository.GetAll()
                            .Where(rolePermission => input.Permissions.Contains(rolePermission.Name)) on
                            new { RoleId = ur == null ? 0 : ur.RoleId } equals new { rp.RoleId } into rpJoined
                        from rp in rpJoined.DefaultIfEmpty()
                        where (up != null && up.IsGranted) ||
                              (up == null && rp != null && rp.IsGranted) ||
                              (up == null && rp == null && staticRoleNames.Contains(urr.Name))
                        select user;
            }

            return query;
        }
    }
}
