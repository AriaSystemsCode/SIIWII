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
        public bool IsProfileOwner { get; set; }
        public bool IsAccountAdmin { get; set; }
    }
    public class OverAllRatingDto
    { 
        public decimal OverAllRating { get; set; }
        public long TotalNumberOfRating { get; set; }
        public decimal OneTotal { get; set; }
        public decimal TwoTotal { get; set; }
        public decimal ThreeTotal { get; set; }
        public decimal FourTotal { get; set; }
        public decimal FiveTotal { get; set; }
    }
}
