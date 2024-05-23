
using System;
using System.Collections.Generic;
using Abp.Application.Services.Dto;
using onetouch.AccountInfos.Dtos;
using onetouch.Common;
using onetouch.AppContacts.Dtos;
using onetouch.Globals.Dtos;

namespace onetouch.MarketplaceAccounts.Dtos
{
    public class AccountExcelDto
    {
        public Int32 rowNumber { get; set; }
        public string PriceLevel { get; set; }
        public string RecordType { get; set; }
        public string ParentCode { get; set; }
        public long? ParentId { get; set; }
        public long? AccountId { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Language { get; set; }
        public string EmailAddress { get; set; }
        public string Phone1Type { get; set; }
        public string Phone1Code { get; set; }
        public string Phone1Number { get; set; }
        public string Phone1Ext { get; set; }
        public string Phone2Type { get; set; }
        public string Phone2Code { get; set; }
        public string Phone2Number { get; set; }
        public string Phone2Ext { get; set; }
        public string Phone3Type { get; set; }
        public string Phone3Code { get; set; }
        public string Phone3Number { get; set; }
        public string Phone3Ext { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
       // public string Department { get; set; }
        public string Title { get; set; }
        public string TradeName { get; set; }
        public string AccountType { get; set; }
        public string Aboutus { get; set; }
        public string Currency { get; set; }
        public string Website { get; set; }
        public string BusinessClassification1 { get; set; }
        public string BusinessClassification2 { get; set; }
        public string BusinessClassification3 { get; set; }
        public string Department1 { get; set; }
        public string Department2 { get; set; }
        public string Department3 { get; set; }
        public string Address1Type { get; set; }
        public string Address1Code { get; set; }
        public string Address1Name { get; set; }
        public string Address1Line1 { get; set; }
        public string Address1Line2 { get; set; }
        public string Address1City { get; set; }
        public string Address1State { get; set; }
        public string Address1PostalCode { get; set; }
        public string Address1Country { get; set; }
      
        public string Address2Type { get; set; }
        public string Address2Code { get; set; }
        public string Address2Name { get; set; }
        public string Address2Line1 { get; set; }
        public string Address2Line2 { get; set; }
        public string Address2City { get; set; }
        public string Address2State { get; set; }
        public string Address2PostalCode { get; set; }
        public string Address2Country { get; set; }
        public string Address3Type { get; set; }
        public string Address3Code { get; set; }
        public string Address3Name { get; set; }
        public string Address3Line1 { get; set; }
        public string Address3Line2 { get; set; }
        public string Address3City { get; set; }
        public string Address3State { get; set; }
        public string Address3PostalCode { get; set; }
        public string Address3Country { get; set; }
        public string Address4Type { get; set; }
        public string Address4Code { get; set; }
        public string Address4Name { get; set; }
        public string Address4Line1 { get; set; }
        public string Address4Line2 { get; set; }
        public string Address4City { get; set; }
        public string Address4State { get; set; }
        public string Address4PostalCode { get; set; }
        public string Address4Country { get; set; }
        public string Image1Type { get; set; }
        public string Image1FileName { get; set; }
        public string Image1Guid { get; set; }
        public string Image2Type { get; set; }
        public string Image2FileName { get; set; }
        public string Image2Guid { get; set; }
        public string Image3Type { get; set; }
        public string Image3FileName { get; set; }
        public string Image3Guid { get; set; }
        public string Image4Type { get; set; }
        public string Image4FileName { get; set; }
        public string Image4Guid { get; set; }
        public string Image5Type { get; set; }
        public string Image5FileName { get; set; }
        public string Image5Guid { get; set; }
    }
}