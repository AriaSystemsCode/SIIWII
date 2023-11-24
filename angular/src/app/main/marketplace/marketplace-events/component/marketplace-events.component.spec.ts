import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceEventsComponent } from './marketplace-events.component';

describe('MarketplaceEventsComponent', () => {
  let component: MarketplaceEventsComponent;
  let fixture: ComponentFixture<MarketplaceEventsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketplaceEventsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketplaceEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
