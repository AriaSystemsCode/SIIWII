import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountPartnerProfileModalComponent } from './account-partner-profile-modal.component';

describe('AccountPartnerProfileModalComponent', () => {
  let component: AccountPartnerProfileModalComponent;
  let fixture: ComponentFixture<AccountPartnerProfileModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccountPartnerProfileModalComponent]
    });
    fixture = TestBed.createComponent(AccountPartnerProfileModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
