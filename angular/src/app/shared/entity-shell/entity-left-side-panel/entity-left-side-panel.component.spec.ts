import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityLeftSidePanelComponent } from './entity-left-side-panel.component';

describe('EntityLeftSidePanelComponent', () => {
  let component: EntityLeftSidePanelComponent;
  let fixture: ComponentFixture<EntityLeftSidePanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EntityLeftSidePanelComponent]
    });
    fixture = TestBed.createComponent(EntityLeftSidePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
