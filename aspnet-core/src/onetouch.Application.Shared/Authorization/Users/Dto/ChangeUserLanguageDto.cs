using System.ComponentModel.DataAnnotations;

namespace onetouch.Authorization.Users.Dto
{
    public class ChangeUserLanguageDto
    {
        [Required]
        public string LanguageName { get; set; }
    }
}
