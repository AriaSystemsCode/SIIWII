import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyMarketplaceViewComponent } from './copy-marketplace-view.component';

describe('CopyMarketplaceViewComponent', () => {
  let component: CopyMarketplaceViewComponent;
  let fixture: ComponentFixture<CopyMarketplaceViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CopyMarketplaceViewComponent]
    });
    fixture = TestBed.createComponent(CopyMarketplaceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
