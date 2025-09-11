using Abp.Application.Services;
using onetouch.EmailingTemplates.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.EmailingTemplates
{
    public interface IEmailingTemplateAppService : IApplicationService
    {
        EmailTemplateReturnDto GetEmailTemplate(string templateName, List<string> emailParameters, string langunage);
        
    }
}
