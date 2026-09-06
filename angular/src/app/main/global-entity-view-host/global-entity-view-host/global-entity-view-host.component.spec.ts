import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalEntityViewHostComponent } from './global-entity-view-host.component';

describe('GlobalEntityViewHostComponent', () => {
  let component: GlobalEntityViewHostComponent;
  let fixture: ComponentFixture<GlobalEntityViewHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlobalEntityViewHostComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalEntityViewHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
