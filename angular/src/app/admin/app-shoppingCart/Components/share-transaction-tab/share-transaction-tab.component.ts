import { Component, EventEmitter, Injector,Output,Input, OnInit, OnChanges, SimpleChanges  } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { AppTransactionServiceProxy, AppPostsServiceProxy, SharingTransactionOptions, TransactionSharingDto} from '@shared/service-proxies/service-proxies';
import { filter } from 'lodash';
interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}
@Component({
  selector: 'app-share-transaction-tab',
  templateUrl: './share-transaction-tab.component.html',
  styleUrls: ['./share-transaction-tab.component.scss']
})
export class ShareTransactionTabComponent  extends AppComponentBase {
  @Output() offShareTransactionEvent = new EventEmitter<any>();
  @Output() closeTranScreenEvent = new EventEmitter<any>();
  @Input("orderId") orderId:number;
  @Input("sharedWithUsers") sharedWithUsers:any;
  emailList:string;
  sharingList:any;
  sharingListForSave:any;
  searchContact: any[] | undefined;
  suggestionsContacts:any[]|undefined;
  contact: any[] | undefined;
  item:any;
  email: boolean | string	
  validEmailFormate:boolean=true;
  sharedBefore:boolean=true;
  editMode:boolean=true;
  readyForSave:boolean=false;
  attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
  shareTranOptions:SharingTransactionOptions;
  messageBody:string;
  contactsToBeSharedWith:TransactionSharingDto[];
  dasableShareBtn:boolean=true;
  constructor(
    injector: Injector,
    private _postService: AppPostsServiceProxy,
    private _AppTransactionServiceProxy:AppTransactionServiceProxy

  ) {
    super(injector);

  }
  ngOnChanges(changes: SimpleChanges) {
    this.checkSaveAvilabilty();
  }
  ngOnInit(): void {
if(this.sharedWithUsers){
  this.editMode=false;
  this.sharingListForSave=this.sharedWithUsers;
  this.sharingList=this.sharedWithUsers;
  for (let i =0; i<this.sharingList.length;i++){
    if(this.sharingList[i].userImage){
      this.sharingList.filter(item=>{
        if(item.id==this.sharingList[i].id) this.sharingList[i].isLoading=true;
      })
      this.getProfilePictureById(this.sharingList[i].userImage,this.sharingList[i],'sharingList');
    }

  }
}else{
  this.loadContactList();

}

  }
  checkSaveAvilabilty(){
    if(this.messageBody=='')this.messageBody=undefined
    if(!this.sharingListForSave&&this.messageBody&&!this.emailList||this.sharingListForSave&&!this.messageBody&&!this.emailList)this.dasableShareBtn=true;
    if(!this.emailList&&this.messageBody&&!this.sharingListForSave||this.emailList&&!this.messageBody&&!this.sharingListForSave||this.emailList&&!this.messageBody&&this.sharingListForSave)this.dasableShareBtn=true;
    if(this.sharingListForSave?.length==0&&!this.editMode)this.dasableShareBtn=true;
    if(this.sharingListForSave&&this.messageBody)this.dasableShareBtn=false;
    if(this.emailList&&this.messageBody)this.dasableShareBtn=false;
    if(this.readyForSave&&this.sharingListForSave?.length>0)this.dasableShareBtn=false;
  } 
  shareTransaction(){
    let newsharingArray=[];
    let shareTranOptionsDto:any={
      transactionId:undefined,
      message:'',
      transactionSharing:[]
    };

    if(this.sharingListForSave&&this.sharingListForSave?.length>0){
      this.sharingListForSave.forEach(function(contact,index){
        let contactUser:any={};
        contactUser.sharedTenantId=contact.tenantId;
        contactUser.sharedUserId=contact.userId;
        contactUser.sharedUserEMail=contact.email;
        contactUser.sharedUserName=contact.name;
        contactUser.sharedUserSureName=contact.name;
        contactUser.sharedUserTenantName=contact.tenantName;
        contactUser.id=contact.id;
        newsharingArray.push(contactUser);
      })
      shareTranOptionsDto['transactionId']=this.orderId;
      shareTranOptionsDto['message']=this.messageBody;
      shareTranOptionsDto['transactionSharing']=newsharingArray;
      shareTranOptionsDto['subject']=undefined;
      this.showMainSpinner();
     this._AppTransactionServiceProxy.shareTransactionByMessage(shareTranOptionsDto).subscribe(result=>{
      if(result){
        this.notify.success(this.l("TransactionHasBeenSent"));
        this.closeTransPopup();

      }
       this.hideMainSpinner();
        }) 
    }
    if(this.emailList){
      shareTranOptionsDto['transactionId']=this.orderId;
      shareTranOptionsDto['message']=this.messageBody;
      shareTranOptionsDto['emailAddresses']=this.emailList.split(/[ ,]+/);
      this.showMainSpinner();
      this._AppTransactionServiceProxy.shareTransactionByEmail(shareTranOptionsDto).subscribe(result=>{
        if(result){
          this.notify.success(this.l("TransactionHasBeenSent"));
          this.closeTransPopup();
        }
        this.hideMainSpinner();
         }) 
    }

  }
  closeTransPopup(){
    this.closeTranScreenEvent.emit();
  }
  loadContactList(){
    this._AppTransactionServiceProxy.getTransactionContacts(this.orderId,'').subscribe(result=>{
      for (let i =0; i<result.length;i++){
        if(result[i].userImage){
          result.filter(item=>{
            if(item.id==result[i].id) result[i].isLoading=true;
          })
          this.getProfilePictureById(result[i].userImage,result[i],'sharingList');
        }
    
      }
      this.sharingList=result;
    })
    
  }
  validateSelectedContact(){
    let isValidContacts=true;
    let currentsharingList=JSON.parse(JSON.stringify(this.sharingList));
    let searchArray=JSON.parse(JSON.stringify(this.searchContact));
    let indexInsideArray;
    let arrindex ;

    searchArray.forEach(function(item){
      indexInsideArray=currentsharingList.findIndex(a => a.userId === item.userId);
      if(indexInsideArray>=0){
        arrindex= currentsharingList.findIndex(a => a.userId === item.userId)
        if(searchArray.length>arrindex){
                  searchArray.splice(arrindex, 1);

        }else if (searchArray.length==1){
          searchArray=[];
        }

      }
    })
    if(searchArray.length==0){
      isValidContacts=false;
 
    }
    this.searchContact=searchArray;
    return isValidContacts;
  }  
  selectContact(value){
    this.editMode=true;
    this.checkSaveAvilabilty();

  }

  updateSelectedContacts(){
    let newsharingList;
   
    if( this.validateSelectedContact()){
      newsharingList=this.sharingList;
     this.searchContact.forEach(function(item){
      newsharingList.push(item);

    })
    this.sharingList=newsharingList; 
    this.sharingListForSave = this.sharingList.filter(contact => {
      return contact.removed !== true;
    });   
     this.searchContact=[];
    this.checkSaveAvilabilty();

    }

  }
  getProfilePictureById(id: string,contact:any,objectName:string) {
    let contactImage;
   const currentObject= this[objectName]
    this._postService
        .getProfilePictureAllByID(id)
        .subscribe((data) => {
            if (data.profilePicture) {
                contactImage ="data:image/jpeg;base64," + data.profilePicture;
                contact.userImage=contactImage;
                if(currentObject){
                let indexInsideArray=currentObject.findIndex(a => a.id === contact.id);

                this[objectName].filter(item=>{
                  if(item.id==contact.id) currentObject[indexInsideArray].userImage=contactImage;
                })
                this[objectName]=currentObject;  
                }


            }
        });
} 
  filterContacts(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let query = event.query;
this._AppTransactionServiceProxy.getAccountConnectedContacts(query).subscribe(result=>{
  this.suggestionsContacts=[];
  for (let i =0; i<result.length;i++){
    if(result[i].userImage){
      result.filter(item=>{
        if(item.id==result[i].id) result[i].isLoading=true;
      })
      this.getProfilePictureById(result[i].userImage,result[i],'suggestionsContacts');
    }

  }
  this.suggestionsContacts=result;
})


}
  removefromShareList(id){
    this.sharingListForSave = this.sharingListForSave.filter(contact => {
      return contact.id !== id;
    });
    this.sharingList.forEach(function(contact){
      if(contact.id==id){ contact.removed=true;}
    })
    this.readyForSave=true;
this.checkSaveAvilabilty();

  }
  reloadContact(id){
    this.sharingList.forEach(function(contact){
      if(contact.id==id){ contact.removed=false;}
    })
    this.sharingListForSave = this.sharingList.filter(contact => {
      return contact.removed !== true;
    });
    this.checkSaveAvilabilty();

  }
  closeShareMode(){
    this.offShareTransactionEvent.emit();
  } 
   validateEmailFormate(){
    let emailList=this.emailList.split(/[ ,]+/);
    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    let emailIsValid=true;
    emailList.forEach(function(email){
      if (!email.match(validRegex)) {
        emailIsValid=false;
          
        }
    })
this.validEmailFormate=emailIsValid;
  }

}
