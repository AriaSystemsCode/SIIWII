using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.Message.Dto
{
    public class CreateMessageForRecieversInput
    {
        public string[] UsersList { get; set; }
        public long Messageid { get; set; }
        public long? ThreadId { get; set; }

        public CreateMessageInput CreateMessageInput { get; set; }
    }
}
