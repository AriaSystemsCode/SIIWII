using Abp.Application.Services.Dto;
using System;

namespace onetouch.AppPosts.Dtos
{
    public class GetAllAppPostsInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }

        public string CodeFilter { get; set; }

        public string DescriptionFilter { get; set; }
        //Iteration#29,1 MMT News Digest changes[Start]
        //public string TypeFilter { get; set; }
        public PostType? TypeFilter { get; set; } = null;
        public DateTime? FromCreationDateFilter { set; get; } = null;
        public DateTime? ToCreationDateFilter { set; get; } = null;
        //Iteration#29,1 MMT News Digest changes[End]
        public string AppContactNameFilter { get; set; }

        public string AppEntityNameFilter { get; set; }

        public long PostId { get; set; }

    }
}