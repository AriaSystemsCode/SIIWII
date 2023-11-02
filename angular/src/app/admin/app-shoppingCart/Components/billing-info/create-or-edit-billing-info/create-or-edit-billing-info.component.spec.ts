import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrEditBillingInfoComponent } from './create-or-edit-billing-info.component';

describe('CreateOrEditBillingInfoComponent', () => {
  let component: CreateOrEditBillingInfoComponent;
  let fixture: ComponentFixture<CreateOrEditBillingInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateOrEditBillingInfoComponent]
    });
    fixture = TestBed.createComponent(CreateOrEditBillingInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
