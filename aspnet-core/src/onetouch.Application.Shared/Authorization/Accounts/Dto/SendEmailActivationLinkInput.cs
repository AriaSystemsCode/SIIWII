using System.ComponentModel.DataAnnotations;

namespace onetouch.Authorization.Accounts.Dto
{
    public class SendEmailActivationLinkInput
    {
        [Required]
        public string EmailAddress { get; set; }
    }
}