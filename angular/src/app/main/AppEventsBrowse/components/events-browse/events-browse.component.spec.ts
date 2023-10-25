import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EventsBrowseComponent } from './events-browse.component';

describe('EventsBrowseComponent', () => {
  let component: EventsBrowseComponent;
  let fixture: ComponentFixture<EventsBrowseComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EventsBrowseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsBrowseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
