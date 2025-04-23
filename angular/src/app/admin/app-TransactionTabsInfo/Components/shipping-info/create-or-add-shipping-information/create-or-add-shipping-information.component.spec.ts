import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrAddShippingInformationComponent } from './create-or-add-shipping-information.component';

describe('CreateOrAddShippingInformationComponent', () => {
  let component: CreateOrAddShippingInformationComponent;
  let fixture: ComponentFixture<CreateOrAddShippingInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateOrAddShippingInformationComponent]
    });
    fixture = TestBed.createComponent(CreateOrAddShippingInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
