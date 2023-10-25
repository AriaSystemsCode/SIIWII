import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsBrowseActionsMenuComponent } from './events-browse-actions-menu.component';

describe('EventsBrowseActionsMenuComponent', () => {
  let component: EventsBrowseActionsMenuComponent;
  let fixture: ComponentFixture<EventsBrowseActionsMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventsBrowseActionsMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsBrowseActionsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
