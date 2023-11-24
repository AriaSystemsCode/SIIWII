import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsBrowseComponent } from './events-browse.component';

describe('EventsBrowseComponent', () => {
  let component: EventsBrowseComponent;
  let fixture: ComponentFixture<EventsBrowseComponent>;

  beforeEach(async(() => {
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
