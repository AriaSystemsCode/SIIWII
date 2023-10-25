using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.AppEntities.Dtos
{
	public class AppEntityUserReactionsDto : EntityDto<long>
	{
		public long UserId { get; set; }
		public int ReactionSelected { get; set; }
		public DateTime ActionTime { get; set; }
		public string UserName { get; set; }
		public string UserImage { get; set; }
		public string JobTitle { get; set; }
		public string AccountName { get; set; }
		public Guid ProfilePictureId { get; set; }
		public string ProfilePictureUrl { get; set; }
		//MMT, Iteration#22 changes[Start]
		public string FirstName { get; set; }
		public string LastName { get; set; }
		public string TenancyName { get; set; }
		public int? TenantId { get; set; }
		//MMT, Iteration#22 changes[End]

	}
	public class AppEntityUserReactionDto : EntityDto<long>
	{
		public int ReactionSelected { set; get; }

	}
	public class UserInformationDto : EntityDto<long>
	{
		public string UserImage { get; set; }
		public string JobTitle { get; set; }
		public string AccountName { get; set; }
		public long AccountId { get; set; }
		
		public string UserName { get; set; }
	}
	public class AccountInfoDto: EntityDto<long>
	{
		public string Name { get; set; }
		public string LogoUrl { get; set; }
	 }
	public enum Reactions
	{
		Like = 1,
		Celebrate = 2,
		Love = 3,
		Insightful = 4,
		Curious = 5
	}
}
