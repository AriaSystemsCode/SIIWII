using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.Message.Dto
{
    public class MessagePagedResultDto: PagedResultDto<GetMessagesForViewDto>
    {
        public MessagePagedResultDto(int totalCount,int totalUnread, IReadOnlyList<GetMessagesForViewDto> items) : base(totalCount, items)
        {
            TotalUnread = totalUnread;
        }

        public int TotalUnread { get; set; }

    }
}
