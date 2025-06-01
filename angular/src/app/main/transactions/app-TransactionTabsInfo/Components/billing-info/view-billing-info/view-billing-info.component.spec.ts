import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBillingInfoComponent } from './view-billing-info.component';

describe('ViewBillingInfoComponent', () => {
  let component: ViewBillingInfoComponent;
  let fixture: ComponentFixture<ViewBillingInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewBillingInfoComponent]
    });
    fixture = TestBed.createComponent(ViewBillingInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
