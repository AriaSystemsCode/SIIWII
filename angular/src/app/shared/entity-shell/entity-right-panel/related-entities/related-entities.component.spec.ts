import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedEntitiesComponent } from './related-entities.component';

describe('RelatedEntitiesComponent', () => {
  let component: RelatedEntitiesComponent;
  let fixture: ComponentFixture<RelatedEntitiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RelatedEntitiesComponent]
    });
    fixture = TestBed.createComponent(RelatedEntitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
