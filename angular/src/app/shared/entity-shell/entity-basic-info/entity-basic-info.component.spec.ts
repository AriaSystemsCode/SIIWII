import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityBasicInfoComponent } from './entity-basic-info.component';

describe('EntityBasicInfoComponent', () => {
  let component: EntityBasicInfoComponent;
  let fixture: ComponentFixture<EntityBasicInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EntityBasicInfoComponent]
    });
    fixture = TestBed.createComponent(EntityBasicInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
