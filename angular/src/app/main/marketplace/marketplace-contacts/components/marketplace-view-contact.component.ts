import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ViewMemberProfileComponent } from '@app/main/teamMembers/components/view-member-profile/view-member-profile.component';
import { ViewMemberProfileComponentInputsI } from '@app/main/teamMembers/models/view-member-profile-model';

@Component({
    selector: 'app-marketplace-view-contact',
    templateUrl: './marketplace-view-contact.component.html',
    styleUrls: ['./marketplace-view-contact.component.scss']
})
export class MarketplaceViewContactComponent implements OnInit {
    @ViewChild('viewMemberComponent') viewMemberComponent: ViewMemberProfileComponent
    constructor(private activatedRoute: ActivatedRoute) { }
    selectedMemberId: number
    ngOnInit(): void {
        this.selectedMemberId = this.activatedRoute.snapshot.params['id']
    }
    ngAfterViewInit(): void {
        this.viewMemberHandler()
    }

    viewMemberHandler() {
        const input: ViewMemberProfileComponentInputsI = {
            id: this.selectedMemberId,
            title:"ContactInformation"
        }
        // permission to delete and edit
        input.canDelete = false
        input.canEdit = false

        this.viewMemberComponent.show(input)
        this.selectedMemberId = undefined
    }
}
