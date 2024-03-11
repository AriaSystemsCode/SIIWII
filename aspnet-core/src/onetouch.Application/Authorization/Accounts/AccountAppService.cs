using System;
using System.Threading.Tasks;
using System.Web;
using Abp.Authorization;
using Abp.Configuration;
using Abp.Extensions;
using Abp.Runtime.Security;
using Abp.Runtime.Session;
using Abp.UI;
using Abp.Zero.Configuration;
using Microsoft.AspNetCore.Identity;
using onetouch.Authorization.Accounts.Dto;
using onetouch.Authorization.Impersonation;
using onetouch.Authorization.Users;
using onetouch.Configuration;
using onetouch.Debugging;
using onetouch.MultiTenancy;
using onetouch.Security.Recaptcha;
using onetouch.Url;
using onetouch.Authorization.Delegation;
using Abp.Domain.Repositories;
using System.Management.Automation.Runspaces;
using System.Management.Automation;
using System.Collections.Generic;
using System.Text;


using System.Collections.ObjectModel;
using onetouch.Net.Emailing;
using Abp.Reflection.Extensions;
using Abp.IO.Extensions;
using System.Text.RegularExpressions;

namespace onetouch.Authorization.Accounts
{
    public class AccountAppService : onetouchAppServiceBase, IAccountAppService
    {
        public IAppUrlService AppUrlService { get; set; }

        public IRecaptchaValidator RecaptchaValidator { get; set; }

        private readonly IUserEmailer _userEmailer;
        private readonly UserRegistrationManager _userRegistrationManager;
        private readonly IImpersonationManager _impersonationManager;
        private readonly IUserLinkManager _userLinkManager;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IWebUrlService _webUrlService;
        private readonly IUserDelegationManager _userDelegationManager;

        public AccountAppService(
            IUserEmailer userEmailer,
            UserRegistrationManager userRegistrationManager,
            IImpersonationManager impersonationManager,
            IUserLinkManager userLinkManager,
            IPasswordHasher<User> passwordHasher,
            IWebUrlService webUrlService, 
            IUserDelegationManager userDelegationManager)
        {
            _userEmailer = userEmailer;
            _userRegistrationManager = userRegistrationManager;
            _impersonationManager = impersonationManager;
            _userLinkManager = userLinkManager;
            _passwordHasher = passwordHasher;
            _webUrlService = webUrlService;

            AppUrlService = NullAppUrlService.Instance;
            RecaptchaValidator = NullRecaptchaValidator.Instance;
            _userDelegationManager = userDelegationManager;
        }

        public async Task<IsTenantAvailableOutput> IsTenantAvailable(IsTenantAvailableInput input)
        {
            var tenant = await TenantManager.FindByTenancyNameAsync(input.TenancyName);
            if (tenant == null)
            {
                return new IsTenantAvailableOutput(TenantAvailabilityState.NotFound);
            }

            if (!tenant.IsActive)
            {
                return new IsTenantAvailableOutput(TenantAvailabilityState.InActive);
            }

            return new IsTenantAvailableOutput(TenantAvailabilityState.Available, tenant.Id, _webUrlService.GetServerRootAddress(input.TenancyName));
        }

        public Task<int?> ResolveTenantId(ResolveTenantIdInput input)
        {
            if (string.IsNullOrEmpty(input.c))
            {
                return Task.FromResult(AbpSession.TenantId);
            }

            var parameters = SimpleStringCipher.Instance.Decrypt(input.c);
            var query = HttpUtility.ParseQueryString(parameters);

            if (query["tenantId"] == null)
            {
                return Task.FromResult<int?>(null);
            }

            var tenantId = Convert.ToInt32(query["tenantId"]) as int?;
            return Task.FromResult(tenantId);
        }

        public async Task<RegisterOutput> Register(RegisterInput input)
        {
            
            if (UseCaptchaOnRegistration())
            {
                await RecaptchaValidator.ValidateAsync(input.CaptchaResponse);
            }
          
            var user = await _userRegistrationManager.RegisterAsync(
                input.Name,
                input.Surname,
                input.EmailAddress,
                input.UserName,
                input.Password,
                false,
                AppUrlService.CreateEmailActivationUrlFormat(AbpSession.TenantId)
            );

            var isEmailConfirmationRequiredForLogin = await SettingManager.GetSettingValueAsync<bool>(AbpZeroSettingNames.UserManagement.IsEmailConfirmationRequiredForLogin);

            CreateDomainUser(input.UserName, input.Password);

            return new RegisterOutput
            {
                CanLogin = user.IsActive && (user.IsEmailConfirmed || !isEmailConfirmationRequiredForLogin)
            };
        }

        private void CreateDomainUser(string userName, string Password)
        {
            try
            {
                //RunspaceConfiguration runspaceConfiguration;
                //runspaceConfiguration = RunspaceConfiguration.Create();

                Runspace runspace = RunspaceFactory.CreateRunspace();
                runspace.Open();

                //RunspaceInvoke scriptInvoker = new RunspaceInvoke(runspace);

                Pipeline pipeline = runspace.CreatePipeline();

                //Here's how you add a new script with arguments
                Command myCommand = new Command(@"D:\CreateAccount2.ps1");

                CommandParameter userNameParam = new CommandParameter("username", userName);
                myCommand.Parameters.Add(userNameParam);

                CommandParameter userpasswordParam = new CommandParameter("userpassword", Password);
                myCommand.Parameters.Add(userpasswordParam);

                pipeline.Commands.Add(myCommand);

                // Execute PowerShell script
                var results = pipeline.Invoke();
            }
            catch (Exception ex)
            {

          
            }

        }

        private async Task RunScript(string userName)
        {
            // create a new hosted PowerShell instance using the default runspace.
            // wrap in a using statement to ensure resources are cleaned up.
            try
            {
                using (PowerShell ps = PowerShell.Create())
                {
                    var scriptParameters = new Dictionary<string, object>()
                {
                    { "username", userName },
                    { "userpassword", "Aria@2020" }
                };

                    var scriptContents = new StringBuilder();
                    scriptContents.AppendLine(@"D:\CreateAccount2.ps1");
                    //scriptContents.AppendLine("param ($username, $userpassword)");
                    //scriptContents.AppendLine("");
                    //scriptContents.AppendLine("New-LocalUser -Name $username -Password $(ConvertTo-SecureString $userpassword -AsPlainText -Force)");
                    //scriptContents.AppendLine("");

                    // specify the script code to run.
                    ps.AddScript(scriptContents.ToString(), true);

                    // specify the parameters to pass into the script.
                    ps.AddParameters(scriptParameters);

                    ps.Streams.Error.DataAdded += Error_DataAdded;

                    // execute the script and await the result.
                    var pipelineObjects = await ps.InvokeAsync().ConfigureAwait(false);

                    // print the resulting pipeline objects to the console.
                    foreach (var item in pipelineObjects)
                    {
                        Console.WriteLine(item.BaseObject.ToString());
                    }
                }
            }
            catch (Exception ex)
            {


            }
   
        }

        void Error_DataAdded(object sender, DataAddedEventArgs e)
        {
            //display error message in UI
        }
        //Mariam[Start]
        //public async Task SendPasswordResetCode(SendPasswordResetCodeInput input)
        public async Task SendPasswordResetCode(SendUserResetPasswordCodeInput input)
        //Mariam[end]
        {
            //Mariam [Start]
            //var user = await GetUserByChecking(input.EmailAddress);  
            var user = await UserManager.FindByNameOrEmailAsync (input.UserName);
            if (user != null)
            {
                //Mariam[end]
                user.SetNewPasswordResetCode();
                await _userEmailer.SendPasswordResetLinkAsync(
                    user,
                    AppUrlService.CreatePasswordResetUrlFormat(AbpSession.TenantId)
                    );
            }
            else
            {
                
                    throw new UserFriendlyException(L("InvalidUserName"));
                
            }

        }

        public async Task<ResetPasswordOutput> ResetPassword(ResetPasswordInput input)
        {
            var user = await UserManager.GetUserByIdAsync(input.UserId);
            if (user == null || user.PasswordResetCode.IsNullOrEmpty() || user.PasswordResetCode != input.ResetCode)
            {
                throw new UserFriendlyException(L("InvalidPasswordResetCode"), L("InvalidPasswordResetCode_Detail"));
            }

            await UserManager.InitializeOptionsAsync(AbpSession.TenantId);
            CheckErrors(await UserManager.ChangePasswordAsync(user, input.Password));
            user.PasswordResetCode = null;
            user.IsEmailConfirmed = true;
            user.ShouldChangePasswordOnNextLogin = false;

            await UserManager.UpdateAsync(user);

            return new ResetPasswordOutput
            {
                CanLogin = user.IsActive,
                UserName = user.UserName
            };
        }

        public async Task SendEmailActivationLink(SendEmailActivationLinkInput input)
        {
            var user = await GetUserByChecking(input.EmailAddress);
            user.SetNewEmailConfirmationCode();
            await _userEmailer.SendEmailActivationLinkAsync(
                user,
                AppUrlService.CreateEmailActivationUrlFormat(AbpSession.TenantId)
            );
        }

        public async Task ActivateEmail(ActivateEmailInput input)
        {
            var user = await UserManager.GetUserByIdAsync(input.UserId);
            if (user != null && user.IsEmailConfirmed)
            {
                return;
            }

            if (user == null || user.EmailConfirmationCode.IsNullOrEmpty() || user.EmailConfirmationCode != input.ConfirmationCode)
            {
                throw new UserFriendlyException(L("InvalidEmailConfirmationCode"), L("InvalidEmailConfirmationCode_Detail"));
            }

            user.IsEmailConfirmed = true;
            user.EmailConfirmationCode = null;

            await UserManager.UpdateAsync(user);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_Users_Impersonation)]
        public virtual async Task<ImpersonateOutput> Impersonate(ImpersonateInput input)
        {
            return new ImpersonateOutput
            {
                ImpersonationToken = await _impersonationManager.GetImpersonationToken(input.UserId, input.TenantId),
                TenancyName = await GetTenancyNameOrNullAsync(input.TenantId)
            };
        }

        public virtual async Task<ImpersonateOutput> DelegatedImpersonate(DelegatedImpersonateInput input)
        {
            var userDelegation = await _userDelegationManager.GetAsync(input.UserDelegationId);
            if (userDelegation.TargetUserId != AbpSession.GetUserId())
            {
                throw new UserFriendlyException("User delegation error.");
            }

            return new ImpersonateOutput
            {
                ImpersonationToken = await _impersonationManager.GetImpersonationToken(userDelegation.SourceUserId, userDelegation.TenantId),
                TenancyName = await GetTenancyNameOrNullAsync(userDelegation.TenantId)
            };
        }

        public virtual async Task<ImpersonateOutput> BackToImpersonator()
        {
            return new ImpersonateOutput
            {
                ImpersonationToken = await _impersonationManager.GetBackToImpersonatorToken(),
                TenancyName = await GetTenancyNameOrNullAsync(AbpSession.ImpersonatorTenantId)
            };
        }

        public virtual async Task<SwitchToLinkedAccountOutput> SwitchToLinkedAccount(SwitchToLinkedAccountInput input)
        {
            if (!await _userLinkManager.AreUsersLinked(AbpSession.ToUserIdentifier(), input.ToUserIdentifier()))
            {
                throw new Exception(L("This account is not linked to your account"));
            }

            return new SwitchToLinkedAccountOutput
            {
                SwitchAccountToken = await _userLinkManager.GetAccountSwitchToken(input.TargetUserId, input.TargetTenantId),
                TenancyName = await GetTenancyNameOrNullAsync(input.TargetTenantId)
            };
        }

        private bool UseCaptchaOnRegistration()
        {
            return SettingManager.GetSettingValue<bool>(AppSettings.UserManagement.UseCaptchaOnRegistration);
        }

        private async Task<Tenant> GetActiveTenantAsync(int tenantId)
        {
            var tenant = await TenantManager.FindByIdAsync(tenantId);
            if (tenant == null)
            {
                throw new UserFriendlyException(L("UnknownTenantId{0}", tenantId));
            }

            if (!tenant.IsActive)
            {
                throw new UserFriendlyException(L("TenantIdIsNotActive{0}", tenantId));
            }

            return tenant;
        }

        private async Task<string> GetTenancyNameOrNullAsync(int? tenantId)
        {
            return tenantId.HasValue ? (await GetActiveTenantAsync(tenantId.Value)).TenancyName : null;
        }

        private async Task<User> GetUserByChecking(string inputEmailAddress)
        {
            var user = await UserManager.FindByEmailAsync(inputEmailAddress);
            if (user == null)
            {
                throw new UserFriendlyException(L("InvalidEmailAddress"));
            }

            return user;
        }
       
    }
}