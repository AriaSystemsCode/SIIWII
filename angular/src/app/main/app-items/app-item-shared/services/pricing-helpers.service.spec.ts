import { TestBed } from '@angular/core/testing';

import { PricingHelpersService } from './pricing-helpers.service';

describe('PricingHelpersService', () => {
  let service: PricingHelpersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PricingHelpersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
