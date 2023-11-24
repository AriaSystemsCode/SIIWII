using Abp.Application.Services.Dto;
using System;

namespace onetouch.AppPosts.Dtos
{
    public class GetAllAppPostsInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }

        public string CodeFilter { get; set; }

        public string DescriptionFilter { get; set; }

        public string TypeFilter { get; set; }

        public string AppContactNameFilter { get; set; }

        public string AppEntityNameFilter { get; set; }

        public long PostId { get; set; }

    }
}