import { Component, EventEmitter, Injector,Output,Input  } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { AppTransactionServiceProxy, AppPostsServiceProxy} from '@shared/service-proxies/service-proxies';
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
export class ShareTransactionTabComponent  extends AppComponentBase{
  @Output() offShareTransactionEvent = new EventEmitter<any>();
  @Input("orderId") orderId:number;

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

  constructor(
    injector: Injector,
    private _postService: AppPostsServiceProxy,
    private _AppTransactionServiceProxy:AppTransactionServiceProxy

  ) {
    super(injector);

  }
  ngOnInit(): void {
    this.sharingList=[{
      id:1,
      name:'test',
      image:'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png'
    },
    {
      id:2,
      name:'test2',
      image:'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png'
    },
    {
      id:3,
      name:'tes2',
      image:'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png'
    }];
    this.sharingList.forEach(function(contact){
      contact.removed=false;
    })
  this.sharingListForSave=this.sharingList;
  this.loadContactList();
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
    let indexInsideArray;
    let arrindex ;

    this.searchContact.forEach(function(item){
      indexInsideArray=currentsharingList.findIndex(a => a.id === item.id);
      if(indexInsideArray>0){
        arrindex= currentsharingList.findIndex(a => a.id === item.id)
        currentsharingList.splice(arrindex, 1);

      }
    })
    if(currentsharingList.length==0){
      isValidContacts=false;

    }
    this.sharingList=currentsharingList;
    return isValidContacts;
  } 
  selectContact(value){
    debugger
    this.editMode=true;
  }

  updateSelectedContacts(){
    let newsharingList;
   
    if( this.validateSelectedContact()){
      newsharingList=this.sharingList;
     this.searchContact.forEach(function(item){
      newsharingList.push(item);

    })
    this.sharingList=newsharingList; 
    this.searchContact=[];

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
                this.suggestionsContacts=currentObject;  
                }


            }
        });
} 
  filterContacts(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let query = event.query;
this._AppTransactionServiceProxy.getAccountConnectedContacts(query).subscribe(result=>{
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
  }
  reloadContact(id){
    this.sharingList.forEach(function(contact){
      if(contact.id==id){ contact.removed=false;}
    })
    this.sharingListForSave = this.sharingList;
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
