import { TestBed } from '@angular/core/testing';

import { UpdateLogoService } from './update-logo.service';

describe('UpdateLogoService', () => {
  let service: UpdateLogoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpdateLogoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
