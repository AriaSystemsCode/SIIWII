import { Component, Injector, OnInit, forwardRef, HostBinding } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { UserDelegationServiceProxy, UserDelegationDto } from '@shared/service-proxies/service-proxies';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ImpersonationService } from '@app/admin/users/impersonation.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'active-delegated-users-combo',
    template:
        `
        <div *ngIf="delegations?.length" class="kt-header__topbar-item dropdown active-user-delegations">
        <div class="kt-header__topbar-wrapper">
            <span class="kt-header__topbar-icon kt-header__topbar-icon--brand">
                <select class="form-control form-control-sm" (change)="switchToDelegatedUser($event)" [(ngModel)]="selectedUserDelegationId">
                    <option selected="selected" value="0">{{'SwitchToUser' | localize}}</option>
                    <option *ngFor="let delegation of delegations" [value]="delegation.id" [attr.data-username]="delegation.username">{{delegation.username}} ({{'ExpiresAt' | localize : (delegation.endTime|momentFormat:'L LT')}})</option>
                </select>
            </span>
        </div>
    </div>`,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ActiveDelegatedUsersComboComponent),
        multi: true
    }]
})
export class ActiveDelegatedUsersComboComponent extends AppComponentBase implements OnInit {

    delegations: UserDelegationDto[] = [];
    selectedUserDelegationId = 0;
    currentSelectedUserDelegationId = 0;
    @HostBinding('style.display') public display = 'flex';

    constructor(
        private _userDelegationService: UserDelegationServiceProxy,
        private _impersonationService: ImpersonationService,
        injector: Injector) {
        super(injector);
    }

    ngOnInit(): void {
        this._userDelegationService.getActiveUserDelegations().subscribe(result => {
            this.delegations = result;
        });
    }

    switchToDelegatedUser($event): void {
        let username = $event.target.selectedOptions[0].getAttribute('data-username');

        var isConfirmed: Observable<boolean>;
        var message = this.l('SwitchToDelegatedUserWarningMessage', username);
    isConfirmed   = this.askToConfirm(message,"AreYouSure");

   isConfirmed.subscribe((res)=>{
      if(res){
                    this.currentSelectedUserDelegationId = this.selectedUserDelegationId;
                    this._impersonationService.delegatedImpersonate(this.selectedUserDelegationId, this.appSession.tenantId);
                } else {
                    this.selectedUserDelegationId = this.currentSelectedUserDelegationId;
                }
            }
        );
    }
}
