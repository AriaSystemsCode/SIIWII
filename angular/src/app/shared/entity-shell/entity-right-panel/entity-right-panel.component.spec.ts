import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityRightPanelComponent } from './entity-right-panel.component';

describe('EntityRightPanelComponent', () => {
  let component: EntityRightPanelComponent;
  let fixture: ComponentFixture<EntityRightPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EntityRightPanelComponent]
    });
    fixture = TestBed.createComponent(EntityRightPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
