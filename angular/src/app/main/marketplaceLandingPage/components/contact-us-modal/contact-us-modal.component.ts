import { Component, Injector, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
  selector: 'app-contact-us-modal',
  templateUrl: './contact-us-modal.component.html',
  styleUrls: ['./contact-us-modal.component.scss']
})
export class ContactUsModalComponent extends AppComponentBase {

  @ViewChild('contactUsModal', { static: false }) modal: ModalDirective;
  @ViewChild('contactForm', { static: false }) contactForm: NgForm;
  emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
  active = false;
  saving = false;

  model = {
    subject: 'Registration request',
    firstName: '',
    lastName: '',
    email: '',
    telephone: '',
    message: ''
  };

  constructor(injector: Injector) {
    super(injector);
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

    // TODO: call your API here
    // example:
    // this._contactService.sendContactUs(this.model)
    //   .pipe(finalize(() => this.saving = false))
    //   .subscribe(() => { ... });

    setTimeout(() => {
      this.saving = false;
      this.notify.info(this.l('YourMessageHasBeenSent'));
      this.close();
    }, 800);
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
}
