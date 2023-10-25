import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EventsBrowseCardComponent } from './events-browse-card.component';

describe('EventsBrowseCardComponent', () => {
  let component: EventsBrowseCardComponent;
  let fixture: ComponentFixture<EventsBrowseCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EventsBrowseCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsBrowseCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
