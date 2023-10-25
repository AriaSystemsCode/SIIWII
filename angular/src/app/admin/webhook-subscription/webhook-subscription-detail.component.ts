import { Component, OnInit, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { WebhookSubscriptionServiceProxy, WebhookSendAttemptServiceProxy, WebhookSubscription, ActivateWebhookSubscriptionInput } from '@shared/service-proxies/service-proxies';
import { CreateOrEditWebhookSubscriptionModalComponent } from './create-or-edit-webhook-subscription-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Router, ActivatedRoute } from '@angular/router';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/api';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-webhook-subscription',
    templateUrl: './webhook-subscription-detail.component.html',
    styleUrls: ['./webhook-subscription-detail.component.css'],
    animations: [appModuleAnimation()]
})
export class WebhookSubscriptionDetailComponent extends AppComponentBase implements OnInit {
    objectKeys = Object.keys;
    @ViewChild('createOrEditWebhookSubscriptionModal', { static: true }) createOrEditWebhookSubscriptionModal: CreateOrEditWebhookSubscriptionModalComponent;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('detailModal', { static: true }) detailModal: ModalDirective;

    subscriptionId = '';
    subscription: WebhookSubscription;
    loading = true;
    isSecretBlurActive = true;

    listMaxDataLength = 100;
    detailModalText = '';

    constructor(
        injector: Injector,
        private _webhookSubscriptionService: WebhookSubscriptionServiceProxy,
        private _webhookSendAttemptService: WebhookSendAttemptServiceProxy,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
    ) {
        super(injector);
    }

    ngOnInit() {
        this.subscriptionId = this._activatedRoute.snapshot.queryParams['id'];
        this.getDetail();
    }

    getSendAttempts(event?: LazyLoadEvent): void {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.totalRecords = 10;
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._webhookSendAttemptService.getAllSendAttempts(
            this.subscriptionId,
            this.primengTableHelper.getMaxResultCount(this.paginator, event),
            this.primengTableHelper.getSkipCount(this.paginator, event)
        ).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
            this.primengTableHelper.hideLoadingIndicator();
        });
    }

    editSubscription(): void {
        this.createOrEditWebhookSubscriptionModal.show();
    }

    getDetail(): void {
        this._webhookSubscriptionService.getSubscription(this.subscriptionId).subscribe((subscription) => {
            this.subscription = subscription;
            this.loading = false;
        });
    }

    toggleActivity(): void {
            var isConfirmed: Observable<boolean>;
            let message = this.subscription.isActive
            ? this.l('DeactivateSubscriptionWarningMessage')
            : this.l('ActivateSubscriptionWarningMessage');
            isConfirmed   = this.askToConfirm(message,"AreYouSure");
      
           isConfirmed.subscribe((res)=>{
              if(res){
                    let input = new ActivateWebhookSubscriptionInput();
                    input.subscriptionId = this.subscription.id;
                    input.isActive = !this.subscription.isActive;

                    this._webhookSubscriptionService.activateWebhookSubscription(input)
                        .subscribe(() => {
                            this.subscription.isActive = !this.subscription.isActive;
                        });
                }
            }
        );
    }

    viewSecret(): void {
        this.isSecretBlurActive = false;
    }

    goToWebhookDetail(webhookId: string): void {
        this._router.navigate(['app/admin/webhook-event-detail'],
            {
                queryParams: {
                    id: webhookId,
                }
            });
    }

    resend(id: string): void {
        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm('WebhookEventWillBeSendWithSameParameters',"AreYouSure");
  
       isConfirmed.subscribe((res)=>{
          if(res){
                    this.showMainSpinner();
                    this._webhookSendAttemptService.resend(id).subscribe(() => {
                        abp.notify.success(this.l('WebhookSendAttemptInQueue'));
                        this.hideMainSpinner();
                    }, (e) => {
                        this.hideMainSpinner();
                    });
                }
            }
        );
    }

    showDetailModal(text): void {
        this.detailModalText = text;
        this.detailModal.show();
    }
}
