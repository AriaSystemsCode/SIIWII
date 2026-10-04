using Abp.Application.Services.Dto;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Policy;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppDashboards.Dtos
{
    public class GetDashboardForViewDto
    {
        public virtual long Id { get; set; }
        public virtual string Title { get; set; }
        public virtual string CreatorUserName { get; set; }
        public virtual long CreatorUserId { get; set; }
        public virtual DateTime? LastModificationDate { get; set; }
        public virtual DateTime? LastViewDate { get; set; }
        public virtual List<onetouch.AppEntities.Dtos.UserInformationDto> SharedWithUsers { get; set; }
        public virtual JObject Spreadsheet { get; set; }
        public virtual string SpreadsheetFilePath { get; set;}
        public virtual bool IsEditable { set; get; }
        public virtual bool IsTheOwner { set; get; }
        public virtual int SharingLevel { get; set; }
    }
    public class GetAllDashboardsInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
        public DashboardFilterType SharingLevel { get; set; } = 0;
    }
    public enum DashboardFilterType
    {
        All,
        MyDashboards,
        SharedWithMe 
    }
    public class CreateOrEditDashboard
    {
        public virtual long Id { get; set; }
        public virtual string Title { get; set; }
        public virtual string Description{ get; set; }

    }
    public class SharingUserInfo: onetouch.AppEntities.Dtos.UserInformationDto
    { 
        public virtual bool CanEdit { set; get; }
        public virtual bool IsOwner { set; get; }
        public virtual long UserId { get; set; }
        public virtual bool CanView { set; get; }

    }
    public class ShareDashboardInfo
    { 
        public virtual long DashboardId { get; set; }
        public virtual int SharingLevel { get; set; }
        public virtual bool CanEdit{ get; set; }
        public virtual List<ShareWithUser> UsersList{ get; set; }

    }
    public class ShareWithUser
    { 
        public virtual long UserId { get;set; }
        public virtual bool CanEdit { get; set; }
        
    }
}
