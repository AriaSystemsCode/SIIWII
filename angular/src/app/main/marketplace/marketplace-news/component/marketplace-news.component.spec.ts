import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceNewsComponent } from './marketplace-news.component';

describe('MarketplaceNewsComponent', () => {
  let component: MarketplaceNewsComponent;
  let fixture: ComponentFixture<MarketplaceNewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketplaceNewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketplaceNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
