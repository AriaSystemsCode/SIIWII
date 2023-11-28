import { AfterViewInit, Component, Injector, Input, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppItemsServiceProxy, GetUsersForMessageDto, ItemSharingDto, MessageServiceProxy, PublishItemOptions } from '@shared/service-proxies/service-proxies';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-share-listing',
  templateUrl: './share-listing.component.html',
  styleUrls: ['./share-listing.component.scss']
})
export class ShareListingComponent extends AppComponentBase implements OnInit{
  filteredUsers :GetUsersForMessageDto[] = []
  listingItemId : number
  alreadypublished : boolean
  publishItemOptions : PublishItemOptions
  savingDone : boolean = false
  active : boolean = true;
  saving : boolean = false;
  loading : boolean;
  _notify:boolean = false;
  buttonText = this.l("ShareAndPublish")
  showCloseText = false
  constructor(
      injector:Injector,
      public currentModalRef: BsModalRef,
      private appItemsServiceProxy: AppItemsServiceProxy,
      private messageServiceProxy: MessageServiceProxy
    ) {
      super(injector)
   }

  ngOnInit(): void {
    if(!this.publishItemOptions) this.publishItemOptions = new PublishItemOptions()
    if(!this.publishItemOptions.itemSharing) this.publishItemOptions.itemSharing = []
    if(!this.publishItemOptions.sharingLevel) this.publishItemOptions.sharingLevel = 1
}


  publishListing(){
    const publishItemOptions = PublishItemOptions.fromJS(this.publishItemOptions)
    publishItemOptions.itemSharing.map((item)=>{
        if(item.sharedUserId) {
            item.sharedUserName = undefined
            item.sharedUserSureName = undefined
            item.sharedUserTenantName = undefined
        }
        return item
    })
    this.publishItemOptions = publishItemOptions
    this.savingDone = true
    this.currentModalRef.hide()
  }

  usersSearch(querySearch): void {
    if(!querySearch) return

    const alreadySelected = (user:GetUsersForMessageDto) : boolean => {
    const index = this.publishItemOptions.itemSharing.findIndex((item)=> String(item.sharedUserId) == user.users.value)
        return index > -1
    }

    this.messageServiceProxy.getAllUsers(querySearch).subscribe(users => {
        this.filteredUsers = users.filter((user)=>{
            return !alreadySelected(user)
        })
    });
  }

  addSharingItem(user:GetUsersForMessageDto,i:number){

    const itemSharingDto : ItemSharingDto = new ItemSharingDto()
    itemSharingDto.sharedUserId = Number(user.users.value)
    itemSharingDto.sharedUserName = user?.users?.name
    itemSharingDto.sharedUserSureName = user?.surname
    itemSharingDto.sharedUserTenantName = user?.tenantName

    this.publishItemOptions.itemSharing.push(itemSharingDto)

    this.filteredUsers.splice(i,1)
    this.showCloseText = false

  }

    removeSharingItem(i:number){
        this.publishItemOptions.itemSharing.splice(i,1)
    }

    showCloseButtonText(){
        if( this.publishItemOptions.itemSharing.length === 0 ) this.showCloseText = true
    }
    hideCloseButtonText(){
        this.showCloseText = false
    }

  addEmail(querySearchElem:{value:string}){
    const email = querySearchElem?.value?.trim()
    if(!email ) return
    if( !this.validateEmail(email) ) return this.notify.error(this.l("PleaseEnterAValidEmail"))
    const itemSharingDto : ItemSharingDto = new ItemSharingDto()
    itemSharingDto.sharedUserEMail = email
    querySearchElem.value = ""
    this.publishItemOptions.itemSharing.push(itemSharingDto)
    this.showCloseText = false
  }

  validateEmail(email) {
    const regex = this.patterns.email
    return regex.test(String(email).toLowerCase());
  }

  close(){
    this.currentModalRef.hide()
    this.savingDone = false
  }
  triggerMessage(value){
    if(!value) this.publishItemOptions.message = undefined
  }
}



