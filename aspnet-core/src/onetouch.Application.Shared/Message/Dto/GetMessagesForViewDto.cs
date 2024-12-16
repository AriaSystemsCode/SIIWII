using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.Message.Dto
{
  public  class GetMessagesForViewDto
    {
        public MessagesDto Messages { get; set; }
        public int? Rating { get; set; }
        public bool IsUserVerifiedPurchaser { get; set; }
    }
}
