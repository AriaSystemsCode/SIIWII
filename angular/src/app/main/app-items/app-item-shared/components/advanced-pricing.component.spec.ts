import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedPricingComponent } from './advanced-pricing.component';

describe('AdvancedPricingComponent', () => {
  let component: AdvancedPricingComponent;
  let fixture: ComponentFixture<AdvancedPricingComponent>;

  beforeEach(async(() => {
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
