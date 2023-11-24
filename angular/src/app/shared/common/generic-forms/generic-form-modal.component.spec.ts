import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericFormModalComponent } from './generic-form-modal.component';

describe('GenericFormModalComponent', () => {
  let component: GenericFormModalComponent;
  let fixture: ComponentFixture<GenericFormModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericFormModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
