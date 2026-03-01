import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationshipSettingsComponent } from './relationship-settings.component';

describe('RelationshipSettingsComponent', () => {
  let component: RelationshipSettingsComponent;
  let fixture: ComponentFixture<RelationshipSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RelationshipSettingsComponent]
    });
    fixture = TestBed.createComponent(RelationshipSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
