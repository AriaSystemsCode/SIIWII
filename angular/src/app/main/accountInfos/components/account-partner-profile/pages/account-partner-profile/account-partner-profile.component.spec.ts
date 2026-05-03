import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountPartnerProfileComponent } from './account-partner-profile.component';

describe('AccountPartnerProfileComponent', () => {
  let component: AccountPartnerProfileComponent;
  let fixture: ComponentFixture<AccountPartnerProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccountPartnerProfileComponent]
    });
    fixture = TestBed.createComponent(AccountPartnerProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
