import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericEntityShellComponent } from './generic-entity-shell.component';

describe('GenericEntityShellComponent', () => {
  let component: GenericEntityShellComponent;
  let fixture: ComponentFixture<GenericEntityShellComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenericEntityShellComponent]
    });
    fixture = TestBed.createComponent(GenericEntityShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
