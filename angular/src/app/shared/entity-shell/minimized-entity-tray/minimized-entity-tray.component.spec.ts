import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinimizedEntityTrayComponent } from './minimized-entity-tray.component';

describe('MinimizedEntityTrayComponent', () => {
  let component: MinimizedEntityTrayComponent;
  let fixture: ComponentFixture<MinimizedEntityTrayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MinimizedEntityTrayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinimizedEntityTrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
