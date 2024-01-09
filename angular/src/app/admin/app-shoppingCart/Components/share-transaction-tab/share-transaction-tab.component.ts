import { Component, EventEmitter, Injector,Output  } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppTransactionServiceProxy } from '@shared/service-proxies/service-proxies';
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
  constructor(
    injector: Injector,
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
  }
  validateSelectedContact(){
    let isValidContacts=true;
    let currentsharingListString=JSON.stringify(this.sharingList);
    let currentsharingList=JSON.parse(JSON.stringify(this.sharingList));

    let arrindex ;

    this.searchContact.forEach(function(item){
      if(currentsharingListString.includes(JSON.stringify(item))){
        debugger
        arrindex= currentsharingList.indexOf(item);
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
    this.editMode=true;
  }

  updateSelectedContacts(){
    let newsharingList=this.sharingList;
   
    if( this.validateSelectedContact()){
     this.searchContact.forEach(function(item){
      newsharingList.push(item);

    })
    this.sharingList=newsharingList; 
    this.searchContact=[];

    }

  }
  filterContacts(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let query = event.query;
this._AppTransactionServiceProxy.getAccountConnectedContacts(query).subscribe(result=>{
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
  }  validateEmailFormate(){
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
