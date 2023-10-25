import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AdvancedPricingComponent } from './advanced-pricing.component';

describe('AdvancedPricingComponent', () => {
  let component: AdvancedPricingComponent;
  let fixture: ComponentFixture<AdvancedPricingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AdvancedPricingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedPricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
