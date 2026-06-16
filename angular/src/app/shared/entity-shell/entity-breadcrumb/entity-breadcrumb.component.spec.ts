import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityBreadcrumbComponent } from './entity-breadcrumb.component';

describe('EntityBreadcrumbComponent', () => {
  let component: EntityBreadcrumbComponent;
  let fixture: ComponentFixture<EntityBreadcrumbComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EntityBreadcrumbComponent]
    });
    fixture = TestBed.createComponent(EntityBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
