import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardShareComponent } from './dashboard-share.component';

describe('DashboardShareComponent', () => {
  let component: DashboardShareComponent;
  let fixture: ComponentFixture<DashboardShareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardShareComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
