using System;
using System.Collections.Generic;
using System.Text;
using System.ComponentModel.DataAnnotations;

namespace onetouch.Authorization.Accounts.Dto
{
    public class SendUserResetPasswordCodeInput
    {
        [Required]
        public string UserName{ get; set; }
    }
}
