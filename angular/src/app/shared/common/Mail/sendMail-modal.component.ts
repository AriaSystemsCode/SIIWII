import {
    Component,
    ViewChild,
    Injector,
    Output,
    EventEmitter,
    Input,
    ElementRef,
} from "@angular/core";

import { ModalDirective } from "ngx-bootstrap/modal";
import { finalize } from "rxjs/operators";
import {
    SendMailDto,
    AccountsServiceProxy,
} from "@shared/service-proxies/service-proxies";

import { AppComponentBase } from "@shared/common/app-component-base";
import * as moment from "moment";

@Component({
    selector: "sendMailModal",
    styleUrls: ["./sendMail-modal.component.css"],
    templateUrl: "./sendMail-modal.component.html",
})
export class SendMailModalComponent extends AppComponentBase {
    @ViewChild("sendMailModal", { static: true }) modal: ModalDirective;
    mailHeader: string;
    @Output() mailSent: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    mail: SendMailDto = new SendMailDto();
    @ViewChild("mailBody")mailBody:ElementRef;

    constructor(
        injector: Injector,
        private _AccountsServiceProxy: AccountsServiceProxy,
    ) {
        super(injector);
    }

    show(mailHeader, mailsubject, mailbody, addressId?: number): void {
        this.mailHeader = mailHeader;
        this.mail.subject = mailsubject;
        this.mail.to="";
        this.mail.body=mailbody;
        this.mail.isBodyHtml = true
        this.active = true;
        this.modal.show();
    }

    save(): void {
        this.saving = true;
        this.mail.body=this.mailBody.nativeElement.innerHTML
        this._AccountsServiceProxy
            .sendMessage(this.mail)
            .pipe(
                finalize(() => {
                    this.saving = false;
                })
            )
            .subscribe((value) => {
                this.notify.info(this.l("InvitationSentSuccessfully"));
                this.close();
                this.mailSent.emit(value);
            });
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
