import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericEntityModalComponent } from './generic-entity-modal.component';

describe('GenericEntityModalComponent', () => {
  let component: GenericEntityModalComponent;
  let fixture: ComponentFixture<GenericEntityModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenericEntityModalComponent]
    });
    fixture = TestBed.createComponent(GenericEntityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
