import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MatrixGridComponent } from './matrix-grid.component';

describe('MatrixGridComponent', () => {
  let component: MatrixGridComponent;
  let fixture: ComponentFixture<MatrixGridComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MatrixGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatrixGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
