import { AppConsts } from "@shared/AppConsts"
import { NameValueOfString } from "@shared/service-proxies/service-proxies"

export class ProductCatalogueReportParamsI {
    reportTemplateName : string
    itemsListId:number=null;
    reportTitle:string
    userId:number
    preparedForContactId:number
    tenantId:number
    showPrice:boolean
    showCode:boolean
    showCover:boolean
    showColors:boolean
    showQty:boolean
    showNo:boolean
    showFooter:boolean
    showSpecialPrice:boolean
    specialPriceLevel:string
    EmailLinesheet:boolean= false
    PrintLinesheet:boolean= true
    selectedKey: string=null;
    toUsers: NameValueOfString[];
    ccUsers: NameValueOfString[] ;
    bccUsers: NameValueOfString[] ;
    subject: string = "";
    body: string = "";
    orderBy: string="";
}

export class ProductCatalogueReportParams implements ProductCatalogueReportParamsI {
    reportTemplateName : string
    itemsListId:number=null;
    reportTitle:string
    userId:number
    preparedForContactId:any
    tenantId:number 
    showPrice:boolean = true
    showCode:boolean = true
    showCover:boolean= false
    showColors:boolean= false
    showQty:boolean= true
    showNo:boolean= true
    showFooter:boolean= false
    showSpecialPrice:boolean= false
    specialPriceLevel:string
    EmailLinesheet:boolean= false
    PrintLinesheet:boolean= true
    selectedKey: string=null;;
    toUsers: NameValueOfString[]=[];
    ccUsers: NameValueOfString[] =[];
    bccUsers: NameValueOfString[] =[];
    subject: string = "";
    body: string = "";
    BKGround: string = "";
    orderBy: string = "";
    ColorPageSort: string = "";
    DetailPageSort: string = "";
    DetailPageGroupByName: string="";
    DetailPageShowCategory:boolean= false
    ColorPageShowCategory:boolean= false
    TransactionId: string="";
    orderType: string="";
    saveToPDF:boolean= true;


    private attachmentBaseUrl :string = AppConsts.attachmentBaseUrl
    constructor(body?:ProductCatalogueReportParamsI){
        if(!body) return
        Object.keys(body).forEach(key => {
            const value = body[key]
            this[key] = value
        });
    }
    getReportUrl(){
        debugger;
       let url = ""
       let  toUsers= ""
       let ccUsers= ""
       let bccUsers= ""

       for (let i = 0; i < this.toUsers.length; i++) {
        if (i != this.toUsers.length - 1)
            toUsers += this.toUsers[i].value + ",";
        else
                toUsers += this.toUsers[i].value;
    }

    for (let i = 0; i < this.ccUsers.length; i++) {
        if (i != this.ccUsers.length - 1)
        ccUsers += this.ccUsers[i].value + ",";
        else
        ccUsers += this.ccUsers[i].value;
    }

    for (let i = 0; i < this.bccUsers.length; i++) {
        if (i != this.bccUsers.length - 1)
        bccUsers += this.bccUsers[i].value + ",";
        else
        bccUsers += this.bccUsers[i].value;
    }
       url += this.reportTemplateName + "?"
       url += 'itemsListId=' + this.itemsListId
       url += '&reportTitle=' + this.reportTitle
       url += '&userId=' + this.userId
       if(this.preparedForContactId) url += '&preparedForContactId=' + this.preparedForContactId
       url += '&tenantId=' + this.tenantId
       url += '&showPrice=' + this.showPrice
       url += '&showCode=' + this.showCode
       url += '&showCover=' + this.showCover
       url += '&showColors=' + this.showColors
       url += '&showQty=' + this.showQty
       url += '&showNo=' + this.showNo
       url += '&showFooter=' + this.showFooter
       url += '&showSpecialPrice=' + this.showSpecialPrice
       url += '&specialPriceLevel=' + this.specialPriceLevel
       url += '&EmailLinesheet=' + this.EmailLinesheet
       url += '&PrintLinesheet=' + this.PrintLinesheet
       url += '&selectedKey=' + this.selectedKey
       url += '&to=' + toUsers
       url += '&cc=' + ccUsers
       url += '&bcc=' + bccUsers
       url += '&subject=' + this.subject
       url += '&body=' + this.body
       url += "&attachmentBaseUrl=" + this.attachmentBaseUrl
       url += "&BKGround=" + this.BKGround
       url += "&ColorPageSort=" + this.ColorPageSort
       url += "&DetailPageSort=" + this.DetailPageSort
       url += "&DetailPageGroupByName=" + this.DetailPageGroupByName
       url += "&DetailPageShowCategory=" + this.DetailPageShowCategory
       url += "&ColorPageShowCategory=" + this.ColorPageShowCategory
       url += "&TransactionId=" + this.TransactionId
       url += "&orderType=" + this.orderType
       url += "&saveToPDF=" + this.saveToPDF
              return url
    }
}
