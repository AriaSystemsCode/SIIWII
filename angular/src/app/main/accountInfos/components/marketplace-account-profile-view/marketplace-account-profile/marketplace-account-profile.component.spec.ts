import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceAccountProfileComponent } from './marketplace-account-profile.component';

describe('MarketplaceAccountProfileComponent', () => {
  let component: MarketplaceAccountProfileComponent;
  let fixture: ComponentFixture<MarketplaceAccountProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MarketplaceAccountProfileComponent]
    });
    fixture = TestBed.createComponent(MarketplaceAccountProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
