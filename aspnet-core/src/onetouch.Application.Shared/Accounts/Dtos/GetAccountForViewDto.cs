namespace onetouch.Accounts.Dtos
{
    public class GetAccountForViewDto
    {
		public AccountDto Account { get; set; }

		public string AppEntityName { get; set;}

        //MMT10
        public bool IsPublished { get; set; }
        //MMT10
        //I46[Start]
        public virtual string ShipViaName { set; get; }
        public virtual string PaymentTermsName { set; get; }
        public virtual long? ShipViaId { set; get; }
        public virtual long? PaymentTermsId{ set; get; }
        //I46[End]
    }
}