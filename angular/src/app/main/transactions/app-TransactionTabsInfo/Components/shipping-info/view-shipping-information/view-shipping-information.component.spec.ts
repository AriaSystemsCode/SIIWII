import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewShippingInformationComponent } from './view-shipping-information.component';

describe('ViewShippingInformationComponent', () => {
  let component: ViewShippingInformationComponent;
  let fixture: ComponentFixture<ViewShippingInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewShippingInformationComponent]
    });
    fixture = TestBed.createComponent(ViewShippingInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
