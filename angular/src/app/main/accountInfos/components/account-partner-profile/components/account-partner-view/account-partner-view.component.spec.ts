import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountPartnerViewComponent } from './account-partner-view.component';

describe('AccountPartnerViewComponent', () => {
  let component: AccountPartnerViewComponent;
  let fixture: ComponentFixture<AccountPartnerViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccountPartnerViewComponent]
    });
    fixture = TestBed.createComponent(AccountPartnerViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
