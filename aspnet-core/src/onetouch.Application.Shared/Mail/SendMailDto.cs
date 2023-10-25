
using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using onetouch.AppContacts.Dtos;

namespace onetouch.Mail
{
    public class SendMailDto
    {
		[Required]
		public string To { get; set; }

		[Required]
		public string Subject { get; set; }

		[Required]
		public string Body { get; set; }

		[Required]
		public bool IsBodyHtml { get; set; }
	}
}