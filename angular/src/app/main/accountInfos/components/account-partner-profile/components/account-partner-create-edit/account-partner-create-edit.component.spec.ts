import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountPartnerCreateEditComponent } from './account-partner-create-edit.component';

describe('AccountPartnerCreateEditComponent', () => {
  let component: AccountPartnerCreateEditComponent;
  let fixture: ComponentFixture<AccountPartnerCreateEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccountPartnerCreateEditComponent]
    });
    fixture = TestBed.createComponent(AccountPartnerCreateEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
