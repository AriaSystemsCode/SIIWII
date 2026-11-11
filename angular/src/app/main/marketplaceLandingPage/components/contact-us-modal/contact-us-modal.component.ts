import { Component, Injector, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppEntitiesServiceProxy, SydObjectsServiceProxy } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-contact-us-modal',
  templateUrl: './contact-us-modal.component.html',
  styleUrls: ['./contact-us-modal.component.scss']
})
export class ContactUsModalComponent extends AppComponentBase {

  @ViewChild('contactUsModal', { static: false }) modal: ModalDirective;
  @ViewChild('contactForm', { static: false }) contactForm: NgForm;
  emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  active = false;
  saving = false;
  isContactUsFound :boolean
  model = {
    subject: 'Registration request',
    firstName: '',
    lastName: '',
    email: '',
    telephone: '',
    message: ''
  };

  constructor(injector: Injector, private SydObjectsServiceProxy:SydObjectsServiceProxy, private _appEntitiesServiceProxy: AppEntitiesServiceProxy) {
    super(injector);
  }

  ngOnInit(){
    this.getTenantData()
  }

  show(): void {
    this.resetForm();
    this.active = true;
    this.modal.show();
  }

  close(): void {
    this.active = false;
    this.modal.hide();
  }

  save(): void {
    if (!this.contactForm.valid) {
      return;
    }

    this.saving = true;

  
    this.SydObjectsServiceProxy.sendContactUsInfo(this.model.firstName,this.model.lastName,this.model.email,this.model.telephone,this.model.message)
      .pipe(finalize(() => {
        this.saving = false;
        this.notify.info(this.l('YourRequestHasBeenSubmitted'));
        this.close();
      }))
      .subscribe(() => { });

 
  }

  private resetForm(): void {
    this.model = {
      subject: 'Registration request',
      firstName: '',
      lastName: '',
      email: '',
      telephone: '',
      message: ''
    };
    if (this.contactForm) {
      this.contactForm.resetForm(this.model);
    }
  }

  getTenantData() {

    this._appEntitiesServiceProxy.getHostSettingValue(1219, null)
      .subscribe((result) => {
          this.isContactUsFound = !!result?.trim();
      });
  }
}
