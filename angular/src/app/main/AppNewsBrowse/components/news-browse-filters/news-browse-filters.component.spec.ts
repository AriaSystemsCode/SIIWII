import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsBrowseFiltersComponent } from './events-browse-filters.component';

describe('EventsBrowseFiltersComponent', () => {
  let component: EventsBrowseFiltersComponent;
  let fixture: ComponentFixture<EventsBrowseFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventsBrowseFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsBrowseFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
