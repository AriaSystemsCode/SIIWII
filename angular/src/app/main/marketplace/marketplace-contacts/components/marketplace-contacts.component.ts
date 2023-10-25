import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MembersListComponent } from '@app/main/members-list/components/members-list.component';
import { MemberFilterTypeEnum } from '@shared/service-proxies/service-proxies';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-marketplace-contacts',
  templateUrl: './marketplace-contacts.component.html',
  styleUrls: ['./marketplace-contacts.component.scss']
})
export class MarketplaceContactsComponent implements OnInit {
    @ViewChild( "memberListComponent" , { static : true } ) memberListComponent : MembersListComponent

    constructor(private router:Router) { }
    ngOnInit(){
        const defaultMainFilter : MemberFilterTypeEnum  = MemberFilterTypeEnum.MarketPlace
        const pageMainFilters : SelectItem [] = [{ label:'AllContacts', value:MemberFilterTypeEnum.MarketPlace }]

        const showMainFiltersOptions : boolean = false
        const canAdd : boolean = false
        const canView : boolean = true
        const title : string = "Contacts"
        this.memberListComponent.show({
            showMainFiltersOptions ,
            canAdd ,
            canView ,
            defaultMainFilter,
            pageMainFilters,
            title
        })
    }
    viewMemberHandler({memberId,userId} : {memberId:number,userId:number}){
        this.router.navigate([`/app/main/marketplace/contacts/view/${memberId}`])
    }

}
