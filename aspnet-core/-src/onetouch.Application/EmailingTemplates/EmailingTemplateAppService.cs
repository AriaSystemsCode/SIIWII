using Abp.Reflection.Extensions;
using Newtonsoft.Json;
using onetouch.EmailingTemplates.Dto;
using onetouch.Net.Emailing;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

namespace onetouch.EmailingTemplates
{
    public class EmailingTemplateAppService : onetouchAppServiceBase, IEmailingTemplateAppService
    {
        public EmailTemplateReturnDto  GetEmailTemplate(string templateName, List <string> emailParameters,string langunage)
        {
            EmailTemplateReturnDto emailTemplateReturnDto = new EmailTemplateReturnDto();

            //string templateFilePath = Path.Combine(System.IO.Path.GetFullPath(@"..\"), @"onetouch.Core\Net\Emailing\EmailTemplates\", templateName +"_"+ langunage + ".json");
            //System.IO.FileInfo fileInfo = new FileInfo(templateFilePath);
            //if (!fileInfo.Exists)
            //{
            //   templateFilePath = Path.Combine(System.IO.Path.GetFullPath(@"..\"), @"onetouch.Core\Net\Emailing\EmailTemplates\", templateName + "_EN" + ".json");
            //    fileInfo = new FileInfo(templateFilePath);
            //    if (!fileInfo.Exists)
            //        return emailTemplateReturnDto;
            //}

            try
            {
                using (var stream = typeof(EmailTemplateProvider).GetAssembly().GetManifestResourceStream("onetouch.Net.Emailing.EmailTemplates." + templateName + "_" + langunage.ToUpper() + ".json"))
                using (var reader = new StreamReader(stream))
                {

                    string json = reader.ReadToEnd();
                    emailTemplateReturnDto = JsonConvert.DeserializeObject<EmailTemplateReturnDto>(json);
                }
               
            }
            catch
            {
                using (var stream = typeof(EmailTemplateProvider).GetAssembly().GetManifestResourceStream("onetouch.Net.Emailing.EmailTemplates." + templateName + "_" + "EN" + ".json"))
                using (var reader = new StreamReader(stream))
                {

                    string json = reader.ReadToEnd();
                    emailTemplateReturnDto = JsonConvert.DeserializeObject<EmailTemplateReturnDto>(json);
                }

            }
            
            for (int pcount = 0; pcount < emailParameters.Count;pcount++)
            {
                emailTemplateReturnDto.MessageBody = emailTemplateReturnDto.MessageBody.Replace("{param" + (pcount+1).ToString().Trim()+"}", emailParameters[pcount]);
                emailTemplateReturnDto.MessageSubject = emailTemplateReturnDto.MessageSubject.Replace("{param" + (pcount + 1).ToString().Trim()+"}", emailParameters[pcount]);
            }
            emailTemplateReturnDto.MessageBody = emailTemplateReturnDto.MessageBody.Replace("\\\"","\"");
           // emailTemplateReturnDto.MessageBody = HtmlToPlainText(emailTemplateReturnDto.MessageBody);
            ////string templateValue = "";
            ////string templateFilePath = Path.Combine(System.IO.Path.GetFullPath(@"..\"), @"onetouch.Core\Net\Emailing\EmailTemplates\", templateName+".html");
            ////templateValue = System.IO.File.ReadAllText(templateFilePath);
            ////templateValue = templateValue.Replace("{param1}", param1).Replace("{param2}", param2).Replace("{param3}", param3).Replace("{param4}", param4).Replace("{param5}", param5)
            ////                .Replace("{param6}", param6).Replace("{param7}", param7).Replace("{param8}", param8).Replace("{param9}", param9);

            return emailTemplateReturnDto;
            
           
        }
        private static string HtmlToPlainText(string html)
        {
            const string tagWhiteSpace = @"(>|$)(\W|\n|\r)+<";//matches one or more (white space or line breaks) between '>' and '<'
            const string stripFormatting = @"<[^>]*(>|$)";//match any character between '<' and '>', even when end tag is missing
            const string lineBreak = @"<(br|BR)\s{0,1}\/{0,1}>";//matches: <br>,<br/>,<br />,<BR>,<BR/>,<BR />
            var lineBreakRegex = new Regex(lineBreak, RegexOptions.Multiline);
            var stripFormattingRegex = new Regex(stripFormatting, RegexOptions.Multiline);
            var tagWhiteSpaceRegex = new Regex(tagWhiteSpace, RegexOptions.Multiline);
            var text = html;
            //Decode html specific characters
            text = System.Net.WebUtility.HtmlDecode(text);
            //Remove tag whitespace/line breaks
            text = tagWhiteSpaceRegex.Replace(text, "><");
            //Replace <br /> with line breaks
            text = lineBreakRegex.Replace(text, Environment.NewLine);
            //Strip formatting
            text = stripFormattingRegex.Replace(text, string.Empty);
            return text;
        }

    }
    
}
